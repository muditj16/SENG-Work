
/* Standard includes. */
#include <stdint.h>
#include <stdio.h>
#include "stm32f4_discovery.h"
/* Kernel includes. */
#include "stm32f4xx.h"
#include "../FreeRTOS_Source/include/FreeRTOS.h"
#include "../FreeRTOS_Source/include/queue.h"
#include "../FreeRTOS_Source/include/semphr.h"
#include "../FreeRTOS_Source/include/task.h"
#include "../FreeRTOS_Source/include/timers.h"
#include <stdlib.h>


/*-----------------------------------------------------------*/
#define mainQUEUE_LENGTH 100
#define GREEN  	GPIO_PIN_2
#define RED  	GPIO_PIN_0
#define AMBER	GPIO_PIN_1
#define DATA	GPIO_PIN_6
#define CLOCK	GPIO_PIN_7
#define RESET	GPIO_PIN_8
#define TICKS pdMS_TO_TICKS(100)

/*
 * TODO: Implement this function for any hardware specific clock configuration
 * that was not already performed before main() was called.
 */
static void prvSetupHardware( void );





xQueueHandle xQueue_TRAFFIC_FLOW = 0;
xQueueHandle xQueue_TRAFFIC_LIGHT = 0;
xQueueHandle xQueue_TRAFFIC_GENERATOR = 0;

TimerHandle_t xTim_GREEN=0;
TimerHandle_t xTim_RED=0;
TimerHandle_t xTim_AMBER =0;





/*
 * The queue send and receive tasks as described in the comments at the top of
 * this file.
 */
static void Manager_Task( void *pvParameters );

xQueueHandle xQueue_handle = 0;

void GPIO_out_init( void );
void led_data( unsigned char data );
void my_adc_init( void );
void status_toggle( void );
uint16_t my_adc_convert( void );
void initialize_traffic_lights( void );

void Delay( void );
void Traffic_Flow_Adjustment_Task	( void *pvParameters );
void Traffic_Light_State_Task(void *pvParameters);
void Traffic_Generator_Task(void *pvParameters);
void System_Display_Task(void *pvParameters);
void xGreenDone(TimerHandle_t xTim);
void xRedDone(TimerHandle_t xTim);
void xAmberDone(TimerHandle_t xTim);




unsigned char digits[10] = { 0x3f, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F };


/*-----------------------------------------------------------*/


int main(void)
{
	initialize_traffic_lights();
	
	//initialize LEDs
    STM_EVAL_LEDInit(amber_led);
	STM_EVAL_LEDInit(green_led);
	STM_EVAL_LEDInit(red_led);
	STM_EVAL_LEDInit(blue_led);

	//queues for traffic system components
	xQueue_TRAFFIC_FLOW = xQueueCreate(1, sizeof(int));
	xQueue_TRAFFIC_LIGHT = xQueueCreate(1, sizeof(uint16_t));
	xQueue_TRAFFIC_GENERATOR = xQueueCreate(1, sizeof(int));

	/* Configure the system ready to run the demo.  The clock configuration
	can be done here if it was not done before main() was called. */
	prvSetupHardware();
	xTaskCreate( Manager_Task, "Manager", configMINIMAL_STACK_SIZE, NULL, 2, NULL);




	//check if all queues were created successfullly
if (xQueue_TRAFFIC_FLOW && xQueue_TRAFFIC_LIGHT && xQueue_TRAFFIC_GENERATOR){
	xTaskCreate(Traffic_Flow_Adjustment_Task, "Traffic_Flow_Adjustment", configMINIMAL_STACK_SIZE, NULL, 1, NULL);
	xTaskCreate(Traffic_Light_State_Task, "Traffic_Light_State", configMINIMAL_STACK_SIZE, NULL, 1, NULL);
	xTaskCreate(Traffic_Generator_Task, "Traffic_Generator", configMINIMAL_STACK_SIZE, NULL, 1, NULL);
	xTaskCreate(System_Display_Task, "System_Display", configMINIMAL_STACK_SIZE, NULL, 1, NULL);

	//expires after 5 sec, pdFALSE means timer will expire once and will not restart again automatically
	xTim_GREEN = xTimerCreate("TIM1", pdMs_TO_TICKS(5000), pdFALSE, 0, xGreenDone);
	xTim_RED = xTimerCreate("TIM2", pdMs_TO_TICKS(5000), pdFALSE,0, xRedDone);
	xTim_AMBER = xTimerCreate("TIM3", pdMs_TO_TICKS(5000), pdFALSE,0, xAmberDone);

	vQueueAddToRegistry(xQueue_TRAFFIC_FLOW, "xQueue_TRAFFIC_FLOW" );
	vQueueAddToRegistry( xQueue_TRAFFIC_LIGHT, "xQueue_TRAFFIC_LIGHT" );
	vQueueAddToRegistry( xQueue_TRAFFIC_GENERATOR, "xQueue_TRAFFIC_GENERATOR" );

}

	/* Start the tasks and timer running. */
	vTaskStartScheduler();

	return 0;
}


