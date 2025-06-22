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
import org.openqa.selenium.support.ui.WebDriverWait;

import org.testng.Assert;

import java.time.Duration;

public class RoleManagementTest {

    private WebDriver driver;
    private WebDriverWait wait;

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

    // ----------- Positive Scenario: Admin edits user role -----------

    @Given("I am logged in as an admin")
    public void i_am_logged_in_as_an_admin() {
        driver.get("http://localhost");  // replace with your app URL

        // Click login button or go to login page
        WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("a#login-btn")));
        loginButton.click();

        // Enter admin credentials
        WebElement emailInput = wait.until(ExpectedConditions.elementToBeClickable(By.id("loginEmail")));
        emailInput.sendKeys("admin@uranus.com");  // update if needed

        WebElement passwordInput = driver.findElement(By.id("loginPassword"));
        passwordInput.sendKeys("g8rD%+");  // update if needed

        WebElement submitBtn = driver.findElement(By.cssSelector("button[type='submit']"));
        submitBtn.click();

        // Wait until login success or admin panel link is visible
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("a#admin-panel-link")));
    }

    @When("I open the admin panel")
    public void i_open_the_admin_panel() {
        WebElement adminPanelLink = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("a#admin-panel-link")));
        adminPanelLink.click();

        // Wait for admin panel title
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("h1.admin-panel-title")));
    }

    @When("I edit the role of the first user to {string}")
    public void i_edit_the_role_of_the_first_user_to(String role) {
        // Wait for users table/list to load
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("table#users-table")));

        // Click edit role button for first user
        WebElement editButton = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("table#users-table tbody tr:first-child button.edit-role")));
        editButton.click();

        // Wait for role dropdown in modal/form
        WebElement roleDropdown = wait.until(ExpectedConditions.elementToBeClickable(By.id("roleSelect")));
        roleDropdown.click();

        // Select the given role from dropdown options
        WebElement option = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//select[@id='roleSelect']/option[text()='" + role + "']")));
        option.click();

        // Submit role change
        WebElement saveButton = driver.findElement(By.id("saveRoleBtn"));
        saveButton.click();
    }

    @Then("I should see a success message {string}")
    public void i_should_see_a_success_message(String expectedMsg) {
        WebElement toastMsg = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".toast-message")));
        Assert.assertEquals(toastMsg.getText().trim(), expectedMsg);
    }

    // ----------- Negative Scenario: Non-admin cannot edit roles -----------

    @Given("I am logged in as a regular user")
    public void i_am_logged_in_as_a_regular_user() {
        driver.get("http://localhost");  // replace with your app URL

        // Click login button or go to login page
        WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("a#login-btn")));
        loginButton.click();

        // Enter regular user credentials
        WebElement emailInput = wait.until(ExpectedConditions.elementToBeClickable(By.id("loginEmail")));
        emailInput.sendKeys("user@example.com");  // update if needed

        WebElement passwordInput = driver.findElement(By.id("loginPassword"));
        passwordInput.sendKeys("password123");  // update if needed

        WebElement submitBtn = driver.findElement(By.cssSelector("button[type='submit']"));
        submitBtn.click();

        // Wait for user home page/dashboard load
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("div.user-dashboard")));
    }

    @When("I try to access the admin panel or edit roles")
    public void i_try_to_access_the_admin_panel_or_edit_roles() {
        // Try navigating to admin panel URL directly
        driver.get("http://localhost/admin-panel"); // replace URL as needed
    }

    @Then("I should be denied access or not see any role editing option")
    public void i_should_be_denied_access_or_not_see_any_role_editing_option() {
        // Check for access denied message or redirection
        boolean accessDeniedVisible = driver.findElements(By.cssSelector(".access-denied-message")).size() > 0;
        boolean roleEditButtonVisible = driver.findElements(By.cssSelector("button.edit-role")).size() > 0;

        Assert.assertTrue(accessDeniedVisible || !roleEditButtonVisible,
            "User should either see access denied or no role edit buttons");
    }
}
