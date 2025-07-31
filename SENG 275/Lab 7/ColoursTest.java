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

class ColoursTest {
    /*
     * Create property tests that test combinations of valid and invalid values.
     */

    @Property
    void validRgbBytesToInt(@ForAll @IntRange(min =0, max = 255) int r,
                            @ForAll @IntRange(min =0, max = 255) int g,
                            @ForAll @IntRange(min =0, max = 255) int b){
        int rgb = Colours.rgbBytesToInt(r, g, b);
        int val = (r << 16) + (g << 8) + b;
        assertThat(rgb).isEqualTo(val);
    }

    @Property
    void bytesToInt(@ForAll("invalidValue") int r,
                    @ForAll("invalidValue") int g,
                    @ForAll("invalidValue") int b) {

        assertThrows(IllegalArgumentException.class, () ->  Colours.rgbBytesToInt(r,g,b));
        }


    @Provide
    Arbitrary<Integer> invalidValue(){
        return Arbitraries.integers().greaterOrEqual(256);
    }
}
