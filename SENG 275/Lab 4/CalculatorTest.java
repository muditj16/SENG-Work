import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

//each test case has at least one test case that fails due to mutation.
//100% mutation was achieved

public class CalculatorTest {
    Calculator calculator;

    @BeforeEach
    void setUp(){
        calculator = new Calculator();
    }
    @Test
    void testFirstZero(){       //fails when sign changed
        assertEquals(-5, calculator.ComplexAdd(0,5));
    }
    @Test
    void testFirstNegative(){   //fails when return statement is removed
        assertEquals(15, calculator.ComplexAdd(-5,-10));
    }
    @Test
    void testEqualsTwo(){           //fails when sign changes addition to subtraction
        assertEquals(5, calculator.ComplexAdd(2,3));
    }
    @Test
    void testGreaterThanTwo(){          //fails when multiplication is added to result
        assertEquals(10, calculator.ComplexAdd(3,7));
    }
    @Test
    void testLessThanTwo(){
        assertEquals(-7, calculator.ComplexAdd(1,6));
    }
    @Test
    void testIsPositive(){
        assertEquals(8, calculator.ComplexAdd(4,4));    //fails when one of the operands is removed
    }


    @Test
    void testIsNegative() {         //when addition changed to subtraction
        assertEquals(-3, calculator.ComplexAdd(5, -8));
    }

    @Test
    void testAandBAreZero() {       //when constant added to result
        assertEquals(0, calculator.ComplexAdd(0, 0));
    }


}

