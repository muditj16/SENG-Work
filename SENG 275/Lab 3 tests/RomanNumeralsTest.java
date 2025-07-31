import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class RomanNumeralsTest {





    @Test
    void correctInteger(){
        RomanNumerals romanNumerals= new RomanNumerals();
        assertEquals(1, romanNumerals.convert("I"));
        assertEquals(6, romanNumerals.convert("VI"));
        assertEquals(7, romanNumerals.convert("VII"));
        assertEquals(11, romanNumerals.convert("XI"));
        assertEquals(40, romanNumerals.convert("XL"));
        assertEquals(101, romanNumerals.convert("CI"));
        assertEquals(1842, romanNumerals.convert("MDCCCXLII"));

    }





    @Test
    void returnsZero(){
        RomanNumerals romanNumeral= new RomanNumerals();
        assertEquals(0, romanNumeral.convert(""));
        assertEquals(0, romanNumeral.convert("XXXX"));
        assertEquals(0, romanNumeral.convert("ABC"));
        assertEquals(0, romanNumeral.convert("VV"));
        assertEquals(0, romanNumeral.convert("DD"));
        assertEquals(0, romanNumeral.convert("DCM"));

    }
}
