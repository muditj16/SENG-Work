#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <stdint.h>
#include <time.h>

#define M 128 //128 samples
#define N 4 //4-tap FIR filter
#define PI 3.14159265359
#define SF 32768 // Scaling factor 2^15
#define NUM_AMPLITUDE_TESTS 20 // Number of different amplitude levels to test

//using q1.15 (one sign bit 15 fractional bits )
int16_t x[M]; //input
int16_t y_rounding[M]; //output with rounding
int16_t y_truncation[M]; //output with truncation

// Dead band test results
typedef struct {
    float input_amplitude;
    float max_output_rounding;
    float max_output_truncation;
    int responding_rounding;
    int responding_truncation;
    float snr_rounding;
    float snr_truncation;
} DeadBandResult;

DeadBandResult dead_band_results[NUM_AMPLITUDE_TESTS];

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

// Generate small amplitude test signal
void generate_small_signal(float amplitude) {
    const float f = 0.05f; // Low frequency for better analysis
    const float twopi_f = 2 * PI * f;
    
    for (int i = 0; i < M; i++){
        float clean_signal = amplitude * sinf(twopi_f * i);
        x[i] = fixedpoint_conv(clean_signal);
    }
}

// Run FIR filter with rounding
void run_fir_filter_rounding() {
    int32_t sum = 0;
    int16_t inverse_N = fixedpoint_conv(1.0f / N);
    
    // Clear output array
    for (int i = 0; i < M; i++) {
        y_rounding[i] = 0;
    }
    
    // Initial sum for first N samples
    for(int i = 0; i < N; i++){
        sum += x[i];
    }
    y_rounding[N - 1] = fixed_multiplication_mac_rounding(sum, inverse_N);
    
    // Recursive update
    for(int n = N; n < M; n++){
        sum += x[n] - x[n - N];
        y_rounding[n] = fixed_multiplication_mac_rounding(sum, inverse_N);
    }
}

// Run FIR filter with truncation
void run_fir_filter_truncation() {
    int32_t sum = 0;
    int16_t inverse_N = fixedpoint_conv(1.0f / N);
    
    // Clear output array
    for (int i = 0; i < M; i++) {
        y_truncation[i] = 0;
    }
    
    // Initial sum for first N samples
    for(int i = 0; i < N; i++){
        sum += x[i];
    }
    y_truncation[N - 1] = fixed_multiplication_mac_truncation(sum, inverse_N);
    
    // Recursive update
    for(int n = N; n < M; n++){
        sum += x[n] - x[n - N];
        y_truncation[n] = fixed_multiplication_mac_truncation(sum, inverse_N);
    }
}

// Calculate signal statistics
float calculate_max_amplitude(int16_t *signal, int start_idx, int end_idx) {
    float max_val = 0.0f;
    for (int i = start_idx; i < end_idx; i++) {
        float val = fabs(floating_conv(signal[i]));
        if (val > max_val) {
            max_val = val;
        }
    }
    return max_val;
}

float calculate_rms(int16_t *signal, int start_idx, int end_idx) {
    double sum_squares = 0.0;
    int count = end_idx - start_idx;
    
    for (int i = start_idx; i < end_idx; i++) {
        float val = floating_conv(signal[i]);
        sum_squares += val * val;
    }
    
    return sqrt(sum_squares / count);
}

// Calculate SNR (Signal-to-Noise Ratio)
float calculate_snr(float input_amplitude, float output_rms) {
    if (output_rms < 1e-10f) {
        return -100.0f; // Very low SNR for essentially zero output
    }
    return 20.0f * log10f(output_rms / (1e-10f + input_amplitude - output_rms));
}

// Check if filter is responding (output > threshold)
int is_filter_responding(int16_t *output, float threshold) {
    float max_output = calculate_max_amplitude(output, N-1, M);
    return (max_output > threshold);
}

