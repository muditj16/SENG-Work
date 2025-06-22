package stepDefinitions;

import io.github.bonigarcia.wdm.WebDriverManager;
import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import org.testng.Assert;

import java.time.Duration;

public class FileEncDecTest {

    private WebDriver driver;
    private WebDriverWait wait;
    private static String encryptedText;
    private static String encryptionKey;
    private static final String plainText = "Hello UCrypt!";

    @Before
    public void setup() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.setPageLoadStrategy(PageLoadStrategy.NORMAL);
        driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(30));
    }

    @After
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    // =============================
    // Scenario 1: Encrypt a file
    // =============================

    @Given("I am logged in as a user")
    public void i_am_logged_in_as_a_user() {
        driver.get("http://localhost");
        WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("a#login-btn")));
        loginButton.click();

        WebElement emailInput = wait.until(ExpectedConditions.elementToBeClickable(By.id("loginEmail")));
        emailInput.sendKeys("user@example.com");

        WebElement passwordInput = driver.findElement(By.id("loginPassword"));
        passwordInput.sendKeys("userPass123");

        WebElement submitBtn = driver.findElement(By.cssSelector("button[type='submit']"));
        submitBtn.click();

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("div.user-dashboard")));
    }

    @When("I navigate to the encryption page")
    public void i_navigate_to_the_encryption_page() {
        WebElement encryptionModule = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("a#encrypt-link")));
        encryptionModule.click();

        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector("h1.page-title"), "File & Text Encryption"));
    }

    @When("I enter valid plain text and select encryption type")
    public void i_enter_plain_text_and_encryption_type() {
        WebElement inputField = wait.until(ExpectedConditions.elementToBeClickable(By.id("plainText")));
        inputField.sendKeys(plainText);

        WebElement dropdown = driver.findElement(By.id("encryptionType"));
        new Select(dropdown).selectByValue("AES");

        WebElement encryptButton = driver.findElement(By.id("encryptBtn"));
        encryptButton.click();

        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".toast-message")));
        Assert.assertEquals(toast.getText().trim(), "data encrypted successfully");

        encryptedText = driver.findElement(By.id("encryptedOutput")).getText();
        encryptionKey = driver.findElement(By.id("keyDisplay")).getText();
    }

    @Then("I should see a success message {string}")
    public void i_should_see_success_message(String expectedMsg) {
        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".toast-message")));
        Assert.assertEquals(toast.getText().trim(), expectedMsg);
    }

    // =============================
    // Scenario 2: Decrypt with correct key
    // =============================

    @When("I navigate to the decryption page")
    public void i_navigate_to_the_decryption_page() {
        WebElement decryptionModule = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("a#decrypt-link")));
        decryptionModule.click();

        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector("h1.page-title"), "File & Text Decryption"));
    }

    @When("I enter the encrypted text and correct key")
    public void i_enter_encrypted_text_and_correct_key() {
        WebElement encryptedInput = wait.until(ExpectedConditions.elementToBeClickable(By.id("encryptedText")));
        encryptedInput.sendKeys(encryptedText);

        WebElement keyInput = driver.findElement(By.id("decryptionKey"));
        keyInput.sendKeys(encryptionKey);

        WebElement decryptButton = driver.findElement(By.id("decryptBtn"));
        decryptButton.click();
    }

    @Then("I should see the original plain text")
    public void i_should_see_original_plain_text() {
        WebElement output = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("decryptedOutput")));
        Assert.assertEquals(output.getText().trim(), plainText);
    }

    // =============================
    // Scenario 3: Decrypt with wrong key
    // =============================

    @When("I enter the encrypted text and incorrect key")
    public void i_enter_encrypted_text_and_incorrect_key() {
        WebElement encryptedInput = wait.until(ExpectedConditions.elementToBeClickable(By.id("encryptedText")));
        encryptedInput.sendKeys(encryptedText);

        WebElement keyInput = driver.findElement(By.id("decryptionKey"));
        keyInput.sendKeys("wrong-key-123");

        WebElement decryptButton = driver.findElement(By.id("decryptBtn"));
        decryptButton.click();
    }

    @Then("I should see an error message {string}")
    public void i_should_see_error_message(String expectedMsg) {
        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".toast-message")));
        Assert.assertEquals(toast.getText().trim(), expectedMsg);
    }
}
