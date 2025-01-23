import static org.junit.jupiter.api.Assertions.*;

import java.util.*;
import java.util.stream.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.*;
import org.junit.jupiter.params.provider.*;


class CollectionUtilsTest {

    @ParameterizedTest
    @MethodSource("generator")
    void containsAny(String description, Collection<?> c1, Collection<?> c2, boolean expected) {
        boolean result = CollectionUtils.containsAny(c1, c2);
        assertEquals(expected, result);
    }

    private static Stream<Arguments> generator() {
        return Stream.of(Arguments.of("common elements", Arrays.asList(1,2,3), Arrays.asList(3,4,5), true),
                Arguments.of("common elements", Arrays.asList(1,2,3), Arrays.asList(6,4,5), false),
                Arguments.of("second empty", Arrays.asList(1,2,3), Collections.emptyList(), false),
                Arguments.of("first empty", Collections.emptyList(), Arrays.asList(3,4,5), false),
                Arguments.of("BOTH EMPTY", Collections.emptyList(), Collections.emptyList(), false),
                Arguments.of("first smaller and common elements", Arrays.asList(1), Arrays.asList(1,4,5), true),
                Arguments.of("first smaller and uncommon elements", Arrays.asList(1), Arrays.asList(6,4,5), false),
                Arguments.of("second smaller and common elements", Arrays.asList(1,2,3), Arrays.asList(1), true),
                Arguments.of("second smaller and uncommon elements", Arrays.asList(1,2,3), Arrays.asList(4), false),
                Arguments.of("duplicates", Arrays.asList(1,2,2,3), Arrays.asList(2,2,4), true),
                Arguments.of("both with 1 element and equal", Arrays.asList(3), Arrays.asList(3), true),
                Arguments.of("both with 1 element and unequal", Arrays.asList(1), Arrays.asList(6), false));

    }

}