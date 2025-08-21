// intrinsic_check_simple.c
// Simple check for ARM intrinsic availability

#include <stdio.h>

int main() {
    printf("=== ARM Intrinsic Detection ===\n");
    
    // Check 1: Architecture Support
    #ifdef __aarch64__
        printf("✓ AArch64 (ARMv8 64-bit) - Has SMADDL intrinsic\n");
    #elif defined(__arm__)
        printf("✓ ARM (ARMv7 32-bit) - Has SMLAL intrinsic\n");
    #else
        printf("✗ No ARM architecture detected\n");
    #endif
    
    // Check 2: ARM C Language Extensions
    #ifdef __ARM_ACLE
        printf("✓ ARM ACLE available - Can use arm_acle.h\n");
    #else
        printf("✗ ARM ACLE not available\n");
    #endif
    
    // Check 3: NEON SIMD Support
    #ifdef __ARM_NEON
        printf("✓ NEON SIMD available - Can use arm_neon.h\n");
    #else
        printf("✗ NEON not available\n");
    #endif
    
    // Check 4: GCC Built-ins
    #ifdef __GNUC__
        printf("✓ GCC %d.%d.%d - May have __builtin_* functions\n", 
               __GNUC__, __GNUC_MINOR__, __GNUC_PATCHLEVEL__);
    #endif
    
    return 0;
}
