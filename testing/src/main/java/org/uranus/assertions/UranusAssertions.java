package org.uranus.assertions;

import static org.testng.Assert.assertEquals;

import org.openqa.selenium.WebElement;

public class UranusAssertions {


    public static void assertTextContentMatches(WebElement element, String expectedText) {
        assertTextContentMatches(element.getText(), expectedText);
    }
    
    public static void assertTextContentMatches(String actualText, String expectedText) {
        assertEquals(actualText, expectedText.strip(), "Text content does not match. Expected: '" + expectedText + "', but found: '" + actualText + "'");
    }
}
