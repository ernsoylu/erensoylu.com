---
title: "What AUTOSAR Timing Contracts Actually Guarantee (and What They Don't)"
date: 2026-07-10 09:00:00 +0100
categories: [Control Systems]
tags: [autosar, embedded, functional-safety]
image:
  path: /assets/img/posts/autosar-timing-contracts.jpg
  alt: "What AUTOSAR Timing Contracts Actually Guarantee"
excerpt: "A closer look at what a timing contract promises in a partitioned ECU, where the guarantees quietly end, and why Rule 8.7 deserves its deviation more often than reviewers allow."
---

AUTOSAR's timing protection mechanism promises a lot on paper: budget enforcement, execution-time monitoring, deadline supervision. In practice, most of what teams call a "timing contract" only covers a fraction of that surface — and knowing exactly where the coverage ends is what separates a review that catches real bugs from one that just checks a box.

## What the contract actually enforces

Execution-time budgets are enforced at the OS level, per runnable, and they trigger a protection error if exceeded. That much is real: the OS-Application timing protection mechanism (AUTOSAR_SWS_OS, §7.7) genuinely watches wall-clock execution time against a configured budget and can terminate the offending application if it overruns.

What isn't covered by default is **interaction timing** — the gap between when a runnable is triggered and when its inputs are actually valid across a partition boundary. A runnable can execute comfortably inside its own budget while consuming a signal that was written three task cycles ago, because nothing in the timing protection configuration checks *data age*, only *execution duration*.

```
<TIMING-PROTECTION>
  <EXECUTION-BUDGET>2.5ms</EXECUTION-BUDGET>
  <BLOCKING-BUDGET>0.8ms</BLOCKING-BUDGET>
</TIMING-PROTECTION>
```

Both of those numbers are real constraints, and both will be enforced by the OS. Neither one tells you whether the torque request this runnable just read is stale.

## Where the gap actually bites

The failure mode I've seen most often: two runnables on different partitions, each individually within budget, communicating through an IOC (inter-OS-application communicator) buffer. The consumer's timing contract says "executes within 2.5ms of trigger" — true. It says nothing about the *age* of the data sitting in that buffer when the trigger fires, because the buffer's write-side and read-side are governed by separate, independently-verified contracts that were never checked against each other as a pair.

This is exactly the gap MISRA-C:2012 Rule 8.7 deviations are meant to document — not to route around review, but to make the boundary explicit. When a signal genuinely needs broader-than-file scope because two independently-scheduled runnables share it across a partition, the deviation record is where you write down the actual staleness bound you're relying on, since the timing protection configuration will never enforce it for you.

## What I check for now

A review that only reads the timing protection XML is reading half the contract. The other half — the one nothing in the OSEK/AUTOSAR toolchain will generate for you automatically — is a table of every cross-partition signal, its producer's period, its consumer's period, and the worst-case staleness that implies. If that table doesn't exist, the "timing contract" is really just an execution-budget contract wearing a bigger name.

None of this is a knock on the standard. AUTOSAR's timing protection does exactly what it says it does, precisely and reliably. The mistake is assuming the label "timing contract" covers more ground than the mechanism actually checks — and that assumption is cheap enough to make that it's worth writing down, every time, exactly where it stops.