/*-----------------------------------------------------------*/

static void Manager_Task( void *pvParameters )
{
//
// Display mode range 1 to 3
//
	uint16_t mode = 1;

	uint16_t counter = 0;
	uint16_t delay = 0;

	uint16_t adc_data = 0;
	uint8_t led1 = 0;
	while(1)
	{
		adc_data = my_adc_convert() / 409;
		printf("ADC: %u\n", adc_data);
		if ( adc_data >= 10 )
		{
			adc_data = 9;
		}

		if(led1 == 0){
			GPIO_SetBits(GPIOC, GPIO_Pin_0);
			led1 = 1;
		}
		else{
			GPIO_ResetBits(GPIOC, GPIO_Pin_0);
			led1 = 0;
		}



		if ( mode == 1 )
		{
			status_toggle();
			delay = 250;
			led_data( digits[counter] );
		}
		else if ( mode == 2 )
		{
			delay = 250;
			led_data( digits[adc_data] );
		}
		else
		{
			delay = (100*adc_data) + 100;
			led_data( digits[counter] );
		}

		counter = counter + 1;
		if ( counter >= 10 )
		{
			counter = 0;
		}


		vTaskDelay( delay );
	}
}

void initialize_traffic_lights( void ){
	RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOC, ENABLE);
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_ADC1, ENABLE);
	GPIO_out_init();
	my_adc_init();
}

void GPIO_out_init( void ) {
	GPIO_InitTypeDef GPIOC_InitStruct;
	GPIOC_InitStruct.GPIO_Mode = GPIO_Mode_OUT;
	GPIOC_InitStruct.GPIO_OType = GPIO_OType_PP;
	GPIOC_InitStruct.GPIO_Pin = GPIO_Pin_0 | GPIO_Pin_1 | GPIO_Pin_2 | GPIO_Pin_6 | GPIO_Pin_7 | GPIO_Pin_8;
	GPIOC_InitStruct.GPIO_PuPd = GPIO_PuPd_NOPULL;
	GPIOC_InitStruct.GPIO_Speed = GPIO_Speed_50MHz;
	//GPIO_Init(GPIO_TypeDef* GPIOx, GPIO_InitTypeDef* GPIO_InitStruct);
	GPIO_Init(GPIOC, &GPIOC_InitStruct);
}
void my_adc_init(){
	GPIO_InitTypeDef GPIOC_InitStruct;
	GPIOC_InitStruct.GPIO_Mode = GPIO_Mode_AN;
	GPIOC_InitStruct.GPIO_OType = GPIO_OType_PP;
	GPIOC_InitStruct.GPIO_Pin = GPIO_Pin_3;
	GPIOC_InitStruct.GPIO_PuPd = GPIO_PuPd_NOPULL;
	GPIOC_InitStruct.GPIO_Speed = GPIO_Speed_50MHz;
	//GPIO_Init(GPIO_TypeDef* GPIOx, GPIO_InitTypeDef* GPIO_InitStruct);
	GPIO_Init(GPIOC, &GPIOC_InitStruct);

	ADC_InitTypeDef ADC_InitStruct;
	ADC_InitStruct.ADC_ContinuousConvMode = DISABLE;
	ADC_InitStruct.ADC_ExternalTrigConv = ADC_ExternalTrigConv_T1_CC1;
	ADC_InitStruct.ADC_ExternalTrigConvEdge = ADC_ExternalTrigConvEdge_None;
	ADC_InitStruct.ADC_NbrOfConversion = 1;
	ADC_InitStruct.ADC_Resolution = ADC_Resolution_12b;
	ADC_InitStruct.ADC_ScanConvMode = DISABLE;

	// void ADC_Init(ADC_TypeDef* ADCx, ADC_InitTypeDef* ADC_InitStruct)
	ADC_Init(ADC1, &ADC_InitStruct);
	ADC_Cmd (ADC1, ENABLE);
	// void ADC_RegularChannelConfig(ADC_TypeDef* ADCx, uint8_t ADC_Channel, uint8_t Rank, uint8_t ADC_SampleTime)
	ADC_RegularChannelConfig(ADC1, ADC_Channel_13, 1, ADC_SampleTime_3Cycles);
}

