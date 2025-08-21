
# Digital Filters Project – SENG 440

## Summary
Implement and analyze recursive FIR filters in software (2’s complement) and hardware (sign-magnitude, if possible). Study limit cycles, truncation vs. rounding, ARM MAC effectiveness, and overflow handling.

## Requirements
- Software: Recursive FIR, limit cycle analysis (truncation/rounding), ARM MAC, input scaling, performance (cycle count), dead band.
- Hardware: MAC unit (truncation, sign-magnitude), assembly inlining, latency, performance, dead band, silicon gate penalty.

## Key Files
- `fir_recursive_fixed.c`, `fir_recursive_float.c`: FIR filters
- `MAC_fir_recursive_fixed.c`, `Mac_fir_recursive.s`: MAC/ARM
- `performance_analysis.c`, `sign_magnitude_analysis.c`, `dead_band_analysis.c`, `truncation_vs_rounding_analysis.c`: Analyses
- `check_arm_intrinsics.c`, `intrinsic_check_simple.c`: ARM checks
- `arm_test/`: Tests

## Build & Run
1. Compile (GCC/ARM GCC):
  - `gcc fir_recursive_fixed.c -o fir_fixed`
  - `arm-none-eabi-gcc Mac_fir_recursive.s -o mac_fir`
2. Run: `./fir_fixed`

## Report
- Performance, dead band, limit cycles, overflow handling, hardware MAC latency, silicon gate penalty.


