package org.uranus.driver;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.uranus.configuration.LoadProperties;

import io.github.bonigarcia.wdm.WebDriverManager;

public class UranusDriver {

    public WebDriver webDriver;
    WebDriverWait webDriverWait;
    WebElement webElement;

    public void setup() {
        WebDriverManager.chromedriver().setup();
        webDriver = new ChromeDriver();
        webDriver.navigate().to(LoadProperties.env.getProperty("URL"));
        webDriver.manage().window().maximize();
    }

    public void teardown() {
        webDriver.close();
    }

    public void refresh() {
        webDriver.navigate().refresh();
    }

    public WebElement getElement(By by) {
        webDriverWait = new WebDriverWait(webDriver, Duration.ofSeconds(30));
        webDriverWait.until(ExpectedConditions.refreshed(ExpectedConditions.visibilityOfElementLocated(by)));
        webElement = webDriver.findElement(by);
        webDriverWait.until(ExpectedConditions.refreshed(ExpectedConditions.visibilityOf(webElement)));
        return webElement;
    }

    public String getText(By by) {
        webDriverWait = new WebDriverWait(webDriver, Duration.ofSeconds(30));
        webDriverWait.until(ExpectedConditions.refreshed(ExpectedConditions.visibilityOfElementLocated(by)));
        webElement = webDriver.findElement(by);
        webDriverWait.until(ExpectedConditions.refreshed(ExpectedConditions.visibilityOf(webElement)));
        return webElement.getText();
    }

    //make this enter password into password field fucntion
    public String enterText(String password, By by) {

	
    }
}
