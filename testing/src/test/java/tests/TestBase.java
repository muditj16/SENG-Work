package tests;

import com.github.javafaker.Faker;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.*;
import org.testng.asserts.SoftAssert;
import org.uranus.configuration.LoadProperties;

import java.time.Duration;


/// The TestBase class serves as the base class for all test classes in the application.
/// It contains common setup and teardown logic that is shared across multiple test classes.
/// Developers can inherit from this class to ensure consistent test execution.

public class TestBase {

    public static String token;
    SoftAssert softAssert = new SoftAssert();
    public static WebDriver webDriver;
    WebDriverWait webDriverWait;
    WebElement webElement;
    Faker faker = new Faker();



    // Sets up the necessary web driver and url product under test for the test to run.
    @BeforeClass
    public void startDriver() {
        WebDriverManager.chromedriver().setup();
        webDriver = new ChromeDriver();
        webDriver.navigate().to(LoadProperties.env.getProperty("URL"));
        webDriver.manage().window().maximize();
    }


    @AfterClass
    public void endDriver() {
        webDriver.close();
    }

    public void assertIsEqual(By by, String expected) {
        if (expected != null) {
            webDriverWait = new WebDriverWait(webDriver, Duration.ofSeconds(30));
            webDriverWait.until(ExpectedConditions.refreshed(ExpectedConditions.visibilityOfElementLocated(by)));
            webElement = webDriver.findElement(by);
            webDriverWait.until(ExpectedConditions.refreshed(ExpectedConditions.visibilityOf(webElement)));
            softAssert.assertEquals(webElement.getText(), expected);
        } else {
            return;
        }
    }




}
