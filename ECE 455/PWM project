//
// This file is part of the GNU ARM Eclipse distribution.
// Copyright (c) 2014 Liviu Ionescu.
//

// ----------------------------------------------------------------------------

#include <stdio.h>
#include "diag/Trace.h"
#include <string.h>
#include "cmsis/cmsis_device.h"
// ----- main() ---------------------------------------------------------------
// Sample pragmas to cope with warnings. Please note the related line at
// the end of this function, used to pop the compiler diagnostics status.
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wunused-parameter"
#pragma GCC diagnostic ignored "-Wmissing-declarations"
#pragma GCC diagnostic ignored "-Wreturn-type"

//clock prescaler for timer 2 no prescaling
#define myTIM2_PRESCALER ((uint16_t)0x0000) 
//set the timer 2 period to the maximum possible value
#define myTIM2_PERIOD ((uint32_t)0xFFFFFFFF) 
//set the clock prescaler 
#define myTIM3_PRESCALER ((uint16_t)479)
#define myTIM3_PERIOD ((uint32_t)10000)
//set the scale for the max bit resolution 
#define SCALE_BITS ((float)0xFFF)

unsigned int Freq = 0;  //global Freq variable
unsigned int Res = 0;   //global Freq variable
unsigned int AdcValue = 0; //the value that is in the adc
unsigned char measure = 0; 
unsigned char state = 0;
unsigned char currentSource = 0;

void oled_Write(unsigned char);
void oled_Write_Cmd(unsigned char);
void oled_Write_Data(unsigned char);

void myEXTI_Init(void);
void oled_config(void);
void TIM3_Start(void);
void myTIM3_Init(void);
void myTIM2_Init(void);
void myEXTI1_Init(void);
void refresh_OLED(void);
void myGPIO_Init(void);
void analogToDig(void);
void EXTI0_1_IRQHandler();
SPI_HandleTypeDef SPI_Handle;


//
// LED Display initialization commands
//
unsigned char oled_init_cmds[] =
{
    0xAE,
    0x20, 0x00,
    0x40,
    0xA0 | 0x01,
    0xA8, 0x40 - 1,
    0xC0 | 0x08,
    0xD3, 0x00,
    0xDA, 0x32,
    0xD5, 0x80,
    0xD9, 0x22,
    0xDB, 0x30,
    0x81, 0xFF,
    0xA4,
    0xA6,
    0xAD, 0x30,
    0x8D, 0x10,
    0xAE | 0x01,
    0xC0,
    0xA0
};


