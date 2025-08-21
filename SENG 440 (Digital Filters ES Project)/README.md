

# Digital Filters Project (SENG 440)

## Overview
This project explores the implementation and analysis of digital filters, focusing on recursive FIR filter realizations. Both software and hardware solutions are developed and evaluated, with a particular emphasis on limit cycles, number representations, and Multiply-and-Accumulate (MAC) operations on ARM processors.

## Project Requirements

### Software Implementation
- Consider a recursive realization for the FIR filter.
- Check the limit cycles when using truncation instead of rounding.
- Use 2’s complement representation in software.
- Analyze the effectiveness of the ARM processor's MAC in reducing limit cycles.
- Investigate the type of rounding/truncation employed by the ARM processor.
- Scale the input sequence to avoid overflow limit cycles.
- Provide a pure-software solution and specify:
  - Performance (cycle count)
  - The dead band for the particular pole considered

### Hardware Implementation
- Implement a MAC unit in hardware using truncation.
- Use sign-magnitude representation instead of 2’s complement, if possible.
- Instantiate the new MAC instruction using assembly inlining.
- For the hardware-based solution, specify:
  - The latency of the MAC unit
  - Performance (cycle count)
  - The dead band for the particular pole considered
  - The penalty in terms of silicon gates

## File Structure
- `fir_recursive_fixed.c` / `fir_recursive_float.c`: FIR filter implementations (fixed and floating point)
- `MAC_fir_recursive_fixed.c` / `Mac_fir_recursive.s`: MAC-based FIR filter and ARM assembly
- `performance_analysis.c` / `.s`: Performance measurement code
- `sign_magnitude_analysis.c`: Sign-magnitude representation analysis
- `dead_band_analysis.c`: Dead band analysis
- `truncation_vs_rounding_analysis.c`: Limit cycle analysis
- `check_arm_intrinsics.c` / `intrinsic_check_simple.c`: ARM intrinsic checks
- `arm_test/`: Test files and scripts

## How to Build and Run
1. Ensure you have a C compiler (e.g., GCC/ARM GCC) and, for hardware/assembly, an ARM toolchain.
2. Compile the desired source file:
   ```sh
   gcc fir_recursive_fixed.c -o fir_fixed
   ```
   For ARM assembly:
   ```sh
   arm-none-eabi-gcc Mac_fir_recursive.s -o mac_fir
   ```
3. Run the executable:
   ```sh
   ./fir_fixed
   ```

## Results to Report
- Cycle counts and performance metrics for both software and hardware solutions
- Dead band measurements for the chosen pole
- Analysis of limit cycles under truncation and rounding
- Overflow handling and input scaling strategies
- Hardware MAC latency and silicon gate penalty

## Contributors
- Mihai SIMA © 2024

## Course
SENG440 Embedded Systems (106: Digital Filters)


