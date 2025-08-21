#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <stdint.h>
#include <time.h>

#define M 128 //128 samples
#define N 4 //4-tap FIR filter
#define PI 3.14159265359
#define SF 32768 // Scaling factor 2^15

//using q1.15 (one sign bit 15 fractional bits )
int16_t x[M]; //input
int16_t y_rounding[M]; //output with rounding
int16_t y_truncation[M]; //output with truncation

int16_t fixedpoint_conv(float x){ //Convert float to Q1.15 fixed point
    //add bounds to avoid overflow
    if(x >= 1.0f){
        x = 0.99996948f;
    }
    if(x < -1.0f){
        x = -1.0f;
    }
    return (int16_t)(x * SF);
}

float floating_conv(int16_t x){ //Convert Q1.15 to float
    return ((float)x)/SF;
}

float floating_conv32(int32_t x){ //Convert Q1.15 to float 
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

// ARM MAC-based fixed multiplication with ROUNDING
int16_t fixed_multiplication_mac_rounding(int32_t a, int16_t b) {
    int64_t temp = arm_mac_accumulate(a, (int32_t)b, 1LL << 14); // MAC with rounding bias
    return (int16_t)(temp >> 15); // Adjust scale factor
}

// ARM MAC-based fixed multiplication with TRUNCATION
int16_t fixed_multiplication_mac_truncation(int32_t a, int16_t b) {
    int64_t temp = arm_mac_accumulate(a, (int32_t)b, 0); // NO rounding bias
    return (int16_t)(temp >> 15); // Just truncate
}

void run_fir_filter_rounding() {
    int32_t sum = 0;
    int16_t inverse_N = fixedpoint_conv(1.0f / N);
    
    // Initial sum for first N samples
    for(int i = 0; i < N; i++){
        sum += x[i];
    }
    y_rounding[N - 1] = fixed_multiplication_mac_rounding(sum, inverse_N);
    
    // Recursive update with rounding
    for(int n = N; n < M; n++){
        sum += x[n] - x[n - N];
        y_rounding[n] = fixed_multiplication_mac_rounding(sum, inverse_N);
    }
}

void run_fir_filter_truncation() {
    int32_t sum = 0;
    int16_t inverse_N = fixedpoint_conv(1.0f / N);
    
    // Initial sum for first N samples
    for(int i = 0; i < N; i++){
        sum += x[i];
    }
    y_truncation[N - 1] = fixed_multiplication_mac_truncation(sum, inverse_N);
    
    // Recursive update with truncation
    for(int n = N; n < M; n++){
        sum += x[n] - x[n - N];
        y_truncation[n] = fixed_multiplication_mac_truncation(sum, inverse_N);
    }
}

void analyze_differences() {
    printf("\n=== TRUNCATION vs ROUNDING ANALYSIS ===\n");
    
    double sum_error = 0.0;
    double sum_squared_error = 0.0;
    double max_error = 0.0;
    int differences_count = 0;
    
    printf("\nSample-by-sample comparison:\n");
    printf("Sample\tRounding\tTruncation\tDifference\n");
    printf("------\t--------\t----------\t----------\n");
    
    for (int i = N-1; i < M; i++) {
        float rounding_val = floating_conv(y_rounding[i]);
        float truncation_val = floating_conv(y_truncation[i]);
        float difference = rounding_val - truncation_val;
        
        if (i < N+10 || i >= M-5) { // Show first 10 and last 5 samples
            printf("%d\t%.6f\t%.6f\t%.6f\n", i, rounding_val, truncation_val, difference);
        }
        
        if (fabs(difference) > 1e-8) {
            differences_count++;
        }
        
        sum_error += difference;
        sum_squared_error += difference * difference;
        if (fabs(difference) > max_error) {
            max_error = fabs(difference);
        }
    }
    
    int valid_samples = M - (N - 1);
    double mean_error = sum_error / valid_samples;
    double variance = (sum_squared_error / valid_samples) - (mean_error * mean_error);
    double std_dev = sqrt(variance);
    
    printf("\n=== ERROR STATISTICS ===\n");
    printf("Total samples compared: %d\n", valid_samples);
    printf("Samples with differences: %d (%.1f%%)\n", differences_count, 
           100.0 * differences_count / valid_samples);
    printf("Mean error: %.8f\n", mean_error);
    printf("Max absolute error: %.8f\n", max_error);
    printf("Standard deviation: %.8f\n", std_dev);
    
    // Check for DC bias
    printf("\n=== DC BIAS ANALYSIS ===\n");
    double dc_rounding = 0.0, dc_truncation = 0.0;
    for (int i = N-1; i < M; i++) {
        dc_rounding += floating_conv(y_rounding[i]);
        dc_truncation += floating_conv(y_truncation[i]);
    }
    dc_rounding /= valid_samples;
    dc_truncation /= valid_samples;
    
    printf("DC component (Rounding): %.8f\n", dc_rounding);
    printf("DC component (Truncation): %.8f\n", dc_truncation);
    printf("DC bias difference: %.8f\n", dc_rounding - dc_truncation);
    
    if (fabs(dc_rounding - dc_truncation) > 1e-6) {
        printf("  Significant DC bias detected in truncation!\n");
    } else {
        printf(" No significant DC bias difference\n");
    }
}

int main() {
    printf("=== ARM FIR FILTER: TRUNCATION vs ROUNDING ANALYSIS ===\n");
    printf("Platform: ARM Cortex A72, Q1.15 Fixed Point\n");
    printf("Filter: 4-tap moving average, 128 samples\n");

    srand(0); // Fixed seed for reproducible results

    const float f = 0.05f;
    const float twopi_f = 2 * PI * f;
    const float inverse_random = 1.0f / RAND_MAX;

    // Generate test signal (same as original)
    printf("\nGenerating test signal...\n");
    for (int i = 0; i < M; i++){
        float clean = sinf(twopi_f * i);
        float noise = ((float)rand() - 0.5f) * inverse_random * 0.4f;
        float input = (clean + noise) * 0.5f;
        x[i] = fixedpoint_conv(input);
    }

    // Run both filter versions
    printf("Running FIR filter with rounding...\n");
    run_fir_filter_rounding();
    
    printf("Running FIR filter with truncation...\n");
    run_fir_filter_truncation();
    
    // Analyze differences
    analyze_differences();
    
    // Export results for further analysis
    FILE *fout = fopen("truncation_vs_rounding_results.csv", "w");
    if (fout) {
        fprintf(fout, "Sample,Input,Rounding,Truncation,Difference\n");
        for (int i = 0; i < M; i++) {
            float input_val = floating_conv(x[i]);
            float rounding_val = (i >= N-1) ? floating_conv(y_rounding[i]) : 0.0f;
            float truncation_val = (i >= N-1) ? floating_conv(y_truncation[i]) : 0.0f;
            float difference = rounding_val - truncation_val;
            
            fprintf(fout, "%d,%.8f,%.8f,%.8f,%.8f\n", 
                   i, input_val, rounding_val, truncation_val, difference);
        }
        fclose(fout);
        printf("\n Results exported to truncation_vs_rounding_results.csv\n");
    }

    return 0;
}
