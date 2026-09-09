---
title: Graceful shutdown in Go is mostly about the order
subtitle: Draining an HTTP server is the easy half. The queue behind it is the half that loses data.
date: 2026-07-02
tags:
  - go
  - backend
  - reliability
---
Most "graceful shutdown" examples stop at `srv.Shutdown(ctx)` and call it done.
That drains in-flight HTTP requests, which is genuinely useful — and it is also
the part least likely to lose anything. The data loss happens behind the
handler, in whatever the request handed off to.

## The shape of the problem

A typical service has layers that must stop in a specific order:

1. **Stop accepting new work** — the listener, and any queue consumer.
2. **Finish work already accepted** — in-flight handlers, in-flight jobs.
3. **Flush anything buffered** — metrics, batched writes, log shippers.
4. **Close the connections** those flushes needed.

Reverse any two of these and you get a class of bug that only shows up under
deploy pressure: a batch writer closed before the handler that was about to use
it, or a database pool closed while a job still holds a transaction.

## Signal first, then unwind

```go
func main() {
	ctx, stop := signal.NotifyContext(context.Background(),
		syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	srv := &http.Server{Addr: ":8080", Handler: routes()}
	workers := worker.New(pool)

	go func() {
		if err := srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("listen: %v", err)
		}
	}()
	workers.Start()

	<-ctx.Done()
	log.Println("shutdown: draining")

	// Give the whole unwind one budget, not one per step.
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 25*time.Second)
	defer cancel()

	// 1 + 2: stop accepting, finish in flight.
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("http drain: %v", err)
	}
	if err := workers.Drain(shutdownCtx); err != nil {
		log.Printf("worker drain: %v", err)
	}

	// 3: flush buffers that the above may have filled.
	if err := metrics.Flush(shutdownCtx); err != nil {
		log.Printf("metrics flush: %v", err)
	}

	// 4: only now is it safe to close the pool.
	pool.Close()
	log.Println("shutdown: complete")
}
```

## Budget the whole unwind, not each step

The mistake I see most often is a fresh 30-second timeout at every stage. Your
orchestrator does not care about your stages — Kubernetes sends `SIGTERM`, waits
`terminationGracePeriodSeconds`, then sends `SIGKILL`. If the sum of your stage
timeouts exceeds that grace period, the last stage never runs, and the last
stage is usually the flush.

One `context.WithTimeout` shared across the unwind, set comfortably below the
grace period, makes the arithmetic obvious:

```yaml
terminationGracePeriodSeconds: 30   # must exceed the 25s budget above
```

## Test it the boring way

You do not need a chaos framework. Start the service, put a slow request through
it, send `SIGTERM`, and assert the request completed and the job landed:

```bash
curl -s localhost:8080/slow &
sleep 0.2
kill -TERM "$(pgrep -f myservice)"
wait
```

If that passes and your logs show the four stages in order, you have the
property you actually wanted. Everything else is tuning.
