---
title: "Notes on the Space Between Circuits and Chords"
date: 2026-06-25 18:30:00 +0100
categories: [Field Notes]
tags: [music, electronics, side-projects]
image:
  path: /assets/img/posts/circuits-and-chords.jpg
  alt: "Notes on the Space Between Circuits and Chords"
excerpt: "Building a tube preamp clone taught me more about signal integrity than three years of powertrain calibration did. Some notes on where the two disciplines actually meet."
---

I spent most of last spring evenings with a soldering iron and a schematic for a classic tube preamp clone, not because I needed another audio project, but because I wanted to understand *why* a circuit that predates modern control theory by decades still sounds the way it does. What I didn't expect was how much of it would double as a refresher on signal integrity — the same discipline I apply to ECU wiring harnesses all day, just with different consequences for getting it wrong.

## The parallel that actually holds up

In automotive work, a noisy ground plane shows up as a diagnostic trouble code, or worse, a phantom sensor fault that costs a week to trace. In a tube preamp, the same class of problem shows up as hum — an audible, immediate, embarrassingly obvious signal that your grounding topology is wrong. There's something clarifying about a feedback loop you can *hear*. I found myself debugging the amp the way I'd debug a CAN bus intermittent: isolate a stage, inject a known signal, move the probe one node at a time until the noise floor tells you where the fault actually lives.

The bias point on a tube stage is its own small lesson in control systems — you're setting an operating point on a nonlinear device and trusting that small-signal behavior around that point stays linear enough to be useful. It's the same mental model as linearizing a plant around a trim condition, just built with a multimeter and patience instead of a Jacobian.

## Where the analogy breaks

It would be tidy to say "it's all the same discipline," but it isn't, and the difference is instructive. Automotive control loops are designed to be *boring* — every effort goes into making the closed-loop response as predictable and repeatable as possible across a wide operating envelope, because unpredictability there is a safety problem. A good tube circuit, on the other hand, is often prized for its *nonlinearities* — the way it soft-clips, the way it colors a signal instead of transmitting it faithfully. I spent a career learning to eliminate exactly the kind of behavior I now deliberately go looking for on a workbench in the evening.

That contrast is, I think, the actual reason I keep building these things. Not because the skills transfer cleanly, but because working somewhere the goal is character instead of fidelity resets whatever part of my brain has spent the day optimizing for the opposite.

## What's next on the bench

A second build is already sketched out — this time chasing a specific mid-range voicing rather than cloning a known circuit outright, which means I'll actually have to reason about the transfer function instead of trusting someone else's. That's either going to be a very short project or a very long one.
