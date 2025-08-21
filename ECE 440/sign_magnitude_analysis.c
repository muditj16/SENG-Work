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
int16_t y_twos_comp[M]; //output with 2's complement
int16_t y_sign_mag[M]; //output with sign-magnitude

// Sign-magnitude format: bit 15 = sign, bits 14-0 = magnitude
#define SIGN_BIT_MASK 0x8000
#define MAGNITUDE_MASK 0x7FFF

int16_t fixedpoint_conv(float x){ //Convert float to Q1.15 fixed point
    if(x >= 1.0f) x = 0.99996948f;
    if(x < -1.0f) x = -1.0f;
    return (int16_t)(x * SF);
}

float floating_conv(int16_t x){ 
    return ((float)x)/SF;
}

// Convert 2's complement to sign-magnitude representation
int16_t twos_complement_to_sign_magnitude(int16_t tc_value) {
    if (tc_value >= 0) {
        // Positive: sign bit = 0, magnitude = value
        return tc_value & MAGNITUDE_MASK;
    } else {
        // Negative: sign bit = 1, magnitude = absolute value
        int16_t magnitude = (-tc_value) & MAGNITUDE_MASK;
        return SIGN_BIT_MASK | magnitude;
    }
}

// Convert sign-magnitude to 2's complement representation
int16_t sign_magnitude_to_twos_complement(int16_t sm_value) {
    if ((sm_value & SIGN_BIT_MASK) == 0) {
        // Positive: return magnitude
        return sm_value & MAGNITUDE_MASK;
    } else {
        // Negative: return -magnitude in 2's complement
        int16_t magnitude = sm_value & MAGNITUDE_MASK;
        return -magnitude;
    }
}

// Sign-magnitude addition
int16_t sign_magnitude_add(int16_t a, int16_t b) {
    // Convert to 2's complement, add, convert back
    int16_t tc_a = sign_magnitude_to_twos_complement(a);
    int16_t tc_b = sign_magnitude_to_twos_complement(b);
    int16_t tc_result = tc_a + tc_b;
    return twos_complement_to_sign_magnitude(tc_result);
}

// Sign-magnitude subtraction
int16_t sign_magnitude_subtract(int16_t a, int16_t b) {
    // Convert to 2's complement, subtract, convert back
    int16_t tc_a = sign_magnitude_to_twos_complement(a);
    int16_t tc_b = sign_magnitude_to_twos_complement(b);
    int16_t tc_result = tc_a - tc_b;
    return twos_complement_to_sign_magnitude(tc_result);
}

// Sign-magnitude multiplication (hardware simulation)
int64_t sign_magnitude_multiply(int32_t a, int32_t b) {
    // Extract signs and magnitudes
    int sign_a = (a < 0) ? 1 : 0;
    int sign_b = (b < 0) ? 1 : 0;
    int result_sign = sign_a ^ sign_b; // XOR for result sign
    
    // Get absolute values (magnitudes)
    uint32_t mag_a = (a < 0) ? -a : a;
    uint32_t mag_b = (b < 0) ? -b : b;
    
    // Multiply magnitudes
    uint64_t magnitude_result = (uint64_t)mag_a * (uint64_t)mag_b;
    
    // Apply result sign
    if (result_sign) {
        return -(int64_t)magnitude_result;
    } else {
        return (int64_t)magnitude_result;
    }
}

