import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class FindMaxMinTest {
    @Test
    void coverageAndBranchTest(){
        List<Float> scoreList = new ArrayList<>();
        FindMaxMin.findMaxMin(scoreList);
        scoreList.add(10.0f);
        FindMaxMin.findMaxMin(scoreList);
        scoreList.add(5.0f);
        scoreList.add(15.0f);
        scoreList.add(-5.0f);
        FindMaxMin.findMaxMin(scoreList);

        scoreList.add(19.0f);
        FindMaxMin.findMaxMin(scoreList);
        scoreList.add(10.0f);
        scoreList.add(10.0f);
        scoreList.add(10.0f);
        FindMaxMin.findMaxMin(scoreList);
        scoreList.add(-20.0f);
        scoreList.add(-20.0f);
        FindMaxMin.findMaxMin(scoreList);

    }
}
