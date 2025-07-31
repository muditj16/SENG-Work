import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ArrayUtilsTest {
    @Test
    void sayHi() {
        System.out.println("Hello from the test.");
    }

    // A sorted array
    @Test
    void sortedAAA() {
        int[] someArray = {1,2,3,4};       // arrange
        boolean someArraySorted = ArrayUtils.isSorted(someArray);  // act
        assertTrue(someArraySorted);       // assert
    }

    // A sorted array - all at once
    @Test
    void sorted() {
        assertTrue(ArrayUtils.isSorted(new int[] {1,2,3,4}));
    }

    // Empty arrays are sorted by definition
    @Test
    void emptySorted(){ assertTrue(ArrayUtils.isSorted(new int[] {}));}
    // Arrays of one element are sorted by definition

    @Test
    void oneElementArray(){ assertTrue(ArrayUtils.isSorted(new int[] {5})); }
    // A partially sorted array (some elements are in sorted order, but some aren't)

    @Test
    void partiallyUnsorted(){ assertFalse(ArrayUtils.isSorted(new int[] {8,2,3,4}));}
    // A completely unsorted array (no elements are in sorted order)
    @Test
    void unsorted(){ assertFalse(ArrayUtils.isSorted(new int[] {7,1,5,6}));}

    // An array with duplicate values (may be sorted or not depending on the values chosen)
    @Test
    void duplicateArray(){assertFalse(ArrayUtils.isSorted(new int[] {7,5,3,5}));}
}
