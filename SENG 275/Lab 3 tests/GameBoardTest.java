import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class GameBoardTest {
    @Test
    void playerInside_Good(){
        GameBoard gameBoard = new GameBoard();
        assertTrue(gameBoard.isInsideBoard(0,0));
        assertTrue(gameBoard.isInsideBoard(4,5));
        assertTrue(gameBoard.isInsideBoard(2,3));
        assertTrue(gameBoard.isInsideBoard(1,4));
        assertTrue(gameBoard.isInsideBoard(3,2));

    }
    @Test
    void playerOutside_Bad(){
        GameBoard gameBoard = new GameBoard();
        assertFalse(gameBoard.isInsideBoard(-1,0));
        assertFalse(gameBoard.isInsideBoard(0,-1));
        assertFalse(gameBoard.isInsideBoard(6,0));
        assertFalse(gameBoard.isInsideBoard(0,6));


    }
    @Test
    void BoundariesTest(){
        GameBoard gameBoard = new GameBoard();
        assertTrue(gameBoard.isInsideBoard(0,0));       //on and off points
        assertFalse(gameBoard.isInsideBoard(-1,-1));
        assertTrue(gameBoard.isInsideBoard(5,0));
        assertFalse(gameBoard.isInsideBoard(6,-1));
        assertTrue(gameBoard.isInsideBoard(0,5));
        assertFalse(gameBoard.isInsideBoard(-1,6));
        assertTrue(gameBoard.isInsideBoard(5,5));
        assertFalse(gameBoard.isInsideBoard(6,6));

    }
}
