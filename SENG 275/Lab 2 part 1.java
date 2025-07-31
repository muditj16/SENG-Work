import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AddMyAlphasTest {
    @Test
    void emptyStringTest(){
        AddMyAlphas push = new AddMyAlphas();
        assertEquals(0, push.Add(""));
    }
    @Test
    void singleNumTest(){
        AddMyAlphas push = new AddMyAlphas();
        assertEquals(1, push.Add("1"));
    }
    @Test
    void multipleNumsTest(){
        AddMyAlphas push = new AddMyAlphas();
        assertEquals(3, push.Add("1,2"));
    }

    @Test
    void linesBetweenTest(){
        AddMyAlphas push = new AddMyAlphas();
        assertEquals(6, push.Add("1\n2,3"));
    }
    @Test
    void biggerThan100Test(){
        AddMyAlphas push = new AddMyAlphas();
        Exception negative = assertThrows(IllegalArgumentException.class, () -> {
            push.Add("0, 1, -2");
        });
        assertEquals("no negatives allowed: -2", negative.getMessage());
    }
    @Test
    void negativeNumbersTest(){
        AddMyAlphas push = new AddMyAlphas();
        assertEquals(2, push.Add("1001,2"));
    }
    @Test
    void delimitersTest(){
        AddMyAlphas push = new AddMyAlphas();
        assertEquals(3, push.Add("//;\n1;2"));
    }
}
