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
        .file   "fir_recursive_fixed.c"
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
        .global floating_conv32
        .syntax unified
        .arm
        .fpu vfpv3-d16
        .type   floating_conv32, %function
floating_conv32:
        @ args = 0, pretend = 0, frame = 0
        @ frame_needed = 0, uses_anonymous_args = 0
        @ link register save eliminated.
        vmov    s0, r0  @ int
        vcvt.f32.s32    s0, s0, #15
        bx      lr
        .size   floating_conv32, .-floating_conv32
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
@ 52 "fir_recursive_fixed.c" 1
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
@ 52 "fir_recursive_fixed.c" 1
        smlal r3, r2, r0, r1
@ 0 "" 2
        .arm
        .syntax unified
        sbfx    r0, r3, #15, #16
        bx      lr
        .size   fixed_multiplication_mac, .-fixed_multiplication_mac
        .align  2
        .global fixed_multiplication
        .syntax unified
        .arm
        .fpu vfpv3-d16
        .type   fixed_multiplication, %function
fixed_multiplication:
        @ args = 0, pretend = 0, frame = 0
        @ frame_needed = 0, uses_anonymous_args = 0
        @ link register save eliminated.
        mul     r0, r0, r1
        add     r0, r0, #16384
        sbfx    r0, r0, #15, #16
        bx      lr
        .size   fixed_multiplication, .-fixed_multiplication
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
        push    {r4, r5, r6, r7, r8, lr}
        movw    r0, #:lower16:.LC0
        vpush.64        {d8, d9}
        movt    r0, #:upper16:.LC0
        sub     sp, sp, #16
        bl      puts
        movw    r0, #:lower16:.LC1
        movt    r0, #:upper16:.LC1
        bl      puts
        movw    r0, #:lower16:.LC2
        ldr     r4, .L30+20
        movt    r0, #:upper16:.LC2
        bl      puts
        mov     r0, #0
        mov     r6, r4
        bl      srand
        vldr.32 s16, .L30
        mov     r5, #0
        vldr.32 s18, .L30+4
        vldr.32 s17, .L30+8
        vldr.32 s19, .L30+12
        b       .L16
.L28:
        vmov    s15, r5 @ int
        vcvt.f32.s32    s0, s15
        vmul.f32        s0, s0, s19
        bl      sinf
        vmov.f32        s16, s0
.L16:
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
        bge     .L14
        vmov.f32        s15, #-1.0e+0
        vcmpe.f32       s0, s15
        vmrs    APSR_nzcv, FPSCR
        vcvtpl.s32.f32  s0, s0, #15
        movmi   r3, #32768
        vmovpl  r3, s0  @ int
        movtmi  r3, 65535
        sxthpl  r3, r3
