---
title: Your PWM driver is lying to you
subtitle: Why a PCA9685 running "50 Hz" is really running 52, and what that does to a servo.
date: 2026-08-14
tags:
  - embedded
  - hardware
  - calibration
---
I spent an evening convinced I had a bug in my servo easing code. The motion was
smooth on the bench and jittery on the rig, and the difference tracked with
nothing I could name. The code was fine. The clock was not.

## The internal oscillator is nominal, not accurate

The PCA9685 datasheet gives its internal oscillator as **25 MHz**. That number
is a nominal figure with a tolerance, and individual parts land a few percent
either side of it. The prescaler you write is computed against that assumed
25 MHz:

```python
prescale = round(25_000_000 / (4096 * target_hz)) - 1
```

If the real oscillator runs at 26 MHz, every pulse you emit is about 4% shorter
than you asked for. Ask for a 1500 µs neutral pulse and the servo sees roughly
1440 µs — which it reads as "rotate a bit". Across a chain of servos with
slightly different parts, they disagree with each other too.

## Measure the part in front of you

Put a scope or a logic analyser on one channel, ask for a known frequency, and
measure what actually comes out. Then solve for the oscillator:

```python
# Ask for 50 Hz, measure 52.1 Hz on the pin.
measured_hz = 52.1
requested_hz = 50.0
actual_osc = 25_000_000 * (measured_hz / requested_hz)  # ≈ 26.05 MHz
```

Store `actual_osc` per board and use it in the prescaler calculation instead of
the constant. That is the whole fix:

```python
def set_frequency(self, target_hz):
    prescale = round(self.osc_hz / (4096 * target_hz)) - 1
    self._write(MODE1, SLEEP)
    self._write(PRESCALE, max(3, min(255, prescale)))
    self._write(MODE1, RESTART)
```

## Leave the knob in

The instinct is to hide the calibration behind a constant once you have measured
one board. Don't. The next board will be different, and a `osc_hz` field in your
config costs nothing:

```toml
[driver.pca9685]
address = 0x40
osc_hz = 26_050_000  # measured 2026-08-12, board rev C
```

A note with the date and the board revision turns a magic number into a
measurement. Six months later, that comment is the difference between trusting
the value and re-deriving it from scratch.

The general lesson is older than this chip: anything derived from a nominal
oscillator, a nominal resistor, or a nominal supply voltage is an estimate. If
your control loop cares, measure it once and write it down.