void analyze_dead_band() {
    printf("\n=== DEAD BAND ANALYSIS ===\n");
    printf("Testing filter response to small amplitude signals\n");
    printf("Amplitude range: 1e-6 to 1e-1 (logarithmic scale)\n\n");
    
    // Response threshold - minimum output to consider "responding"
    float response_threshold = 1.0f / SF; // 1 LSB in Q1.15
    
    printf("Amplitude\tInput(LSB)\tRounding Max\tTruncation Max\tRounding Resp\tTruncation Resp\n");
    printf("---------\t----------\t------------\t--------------\t-------------\t---------------\n");
    
    for (int test = 0; test < NUM_AMPLITUDE_TESTS; test++) {
        // Logarithmic amplitude sweep from 1e-6 to 1e-1
        float amplitude = pow(10.0f, -6.0f + (test * 5.0f) / (NUM_AMPLITUDE_TESTS - 1));
        
        // Generate test signal
        generate_small_signal(amplitude);
        
        // Run both filter versions
        run_fir_filter_rounding();
        run_fir_filter_truncation();
        
        // Analyze results
        float max_output_rounding = calculate_max_amplitude(y_rounding, N-1, M);
        float max_output_truncation = calculate_max_amplitude(y_truncation, N-1, M);
        
        int responding_rounding = is_filter_responding(y_rounding, response_threshold);
        int responding_truncation = is_filter_responding(y_truncation, response_threshold);
        
        float rms_rounding = calculate_rms(y_rounding, N-1, M);
        float rms_truncation = calculate_rms(y_truncation, N-1, M);
        
        float snr_rounding = calculate_snr(amplitude, rms_rounding);
        float snr_truncation = calculate_snr(amplitude, rms_truncation);
        
        // Store results
        dead_band_results[test].input_amplitude = amplitude;
        dead_band_results[test].max_output_rounding = max_output_rounding;
        dead_band_results[test].max_output_truncation = max_output_truncation;
        dead_band_results[test].responding_rounding = responding_rounding;
        dead_band_results[test].responding_truncation = responding_truncation;
        dead_band_results[test].snr_rounding = snr_rounding;
        dead_band_results[test].snr_truncation = snr_truncation;
        
        // Convert amplitude to LSB units for display
        float amplitude_lsb = amplitude * SF;
        
        printf("%.2e\t%.2f\t\t%.6f\t%.6f\t\t%s\t\t%s\n",
               amplitude, amplitude_lsb,
               max_output_rounding, max_output_truncation,
               responding_rounding ? "YES" : "NO",
               responding_truncation ? "YES" : "NO");
    }
}

void find_dead_band_thresholds() {
    printf("\n=== DEAD BAND THRESHOLD ANALYSIS ===\n");
    
    float dead_band_rounding = -1.0f;
    float dead_band_truncation = -1.0f;
    
    // Find the threshold where filter stops responding
    for (int i = 0; i < NUM_AMPLITUDE_TESTS; i++) {
        if (dead_band_rounding < 0 && !dead_band_results[i].responding_rounding) {
            if (i > 0) {
                dead_band_rounding = dead_band_results[i-1].input_amplitude;
            }
        }
        
        if (dead_band_truncation < 0 && !dead_band_results[i].responding_truncation) {
            if (i > 0) {
                dead_band_truncation = dead_band_results[i-1].input_amplitude;
            }
        }
    }
    
    printf("Dead Band Thresholds (minimum amplitude for response):\n");
    if (dead_band_rounding > 0) {
        printf("  Rounding:   %.2e (%.2f LSB)\n", dead_band_rounding, dead_band_rounding * SF);
    } else {
        printf("  Rounding:   No dead band detected (responds to all test amplitudes)\n");
    }
    
    if (dead_band_truncation > 0) {
        printf("  Truncation: %.2e (%.2f LSB)\n", dead_band_truncation, dead_band_truncation * SF);
    } else {
        printf("  Truncation: No dead band detected (responds to all test amplitudes)\n");
    }
    
    // Quantization noise analysis
    printf("\nQuantization Noise Floor:\n");
    printf("  1 LSB = %.8f (Q1.15 resolution)\n", 1.0f / SF);
    printf("  Filter length N = %d (averaging effect)\n", N);
    printf("  Expected noise reduction: %.1f dB\n", 10.0f * log10f(N));
}

