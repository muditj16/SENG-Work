import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

class BoundaryTest {
    @Test
    void isUnsafe() {
        assertTrue(Boundary.isUnsafe(86));
    }

    @Test
    void isNotUnsafe() {
        assertFalse(Boundary.isUnsafe(85));
    }

    @ParameterizedTest
    @ValueSource(ints = {5,10,20})
    void isComfortable_WithinRange(int temperature) {   //on points
        assertTrue(Boundary.isComfortable(temperature));
    }

    @ParameterizedTest
    @ValueSource(ints = {3, 22})
    void isComfortable_OutsideRange(int temperature) {  //off points
        assertFalse(Boundary.isComfortable(temperature));
    }

    @ParameterizedTest
    @CsvSource({"1, 0", "2, 1", "6, 2"})
    void elevatorsRequired(int storeys, int expected){
        assertEquals(expected, Boundary.elevatorsRequired(storeys));
    }

    @ParameterizedTest
    @CsvSource({"0, F","49.99, F", "50, D","59.99, D", "60, C","64.99, C", "65, C+", "69.99, C+","70, B-","72.99, B-", "73, B","76.99, B", "77, B+","79.99, B+", "80, A-","84, A-", "85, A","89.99, A", "90, A+", "100, A+"})
    void percentageToLetterGrade_BoundaryValues(double percent, String expected){
        assertEquals(expected, Boundary.percentageToLetterGrade(percent));
    }

    void percentageToLetterGrade_IllegalArgument(double percent){
        assertThrows(IllegalArgumentException.class, () -> {
            Boundary.percentageToLetterGrade(percent); });

    }


}
