import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

import java.util.*;
import java.util.stream.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.*;
import org.junit.jupiter.params.provider.*;


class SplittingTest {
    @ParameterizedTest
    @MethodSource("generator")
    void BalanceTest(String description, int[] arr, boolean expected) {
        boolean result = Splitting.canBalance(arr);
        assertEquals(expected, result);
    }

    private static Stream<Arguments> generator() {
        return Stream.of(Arguments.of("array is null", null, false),
                Arguments.of("array with all zeros", new int[]{0,0,0,0}, true),
                Arguments.of("balanced", new int[]{1,1,1,2,1}, true),
                Arguments.of("unbalanced", new int[]{2,1,1,2,1}, false),
                Arguments.of("negative balanced", new int[]{-2,2,-2,2}, true),
                Arguments.of("negative unbalanced", new int[]{-2,2,-2}, false),
                Arguments.of("balanced complex", new int[]{1,1,1,1,1,1,6}, true),
                Arguments.of("empty array", new int[]{}, false));
    }


}