void analyze_limit_cycles() {
    printf("\n=== LIMIT CYCLE ANALYSIS ===\n");
    
    // Test with very small DC input to check for limit cycles
    float dc_levels[] = {1e-6f, 5e-6f, 1e-5f, 5e-5f, 1e-4f};
    int num_dc_tests = sizeof(dc_levels) / sizeof(dc_levels[0]);
    
    printf("DC Input\t\tRounding Output\t\tTruncation Output\tDifference\n");
    printf("--------\t\t---------------\t\t-----------------\t----------\n");
    
    for (int test = 0; test < num_dc_tests; test++) {
        float dc_level = dc_levels[test];
        
        // Generate DC signal
        for (int i = 0; i < M; i++) {
            x[i] = fixedpoint_conv(dc_level);
        }
        
        // Run filters
        run_fir_filter_rounding();
        run_fir_filter_truncation();
        
        // Check final outputs (steady state)
        float final_rounding = floating_conv(y_rounding[M-1]);
        float final_truncation = floating_conv(y_truncation[M-1]);
        float difference = final_rounding - final_truncation;
        
        printf("%.2e\t\t%.8f\t\t%.8f\t\t%.8f\n",
               dc_level, final_rounding, final_truncation, difference);
    }
    
    
}

void generate_detailed_report() {
    printf("\n=== DETAILED DEAD BAND REPORT ===\n");
    
    printf("\nFilter Characteristics:\n");
    printf("  Type: 4-tap Moving Average FIR Filter\n");
    printf("  Implementation: Recursive (sliding window)\n");
    printf("  Arithmetic: Q1.15 Fixed Point\n");
    printf("  ARM MAC: SMLAL instruction (ARMv7)\n");
    
    printf("\nQuantization Effects:\n");
    printf("  Rounding: Adds ±0.5 LSB bias, reduces quantization noise\n");
    printf("  Truncation: Always rounds toward zero, introduces DC bias\n");
    printf("  MAC Unit: Hardware multiply-accumulate reduces intermediate quantization\n");
    
    printf("\nDead Band Definition:\n");
    printf("  The range of input amplitudes where quantization effects\n");
    printf("  prevent the filter from producing meaningful output.\n");
    printf("  Occurs when input signal is smaller than quantization noise.\n");
    
    // Find performance crossover point
    float crossover_amplitude = -1.0f;
    for (int i = 0; i < NUM_AMPLITUDE_TESTS; i++) {
        if (dead_band_results[i].max_output_rounding > dead_band_results[i].max_output_truncation) {
            crossover_amplitude = dead_band_results[i].input_amplitude;
            break;
        }
    }
    
    if (crossover_amplitude > 0) {
        printf("\nPerformance Crossover:\n");
        printf("  Rounding outperforms truncation above: %.2e\n", crossover_amplitude);
    }
}

int main() {
    printf("=== ARM FIR FILTER: DEAD BAND ANALYSIS ===\n");
    printf("Platform: ARM Cortex A72\n");
    printf("Analysis: Small Signal Response and Limit Cycles\n");
    
    #ifdef __aarch64__
    printf("Architecture: ARMv8 (AArch64) - Using SMADDL\n");
    #elif defined(__arm__)
    printf("Architecture: ARMv7 (32-bit) - Using SMLAL\n");
    #else
    printf("Architecture: Fallback (non-ARM)\n");
    #endif
    
    // Perform dead band analysis
    analyze_dead_band();
    
    // Find threshold points
    find_dead_band_thresholds();
    
    // Analyze limit cycles
    analyze_limit_cycles();
    
    // Generate comprehensive report
    generate_detailed_report();
    
    // Export results to CSV
    FILE *fout = fopen("dead_band_analysis.csv", "w");
    if (fout) {
        fprintf(fout, "Amplitude,Amplitude_LSB,Rounding_Max,Truncation_Max,Rounding_Responding,Truncation_Responding,SNR_Rounding,SNR_Truncation\n");
        
        for (int i = 0; i < NUM_AMPLITUDE_TESTS; i++) {
            fprintf(fout, "%.6e,%.6f,%.8f,%.8f,%d,%d,%.2f,%.2f\n",
                   dead_band_results[i].input_amplitude,
                   dead_band_results[i].input_amplitude * SF,
                   dead_band_results[i].max_output_rounding,
                   dead_band_results[i].max_output_truncation,
                   dead_band_results[i].responding_rounding,
                   dead_band_results[i].responding_truncation,
                   dead_band_results[i].snr_rounding,
                   dead_band_results[i].snr_truncation);
        }
        
        fclose(fout);
        printf("\n Dead band analysis exported to dead_band_analysis.csv\n");
    }
    
    return 0;
}