uint16_t my_adc_convert( void ) {
	uint16_t sample_data;
	ADC_SoftwareStartConv(ADC1);
	while (!ADC_GetFlagStatus(ADC1, ADC_FLAG_EOC));
	sample_data = ADC_GetConversionValue(ADC1);
	return sample_data;
}


void Traffic_Flow_Adjustment_Task(void *pvParameters){
	int res_val;
	for(;;){
		//scale the potentiometer value to a range of 0-10
        res_val = my_adc_convert()/10;
		//save new potentiometer value in queue 
        //not sure if xQueueSend would be better
		xQueueOverwrite(xQueue_TRAFFIC_FLOW, &res_val);
        printf("Traffic queue : %u\n", res_val);
		vTaskDelay(TICKS*5);
		
	}
}


void Traffic_Generator_Task(void *pvParameters){
	uint16_t potentiometer_value = 0;
	for(;;){
		xQueuePeek(xQueue_TRAFFIC_FLOW, &potentiometer_value, 1000);
	
	
		//this is done to cap the max at 100.
		potentiometer_value += 20;
		potentiometer_value = (int) ((double)potentiometer_value/1.2);
	
	
		//generate random number between 0-100
		int random = (rand()*100) / RAND_MAX;
		printf("rand: %d adc: %u \n", random, potentiometer_value);
	
	
		//if random number is greater than pot val then generate a new care if not do not generate a new car
		if(random <= potentiometer_value) { //Create new car
			//Send car to new queue
			int new_car = 1;
			xQueueSend(xQueue_TRAFFIC_GENERATOR, &new_car, 1000);
			printf("car generated\n");
		} else{
			int new_car = 0;
			xQueueSend(xQueue_TRAFFIC_GENERATOR, &new_car, 1000);
			printf("no car generated\n");
		}
		vTaskDelay(pdMS_TO_TICKS(500));
	}
}
	



void System_Display_Task(void *pvParameters){
	#define CAR_SPOTS 19
	#define STOP_POSITION 8	//Position where cars should stop if light turns yellow
	#define YELLOW_LIGHT_POSITION 6	//Position where light turns yellow
	void update_traffic_display(int traffic_pos[CAR_SPOTS])
	{
		//Reset all the car spots
		GPIO_ResetBits(GPIOB, RESET);
		GPIO_SetBits(GPIOB, RESET);
	
		for(int i=CAR_SPOTS-1; i>=0; --i) {
			//If there is a car in the spot, set the data pin high
			if(traffic_pos[i]){
				GPIO_SetBits(GPIOB, DATA);
			}
			GPIO_SetBits(GPIOB, CLOCK);
			GPIO_ResetBits(GPIOB, DATA | CLOCK);
		}
	}
	
	/*-----------------------------------------------------------*/
	/*
	 * System Display Task
	 * Description: task that updates the system display based on the traffic light state and the car queue.
	 * Input: void *pvParameters - pointer to parameters
	 * Output: void
	 */
	static void System_Display_Task( void *pvParameters )
	{
		int new_car = 0;
		int traffic_pos[19] = {};
	
		for(;;)
			if(xQueueReceive(xQueue_TRAFFIC_GENERATOR, &new_car, 1000)) { // Update traffic
	
				// Start with traffic beyond stop line, always shift
				for(int i=CAR_SPOTS-1; i>=STOP_POSITION; --i) {
					traffic_pos[i] = traffic_pos[i-1];
				}
	
				// Traffic past yellow light position can go if light is yellow
				if(xGreenDone()) {
					for (int i=STOP_POSITION-1; i>=YELLOW_LIGHT_POSITION; --i) {
						traffic_pos[i] = traffic_pos[i-1];
					}
				}
	
				// Traffic at stop line, shift when traffic light is green
				if(xRedDone()){
					for(int i=YELLOW_LIGHT_POSITION-1; i>=1; --i) {
						traffic_pos[i] = traffic_pos[i-1];
					}
					traffic_pos[0] = 0;
				} 
				
				}
	
				// Add new car value if no traffic jam and new car value is 1
				traffic_pos[0] = new_car && !traffic_pos[0];
			}
			update_traffic_display(traffic_pos);
		}
	


void Traffic_Light_State_Task( void *pvParameters )
{
	xTimerStart( xTim_GREEN, 0);

	uint16_t LIGHT = GREEN;
	xQueueOverwrite(xQueue_TRAFFIC_LIGHT, &LIGHT);

	for( ;; )
	{
		vTaskDelay(100 * TICKS );
	}

}



