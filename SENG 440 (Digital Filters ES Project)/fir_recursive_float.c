#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#define M 128 //128 samples
#define N 4 //4-tap FIR filter
#define PI 3.14159265359

float x[M]; //input
float h[N]; //coefficients
float y[M]; //output


int main() { 
    //sin wave (input signal)
    const float f = 0.05f;
    const float twopi_f = 2 * PI * f;
    const float inverse_N = 1.0f/ N;
    const float inverse_random = 1.0f / RAND_MAX;
    
    
    for (int i = 0; i < M; i++){
        float clean = sinf(twopi_f* i);
        float noise = ((float)rand() - 0.5f) * inverse_random * 0.4f;
        x[i] = (clean + noise) *0.5f;
    }

    //first three
    float sum = 0.0f;
    for(int i = 0; i < N; i++){
        sum += x[i];
    }
    y[N - 1] = sum * inverse_N;

    //Recursive Update
    for(int n = N; n < M; n++){
        sum = sum + x[n] - x[n - N];
        y[n] = sum * inverse_N;
    }
   

    for (int i = 0; i < M; i++){
        printf("y[%d] = %.4f\n", i, y[i]);
    }
    
   
    
    // Export results to CSV
    FILE *fout = fopen("fir_output.csv", "w");
    if (!fout) {
        perror("Failed to open file");
        return 1;
    }

    fprintf(fout, "Sample,Input,Output\n");
    for (int i = 0; i < M; i++) {
        fprintf(fout, "%d,%.6f,%.6f\n", i, x[i], y[i]);
    }

    fclose(fout);
    printf("Exported to fir_output.csv\n");


    return 0;
}
