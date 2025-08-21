    .arch armv7-a
        .eabi_attribute 28, 1
        .eabi_attribute 20, 1
        .eabi_attribute 21, 1
        .eabi_attribute 23, 3
        .eabi_attribute 24, 1
        .eabi_attribute 25, 1
        .eabi_attribute 26, 2
        .eabi_attribute 30, 2
        .eabi_attribute 34, 1
        .eabi_attribute 18, 4
        .file   "performance_analysis.c"
        .text
        .align  2
        .global fixedpoint_conv
        .arch armv7-a
        .syntax unified
        .arm
        .fpu vfpv3-d16
        .type   fixedpoint_conv, %function
fixedpoint_conv:
        @ args = 0, pretend = 0, frame = 0
        @ frame_needed = 0, uses_anonymous_args = 0
        @ link register save eliminated.
        vmov.f32        s15, #1.0e+0
        vcmpe.f32       s0, s15
        vmrs    APSR_nzcv, FPSCR
        blt     .L6
        movw    r0, #32767
        bx      lr
.L6:
        vmov.f32        s15, #-1.0e+0
        vcmpe.f32       s0, s15
        vmrs    APSR_nzcv, FPSCR
        bpl     .L7
        mov     r0, #32768
        movt    r0, 65535
        bx      lr
.L7:
        vcvt.s32.f32    s0, s0, #15
        vmov    r3, s0  @ int
        sxth    r0, r3
        bx      lr
        .size   fixedpoint_conv, .-fixedpoint_conv
        .align  2
        .global floating_conv
        .syntax unified
        .arm
        .fpu vfpv3-d16
        .type   floating_conv, %function
floating_conv:
        @ args = 0, pretend = 0, frame = 0
        @ frame_needed = 0, uses_anonymous_args = 0
        @ link register save eliminated.
        vmov    s0, r0  @ int
        vcvt.f32.s32    s0, s0, #15
        bx      lr
        .size   floating_conv, .-floating_conv
        .align  2
        .global arm_mac_accumulate
        .syntax unified
        .arm
        .fpu vfpv3-d16
        .type   arm_mac_accumulate, %function
arm_mac_accumulate:
        @ args = 0, pretend = 0, frame = 0
        @ frame_needed = 0, uses_anonymous_args = 0
        @ link register save eliminated.
        .syntax divided
@ 43 "performance_analysis.c" 1
        smlal r2, r3, r0, r1
@ 0 "" 2
        .arm
        .syntax unified
        mov     r0, r2
        mov     r1, r3
        bx      lr
        .size   arm_mac_accumulate, .-arm_mac_accumulate
        .align  2
        .global fixed_multiplication_mac
        .syntax unified
        .arm
        .fpu vfpv3-d16
        .type   fixed_multiplication_mac, %function
fixed_multiplication_mac:
        @ args = 0, pretend = 0, frame = 0
        @ frame_needed = 0, uses_anonymous_args = 0
        @ link register save eliminated.
        mov     r3, #16384
        mov     r2, #0
        .syntax divided
@ 43 "performance_analysis.c" 1
        smlal r3, r2, r0, r1
@ 0 "" 2
        .arm
        .syntax unified
        sbfx    r0, r3, #15, #16
        bx      lr
        .size   fixed_multiplication_mac, .-fixed_multiplication_mac
        .align  2
        .global fixed_multiplication_standard
        .syntax unified
        .arm
        .fpu vfpv3-d16
        .type   fixed_multiplication_standard, %function
fixed_multiplication_standard:
        @ args = 0, pretend = 0, frame = 0
        @ frame_needed = 0, uses_anonymous_args = 0
        @ link register save eliminated.
        mul     r0, r0, r1
        add     r0, r0, #16384
        sbfx    r0, r0, #15, #16
        bx      lr
        .size   fixed_multiplication_standard, .-fixed_multiplication_standard
        .align  2
        .global get_time_ns
        .syntax unified
        .arm
        .fpu vfpv3-d16
        .type   get_time_ns, %function
