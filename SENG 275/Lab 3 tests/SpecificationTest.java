import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

class SpecificationTest {
    @ParameterizedTest
    @CsvSource({ "0, 0, true", "279, 719, true", "1280, 720, false", "1919, 1079, true","1920, 1080, false"})

    void insideDisplayArea(int x, int y, boolean expected){
        if (y >= 720 || x>= 1280){
            Specification.setDefinition(1);
        }
        else {
            Specification.setDefinition(0);
        }
        assertEquals(expected, Specification.insideDisplayArea(x,y));
    }

    @ParameterizedTest
    @CsvSource ({
        "AB, false, true", "ABCDEFG, false, false", "A B, false, true", "A-B, false, true", "123456, false, false",
        "ABCDEF, true, true", "ABCDEFG, true, false", "AB-CDE, true, true", "123456, true, true"})

    void messageIsValid(String input, boolean motorcycle, boolean expected) {
        assertEquals(expected, Specification.messageIsValid(input, motorcycle));
    }

}
