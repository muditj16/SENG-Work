#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <stdint.h>
#include <time.h>

#define M 128 //128 samples
#define N 4 //4-tap FIR filter
#define PI 3.14159265359
#define SF 32768 // Scaling factor 2^15
#define ITERATIONS 10000 // Number of iterations for performance testing

//using q1.15 (one sign bit 15 fractional bits )
int16_t x[M]; //input
int16_t y_mac[M]; //output with MAC
int16_t y_standard[M]; //output with standard multiplication

int16_t fixedpoint_conv(float x){ //Convert float to Q1.15 fixed point
    if(x >= 1.0f) x = 0.99996948f;
    if(x < -1.0f) x = -1.0f;
    return (int16_t)(x * SF);
}

float floating_conv(int16_t x){ 
    return ((float)x)/SF;
}

// ARM Cortex A72 MAC using inline assembly
int64_t arm_mac_accumulate(int32_t a, int32_t b, int64_t acc) {
    int64_t result;
    #ifdef __aarch64__
    // ARMv8 64-bit (AArch64) - SMADDL instruction
    __asm__ volatile (
        "smaddl %0, %w1, %w2, %3"
        : "=r" (result)
        : "r" (a), "r" (b), "r" (acc)
        : 
    );
    #elif defined(__arm__)
    // ARMv7 32-bit - SMLAL instruction for signed multiply-accumulate long
    uint32_t low = (uint32_t)acc;
    uint32_t high = (uint32_t)(acc >> 32);
    __asm__ volatile (
        "smlal %0, %1, %2, %3"
        : "+r" (low), "+r" (high)
        : "r" (a), "r" (b)
        :
    );
    result = ((int64_t)high << 32) | low;
    #else
    // Fallback for other architectures
    result = acc + ((int64_t)a * (int64_t)b);
    #endif
    return result;
}

// ARM MAC-based fixed multiplication with rounding
int16_t fixed_multiplication_mac(int32_t a, int16_t b) {
    int64_t temp = arm_mac_accumulate(a, (int32_t)b, 1LL << 14);
    return (int16_t)(temp >> 15);
}

// Standard fixed multiplication with rounding
int16_t fixed_multiplication_standard(int32_t a, int16_t b) {
    int32_t temp = (int64_t)a * (int32_t)b;
    temp += 1 << 14; //rounding
    return (int32_t)(temp >> 15);
}

// High-resolution timer function
uint64_t get_time_ns() {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return (uint64_t)ts.tv_sec * 1000000000ULL + (uint64_t)ts.tv_nsec;
}

// Alternative cycle counter (more compatible)
uint64_t get_cpu_cycles() {
    #ifdef __aarch64__
    uint64_t cycles;
    __asm__ volatile ("mrs %0, cntvct_el0" : "=r" (cycles));
    return cycles;
    #elif defined(__arm__)
    // Use time-based measurement instead of PMU
    return get_time_ns();
    #else
    // Fallback using clock() for non-ARM
    return clock();
    #endif
}

// Performance test for MAC implementation
double benchmark_mac_filter() {
    uint64_t start_cycles, end_cycles;
    int16_t inverse_N = fixedpoint_conv(1.0f / N);
    
    start_cycles = get_cpu_cycles();
    
    for (int iter = 0; iter < ITERATIONS; iter++) {
        int32_t sum = 0;
        
        // Initial sum
        for(int i = 0; i < N; i++){
            sum += x[i];
        }
        y_mac[N - 1] = fixed_multiplication_mac(sum, inverse_N);
        
        // Recursive update
        for(int n = N; n < M; n++){
            sum += x[n] - x[n - N];
            y_mac[n] = fixed_multiplication_mac(sum, inverse_N);
        }
    }
    
    end_cycles = get_cpu_cycles();
    return (double)(end_cycles - start_cycles) / ITERATIONS;
}

// Performance test for standard implementation
double benchmark_standard_filter() {
    uint64_t start_cycles, end_cycles;
    int16_t inverse_N = fixedpoint_conv(1.0f / N);
    
    start_cycles = get_cpu_cycles();
    
    for (int iter = 0; iter < ITERATIONS; iter++) {
        int32_t sum = 0;
        
        // Initial sum
        for(int i = 0; i < N; i++){
            sum += x[i];
        }
        y_standard[N - 1] = fixed_multiplication_standard(sum, inverse_N);
        
        // Recursive update
        for(int n = N; n < M; n++){
            sum += x[n] - x[n - N];
            y_standard[n] = fixed_multiplication_standard(sum, inverse_N);
        }
    }
    
    end_cycles = get_cpu_cycles();
    return (double)(end_cycles - start_cycles) / ITERATIONS;
}

// Micro-benchmark single MAC operation
double benchmark_single_mac() {
    uint64_t start_cycles, end_cycles;
    int32_t a = 12345;
    int16_t b = 8192; // 0.25 in Q1.15
    volatile int16_t result; // Prevent optimization
    
    start_cycles = get_cpu_cycles();
    
    for (int i = 0; i < ITERATIONS * 100; i++) {
        result = fixed_multiplication_mac(a, b);
    }
    
    end_cycles = get_cpu_cycles();
    return (double)(end_cycles - start_cycles) / (ITERATIONS * 100);
}

