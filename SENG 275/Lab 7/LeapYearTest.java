import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;

import java.util.*;
import java.util.stream.*;
import net.jqwik.api.*;
import net.jqwik.api.arbitraries.*;
import net.jqwik.api.constraints.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.*;
import org.junit.jupiter.params.provider.*;

class LeapYearTest {

    @Property
    void validYear(@ForAll("Valid") int year){
        boolean result = LeapYear.isLeapYear(year);

        if(year % 4 == 0 && (year % 100 !=0 || year%400 ==0)) {
            assertThat(result).isTrue();
        } else {
            assertThat(result).isFalse();
        }
    }
    @Property
    void invalidYear(@ForAll("Invalid") int year){
        assertThrows(IllegalArgumentException.class, () -> LeapYear.isLeapYear(year));
    }

    @Provide("Valid")
    Arbitrary<Integer> validYears(){
        return Arbitraries.integers().between(1, Integer.MAX_VALUE).filter(year->year % 4 == 0);
    }
    @Provide("Invalid")
    Arbitrary<Integer> invalidLeapYears(){
        return Arbitraries.integers().between(Integer.MIN_VALUE, 0).filter(year->year % 4 != 0);
    }

}