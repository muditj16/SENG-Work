#include <stdio.h>
#include <stdint.h>

// Try to include ARM intrinsic headers
#ifdef __ARM_ACLE
#include <arm_acle.h>
#endif

#ifdef __ARM_NEON
#include <arm_neon.h>
#endif

// Test program to check ARM intrinsic availability
// This will help answer your professor's question about built-in SMLAL

int main() {
    printf("=== ARM Intrinsic Availability Check ===\n\n");
    
    // 1. Check compiler defines
    printf("1. COMPILER ARCHITECTURE DEFINES:\n");
    #ifdef __aarch64__
        printf("    __aarch64__ defined - ARMv8 64-bit (AArch64) support\n");
        printf("    SMADDL intrinsic available\n");
    #elif defined(__arm__)
        printf("    __arm__ defined - ARMv7 32-bit ARM support\n");
        printf("    SMLAL intrinsic available\n");
    #else
        printf("    No ARM architecture detected\n");
        printf("    Fallback to standard C required\n");
    #endif
    
    #ifdef __ARM_ACLE
        printf("    __ARM_ACLE defined - ARM C Language Extensions available\n");
    #else
        printf("    __ARM_ACLE not defined - Limited intrinsic support\n");
    #endif
    
    #ifdef __ARM_NEON
        printf("    __ARM_NEON defined - NEON SIMD intrinsics available\n");
    #else
        printf("    __ARM_NEON not defined - No NEON support\n");
    #endif
    
    printf("\n2. INLINE ASSEMBLY TEST:\n");
    
    // Test inline assembly MAC operation
    int32_t a = 100;
    int32_t b = 200;
    int64_t result = 0;
    
    #ifdef __aarch64__
        // ARMv8 64-bit SMADDL test
        __asm__ volatile (
            "smaddl %0, %w1, %w2, %3"
            : "=r" (result)
            : "r" (a), "r" (b), "r" (result)
            : 
        );
        printf("   ✓ SMADDL instruction executed successfully\n");
        printf("   → Result: %d × %d = %lld\n", a, b, (long long)result);
    #elif defined(__arm__)
        // ARMv7 32-bit SMLAL test
        uint32_t low = 0;
        uint32_t high = 0;
        __asm__ volatile (
            "smlal %0, %1, %2, %3"
            : "+r" (low), "+r" (high)
            : "r" (a), "r" (b)
            :
        );
        result = ((int64_t)high << 32) | low;
        printf("    SMLAL instruction executed successfully\n");
        printf("    Result: %d × %d = %lld\n", a, b, (long long)result);
    #else
        result = (int64_t)a * b;
        printf("    Using standard C multiplication\n");
        printf("    Result: %d × %d = %lld\n", a, b, (long long)result);
    #endif
    
    printf("\n3. BUILT-IN INTRINSIC FUNCTIONS TEST:\n");
    
    // Test if ARM built-in intrinsics are available
    #ifdef __ARM_ACLE
        printf("    ARM ACLE header available\n");
        
        // Test built-in SMLAL intrinsic
        #ifdef __smlal
            printf("    __smlal built-in intrinsic available\n");
        #else
            printf("    __smlal built-in intrinsic NOT available\n");
        #endif
        
        // Test other common ARM intrinsics
        printf("   Checking other ARM intrinsics:\n");
        #ifdef __smull
            printf("      __smull (signed multiply long)\n");
        #endif
        #ifdef __umlal
            printf("      __umlal (unsigned multiply-accumulate long)\n");
        #endif
        #ifdef __qadd
            printf("      __qadd (saturating add)\n");
        #endif
        
    #else
        printf("    ARM ACLE header NOT available\n");
        printf("    No built-in ARM intrinsics\n");
    #endif
    
    printf("\n4. COMPILER AUTO-VECTORIZATION TEST:\n");
    
    // Test if compiler automatically generates SMLAL from C code
    int32_t test_a = 1000;
    int32_t test_b = 2000;
    int64_t accumulator = 5000000LL;
    
    // This pattern should trigger SMLAL if compiler is smart enough
    int64_t auto_result = (int64_t)test_a * test_b + accumulator;
    printf("   Pattern: (int64_t)a * b + acc\n");
    printf("   Result: %d × %d + %lld = %lld\n", 
           test_a, test_b, (long long)accumulator, (long long)auto_result);
    printf("   → Check assembly to see if SMLAL was generated\n");
    
    printf("\n5. COMPILER VERSION:\n");
    #ifdef __GNUC__
        printf("   Compiler: GCC %d.%d.%d\n", __GNUC__, __GNUC_MINOR__, __GNUC_PATCHLEVEL__);
    #endif
    
    #ifdef __clang__
        printf("   Compiler: Clang %d.%d.%d\n", __clang_major__, __clang_minor__, __clang_patchlevel__);
    #endif
    
    printf("\n6. SYSTEM INFORMATION:\n");
    printf("   sizeof(int): %zu bytes\n", sizeof(int));
    printf("   sizeof(long): %zu bytes\n", sizeof(long));
    printf("   sizeof(void*): %zu bytes\n", sizeof(void*));
    
    return 0;
}
