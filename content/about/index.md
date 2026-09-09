---
title: About
subtitle: Engineer, thinker, art enthusiast — United Kingdom.
---
I build software for things that have to keep working: embedded controllers,
backend services, and the deployment glue that holds them together. Most of my
work sits at the boundary where firmware stops being neat and the real world
starts being awkward — sensors that drift, clocks that lie, networks that drop
halfway through a write.

## What I work on

- **Embedded systems.** C and Rust on ARM Cortex-M, plus the Linux side of
  things when a board is big enough to run it. Motor control, sensor fusion,
  and the calibration work nobody puts in the datasheet.
- **Backend services.** Mostly Go and Python. APIs, job queues, and data
  pipelines that need to survive a bad night without waking anyone up.
- **Infrastructure.** Containers, CI, and observability. I would rather spend a
  day on a good dashboard than a week guessing.

## How I like to work

Small changes, shipped often, with a way to tell whether they worked. I am
suspicious of abstractions that exist before the second use case, and of any
system whose failure mode is "we'll notice eventually".

The most useful thing I have learned is that hardware never matches the model.
A clock drifts, a sensor reads a few percent off, a PWM driver runs fast. Leave
the calibration knob in — the physical world will need it.

## This site

Built with [Eleventy](https://www.11ty.dev/), styled with Tailwind CSS on the
[Everforest](https://github.com/sainnhe/everforest) palette, and deployed to
GitHub Pages. No trackers, no analytics, no cookie banner — there is nothing to
consent to.

Want to talk? The [contact page](/contact/) has the details.
