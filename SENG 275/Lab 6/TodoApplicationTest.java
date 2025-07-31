import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.*;
import java.util.stream.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.*;
import org.junit.jupiter.params.provider.*;

import java.util.List;

class TodoApplicationTest {

    private TodoApplication todoApp;
    private PersonService personServiceMock;
    private TodoService todoServiceMock;

    private final String userName = "SomeUser";
    private final Long userID = 1L;
    private final List<String> todos = List.of("Wake up", "Test the code", "Celebrate the victory!");


    @BeforeEach
    void setUp() {
        personServiceMock = mock(PersonService.class);
        todoServiceMock = mock(TodoService.class);
        todoApp = new TodoApplication(todoServiceMock, personServiceMock);
        when(personServiceMock.findUsernameById(userID)).thenReturn(userName);
    }

    @Test
    void addTodo() {
        when(todoServiceMock.addTodo(userName, "New Todo")).thenReturn(true);
        boolean result = todoApp.addTodo(userID, "New Todo");
        assertThat(result).isTrue();
        verify(personServiceMock).findUsernameById(userID);
        verify(todoServiceMock).addTodo(userName, "New Todo");

        // Ensure that it's possible to add a todo to the app, and that the correct methods are called
    }

    @Test
    void retrieveTodos() {
        when(todoServiceMock.retrieveTodos(userName)).thenReturn(todos);
        List<String> result = todoApp.retrieveTodos(userID, "Test");
        assertThat(result).containsExactly("Test the code");
        verify(personServiceMock).findUsernameById(userID);
        verify(todoServiceMock).retrieveTodos(userName);

        // add multiple todos to the app, and retrieve a strict subset of them using a substring.
    }

    @Test
    void completeAllWithNoTodos() {
        when(todoServiceMock.retrieveTodos(userName)).thenReturn(List.of());
        todoApp.completeAllTodos(userID);
        verify(personServiceMock).findUsernameById(userID);
        verify(todoServiceMock).retrieveTodos(userName);
        verify(todoServiceMock, never()).completeTodo(anyString());
    }

    @Test
    void completeAllWithThreeTodos() {
        when(todoServiceMock.retrieveTodos(userName)).thenReturn(todos);
        todoApp.completeAllTodos(userID);
        verify(personServiceMock).findUsernameById(userID);
        verify(todoServiceMock).retrieveTodos(userName);
        for (String todo : todos) {
            verify(todoServiceMock).completeTodo(todo);
        }

    }
}