void xGreenDone ( TimerHandle_t xTim)
{
	xTimerStart(xTim_AMBER, 0);
    // Set the traffic light to AMBER
    uint16_t LIGHT;
    
		if(xQueueReceive(xQueue_TRAFFIC_LIGHT, &LIGHT, 500))
		{
			if(LIGHT == AMBER)
			{
				GPIO_ResetBits(GPIOB, GREEN);       //reset green
                GPIO_SetBits(GPIOB, AMBER);
                xTimerChangePeriod( xTim, pdMS_TO_TICKS(3000), 1000); //Set timer period to 3 seconds
				printf("Green Off, changed to AMBER.\n");
			}
        
		}
	
}



//inversely proportional to potentiometer value
void xAmberDone ( TimerHandle_t xTim){

    int flow;
	BaseType_t xStatus = xQueuePeek( xQueue_TRAFFIC_FLOW, &flow, TICKS );

    // Set the traffic light to AMBER
    uint16_t LIGHT;
    
		if(xQueueReceive(xQueue_TRAFFIC_LIGHT, &LIGHT, 500) && LIGHT == AMBER)
		{
			if(LIGHT == RED)
			{
				GPIO_ResetBits(GPIOB, AMBER);       //reset amber
                GPIO_SetBits(GPIOB, RED);
                xTimerChangePeriod( xTim_RED, pdMS_TO_TICKS(10000 - 50 * flow), 0); //AS FLOW INCREASES PERIOD DECREASES
				printf("AMBER Off, red on.\n");
			}
		
        }
    

}


//proportional to potentiometer value
void xRedDone ( TimerHandle_t xTim)
{

    int flow;
	BaseType_t xStatus = xQueuePeek( xQueue_TRAFFIC_FLOW, &flow, TICKS );

    // Set the traffic light to AMBER
    uint16_t LIGHT;
    
		if(xQueueReceive(xQueue_TRAFFIC_LIGHT, &LIGHT, 500))
		{
			if(LIGHT == GREEN)
			{
				GPIO_ResetBits(GPIOB, RED);       //reset RED
                GPIO_SetBits(GPIOB, GREEN);
                xTimerChangePeriod( xTim_GREEN, pdMS_TO_TICKS(5000 + 50 * flow), 0 );
				printf("RED Off, green on.\n");
			}
			
		}
	
}

/*-----------------------------------------------------------*/

void vApplicationMallocFailedHook( void )
{
	/* The malloc failed hook is enabled by setting
	configUSE_MALLOC_FAILED_HOOK to 1 in FreeRTOSConfig.h.

	Called if a call to pvPortMalloc() fails because there is insufficient
	free memory available in the FreeRTOS heap.  pvPortMalloc() is called
	internally by FreeRTOS API functions that create tasks, queues, software 
	timers, and semaphores.  The size of the FreeRTOS heap is set by the
	configTOTAL_HEAP_SIZE configuration constant in FreeRTOSConfig.h. */
	for( ;; );
}
/*-----------------------------------------------------------*/

void vApplicationStackOverflowHook( xTaskHandle pxTask, signed char *pcTaskName )
{
	( void ) pcTaskName;
	( void ) pxTask;

	/* Run time stack overflow checking is performed if
	configconfigCHECK_FOR_STACK_OVERFLOW is defined to 1 or 2.  This hook
	function is called if a stack overflow is detected.  pxCurrentTCB can be
	inspected in the debugger if the task name passed into this function is
	corrupt. */
	for( ;; );
}
/*-----------------------------------------------------------*/

void vApplicationIdleHook( void )
{
volatile size_t xFreeStackSpace;

	/* The idle task hook is enabled by setting configUSE_IDLE_HOOK to 1 in
	FreeRTOSConfig.h.

	This function is called on each cycle of the idle task.  In this case it
	does nothing useful, other than report the amount of FreeRTOS heap that
	remains unallocated. */
	xFreeStackSpace = xPortGetFreeHeapSize();

	if( xFreeStackSpace > 100 )
	{
		/* By now, the kernel has allocated everything it is going to, so
		if there is a lot of heap remaining unallocated then
		the value of configTOTAL_HEAP_SIZE in FreeRTOSConfig.h can be
		reduced accordingly. */
	}
}
/*-----------------------------------------------------------*/

static void prvSetupHardware( void )
{
	/* Ensure all priority bits are assigned as preemption priority bits.
	http://www.freertos.org/RTOS-Cortex-M3-M4.html */
	NVIC_SetPriorityGrouping( 0 );

	/* TODO: Setup the clocks, etc. here, if they were not configured before
	main() was called. */
}

