import static org.junit.jupiter.api.Assertions.*;

import java.util.*;
import java.util.stream.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.*;
import org.junit.jupiter.params.provider.*;

class WordUtilitiesTest {
    @ParameterizedTest
    @MethodSource("generator")
    void TestSwap(String description, String input, String expected) {
        String result = WordUtilities.swapCase(input);
        assertEquals(expected, result, description);
    }

    private static Stream<Arguments> generator() {
        return Stream.of(Arguments.of("null", null, null),
                Arguments.of("empty string", "", ""),
                Arguments.of("all lowercase", "hello world", "HELLO WORLD"),
                Arguments.of("all uppercase", "HELLO WORLD","hello world"),
                Arguments.of("mixed case", "Hello World", "hELLO wORLD"),
                Arguments.of("LEADING SPACES", " hello world", " HELLO WORLD"),
                Arguments.of("trailing spaces", "hello world ", "HELLO WORLD "),
                Arguments.of("punctuation", "hello, world!", "HELLO, WORLD!" ),
                Arguments.of("both letters and nnumbers", "123abcDEF", "123ABCdef"));
    }
}