//
// Character specifications for LED Display (1 row = 8 bytes = 1 ASCII character)
// Example: to display '4', retrieve 8 data bytes stored in Characters[52][X] row
//          (where X = 0, 1, ..., 7) and send them one by one to LED Display.
// Row number = character ASCII code (e.g., ASCII code of '4' is 0x34 = 52)
//
unsigned char Characters[][8] = {
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // SPACE
    {0b00000000, 0b00000000, 0b01011111, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // !
    {0b00000000, 0b00000111, 0b00000000, 0b00000111, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // "
    {0b00010100, 0b01111111, 0b00010100, 0b01111111, 0b00010100,0b00000000, 0b00000000, 0b00000000},  // #
    {0b00100100, 0b00101010, 0b01111111, 0b00101010, 0b00010010,0b00000000, 0b00000000, 0b00000000},  // $
    {0b00100011, 0b00010011, 0b00001000, 0b01100100, 0b01100010,0b00000000, 0b00000000, 0b00000000},  // %
    {0b00110110, 0b01001001, 0b01010101, 0b00100010, 0b01010000,0b00000000, 0b00000000, 0b00000000},  // &
    {0b00000000, 0b00000101, 0b00000011, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // '
    {0b00000000, 0b00011100, 0b00100010, 0b01000001, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // (
    {0b00000000, 0b01000001, 0b00100010, 0b00011100, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // )
    {0b00010100, 0b00001000, 0b00111110, 0b00001000, 0b00010100,0b00000000, 0b00000000, 0b00000000},  // *
    {0b00001000, 0b00001000, 0b00111110, 0b00001000, 0b00001000,0b00000000, 0b00000000, 0b00000000},  // +
    {0b00000000, 0b01010000, 0b00110000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // ,
    {0b00001000, 0b00001000, 0b00001000, 0b00001000, 0b00001000,0b00000000, 0b00000000, 0b00000000},  // -
    {0b00000000, 0b01100000, 0b01100000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // .
    {0b00100000, 0b00010000, 0b00001000, 0b00000100, 0b00000010,0b00000000, 0b00000000, 0b00000000},  // /
    {0b00111110, 0b01010001, 0b01001001, 0b01000101, 0b00111110,0b00000000, 0b00000000, 0b00000000},  // 0
    {0b00000000, 0b01000010, 0b01111111, 0b01000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // 1
    {0b01000010, 0b01100001, 0b01010001, 0b01001001, 0b01000110,0b00000000, 0b00000000, 0b00000000},  // 2
    {0b00100001, 0b01000001, 0b01000101, 0b01001011, 0b00110001,0b00000000, 0b00000000, 0b00000000},  // 3
    {0b00011000, 0b00010100, 0b00010010, 0b01111111, 0b00010000,0b00000000, 0b00000000, 0b00000000},  // 4
    {0b00100111, 0b01000101, 0b01000101, 0b01000101, 0b00111001,0b00000000, 0b00000000, 0b00000000},  // 5
    {0b00111100, 0b01001010, 0b01001001, 0b01001001, 0b00110000,0b00000000, 0b00000000, 0b00000000},  // 6
    {0b00000011, 0b00000001, 0b01110001, 0b00001001, 0b00000111,0b00000000, 0b00000000, 0b00000000},  // 7
    {0b00110110, 0b01001001, 0b01001001, 0b01001001, 0b00110110,0b00000000, 0b00000000, 0b00000000},  // 8
    {0b00000110, 0b01001001, 0b01001001, 0b00101001, 0b00011110,0b00000000, 0b00000000, 0b00000000},  // 9
    {0b00000000, 0b00110110, 0b00110110, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // :
    {0b00000000, 0b01010110, 0b00110110, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // ;
    {0b00001000, 0b00010100, 0b00100010, 0b01000001, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // <
    {0b00010100, 0b00010100, 0b00010100, 0b00010100, 0b00010100,0b00000000, 0b00000000, 0b00000000},  // =
    {0b00000000, 0b01000001, 0b00100010, 0b00010100, 0b00001000,0b00000000, 0b00000000, 0b00000000},  // >
    {0b00000010, 0b00000001, 0b01010001, 0b00001001, 0b00000110,0b00000000, 0b00000000, 0b00000000},  // ?
    {0b00110010, 0b01001001, 0b01111001, 0b01000001, 0b00111110,0b00000000, 0b00000000, 0b00000000},  // @
    {0b01111110, 0b00010001, 0b00010001, 0b00010001, 0b01111110,0b00000000, 0b00000000, 0b00000000},  // A
    {0b01111111, 0b01001001, 0b01001001, 0b01001001, 0b00110110,0b00000000, 0b00000000, 0b00000000},  // B
    {0b00111110, 0b01000001, 0b01000001, 0b01000001, 0b00100010,0b00000000, 0b00000000, 0b00000000},  // C
    {0b01111111, 0b01000001, 0b01000001, 0b00100010, 0b00011100,0b00000000, 0b00000000, 0b00000000},  // D
    {0b01111111, 0b01001001, 0b01001001, 0b01001001, 0b01000001,0b00000000, 0b00000000, 0b00000000},  // E
    {0b01111111, 0b00001001, 0b00001001, 0b00001001, 0b00000001,0b00000000, 0b00000000, 0b00000000},  // F
    {0b00111110, 0b01000001, 0b01001001, 0b01001001, 0b01111010,0b00000000, 0b00000000, 0b00000000},  // G
    {0b01111111, 0b00001000, 0b00001000, 0b00001000, 0b01111111,0b00000000, 0b00000000, 0b00000000},  // H
    {0b01000000, 0b01000001, 0b01111111, 0b01000001, 0b01000000,0b00000000, 0b00000000, 0b00000000},  // I
    {0b00100000, 0b01000000, 0b01000001, 0b00111111, 0b00000001,0b00000000, 0b00000000, 0b00000000},  // J
    {0b01111111, 0b00001000, 0b00010100, 0b00100010, 0b01000001,0b00000000, 0b00000000, 0b00000000},  // K
    {0b01111111, 0b01000000, 0b01000000, 0b01000000, 0b01000000,0b00000000, 0b00000000, 0b00000000},  // L
    {0b01111111, 0b00000010, 0b00001100, 0b00000010, 0b01111111,0b00000000, 0b00000000, 0b00000000},  // M
    {0b01111111, 0b00000100, 0b00001000, 0b00010000, 0b01111111,0b00000000, 0b00000000, 0b00000000},  // N
    {0b00111110, 0b01000001, 0b01000001, 0b01000001, 0b00111110,0b00000000, 0b00000000, 0b00000000},  // O
    {0b01111111, 0b00001001, 0b00001001, 0b00001001, 0b00000110,0b00000000, 0b00000000, 0b00000000},  // P
    {0b00111110, 0b01000001, 0b01010001, 0b00100001, 0b01011110,0b00000000, 0b00000000, 0b00000000},  // Q
    {0b01111111, 0b00001001, 0b00011001, 0b00101001, 0b01000110,0b00000000, 0b00000000, 0b00000000},  // R
    {0b01000110, 0b01001001, 0b01001001, 0b01001001, 0b00110001,0b00000000, 0b00000000, 0b00000000},  // S
    {0b00000001, 0b00000001, 0b01111111, 0b00000001, 0b00000001,0b00000000, 0b00000000, 0b00000000},  // T
    {0b00111111, 0b01000000, 0b01000000, 0b01000000, 0b00111111,0b00000000, 0b00000000, 0b00000000},  // U
    {0b00011111, 0b00100000, 0b01000000, 0b00100000, 0b00011111,0b00000000, 0b00000000, 0b00000000},  // V
    {0b00111111, 0b01000000, 0b00111000, 0b01000000, 0b00111111,0b00000000, 0b00000000, 0b00000000},  // W
    {0b01100011, 0b00010100, 0b00001000, 0b00010100, 0b01100011,0b00000000, 0b00000000, 0b00000000},  // X
    {0b00000111, 0b00001000, 0b01110000, 0b00001000, 0b00000111,0b00000000, 0b00000000, 0b00000000},  // Y
    {0b01100001, 0b01010001, 0b01001001, 0b01000101, 0b01000011,0b00000000, 0b00000000, 0b00000000},  // Z
    {0b01111111, 0b01000001, 0b00000000, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // [
    {0b00010101, 0b00010110, 0b01111100, 0b00010110, 0b00010101,0b00000000, 0b00000000, 0b00000000},  // back slash
    {0b00000000, 0b00000000, 0b00000000, 0b01000001, 0b01111111,0b00000000, 0b00000000, 0b00000000},  // ]
    {0b00000100, 0b00000010, 0b00000001, 0b00000010, 0b00000100,0b00000000, 0b00000000, 0b00000000},  // ^
    {0b01000000, 0b01000000, 0b01000000, 0b01000000, 0b01000000,0b00000000, 0b00000000, 0b00000000},  // _
    {0b00000000, 0b00000001, 0b00000010, 0b00000100, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // `
    {0b00100000, 0b01010100, 0b01010100, 0b01010100, 0b01111000,0b00000000, 0b00000000, 0b00000000},  // a
    {0b01111111, 0b01001000, 0b01000100, 0b01000100, 0b00111000,0b00000000, 0b00000000, 0b00000000},  // b
    {0b00111000, 0b01000100, 0b01000100, 0b01000100, 0b00100000,0b00000000, 0b00000000, 0b00000000},  // c
    {0b00111000, 0b01000100, 0b01000100, 0b01001000, 0b01111111,0b00000000, 0b00000000, 0b00000000},  // d
    {0b00111000, 0b01010100, 0b01010100, 0b01010100, 0b00011000,0b00000000, 0b00000000, 0b00000000},  // e
    {0b00001000, 0b01111110, 0b00001001, 0b00000001, 0b00000010,0b00000000, 0b00000000, 0b00000000},  // f
    {0b00001100, 0b01010010, 0b01010010, 0b01010010, 0b00111110,0b00000000, 0b00000000, 0b00000000},  // g
    {0b01111111, 0b00001000, 0b00000100, 0b00000100, 0b01111000,0b00000000, 0b00000000, 0b00000000},  // h
    {0b00000000, 0b01000100, 0b01111101, 0b01000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // i
    {0b00100000, 0b01000000, 0b01000100, 0b00111101, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // j
    {0b01111111, 0b00010000, 0b00101000, 0b01000100, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // k
    {0b00000000, 0b01000001, 0b01111111, 0b01000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // l
    {0b01111100, 0b00000100, 0b00011000, 0b00000100, 0b01111000,0b00000000, 0b00000000, 0b00000000},  // m
    {0b01111100, 0b00001000, 0b00000100, 0b00000100, 0b01111000,0b00000000, 0b00000000, 0b00000000},  // n
    {0b00111000, 0b01000100, 0b01000100, 0b01000100, 0b00111000,0b00000000, 0b00000000, 0b00000000},  // o
    {0b01111100, 0b00010100, 0b00010100, 0b00010100, 0b00001000,0b00000000, 0b00000000, 0b00000000},  // p
    {0b00001000, 0b00010100, 0b00010100, 0b00011000, 0b01111100,0b00000000, 0b00000000, 0b00000000},  // q
    {0b01111100, 0b00001000, 0b00000100, 0b00000100, 0b00001000,0b00000000, 0b00000000, 0b00000000},  // r
    {0b01001000, 0b01010100, 0b01010100, 0b01010100, 0b00100000,0b00000000, 0b00000000, 0b00000000},  // s
    {0b00000100, 0b00111111, 0b01000100, 0b01000000, 0b00100000,0b00000000, 0b00000000, 0b00000000},  // t
    {0b00111100, 0b01000000, 0b01000000, 0b00100000, 0b01111100,0b00000000, 0b00000000, 0b00000000},  // u
    {0b00011100, 0b00100000, 0b01000000, 0b00100000, 0b00011100,0b00000000, 0b00000000, 0b00000000},  // v
    {0b00111100, 0b01000000, 0b00111000, 0b01000000, 0b00111100,0b00000000, 0b00000000, 0b00000000},  // w
    {0b01000100, 0b00101000, 0b00010000, 0b00101000, 0b01000100,0b00000000, 0b00000000, 0b00000000},  // x
    {0b00001100, 0b01010000, 0b01010000, 0b01010000, 0b00111100,0b00000000, 0b00000000, 0b00000000},  // y
    {0b01000100, 0b01100100, 0b01010100, 0b01001100, 0b01000100,0b00000000, 0b00000000, 0b00000000},  // z
    {0b00000000, 0b00001000, 0b00110110, 0b01000001, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // {
    {0b00000000, 0b00000000, 0b01111111, 0b00000000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // |
    {0b00000000, 0b01000001, 0b00110110, 0b00001000, 0b00000000,0b00000000, 0b00000000, 0b00000000},  // }
    {0b00001000, 0b00001000, 0b00101010, 0b00011100, 0b00001000,0b00000000, 0b00000000, 0b00000000},  // ~
    {0b00001000, 0b00011100, 0b00101010, 0b00001000, 0b00001000,0b00000000, 0b00000000, 0b00000000}   // <-
};



void SystemClock48MHz( void ){
//
// Disable the PLL
//
	RCC->CR &= ~(RCC_CR_PLLON);
//
// Wait for the PLL to unlock
//
	while (( RCC->CR & RCC_CR_PLLRDY ) != 0 );
//
// Configure the PLL for a 48MHz system clock
//
	RCC->CFGR = 0x00280000;

//
// Enable the PLL
//
	RCC->CR |= RCC_CR_PLLON;

//
// Wait for the PLL to lock
//
	while (( RCC->CR & RCC_CR_PLLRDY ) != RCC_CR_PLLRDY );
// Switch the processor to the PLL clock source
	RCC->CFGR = ( RCC->CFGR & (~RCC_CFGR_SW_Msk)) | RCC_CFGR_SW_PLL;
// Update the system with the new clock frequency
	SystemCoreClockUpdate();
}

int main(int argc, char* argv[]){
	SystemClock48MHz(); 
	myGPIO_Init(); //initialize port A
	myTIM2_Init(); //initialize timer3
	myEXTI1_Init(); //initialize the interrupt routine for timer555 and button
	myEXTI_Init(); //initialize the interrupt routine for function generator
	myTIM3_Init(); //initialize timer3
	oled_config(); //initialize SPI, GPIOB, and OLED

	while (1){
		analogToDig(); // Get the Res
		refresh_OLED(); // Update the LCD with the Freq and Res
	}
}

/*
This function converts the analog value into a digital value and saves it to AdcValue. AdcValue is output to the DAC where it is converted into a analog
value that is output to the optocuppler. The AdcValue is used to calculate and update the global Res variable
*/
void analogToDig(void){
	// wait until the ADC can accept conversion requests
	while(((ADC1->ISR)&ADC_ISR_ADRDY)==0);
	//start conversion process
	ADC1->CR|= ADC_CR_ADSTART;
	//wait until the conversion is complete
	while(((ADC1->ISR)& ADC_ISR_EOC) ==0);
	// retrieve the converted value
	AdcValue = ADC1->DR;
	//output converted value to the DAC
	DAC->DHR12R1 = AdcValue;
	// convert the adc value to resistance
	Res = (AdcValue/SCALE_BITS)*5000;
}

// LED Display Functions
void refresh_OLED( void ){
	//define a string to hold the 16 characters and terminating character
	unsigned char Buffer[17];
	unsigned int character;

	// For Resistance
	snprintf( Buffer, sizeof( Buffer ), "R: %5u Ohms", Res );
	// Buffer now contains your character ASCII codes for LED Display
	//- select PAGE (LED Display line) and set starting SEG (column)
	//- for each c = ASCII code = Buffer[0], Buffer[1], ...,
	//send 8 bytes in Characters[c][0-7] to LED Display

	//set the starting position on the OLED display for row2
	oled_Write_Cmd(0xB2); //set to page2 (row2) of the display
	oled_Write_Cmd(0x05); //set the lower nibble of the column SEG
	oled_Write_Cmd(0x10); //set the upper nibble of the column SEG
	
	// Iterate over the buffer characters and write to the display
	for (int i = 0; i < 16; i++){
		if(Buffer[i]==0){
			break;
		}
		//write 8 bytes representing the current character to the display
		for (int count = 0; count < 8; count++) {
			oled_Write_Data(Characters[Buffer[i]][count]);
		}
	}
	// create a delay for correct update rate
	TIM3_Start();
	while ((TIM3->SR & TIM_SR_UIF) == 0);

	// For Frequency
	snprintf( Buffer, sizeof( Buffer ), "F: %5u Hz", Freq );
	/* Buffer now contains your character ASCII codes for LED Display
	- select PAGE (LED Display line) and set starting SEG (column)
	- for each c = ASCII code = Buffer[0], Buffer[1], ...,
	send 8 bytes in Characters[c][0-7] to LED Display
	*/
	oled_Write_Cmd(0xB4); //set to page2 (row2) of the display
	oled_Write_Cmd(0x05); //set the lower nibble of the column SEG
	oled_Write_Cmd(0x10); //set the upper nibble of the column SEG
	
	// Iterate over the buffer characters and write to the display
	for (int i = 0; i < 16; i++){
		if(Buffer[i]==0){
			break;
		}
		//write 8 bytes representing the current character to the display
		for (int count = 0; count < 8; count++) {
			oled_Write_Data(Characters[Buffer[i]][count]);
		}
	}
	// create a delay for correct update rate
	TIM3_Start();
	while ((TIM3->SR & TIM_SR_UIF) == 0);
}


void oled_Write_Cmd( unsigned char cmd ){
	GPIOB->BSRR|=GPIO_BSRR_BS_6; // make PB6 = CS# = 1
	GPIOB->BSRR|=GPIO_BSRR_BR_7; // make PB7 = D/C# = 0
	GPIOB->BSRR|=GPIO_BSRR_BR_6;// make PB6 = CS# = 0
   	oled_Write( cmd );
    	GPIOB->BSRR|=GPIO_BSRR_BS_6; // make PB6 = CS# = 1
}

void oled_Write_Data( unsigned char data ){
	GPIOB->BSRR|=GPIO_BSRR_BS_6; // make PB6 = CS# = 1
	GPIOB->BSRR|=GPIO_BSRR_BS_7; // make PB7 = D/C# = 1
	GPIOB->BSRR|=GPIO_BSRR_BR_6; // make PB6 = CS# = 0
    	oled_Write( data );
	GPIOB->BSRR|=GPIO_BSRR_BS_6;// make PB6 = CS# = 1
}


void oled_Write( unsigned char Value ) {
	//waiting until SPI1 is ready for writing (TXE =1)
	while(((SPI1->SR)&SPI_SR_TXE)==0);

	//send one 8-bit character
	HAL_SPI_Transmit( &SPI_Handle, &Value, 1, HAL_MAX_DELAY );
	// Wait until transmission is complete (TXE = 1 in SPI1_SR) 
	while(((SPI1->SR)&SPI_SR_TXE)==0);
}

void myGPIO_Init() {
	//************ADC************
	//Enable the GPIOA clock
	RCC->AHBENR |= RCC_AHBENR_GPIOAEN;
	//Reset MODER and PUPDR 
	GPIOA->MODER = 0X28000000;
	GPIOA->PUPDR = 0X24000000;

	//enable the clock for ADC
	RCC->APB2ENR|=RCC_APB2ENR_ADCEN; 

	//Calibrate the ADC
	ADC1->CR|=ADC_CR_ADCAL;
	//wait until callibration is done
	while(((ADC1->CR)&ADC_CR_ADCAL) != 0); //if it is still set to 1 the callibration process is still in process
	
	//ADC configurations
	ADC1->CFGR1 &= ~(ADC_CFGR1_RES); //configure resolution to 12 bit resolution 
	ADC1->CFGR1 |= ADC_CFGR1_CONT;//enable continuous conversion mode
	ADC1->CFGR1|= ADC_CFGR1_OVRMOD; //enable overrun management mode

	GPIOA->MODER |= GPIO_MODER_MODER5; //connect PA5 and ADC
	ADC1->CHSELR|=ADC_CHSELR_CHSEL5; //enable channel 5 conversion
	ADC1->SMPR|=ADC_SMPR_SMP; //set the ADC sampling speed

	//enable ADC after configurations are complete
	ADC1->CR|=ADC_CR_ADEN; 
	while(((ADC1->ISR)& ADC_ISR_ADRDY) ==0); //wait until ADC is ready after enabling

	//************DAC************
	RCC->APB1ENR|= RCC_APB1ENR_DACEN;//enable clock for DAC
	GPIOA->MODER |= GPIO_MODER_MODER4;//configure PA4 as analog mode
	DAC->CR &=~(DAC_CR_BOFF1);//ensure that tri state buffer is enabled
	//DAC->CR &=~(DAC_CR_TEN1);//ensure channel1 trigger is disabled
	DAC->CR|=DAC_CR_EN1;//enable DAC (can only be done after configuring PA4)


	//************555 Timer************
	GPIOA->MODER &= ~(GPIO_MODER_MODER1);//configure PA1 as input
	GPIOA->PUPDR &= ~(GPIO_PUPDR_PUPDR1);//ensure no pull up no pull down

	//************User Push Button************
	GPIOA->MODER &= ~(GPIO_MODER_MODER0);//configure PA0 as input
	GPIOA->PUPDR &= ~(GPIO_PUPDR_PUPDR0);//ensure no pull up pull down

	//************Function Generator************
	GPIOA->MODER &= ~(GPIO_MODER_MODER2); //configure PA2 as input
	GPIOA->PUPDR &= ~(GPIO_PUPDR_PUPDR2); //ensure no pull up pull down
}

/* This handler is declared in system/src/cmsis/vectors_stm32f051x8.c */
void EXTI0_1_IRQHandler() {
	unsigned int period = 0;//stores the calculated period

	//check if the user push button was pressed
	if ((EXTI->PR & EXTI_PR_PR0) != 0) {
		//check to see if source is TIMER555
    		if(currentSource == 0){
	    		currentSource=1;//indicate new source
	    		EXTI->IMR &= ~(EXTI_IMR_MR1);//mask EXTI1 interrupts
	    		EXTI->IMR|=EXTI_IMR_MR2;//unmask EXTI2 interrupts
	    		//trace_printf("EXTI2 enabled");//optional message
	    	}else{//source is function generator
	    		currentSource = 0;//indicate new source
	    		EXTI->IMR &= ~(EXTI_IMR_MR2);//mask EXTI2 interrupts
	    		EXTI->IMR|=EXTI_IMR_MR1;//unmask EXTI1 interrupts
	    		//trace_printf("EXTI1 enabled");//optional message
	    	}
	    	EXTI->PR |= EXTI_PR_PR2;//clear EXTI2 flag to prevent error
	    	EXTI->PR |= EXTI_PR_PR1;//clear EXTI1 flag to prevent error
	        EXTI->PR |= EXTI_PR_PR0;//clear user push button flag
	}

	//check if a rising edge detected on PA1
	if ((EXTI->PR & EXTI_PR_PR1) != 0) {
		//check to see if EXTI1 is the current frequency source
	        if(currentSource == 0){
			//check what edge this is
	        	if (state == 0) {
	        		TIM2->CNT = 0;//clear count if it is first guy
	                	TIM2->CR1 |= TIM_CR1_CEN;//start counting while we wait for second guy
	                	state = 1;//indicate we wait for second
	            	}else{//second edge
	                	TIM2->CR1 &= ~(TIM_CR1_CEN);//stop counting
	               		unsigned int count = TIM2->CNT;//check what the count is
	                	Freq = 48000000/count;//update frequency
	                	state = 0; //reset the state for next wave
	            	}
	        }   
        	EXTI->PR |= EXTI_PR_PR1;//clear the pending flag
	}
}


/* This handler is declared in system/src/cmsis/vectors_stm32f051x8.c */
void EXTI2_3_IRQHandler() {
	// Declare/initialize your local variables here...
	unsigned int frequency = 0; //to store the calculated frequency
	unsigned int period = 0; //to store the calculated period
	unsigned int periods = 0; //to store the calculated period
	/* Check if EXTI2 interrupt pending flag is indeed set */
	if ((EXTI->PR & EXTI_PR_PR2) != 0) {
		//if this is the first edge
        if(state == 0){
			state = 1; //signal with global varible that first edge was encountered
			TIM2->CNT = 0; //clear timer count register
			TIM2->CR1 |= TIM_CR1_CEN; // Start the timer by or'ing with 0x00000001
		}else{//Else (this is the second edge):
			//	- Stop timer (TIM2->CR1) by clearing the CEN bit
			TIM2->CR1 &= ~(TIM_CR1_CEN); //stop timer by and'ing with 0x11111110 which preserves set bits while clearing the count enable bit
			period = TIM2->CNT; //Read out count register that TIM2 points to (# of clock cycles elapsed)
				Freq = 48000000 / period;
			state = 0; //reset state back to 0 for the next signal
		}
	EXTI->PR |= EXTI_PR_PR2; //clear the pending interrupt flag so it can be retriggered in the future
	}
}
//this ones for the timer 555
// need to enable interrupts on PA1
void myEXTI1_Init() {
	// Map EXTI1 line to PA1
	SYSCFG->EXTICR[0] = 0;
	SYSCFG->EXTICR[0] |= SYSCFG_EXTICR1_EXTI1_PA;
	// EXTI1 line interrupts: set rising-edge trigger
	EXTI->RTSR|=EXTI_RTSR_TR1;
	// Unmask interrupts from EXTI1 line
	EXTI->IMR |= EXTI_IMR_MR1;
	// Assign EXTI1 interrupt priority = 0 in NVIC

	/* Map EXTI0 line to PA0 */
	SYSCFG->EXTICR[0] |= SYSCFG_EXTICR1_EXTI0_PA;
	/* EXTI0 line interrupts: set rising-edge trigger */
	// Relevant register: EXTI->RTSR
	EXTI->FTSR|=EXTI_FTSR_TR0 ;
	/* Unmask interrupts from EXTI0 line */
	// Relevant register: EXTI->IMR
	EXTI->IMR |= EXTI_IMR_IM0;

	NVIC_SetPriority(EXTI0_1_IRQn, 0);

	// Enable EXTI1 interrupts in NVIC
	NVIC_EnableIRQ(EXTI0_1_IRQn);
	trace_printf("EXTI1 initialized \n");
}

void myEXTI_Init(){
	/* Map EXTI2 line to PA2 */
	// Relevant register: SYSCFG->EXTICR[0]
	SYSCFG->EXTICR[0] = 0;
	SYSCFG->EXTICR[0] |= SYSCFG_EXTICR1_EXTI2;
	/* EXTI2 line interrupts: set rising-edge trigger */
	// Relevant register: EXTI->RTSR
	EXTI->RTSR|=EXTI_RTSR_TR2;
	/* mask interrupts from EXTI2 line */
	// Relevant register: EXTI->IMR
	EXTI->IMR &= ~(EXTI_IMR_MR2);

	/* Assign EXTI2 interrupt priority = 0 in NVIC */
	// Relevant register: NVIC->IP[2], or use NVIC_SetPriority
	NVIC_SetPriority(EXTI2_3_IRQn, 0);

	/* Enable EXTI2 interrupts in NVIC */
	// Relevant register: NVIC->ISER[0], or use NVIC_EnableIRQ
	NVIC_EnableIRQ(EXTI2_3_IRQn);
}
void oled_config( void ) {
	RCC->AHBENR|=RCC_AHBENR_GPIOBEN; // Don't forget to enable GPIOB clock in RCC
	RCC->APB2ENR|=RCC_APB2ENR_SPI1EN; // Don't forget to enable SPI1 clock in RCC

	GPIOB->MODER = 0;
	GPIOB->PUPDR = 0;
	GPIOB->AFR[0] = 0; //this will set them to be AF0 cause default

	GPIOB->MODER|= GPIO_MODER_MODER3_1; //set to Alternate Function
	GPIOB->MODER|= GPIO_MODER_MODER5_1; //set to Alternate Function

	GPIOB->MODER|= GPIO_MODER_MODER4_0; //PB4 set to GP output 01
	GPIOB->MODER|= GPIO_MODER_MODER6_0; //PB6 set to GP output 01
	GPIOB->MODER|= GPIO_MODER_MODER7_0; //PB7 set to GP output 01

    	SPI_Handle.Instance = SPI1;

	SPI_Handle.Init.Direction = SPI_DIRECTION_1LINE;
	SPI_Handle.Init.Mode = SPI_MODE_MASTER;
	SPI_Handle.Init.DataSize = SPI_DATASIZE_8BIT;
	SPI_Handle.Init.CLKPolarity = SPI_POLARITY_LOW;
	SPI_Handle.Init.CLKPhase = SPI_PHASE_1EDGE;
	SPI_Handle.Init.NSS = SPI_NSS_SOFT;
	SPI_Handle.Init.BaudRatePrescaler = SPI_BAUDRATEPRESCALER_256;
	SPI_Handle.Init.FirstBit = SPI_FIRSTBIT_MSB;
	SPI_Handle.Init.CRCPolynomial = 7;

    // Initialize the SPI interface
	HAL_SPI_Init( &SPI_Handle );

    // Enable the SPI
	__HAL_SPI_ENABLE( &SPI_Handle );

    // make pin PB4 = 0
	GPIOB->BSRR|=GPIO_BSRR_BR_4;
    // wait for a few ms
	TIM3_Start();
	while ((TIM3->SR & TIM_SR_UIF) == 0);

	// make pin PB4 = 1
	GPIOB->BSRR|=GPIO_BSRR_BS_4;
	//wait a few ms
	TIM3_Start();
	while ((TIM3->SR & TIM_SR_UIF) == 0);

	//Send initialization commands to LED Display
    for ( unsigned int i = 0; i < sizeof( oled_init_cmds ); i++ ) {
        oled_Write_Cmd( oled_init_cmds[i] );
    }

    // Fill the LED display data memory (GDDRAM) with zeros
    for (unsigned int page = 0; page < 8; page++) {
	// Set page address
	oled_Write_Cmd(0xB0 + page);
	// Set column address to 0
	oled_Write_Cmd(0x02); // Lower nibble of column start
	oled_Write_Cmd(0x10); // Upper nibble of column start

	// Write 128 zeros to clear the page
	for (unsigned int seg = 0; seg < 128; seg++) {
		oled_Write_Data(0x00); // Write a zero to the current segment
	}
    }
}

void TIM3_Start(void) {
	// Reset the counter
	TIM3->CNT = 0;
	// Clear any pending UIF flag
	TIM3->SR &= ~TIM_SR_UIF;
	// Enable the counter
	TIM3->CR1 |= TIM_CR1_CEN;
	//trace_printf("TIM3 started\n");
}

void myTIM3_Init(void) {
	// Enable clock for TIM3 peripheral
	RCC->APB1ENR |= RCC_APB1ENR_TIM3EN;
	//Configure TIM3: buffer auto-reload, count up, stop on overflow,
	TIM3->CR1 = ((uint16_t)0x0080);
	/* Set clock prescaler value */
	TIM3->PSC = myTIM3_PRESCALER;
	/* Set auto-reloaded delay */
	TIM3->ARR = myTIM3_PERIOD;
	/* Update timer registers */
	// Relevant register: TIM3->EGR
	TIM3->EGR = ((uint16_t)0x0001);
	TIM3->CR1 |= TIM_CR1_CEN;
	//trace_printf("TIM3 initialized \n");
}

void myTIM2_Init() {
	// Enable clock for TIM2 peripheral
	RCC->APB1ENR |= RCC_APB1ENR_TIM2EN;

	/* Configure TIM2: buffer auto-reload, count up, stop on overflow,
	* enable update events, interrupt on overflow only */
	// Relevant register: TIM2->CR1
	TIM2->CR1 = ((uint16_t)0x008C);

	/* Set clock prescaler value */
	TIM2->PSC = myTIM2_PRESCALER;
	/* Set auto-reloaded delay */
	TIM2->ARR = myTIM2_PERIOD;

	/* Update timer registers */
	// Relevant register: TIM2->EGR
	TIM2->EGR = ((uint16_t)0x0001);

	/* Assign TIM2 interrupt priority = 0 in NVIC */
	// Relevant register: NVIC->IP[3], or use NVIC_SetPriority
	NVIC_SetPriority(TIM2_IRQn, 0);

	/* Enable TIM2 interrupts in NVIC */
	// Relevant register: NVIC->ISER[0], or use NVIC_EnableIRQ
	NVIC_EnableIRQ(TIM2_IRQn);

	/* Enable update interrupt generation */
	// Relevant register: TIM2->DIER
	TIM2->DIER |= TIM_DIER_UIE;
	TIM2->CR1 |= TIM_CR1_CEN;
	trace_printf("TIM2 initialized \n");
}

#pragma GCC diagnostic pop

// ----------------------------------------------------------------------------
