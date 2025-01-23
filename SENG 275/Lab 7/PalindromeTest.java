import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;

import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.constraints.AlphaChars;
import net.jqwik.api.constraints.Size;
import net.jqwik.api.constraints.UniqueElements;
import org.junit.jupiter.api.Test;

class PalindromeTest {

    /*
     * Try testing the following cases:
     *  - any string, followed by the reverse of that string is a palindrome.
     *  - any string, followed by a single character, then the reverse of the string is a palindrome.
     *  - Any string made up of unique characters of length 2 or greater is not a palindrome.
     *  - Any palindrome set to uppercase is still a palindrome.
     */


    static String reverse(String str) {
        StringBuilder sb = new StringBuilder(str);
        sb.reverse();
        return sb.toString();
    }

    @Property
    void testPalindrome(@ForAll @AlphaChars @Size(min = 1, max = 10) String word) {
        String reversed = reverse(word);
        String palindrome = word + reversed;
        assertThat(Palindrome.isPalindrome(palindrome)).isTrue();
    }

    @Property
    void testSingleChar(@ForAll @AlphaChars @Size(min = 1, max = 10) String word,
                        @ForAll @AlphaChars char ch) {
        String reversed = reverse(word);
        String palindrome = word + ch + reversed;
        assertThat(Palindrome.isPalindrome(palindrome)).isTrue();

    }

    @Property
    void testNonPalindrome(@ForAll @UniqueElements @Size(min = 2) String word) {
        assertThat(Palindrome.isPalindrome(word)).isFalse();
    }

    @Property

    void testUpperPalindrome(@ForAll @AlphaChars @Size(min = 1, max = 10) String word) {
        String reversed = reverse(word);
        String palindrome = word.toUpperCase() + reversed.toUpperCase();
        assertThat(Palindrome.isPalindrome(palindrome)).isTrue();
    }
}
