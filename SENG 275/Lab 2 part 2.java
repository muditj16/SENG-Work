import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class RectangleTest {
    @Test
    void customRectangle() {
        Rectangle rect = new Rectangle(4, 4, 3, 3);
        assertEquals(4, rect.getX());
        assertEquals(4, rect.getY());
        assertEquals(3, rect.getWidth());
        assertEquals(3, rect.getHeight());

    }

    @Test
    void changeWidth() {
        Rectangle rect = new Rectangle(4, 4, 3, 3);
        rect.setWidth(20);
        assertEquals(20, rect.getWidth());
    }

    @Test
    void negativeWidth() {
        Rectangle rect = new Rectangle(4, 4, 3, 3);
        assertThrows(IllegalArgumentException.class, () -> rect.setWidth(-5));
    }

    @Test
    void equalityTest() {
        Rectangle rect1 = new Rectangle(4, 4, 3, 3);
        Rectangle rect2 = new Rectangle(4, 4, 3, 3);
        assertTrue(rect1.getX() == rect2.getX() && rect1.getY() == rect2.getY() && rect1.getWidth() == rect2.getWidth() && rect1.getHeight() == rect2.getHeight());
    }

    @Test
    void areaTest() {
        Rectangle rect = new Rectangle(4, 4, 3, 3);
        assertEquals(9, rect.getArea());
    }

    @Test
    void containsTest() {
        Rectangle rect1 = new Rectangle(1, 1, 10, 10);
        Rectangle rect2 = new Rectangle(2, 2, 3, 4);
        assertTrue(rect1.contains(rect2));

    }
}