get_time_ns:
        @ args = 0, pretend = 0, frame = 8
        @ frame_needed = 0, uses_anonymous_args = 0
        str     lr, [sp, #-4]!
        sub     sp, sp, #12
        mov     r1, sp
        mov     r0, #1
        bl      clock_gettime
        mov     r3, #51712
        ldr     r0, [sp, #4]
        ldr     r2, [sp]
        movt    r3, 15258
        asr     r1, r0, #31
        smlal   r0, r1, r3, r2
        add     sp, sp, #12
        @ sp needed
        ldr     pc, [sp], #4
        .size   get_time_ns, .-get_time_ns
        .align  2
        .global get_cpu_cycles
        .syntax unified
        .arm
        .fpu vfpv3-d16
        .type   get_cpu_cycles, %function
get_cpu_cycles:
        @ args = 0, pretend = 0, frame = 8
        @ frame_needed = 0, uses_anonymous_args = 0
        str     lr, [sp, #-4]!
        sub     sp, sp, #12
        mov     r1, sp
        mov     r0, #1
        bl      clock_gettime
        mov     r3, #51712
        ldr     r0, [sp, #4]
        ldr     r2, [sp]
        movt    r3, 15258
        asr     r1, r0, #31
        smlal   r0, r1, r3, r2
        add     sp, sp, #12
        @ sp needed
        ldr     pc, [sp], #4
        .size   get_cpu_cycles, .-get_cpu_cycles
        .global __aeabi_ul2d
        .align  2
        .global benchmark_mac_filter
        .syntax unified
        .arm
        .fpu vfpv3-d16
        .type   benchmark_mac_filter, %function
benchmark_mac_filter:
        @ args = 0, pretend = 0, frame = 32
        @ frame_needed = 0, uses_anonymous_args = 0
        push    {r4, r5, r6, r7, r8, r9, r10, lr}
        movw    r7, #:lower16:x
        sub     sp, sp, #32
        add     r1, sp, #24
        mov     r0, #1
        bl      clock_gettime
        mov     r1, #51712
        movt    r7, #:upper16:x
        ldrsh   r0, [r7, #2]
        ldrsh   r2, [r7]
        ldrsh   r3, [r7, #4]
        add     r2, r2, r0
        ldrsh   r8, [r7, #6]
        ldr     ip, [sp, #24]
        add     r3, r3, r2
        movt    r1, 15258
        add     r8, r8, r3
        smull   r2, r3, ip, r1
        ldr     r0, [sp, #28]
        strd    r2, [sp, #8]
        mov     r2, r0
        movw    r10, #:lower16:y_mac
        movw    r9, #10000
        mov     ip, #8192
        mov     r6, #16384
        mov     r5, #0
        asr     r3, r0, #31
        strd    r2, [sp, #16]
        add     r7, r7, #246
        movt    r10, #:upper16:y_mac
.L17:
        mov     r3, r6
        mov     r2, r5
        .syntax divided
@ 43 "performance_analysis.c" 1
        smlal r3, r2, r8, ip
@ 0 "" 2
        .arm
        .syntax unified
        mov     r1, r8
        lsr     r3, r3, #15
        ldr     r2, .L22+8
        ldr     lr, .L22+12
        strh    r3, [r10, #6]   @ movhi
.L18:
        ldrsh   r0, [r2, #10]
        ldrsh   r4, [r2, #2]!
        mov     r3, r6
        sub     r0, r0, r4
        add     r1, r1, r0
        mov     r0, r5
        .syntax divided
@ 43 "performance_analysis.c" 1
        smlal r3, r0, r1, ip
@ 0 "" 2
        .arm
        .syntax unified
        lsr     r3, r3, #15
        cmp     r7, r2
        strh    r3, [lr, #2]!   @ movhi
        bne     .L18
        subs    r9, r9, #1
        bne     .L17
        add     r1, sp, #24
        mov     r0, #1
        bl      clock_gettime
        ldrd    r4, [sp, #16]
        mov     r3, #51712
        ldr     r2, [sp, #24]
        movt    r3, 15258
        smull   r2, r3, r2, r3
        subs    r1, r2, r4
        str     r1, [sp]
        sbc     r3, r3, r5
        ldrd    r4, [sp, #8]
        ldr     r1, [sp, #28]
        str     r3, [sp, #4]
        ldrd    r2, [sp]
        adds    r2, r2, r1
        adc     r3, r3, r1, asr #31
        subs    r0, r2, r4
        sbc     r1, r3, r5
        bl      __aeabi_ul2d
        vldr.64 d0, .L22
        vmov    d7, r0, r1
        vdiv.f64        d0, d7, d0
        add     sp, sp, #32
        @ sp needed
        pop     {r4, r5, r6, r7, r8, r9, r10, pc}
.L23:
        .align  3
.L22:
        .word   0
        .word   1086556160
        .word   x-2
        .word   y_mac+6
        .size   benchmark_mac_filter, .-benchmark_mac_filter
        .align  2
        .global benchmark_standard_filter
        .syntax unified
        .arm
        .fpu vfpv3-d16
        .type   benchmark_standard_filter, %function
benchmark_standard_filter:
        @ args = 0, pretend = 0, frame = 16
        @ frame_needed = 0, uses_anonymous_args = 0
        push    {r4, r5, r6, r7, r8, r9, r10, fp, lr}
        sub     sp, sp, #20
        add     r1, sp, #8
        mov     r0, #1
        bl      clock_gettime
        movw    ip, #:lower16:x
        mov     r1, #51712
        movw    r10, #:lower16:y_standard
        movw    lr, #10000
        movt    ip, #:upper16:x
        ldrsh   r2, [ip]
        ldrsh   r0, [ip, #2]
        ldrsh   r3, [ip, #4]
        ldrsh   r9, [ip, #6]
        add     r2, r2, r0
        ldr     r4, [sp, #8]
        add     r3, r3, r2
        movt    r1, 15258
        add     r9, r9, r3
        smull   r4, r5, r4, r1
        lsl     r8, r9, #13
        ldr     r6, [sp, #12]
        add     r8, r8, #16384
        add     ip, ip, #246
        sbfx    r8, r8, #15, #16
        movt    r10, #:upper16:y_standard
        asr     r7, r6, #31
.L25:
        mov     r1, r9
        ldr     r2, .L30+8
        ldr     r0, .L30+12
        strh    r8, [r10, #6]   @ movhi
.L26:
        ldrsh   r3, [r2, #10]
        ldrsh   fp, [r2, #2]!
        sub     r3, r3, fp
        add     r1, r1, r3
        lsl     r3, r1, #13
        add     r3, r3, #16384
        asr     r3, r3, #15
        cmp     r2, ip
        strh    r3, [r0, #2]!   @ movhi
        bne     .L26
        subs    lr, lr, #1
        bne     .L25
        add     r1, sp, #8
        mov     r0, #1
        bl      clock_gettime
        mov     r3, #51712
        ldr     r2, [sp, #8]
        movt    r3, 15258
        smull   r2, r3, r2, r3
        subs    r1, r2, r6
        str     r1, [sp]
        sbc     r3, r3, r7
        ldr     r1, [sp, #12]
        str     r3, [sp, #4]
        ldrd    r2, [sp]
        adds    r2, r2, r1
        adc     r3, r3, r1, asr #31
        subs    r0, r2, r4
        sbc     r1, r3, r5
        bl      __aeabi_ul2d
        vldr.64 d0, .L30
        vmov    d7, r0, r1
        vdiv.f64        d0, d7, d0
        add     sp, sp, #20
        @ sp needed
        pop     {r4, r5, r6, r7, r8, r9, r10, fp, pc}
.L31:
        .align  3
.L30:
        .word   0
        .word   1086556160
        .word   x-2
        .word   y_standard+6
        .size   benchmark_standard_filter, .-benchmark_standard_filter
        .align  2
        .global benchmark_single_mac
        .syntax unified
        .arm
        .fpu vfpv3-d16
        .type   benchmark_single_mac, %function
benchmark_single_mac:
        @ args = 0, pretend = 0, frame = 16
        @ frame_needed = 0, uses_anonymous_args = 0
        push    {r4, r5, r6, r7, r8, r9, r10, lr}
        sub     sp, sp, #16
        add     r1, sp, #8
        mov     r0, #1
        bl      clock_gettime
        mov     r3, #51712
        movw    r1, #16960
        movw    ip, #12345
        mov     r0, #8192
        mov     r10, #16384
        mov     lr, #0
        ldr     r6, [sp, #8]
        movt    r3, 15258
        smull   r6, r7, r6, r3
        ldr     r8, [sp, #12]
        movt    r1, 15
        asr     r9, r8, #31
.L33:
        mov     r3, r10
        mov     r2, lr
        .syntax divided
@ 43 "performance_analysis.c" 1
        smlal r3, r2, ip, r0
@ 0 "" 2
        .arm
        .syntax unified
        sbfx    r3, r3, #15, #16
        subs    r1, r1, #1
        strh    r3, [sp, #6]    @ movhi
        bne     .L33
        add     r1, sp, #8
        mov     r0, #1
        bl      clock_gettime
        mov     r3, #51712
        ldr     r2, [sp, #8]
        movt    r3, 15258
        smull   r0, r1, r2, r3
        subs    r3, r0, r8
        mov     r4, r3
        ldr     r2, [sp, #12]
        sbc     r3, r1, r9
        adds    r4, r4, r2
        adc     r5, r3, r2, asr #31
        subs    r0, r4, r6
        sbc     r1, r5, r7
        bl      __aeabi_ul2d
        vldr.64 d0, .L36
        vmov    d7, r0, r1
        vdiv.f64        d0, d7, d0
        add     sp, sp, #16
        @ sp needed
        pop     {r4, r5, r6, r7, r8, r9, r10, pc}
.L37:
        .align  3
.L36:
        .word   0
        .word   1093567616
        .size   benchmark_single_mac, .-benchmark_single_mac
        .align  2
        .global benchmark_single_standard
        .syntax unified
        .arm
        .fpu vfpv3-d16
        .type   benchmark_single_standard, %function
benchmark_single_standard:
        @ args = 0, pretend = 0, frame = 16
        @ frame_needed = 0, uses_anonymous_args = 0
        push    {r4, r5, r6, r7, r8, r9, r10, fp, lr}
        sub     sp, sp, #20
        add     r1, sp, #8
        mov     r0, #1
        bl      clock_gettime
        mov     r1, #51712
        movw    r3, #16960
        movw    r2, #3086
        ldr     r6, [sp, #8]
        movt    r1, 15258
        smull   r6, r7, r6, r1
        ldr     r8, [sp, #12]
        movt    r3, 15
        asr     r9, r8, #31
.L39:
        subs    r3, r3, #1
        strh    r2, [sp, #6]    @ movhi
        bne     .L39
        add     r1, sp, #8
        mov     r0, #1
        bl      clock_gettime
        mov     r3, #51712
        ldr     r2, [sp, #8]
        movt    r3, 15258
        smull   r0, r1, r2, r3
        ldr     r2, [sp, #12]
        subs    r10, r0, r8
        sbc     fp, r1, r9
        adds    r4, r10, r2
        adc     r5, fp, r2, asr #31
        subs    r0, r4, r6
        sbc     r1, r5, r7
        bl      __aeabi_ul2d
        vldr.64 d0, .L42
        vmov    d7, r0, r1
        vdiv.f64        d0, d7, d0
        add     sp, sp, #20
        @ sp needed
        pop     {r4, r5, r6, r7, r8, r9, r10, fp, pc}
.L43:
        .align  3
.L42:
        .word   0
        .word   1093567616
        .size   benchmark_single_standard, .-benchmark_single_standard
        .align  2
        .global verify_correctness
        .syntax unified
        .arm
        .fpu vfpv3-d16
        .type   verify_correctness, %function
verify_correctness:
        @ args = 0, pretend = 0, frame = 0
        @ frame_needed = 0, uses_anonymous_args = 0
        push    {r4, r5, r6, r7, r8, r9, r10, lr}
        movw    r0, #:lower16:.LC0
        vpush.64        {d8}
        movt    r0, #:upper16:.LC0
        sub     sp, sp, #8
        bl      puts
        movw    lr, #:lower16:x
        mov     r9, #16384
        mov     r8, #0
        movt    lr, #:upper16:x
        ldrsh   r2, [lr]
        ldrsh   r1, [lr, #2]
        ldrsh   r3, [lr, #4]
        add     r2, r2, r1
        ldrsh   ip, [lr, #6]
        add     r3, r3, r2
        add     ip, ip, r3
        mov     r2, r8
        mov     r3, r9
        mov     r6, #8192
        .syntax divided
@ 43 "performance_analysis.c" 1
        smlal r3, r2, ip, r6
@ 0 "" 2
        .arm
        .syntax unified
        movw    r4, #:lower16:y_mac
        lsr     r3, r3, #15
        movt    r4, #:upper16:y_mac
        sub     r2, lr, #2
        strh    r3, [r4, #6]!   @ movhi
        mov     r7, r4
        mov     r0, r2
        mov     r1, ip
        add     lr, lr, #246
.L45:
        ldrsh   r5, [r0, #10]
        ldrsh   r10, [r0, #2]!
        mov     r3, r9
        sub     r5, r5, r10
        add     r1, r1, r5
        mov     r5, r8
        .syntax divided
@ 43 "performance_analysis.c" 1
        smlal r3, r5, r1, r6
@ 0 "" 2
        .arm
        .syntax unified
        lsr     r3, r3, #15
        cmp     r0, lr
        strh    r3, [r7, #2]!   @ movhi
        bne     .L45
        movw    r5, #:lower16:y_standard
        lsl     r3, ip, #13
        add     r3, r3, #16384
        movt    r5, #:upper16:y_standard
        asr     r3, r3, #15
        strh    r3, [r5, #6]!   @ movhi
        mov     r1, r5
.L46:
        ldrsh   r3, [r2, #10]
        ldrsh   r0, [r2, #2]!
        sub     r3, r3, r0
        add     ip, ip, r3
        lsl     r3, ip, #13
        add     r3, r3, #16384
        asr     r3, r3, #15
        cmp     r2, lr
        strh    r3, [r1, #2]!   @ movhi
        bne     .L46
        mov     r1, #0
        ldr     r3, .L57+4
        ldr     r2, .L57+8
        add     lr, r3, #250
.L48:
        ldrsh   r0, [r3, #2]!
        ldrsh   ip, [r2, #2]!
        cmp     ip, r0
        addne   r1, r1, #1
        cmp     lr, r3
        bne     .L48
        cmp     r1, #0
        bne     .L49
        movw    r0, #:lower16:.LC1
        movt    r0, #:upper16:.LC1
        bl      puts
.L50:
        movw    r0, #:lower16:.LC3
        movw    r7, #:lower16:.LC4
        movt    r0, #:upper16:.LC3
        bl      puts
        mov     r6, #3
        vldr.32 s16, .L57
        movt    r7, #:upper16:.LC4
.L51:
        ldrsh   r3, [r5], #2
        mov     r1, r6
        vmov    s14, r3 @ int
        ldrsh   r3, [r4], #2
        vcvt.f32.s32    s14, s14
        vmov    s13, r3 @ int
        vcvt.f32.s32    s13, s13
        vmul.f32        s14, s14, s16
        vmul.f32        s13, s13, s16
        vcvt.f64.f32    d7, s14
        vcvt.f64.f32    d6, s13
        vstr.64 d7, [sp]
        vmov    r2, r3, d6
        mov     r0, r7
        add     r6, r6, #1
        bl      printf
        cmp     r6, #8
        bne     .L51
        add     sp, sp, #8
        @ sp needed
        vldm    sp!, {d8}
        pop     {r4, r5, r6, r7, r8, r9, r10, pc}
.L49:
        movw    r0, #:lower16:.LC2
        movt    r0, #:upper16:.LC2
        bl      printf
        b       .L50
.L58:
        .align  2
.L57:
        .word   939524096
        .word   y_mac+4
        .word   y_standard+4
        .size   verify_correctness, .-verify_correctness
        .section        .text.startup,"ax",%progbits
        .align  2
        .global main
        .syntax unified
        .arm
        .fpu vfpv3-d16
        .type   main, %function
main:
        @ args = 0, pretend = 0, frame = 0
        @ frame_needed = 0, uses_anonymous_args = 0
        push    {r4, r5, lr}
        movw    r0, #:lower16:.LC5
        vpush.64        {d8, d9, d10, d11, d12, d13}
        movt    r0, #:upper16:.LC5
        sub     sp, sp, #20
        bl      puts
        movw    r0, #:lower16:.LC6
        movt    r0, #:upper16:.LC6
        bl      puts
        movw    r0, #:lower16:.LC7
        movw    r2, #10000
        mov     r1, #128
        movt    r0, #:upper16:.LC7
        bl      printf
        movw    r0, #:lower16:.LC8
        movt    r0, #:upper16:.LC8
        bl      puts
        mov     r0, #0
        bl      srand
        vldr.32 s16, .L71+8
        mov     r4, #0
        vldr.32 s18, .L71+12
        vldr.32 s17, .L71+16
        vldr.32 s19, .L71+20
        ldr     r5, .L71+24
        b       .L62
.L70:
        vmov    s15, r4 @ int
        vcvt.f32.s32    s0, s15
        vmul.f32        s0, s0, s19
        bl      sinf
        vmov.f32        s16, s0
.L62:
        bl      rand
        vmov    s15, r0 @ int
        vmov.f32        s0, #5.0e-1
        vcvt.f32.s32    s15, s15
        vsub.f32        s15, s15, s0
        vmul.f32        s15, s15, s18
        vmla.f32        s16, s15, s17
        vmov.f32        s15, #1.0e+0
        vmul.f32        s0, s16, s0
        vcmpe.f32       s0, s15
        vmrs    APSR_nzcv, FPSCR
        movwge  r3, #32767
        bge     .L60
        vmov.f32        s15, #-1.0e+0
        vcmpe.f32       s0, s15
        vmrs    APSR_nzcv, FPSCR
        vcvtpl.s32.f32  s0, s0, #15
        movmi   r3, #32768
        vmovpl  r3, s0  @ int
        movtmi  r3, 65535
        sxthpl  r3, r3
.L60:
        add     r4, r4, #1
        cmp     r4, #128
        strh    r3, [r5, #2]!   @ movhi
        bne     .L70
        bl      verify_correctness
        movw    r0, #:lower16:.LC9
        movt    r0, #:upper16:.LC9
        bl      puts
        bl      benchmark_mac_filter
        vmov.f64        d10, d0
        bl      benchmark_standard_filter
        vmov.f64        d11, d0
        bl      benchmark_single_mac
        vmov.f64        d8, d0
        bl      benchmark_single_standard
        movw    r0, #:lower16:.LC10
        movt    r0, #:upper16:.LC10
        vmov.f64        d9, d0
        bl      puts
        movw    r0, #:lower16:.LC11
        vmov    r2, r3, d10
        movt    r0, #:upper16:.LC11
        bl      printf
        movw    r0, #:lower16:.LC12
        vmov    r2, r3, d11
        movt    r0, #:upper16:.LC12
        bl      printf
        vdiv.f64        d12, d11, d10
        movw    r0, #:lower16:.LC13
        vmov    r2, r3, d12
        movt    r0, #:upper16:.LC13
        bl      printf
        movw    r0, #:lower16:.LC14
        movt    r0, #:upper16:.LC14
        bl      puts
        movw    r0, #:lower16:.LC15
        vmov    r2, r3, d8
        movt    r0, #:upper16:.LC15
        bl      printf
        movw    r0, #:lower16:.LC16
        vmov    r2, r3, d9
        movt    r0, #:upper16:.LC16
        bl      printf
        vdiv.f64        d13, d9, d8
        movw    r0, #:lower16:.LC17
        vmov    r2, r3, d13
        movt    r0, #:upper16:.LC17
        bl      printf
        movw    r0, #:lower16:.LC18
        movt    r0, #:upper16:.LC18
        bl      puts
        movw    r0, #:lower16:.LC19
        vmov    r2, r3, d8
        movt    r0, #:upper16:.LC19
        bl      printf
        movw    r0, #:lower16:.LC20
        mov     r1, #125
        movt    r0, #:upper16:.LC20
        bl      printf
        vldr.64 d7, .L71
        movw    r0, #:lower16:.LC21
        vmul.f64        d7, d8, d7
        movt    r0, #:upper16:.LC21
        vmov    r2, r3, d7
        bl      printf
        movw    r1, #:lower16:.LC22
        movw    r0, #:lower16:.LC23
        movt    r1, #:upper16:.LC22
        movt    r0, #:upper16:.LC23
        bl      fopen
        subs    r4, r0, #0
        beq     .L63
        movw    r0, #:lower16:.LC24
        mov     r3, r4
        mov     r2, #58
        mov     r1, #1
        movt    r0, #:upper16:.LC24
        bl      fwrite
        movw    r1, #:lower16:.LC25
        vmov    r2, r3, d10
        movt    r1, #:upper16:.LC25
        vstr.64 d12, [sp, #8]
        vstr.64 d11, [sp]
        mov     r0, r4
        bl      fprintf
        movw    r1, #:lower16:.LC26
        vmov    r2, r3, d8
        movt    r1, #:upper16:.LC26
        vstr.64 d13, [sp, #8]
        vstr.64 d9, [sp]
        mov     r0, r4
        bl      fprintf
        mov     r0, r4
        bl      fclose
        movw    r0, #:lower16:.LC27
        movt    r0, #:upper16:.LC27
        bl      puts
.L63:
        mov     r0, #0
        add     sp, sp, #20
        @ sp needed
        vldm    sp!, {d8-d13}
        pop     {r4, r5, pc}
.L72:
        .align  3
.L71:
        .word   0
        .word   1079984128
        .word   0
        .word   805306368
        .word   1053609165
        .word   1050728828
        .word   x-2
        .size   main, .-main
        .comm   y_standard,256,4
        .comm   y_mac,256,4
        .comm   x,256,4
        .section        .rodata.str1.4,"aMS",%progbits,1
        .align  2
.LC0:
        .ascii  "\012=== CORRECTNESS VERIFICATION ===\000"
        .space  2
.LC1:
        .ascii  "\342\234\223 MAC and Standard implementations produ"
        .ascii  "ce identical results\000"
        .space  1
.LC2:
        .ascii  "\342\232\240\357\270\217  Found %d differences betw"
        .ascii  "een implementations\012\000"
        .space  2
.LC3:
        .ascii  "Sample outputs (first 5):\000"
        .space  2
.LC4:
        .ascii  "  y[%d]: MAC=%.6f, Standard=%.6f\012\000"
        .space  2
.LC5:
        .ascii  "=== ARM FIR FILTER PERFORMANCE ANALYSIS ===\000"
.LC6:
        .ascii  "Platform: ARM Cortex A72\000"
        .space  3
.LC7:
        .ascii  "Test Configuration: %d samples, %d iterations\012\000"
        .space  1
.LC8:
        .ascii  "Architecture: ARMv7 (32-bit) - Using SMLAL\000"
        .space  1
.LC9:
        .ascii  "\012=== PERFORMANCE BENCHMARKS ===\000"
.LC10:
        .ascii  "\012Full Filter Performance:\000"
        .space  2
.LC11:
        .ascii  "  MAC Implementation:      %.2f ns/filter\012\000"
        .space  1
.LC12:
        .ascii  "  Standard Implementation: %.2f ns/filter\012\000"
        .space  1
.LC13:
        .ascii  "  Performance Improvement: %.2fx speedup\012\000"
        .space  2
.LC14:
        .ascii  "\012Single Operation Performance:\000"
        .space  1
.LC15:
        .ascii  "  MAC Operation:      %.2f ns/operation\012\000"
        .space  3
.LC16:
        .ascii  "  Standard Operation: %.2f ns/operation\012\000"
        .space  3
.LC17:
        .ascii  "  Operation Speedup:  %.2fx\012\000"
        .space  3
.LC18:
        .ascii  "\012MAC Unit Analysis:\000"
.LC19:
        .ascii  "  Estimated MAC Latency: %.1f ns\012\000"
        .space  2
.LC20:
        .ascii  "  Operations per Filter: %d\012\000"
        .space  3
.LC21:
        .ascii  "  Total MAC Operations:  %.0f ns\012\000"
        .space  2
.LC22:
        .ascii  "w\000"
        .space  2
.LC23:
        .ascii  "performance_results.csv\000"
.LC24:
        .ascii  "Metric,MAC_Implementation,Standard_Implementation,S"
        .ascii  "peedup\012\000"
        .space  1
.LC25:
        .ascii  "Filter_Cycles,%.2f,%.2f,%.2f\012\000"
        .space  2
.LC26:
        .ascii  "Single_Operation_Cycles,%.2f,%.2f,%.2f\012\000"
.LC27:
        .ascii  "\012\342\234\223 Performance data exported to perfo"
        .ascii  "rmance_results.csv\000"
        .ident  "GCC: (GNU) 8.2.1 20180801 (Red Hat 8.2.1-2)"
        .section        .note.GNU-stack,"",%progbits