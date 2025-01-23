import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
public class UvicTest {

    WebDriver browser;

    @BeforeEach
    public void setUp() {
        String chromeDriverPath = System.getProperty("user.dir") + "\\driver\\chromedriver-win64\\chromedriver.exe";
        System.setProperty("webdriver.chrome.driver", chromeDriverPath);
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--remote-allow-origins=*");
        browser = new ChromeDriver(options);
        browser.manage().window().maximize();
    }

    @AfterEach
    public void cleanUp() {
        browser.quit();
    }

    @Test
    public void uvicHomePage() {
        browser.get("https://www.uvic.ca");
        assertEquals("Home - University of Victoria", browser.getTitle());
    }

    @Test
    public void uvicSearchButton() {
        browser.get("https://www.uvic.ca");
        WebElement searchButton = browser.findElement(By.xpath("//*[@id=\"search-btn\"]"));
        assertTrue(searchButton.isEnabled());
    }

    @Test
    public void uvicSearchBar() {
        browser.get("https://www.uvic.ca");
        WebElement searchButton = browser.findElement(By.xpath("//*[@id=\"search-btn\"]"));
        searchButton.click();
        WebElement searchBar = new WebDriverWait(browser, Duration.ofSeconds(5)).until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//*[@id=\"searchUVic\"]")));
        assertTrue(searchBar.isDisplayed());
    }

    @Test
    public void uvicSearchCsc() {
        browser.get("https://www.uvic.ca");
        WebElement searchButton = browser.findElement(By.xpath("//*[@id=\"search-btn\"]"));
        searchButton.click();
        WebElement searchBar = new WebDriverWait(browser, Duration.ofSeconds(5)).until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//*[@id=\"searchUVic\"]")));
        searchBar.sendKeys("csc");
        assertEquals("csc", searchBar.getAttribute("value"));
    }

    @Test
    public void uvicSearchCscWorks() {
        browser.get("https://www.uvic.ca");
        WebElement searchButton = browser.findElement(By.xpath("//*[@id=\"search-btn\"]"));
        searchButton.click();
        WebElement searchBar = new WebDriverWait(browser, Duration.ofSeconds(5)).until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//*[@id=\"searchUVic\"]")));
        searchBar.sendKeys("csc");
        searchBar.submit();
        new WebDriverWait(browser, Duration.ofSeconds(10)).until(ExpectedConditions.titleIs("Search - University of Victoria"));
        assertEquals("Search - University of Victoria", browser.getTitle());
    }

    @Test
    public void uvicPhoneNumberPresent() {
        browser.get("https://www.uvic.ca/ecs/computerscience/index.php");
        WebElement phoneNumber = new WebDriverWait(browser, Duration.ofSeconds(10)).until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//*[@id=\"footer\"]/div/div[1]/column-content/p/a[2]")));
        assertTrue(phoneNumber.getText().contains("1-250-472-5700"));
    }
}