// ARM Cortex A72 MAC using inline assembly (2's complement)
int64_t arm_mac_accumulate_twos_comp(int32_t a, int32_t b, int64_t acc) {
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

// Sign-magnitude MAC simulation (hardware behavior)
int64_t sign_magnitude_mac_accumulate(int32_t a, int32_t b, int64_t acc) {
    // Simulate hardware sign-magnitude MAC
    int64_t product = sign_magnitude_multiply(a, b);
    return acc + product;
}

// 2's complement fixed multiplication with rounding
int16_t fixed_multiplication_twos_comp(int32_t a, int16_t b) {
    int64_t temp = arm_mac_accumulate_twos_comp(a, (int32_t)b, 1LL << 14);
    return (int16_t)(temp >> 15);
}

// Sign-magnitude fixed multiplication with rounding
int16_t fixed_multiplication_sign_magnitude(int32_t a, int16_t b) {
    int64_t temp = sign_magnitude_mac_accumulate(a, (int32_t)b, 1LL << 14);
    return (int16_t)(temp >> 15);
}

// Run FIR filter using 2's complement arithmetic
void run_fir_filter_twos_complement() {
    int32_t sum = 0;
    int16_t inverse_N = fixedpoint_conv(1.0f / N);
    
    // Initial sum for first N samples
    for(int i = 0; i < N; i++){
        sum += x[i];
    }
    y_twos_comp[N - 1] = fixed_multiplication_twos_comp(sum, inverse_N);
    
    // Recursive update
    for(int n = N; n < M; n++){
        sum += x[n] - x[n - N];
        y_twos_comp[n] = fixed_multiplication_twos_comp(sum, inverse_N);
    }
}

// Run FIR filter using sign-magnitude arithmetic
void run_fir_filter_sign_magnitude() {
    int32_t sum = 0;
    int16_t inverse_N = fixedpoint_conv(1.0f / N);
    
    // Initial sum for first N samples
    for(int i = 0; i < N; i++){
        sum += x[i];
    }
    y_sign_mag[N - 1] = fixed_multiplication_sign_magnitude(sum, inverse_N);
    
    // Recursive update
    for(int n = N; n < M; n++){
        sum += x[n] - x[n - N];
        y_sign_mag[n] = fixed_multiplication_sign_magnitude(sum, inverse_N);
    }
}

void test_number_representations() {
    printf("\n=== NUMBER REPRESENTATION TESTING ===\n");
    
    int16_t test_values[] = {0, 1, -1, 100, -100, 16383, -16383, 32767, -32768};
    int num_tests = sizeof(test_values) / sizeof(test_values[0]);
    
    printf("Value\t2's Comp (hex)\tSign-Mag (hex)\tConverted Back\n");
    printf("-----\t--------------\t--------------\t--------------\n");
    
    for (int i = 0; i < num_tests; i++) {
        int16_t original = test_values[i];
        int16_t sign_mag = twos_complement_to_sign_magnitude(original);
        int16_t converted_back = sign_magnitude_to_twos_complement(sign_mag);
        
        printf("%d\t0x%04X\t\t0x%04X\t\t%d\n", 
               original, (uint16_t)original, (uint16_t)sign_mag, converted_back);
        
        if (original != converted_back) {
            printf("  Conversion error for value %d!\n", original);
        }
    }
}

void analyze_arithmetic_differences() {
    printf("\n=== ARITHMETIC COMPARISON ===\n");
    
    // Test sign-magnitude vs 2's complement arithmetic
    int16_t test_a[] = {1000, -1000, 500, -500};
    int16_t test_b[] = {200, -200, 300, -300};
    int num_tests = 4;
    
    printf("Operation\t2's Complement\tSign-Magnitude\tDifference\n");
    printf("---------\t--------------\t--------------\t----------\n");
    
    for (int i = 0; i < num_tests; i++) {
        // Addition test
        int16_t tc_add = test_a[i] + test_b[i];
        int16_t sm_a = twos_complement_to_sign_magnitude(test_a[i]);
        int16_t sm_b = twos_complement_to_sign_magnitude(test_b[i]);
        int16_t sm_add = sign_magnitude_add(sm_a, sm_b);
        int16_t sm_add_converted = sign_magnitude_to_twos_complement(sm_add);
        
        printf("%d + %d\t%d\t\t%d\t\t%d\n", 
               test_a[i], test_b[i], tc_add, sm_add_converted, tc_add - sm_add_converted);
        
        // Subtraction test
        int16_t tc_sub = test_a[i] - test_b[i];
        int16_t sm_sub = sign_magnitude_subtract(sm_a, sm_b);
        int16_t sm_sub_converted = sign_magnitude_to_twos_complement(sm_sub);
        
        printf("%d - %d\t%d\t\t%d\t\t%d\n", 
               test_a[i], test_b[i], tc_sub, sm_sub_converted, tc_sub - sm_sub_converted);
    }
}

void compare_filter_outputs() {
    printf("\n=== FILTER OUTPUT COMPARISON ===\n");
    
    double sum_error = 0.0;
    double sum_squared_error = 0.0;
    double max_error = 0.0;
    int differences_count = 0;
    
    printf("Sample\t2's Complement\tSign-Magnitude\tDifference\n");
    printf("------\t--------------\t--------------\t----------\n");
    
    for (int i = N-1; i < M; i++) {
        float tc_val = floating_conv(y_twos_comp[i]);
        float sm_val = floating_conv(y_sign_mag[i]);
        float difference = tc_val - sm_val;
        
        if (i < N+5 || i >= M-5) { // Show first 5 and last 5 samples
            printf("%d\t%.6f\t%.6f\t%.6f\n", i, tc_val, sm_val, difference);
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
    
    if (differences_count == 0) {
        printf(" Sign-magnitude and 2's complement produce identical results\n");
    } else {
        printf("  Differences detected between representations\n");
    }
}

void analyze_hardware_implications() {
    printf("\n=== HARDWARE IMPLEMENTATION ANALYSIS ===\n");
    
    printf("2's Complement Representation:\n");
    printf("  + Simpler addition/subtraction circuits\n");
    printf("  + Single representation for zero\n");
    printf("  + Standard ARM processor implementation\n");
    printf("  - Asymmetric range: [−32768, +32767]\n");
    
    printf("\nSign-Magnitude Representation:\n");
    printf("  + Symmetric range: [−32767, +32767]\n");
    printf("  + Easier to determine magnitude\n");
    printf("  + Simpler multiplication logic\n");
    printf("  - More complex addition/subtraction\n");
    printf("  - Two representations for zero (+0, -0)\n");
    printf("  - Requires custom hardware logic\n");
    
    printf("\nMAC Unit Considerations:\n");
    printf("  2's Complement MAC: Uses standard SMLAL/SMADDL instructions\n");
    printf("  Sign-Magnitude MAC: Requires custom logic for sign/magnitude handling\n");
    printf("  Hardware Cost: Sign-magnitude MAC would require additional gates\n");
    printf("  Performance: 2's complement benefits from native ARM support\n");
}

int main() {
    printf("=== ARM FIR FILTER: SIGN-MAGNITUDE vs 2'S COMPLEMENT ANALYSIS ===\n");
    printf("Platform: ARM Cortex A72\n");
    printf("Representation Analysis: Q1.15 Fixed Point\n");
    
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
    
    // Test number representations
    test_number_representations();
    
    // Test arithmetic operations
    analyze_arithmetic_differences();
    
    // Run both filter implementations
    printf("\nRunning FIR filters...\n");
    run_fir_filter_twos_complement();
    run_fir_filter_sign_magnitude();
    
    // Compare filter outputs
    compare_filter_outputs();
    
    // Analyze hardware implications
    analyze_hardware_implications();
    
    // Export results
    FILE *fout = fopen("sign_magnitude_comparison.csv", "w");
    if (fout) {
        fprintf(fout, "Sample,Input,TwosComplement,SignMagnitude,Difference\n");
        for (int i = 0; i < M; i++) {
            float input_val = floating_conv(x[i]);
            float tc_val = (i >= N-1) ? floating_conv(y_twos_comp[i]) : 0.0f;
            float sm_val = (i >= N-1) ? floating_conv(y_sign_mag[i]) : 0.0f;
            float difference = tc_val - sm_val;
            
            fprintf(fout, "%d,%.8f,%.8f,%.8f,%.8f\n", 
                   i, input_val, tc_val, sm_val, difference);
        }
        fclose(fout);
        printf("\n Results exported to sign_magnitude_comparison.csv\n");
    }
    
    return 0;
}