.L14:
        add     r5, r5, #1
        cmp     r5, #128
        strh    r3, [r6, #2]!   @ movhi
        bne     .L28
        movw    r2, #:lower16:x
        mov     r6, #16384
        mov     r5, #0
        movt    r2, #:upper16:x
        ldrsh   r0, [r2, #2]
        ldrsh   r1, [r2]
        ldrsh   r3, [r2, #4]
        add     r1, r1, r0
        ldrsh   r0, [r2, #6]
        add     r3, r3, r1
        add     r1, r0, r3
        mov     lr, #8192
        mov     r3, r6
        mov     r0, r5
        .syntax divided
@ 52 "fir_recursive_fixed.c" 1
        smlal r3, r0, r1, lr
@ 0 "" 2
        .arm
        .syntax unified
        movw    ip, #:lower16:y
        lsr     r3, r3, #15
        movt    ip, #:upper16:y
        add     r7, r2, #246
        strh    r3, [ip, #6]!   @ movhi
        sub     r2, r2, #2
.L17:
        ldrsh   r0, [r2, #10]
        ldrsh   r8, [r2, #2]!
        mov     r3, r6
        sub     r0, r0, r8
        add     r1, r1, r0
        mov     r0, r5
        .syntax divided
@ 52 "fir_recursive_fixed.c" 1
        smlal r3, r0, r1, lr
@ 0 "" 2
        .arm
        .syntax unified
        lsr     r3, r3, #15
        cmp     r7, r2
        strh    r3, [ip, #2]!   @ movhi
        bne     .L17
        ldr     r7, .L30+24
        movw    r8, #:lower16:.LC3
        mov     r6, r7
        mov     r5, #0
        vldr.32 s16, .L30+16
        movt    r8, #:upper16:.LC3
.L18:
        ldrsh   r3, [r6, #2]!
        mov     r1, r5
        vmov    s15, r3 @ int
        vcvt.f32.s32    s15, s15
        vmul.f32        s15, s15, s16
        vcvt.f64.f32    d7, s15
        add     r5, r5, #1
        vmov    r2, r3, d7
        mov     r0, r8
        bl      printf
        cmp     r5, #128
        bne     .L18
        movw    r1, #:lower16:.LC4
        movw    r0, #:lower16:.LC5
        movt    r1, #:upper16:.LC4
        movt    r0, #:upper16:.LC5
        bl      fopen
        subs    r6, r0, #0
        beq     .L29
        movw    r0, #:lower16:.LC7
        mov     r3, r6
        movt    r0, #:upper16:.LC7
        mov     r2, #20
        mov     r1, #1
        movw    r8, #:lower16:.LC8
        bl      fwrite
        mov     r5, #0
        vldr.32 s16, .L30+16
        movt    r8, #:upper16:.LC8
.L21:
        ldrsh   r3, [r7, #2]!
        mov     r2, r5
        vmov    s12, r3 @ int
        ldrsh   r3, [r4, #2]!
        vcvt.f32.s32    s12, s12
        vmov    s14, r3 @ int
        vcvt.f32.s32    s14, s14
        vmul.f32        s12, s12, s16
        vmul.f32        s14, s14, s16
        vcvt.f64.f32    d6, s12
        vcvt.f64.f32    d7, s14
        vstr.64 d6, [sp, #8]
        vstr.64 d7, [sp]
        mov     r1, r8
        add     r5, r5, #1
        mov     r0, r6
        bl      fprintf
        cmp     r5, #128
        bne     .L21
        mov     r0, r6
        bl      fclose
        movw    r0, #:lower16:.LC9
        movt    r0, #:upper16:.LC9
        bl      puts
        mov     r0, #0
.L13:
        add     sp, sp, #16
        @ sp needed
        vldm    sp!, {d8-d9}
        pop     {r4, r5, r6, r7, r8, pc}
.L29:
        movw    r0, #:lower16:.LC6
        movt    r0, #:upper16:.LC6
        bl      perror
        mov     r0, #1
        b       .L13
.L31:
        .align  2
.L30:
        .word   0
        .word   805306368
        .word   1053609165
        .word   1050728828
        .word   939524096
        .word   x-2
        .word   y-2
        .size   main, .-main
        .comm   y,256,4
        .comm   x,256,4
        .section        .rodata.str1.4,"aMS",%progbits,1
        .align  2
.LC0:
        .ascii  "=== ARM Cortex A72 FIR Filter with MAC Analysis ==="
        .ascii  "\000"
.LC1:
        .ascii  "Platform: Raspberry Pi 64-bit, ARMv8 Architecture\000"
        .space  2
.LC2:
        .ascii  "Compiler: GCC (specify version in final report)\012"
        .ascii  "\000"
        .space  3
.LC3:
        .ascii  "y[%d] = %.4f\012\000"
        .space  2
.LC4:
        .ascii  "w\000"
        .space  2
.LC5:
        .ascii  "fir_fixed_output.csv\000"
        .space  3
.LC6:
        .ascii  "Failed to open file\000"
.LC7:
        .ascii  "Sample,Input,Output\012\000"
        .space  3
.LC8:
        .ascii  "%d,%.6f,%.6f\012\000"
        .space  2
.LC9:
        .ascii  "Exported to fir_fixed_output.csv\000"
        .ident  "GCC: (GNU) 8.2.1 20180801 (Red Hat 8.2.1-2)"
        .section        .note.GNU-stack,"",%progbits