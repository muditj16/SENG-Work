package org.uranus.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.uranus.driver.UranusDriver;
import org.uranus.model.UserRegistrationModel;

public class HomePage extends PageBase {
    public HomePage(WebDriver webDriver) {
        super(webDriver);
    }

    public HomePage(UranusDriver uranusDriver) {
        super(uranusDriver.webDriver);
    }   

   // This defines a locators for a Elements in a webpage.
    By signUpBtn = By.cssSelector("#collapsibleNavId div a:first-child");
    By loginBtn = By.cssSelector(".btn-outline-secondary");
    By nameField = By.id("signUpName");
    By emailField = By.id("loginEmail");
    public By invalidEmailError = By.cssSelector("#login > div > app-sign-up-page > div > div.modal-body > form > div:nth-child(2) > div");
    By passField = By.id("loginPassword");
    By confirmPassField = By.id("signUpConfirmPassword");
    By roleField = By.id("signUpRole");
    By signUpSubmitBtn = By.cssSelector("app-sign-up-page form .btn-submit");
   public By toastMsg=By.cssSelector(".p-toast-detail");
   public By closeToastMsg=By.cssSelector(".p-toast-icon-close");
   By emailLoginField=By.cssSelector("app-header #signUp app-login-page .auth-form #loginEmail");
   By passwordLoginField=By.cssSelector("app-header #signUp app-login-page .auth-form #loginPassword");
   By loginSubmitBtn=By.cssSelector("app-header #signUp app-login-page .auth-form button");
   By adminPanelModule=By.cssSelector("div #collapsibleNavId ul li:nth-child(8) a");
    public By profileDropdown = By.cssSelector("#collapsibleNavId>div>ul>li>a");
    public By profileDropdownLogoutLink = By.cssSelector("#collapsibleNavId > div > ul > li > div > a:nth-child(2)");

    //Method to sign up a user with the provided information.
    public void signUp(UserRegistrationModel user) {
        click(signUpBtn);
        type(nameField, user.name);
        type(emailField, user.email);
        type(passField, user.password);
        type(confirmPassField, user.confirmPassword);
        select(roleField, user.role);
        click(signUpSubmitBtn);
    }


    //Method to log in a user with the provided information.
    public void login(String email, String password){
        click(loginBtn);
        type(emailLoginField,email);
        type(passwordLoginField,password);
        click(loginSubmitBtn);
    }

    public void openAdminPanel(){
        click(adminPanelModule);
    }

    public void closeToastMsg() {
        click(closeToastMsg);
    }

    public void logout() {
        click(profileDropdown);
        click(profileDropdownLogoutLink);
    }
}
