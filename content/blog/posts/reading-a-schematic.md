---
translationKey: reading-a-schematic
title: Reading a schematic when you are not an electrical engineer
subtitle: A working method for software people who have to bring up someone else's board.
date: 2026-06-09
tags:
  - hardware
  - embedded
  - notes
---
I write firmware. Every so often a board lands on my desk with a schematic, a
half-finished bring-up doc, and a question: why doesn't the sensor respond? You
do not need an EE degree to answer that. You need a method.

## Start from the connector, not the corner

Schematics are drawn for the person who designed them, and their reading order
is rarely useful to you. Do not start top-left. Start at the thing you are
debugging and walk outwards:

1. Find the part in the schematic by its **designator** (`U7`, `J3`).
2. Find its power pins. Note the rail name — `+3V3`, `VDDA`, `VBUS`.
3. Find that rail's regulator. Note its enable pin and what drives it.
4. Only then follow the signal you actually care about.

Step 3 catches an embarrassing share of "dead peripheral" bugs. A rail with an
enable pin tied to a GPIO is a rail that is off until your firmware turns it on.

## Net names are the real index

Every wire belongs to a **net**, and nets have names. A good schematic uses the
same net name everywhere the wire appears, including across sheets, and the
off-sheet connector arrows tell you where to look next. If you can search the
PDF, searching for `I2C1_SDA` is faster than tracing lines with a cursor.

Watch for the two ways this bites:

- **Buses.** `SPI2_MOSI` may appear once as part of `SPI2[0..3]`. Expand the bus
  label before concluding the pin is unconnected.
- **Net aliases.** Two names joined by a zero-ohm link or a solder bridge are
  the same net *if the link is fitted*. Check the BOM for "DNP" — do not
  populate. A DNP resistor is a wire that isn't there.

## Pull-ups are configuration

On an I²C bus, the pull-up resistors are not decoration; they set the rise time
and therefore the maximum usable clock. Two common failures:

- **No pull-ups at all** because the designer assumed the MCU's internal ones.
  Internal pull-ups are typically tens of kΩ — far too weak for 400 kHz.
- **Pull-ups on two boards.** Stack a carrier and a sensor board that each fit
  4.7 kΩ and you get 2.35 kΩ, which some parts will not drive low enough.

If the bus works at 100 kHz and fails at 400 kHz, suspect the pull-ups before
your driver.

## Three measurements before you touch firmware

With a multimeter and five minutes:

| Measure | Expect | If it's wrong |
| --- | --- | --- |
| Each rail, board powered | Within a few % of nominal | Regulator not enabled, or shorted |
| Reset pin, idle | Held at the rail, not floating | Missing pull-up, or held by a debugger |
| SDA and SCL, bus idle | Both at the rail | Missing pull-ups, or a device holding the line |

That last row is the one I forget most. A device stuck mid-transaction holds SDA
low forever, and every subsequent transfer fails in a way that looks exactly
like a driver bug. Nine clock pulses on SCL frees it — most vendor HALs have a
`bus_recover()` for precisely this.

## The habit worth building

Write down what you measured, where, and when, next to the schematic reference:

```text
2026-06-08  rev B, s/n 004
  +3V3   3.29 V   ok
  VDDA   0.00 V   -> EN on U4 tied to PA8, firmware never drives it. Fixed.
  SDA    3.28 V   ok (R21/R22 fitted, 4k7)
```

Six months later that block tells you which board revision you were holding and
what was already ruled out. It is the same reason I keep calibration constants
in config rather than in code: a measurement without its context is just a
number.
