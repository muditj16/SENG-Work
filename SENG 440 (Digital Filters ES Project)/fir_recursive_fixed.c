#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <stdint.h>
#include <time.h>

#define M 128 //128 samples
#define N 4 //4-tap FIR filter
#define PI 3.14159265359
#define SF 32768 // Scaling factotr 2^15


//using q1.15 (one sign bit 15 fractional bits )
int16_t x[M]; //input
int16_t y[M]; //output


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

// ARM MAC-based fixed multiplication with rounding
int16_t fixed_multiplication_mac(int32_t a, int16_t b) {
    int64_t temp = arm_mac_accumulate(a, (int32_t)b, 1LL << 14); // MAC with rounding bias
    return (int16_t)(temp >> 15); // Adjust scale factor
}

int16_t fixed_multiplication(int32_t a, int16_t b) { //multiply two q1.15 numbers
    int32_t temp = (int64_t)a * (int32_t)b;
    temp += 1 << 14; //rounding
    return (int32_t)(temp >> 15); //adjust scale factor
}

int main() { 

 //   printf("=== ARM Cortex A72 FIR Filter with MAC Analysis ===\n");
  //  printf("Platform: Raspberry Pi 64-bit, ARMv8 Architecture\n");

    srand(0);

    const float f = 0.05f;
    const float twopi_f = 2 * PI * f;
    const float inverse_random = 1.0f / RAND_MAX;

    int16_t inverse_N = fixedpoint_conv(1.0f / N);
 
    //Generate noisy sine wave signal for filtering
    for (int i = 0; i < M; i++){
        float clean = sinf(twopi_f* i);
        float noise = ((float)rand() - 0.5f) * inverse_random * 0.4f;
        float input = (clean + noise) * 0.5f;

        x[i] = fixedpoint_conv(input);
    }

  
    //FIR Moving Average
    int32_t sum = 0; //prevents overflow

    for(int i = 0; i < N; i++){
        sum += x[i];
    }
    y[N - 1] = fixed_multiplication_mac(sum, inverse_N); 


    //Recursive Update
    for(int n = N; n < M; n++){
        sum += x[n] - x[n - N];
        y[n] = fixed_multiplication_mac(sum, inverse_N); 
    }

    for (int i = 0; i < M; i++){
        printf("y[%d] = %.4f\n", i, floating_conv32(y[i]));
    }
    
    // Export results to CSV
    FILE *fout = fopen("fir_fixed_output.csv", "w");
    if (!fout) {
        perror("Failed to open file");
        return 1;
    }

    fprintf(fout, "Sample,Input,Output\n");
    for (int i = 0; i < M; i++) {
        fprintf(fout, "%d,%.6f,%.6f\n", i, floating_conv(x[i]), floating_conv32(y[i]));
    }

    fclose(fout);
    printf("Exported to fir_fixed_output.csv\n");


    return 0;
}