// Micro-benchmark single standard multiplication
double benchmark_single_standard() {
    uint64_t start_cycles, end_cycles;
    int32_t a = 12345;
    int16_t b = 8192; // 0.25 in Q1.15
    volatile int16_t result; // Prevent optimization
    
    start_cycles = get_cpu_cycles();
    
    for (int i = 0; i < ITERATIONS * 100; i++) {
        result = fixed_multiplication_standard(a, b);
    }
    
    end_cycles = get_cpu_cycles();
    return (double)(end_cycles - start_cycles) / (ITERATIONS * 100);
}

void verify_correctness() {
    printf("\n=== CORRECTNESS VERIFICATION ===\n");
    
    // Run both implementations
    int16_t inverse_N = fixedpoint_conv(1.0f / N);
    int32_t sum1 = 0, sum2 = 0;
    
    // MAC implementation
    for(int i = 0; i < N; i++) sum1 += x[i];
    y_mac[N - 1] = fixed_multiplication_mac(sum1, inverse_N);
    for(int n = N; n < M; n++){
        sum1 += x[n] - x[n - N];
        y_mac[n] = fixed_multiplication_mac(sum1, inverse_N);
    }
    
    // Standard implementation
    for(int i = 0; i < N; i++) sum2 += x[i];
    y_standard[N - 1] = fixed_multiplication_standard(sum2, inverse_N);
    for(int n = N; n < M; n++){
        sum2 += x[n] - x[n - N];
        y_standard[n] = fixed_multiplication_standard(sum2, inverse_N);
    }
    
    // Compare results
    int differences = 0;
    for (int i = N-1; i < M; i++) {
        if (y_mac[i] != y_standard[i]) {
            differences++;
        }
    }
    
    if (differences == 0) {
        printf(" MAC and Standard implementations produce identical results\n");
    } else {
        printf("  Found %d differences between implementations\n", differences);
    }
    
    printf("Sample outputs (first 5):\n");
    for (int i = N-1; i < N+4; i++) {
        printf("  y[%d]: MAC=%.6f, Standard=%.6f\n", 
               i, floating_conv(y_mac[i]), floating_conv(y_standard[i]));
    }
}

int main() {
    printf("=== ARM FIR FILTER PERFORMANCE ANALYSIS ===\n");
    printf("Platform: ARM Cortex A72\n");
    printf("Test Configuration: %d samples, %d iterations\n", M, ITERATIONS);
    
    #ifdef __aarch64__
    printf("Architecture: ARMv8 (AArch64) - Using SMADDL\n");
    #elif defined(__arm__)
    printf("Architecture: ARMv7 (32-bit) - Using SMLAL\n");
    #else
    printf("Architecture: Fallback (non-ARM)\n");
    #endif
    
    // Generate test signal
    srand(0);
    const float f = 0.05f;
    const float twopi_f = 2 * PI * f;
    const float inverse_random = 1.0f / RAND_MAX;
    
    for (int i = 0; i < M; i++){
        float clean = sinf(twopi_f * i);
        float noise = ((float)rand() - 0.5f) * inverse_random * 0.4f;
        float input = (clean + noise) * 0.5f;
        x[i] = fixedpoint_conv(input);
    }
    
    // Verify correctness first
    verify_correctness();
    
    // Performance benchmarks
    printf("\n=== PERFORMANCE BENCHMARKS ===\n");
    
    double mac_cycles = benchmark_mac_filter();
    double standard_cycles = benchmark_standard_filter();
    double single_mac_cycles = benchmark_single_mac();
    double single_standard_cycles = benchmark_single_standard();
    
    printf("\nFull Filter Performance:\n");
    printf("  MAC Implementation:      %.2f ns/filter\n", mac_cycles);
    printf("  Standard Implementation: %.2f ns/filter\n", standard_cycles);
    printf("  Performance Improvement: %.2fx speedup\n", standard_cycles / mac_cycles);
    
    printf("\nSingle Operation Performance:\n");
    printf("  MAC Operation:      %.2f ns/operation\n", single_mac_cycles);
    printf("  Standard Operation: %.2f ns/operation\n", single_standard_cycles);
    printf("  Operation Speedup:  %.2fx\n", single_standard_cycles / single_mac_cycles);
    
    printf("\nMAC Unit Analysis:\n");
    printf("  Estimated MAC Latency: %.1f ns\n", single_mac_cycles);
    printf("  Operations per Filter: %d\n", M - N + 1);
    printf("  Total MAC Operations:  %.0f ns\n", single_mac_cycles * (M - N + 1));
    
    // Export performance data
    FILE *fout = fopen("performance_results.csv", "w");
    if (fout) {
        fprintf(fout, "Metric,MAC_Implementation,Standard_Implementation,Speedup\n");
        fprintf(fout, "Filter_Cycles,%.2f,%.2f,%.2f\n", mac_cycles, standard_cycles, standard_cycles/mac_cycles);
        fprintf(fout, "Single_Operation_Cycles,%.2f,%.2f,%.2f\n", single_mac_cycles, single_standard_cycles, single_standard_cycles/single_mac_cycles);
        fclose(fout);
        printf("\n Performance data exported to performance_results.csv\n");
    }
    
    return 0;
}
