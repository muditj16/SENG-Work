package tests;

import org.testng.annotations.Test;
import org.uranus.configuration.LoadProperties;
import org.uranus.data.UranusFaker;
import org.uranus.model.UserModel;
import org.uranus.pages.AdminPanelPage;
import org.uranus.pages.HomePage;

public class SignUpTest extends TestBase {

    HomePage homePage;
    AdminPanelPage adminPanelPage;

    UserModel employee = UranusFaker.getRandomEmployee();

    @Test(priority = 0)
    public void checkThatSignUpScenarioWorkingSuccessfully()  {
        homePage = new HomePage(webDriver);
        homePage.signUp(employee);
        assertIsEqual(homePage.toastMsg, "Registerd successfully, please wait for admin approval to login!"); // assertion command about the showing success message of sign up
        softAssert.assertAll();
        homePage.closeToastMsg();
    }

    @Test(priority = 1)
    public void approveRegistrationRequest() {
        homePage = new HomePage(webDriver);
        adminPanelPage = new AdminPanelPage(webDriver);
        homePage.login(LoadProperties.env.getProperty("ADMIN_EMAIL"), LoadProperties.env.getProperty("ADMIN_PASSWORD"));
        homePage.closeToastMsg();
        homePage.openAdminPanel();
        assertIsEqual(adminPanelPage.adminPanelTitle, "ADMIN PANEL");
        assertIsEqual(adminPanelPage.email, employee.email);
        assertIsEqual(adminPanelPage.roleNewAccount, employee.role);
        assertIsEqual(adminPanelPage.name, employee.name);
        adminPanelPage.approveSignUpRequest();
        softAssert.assertAll();
    }

}
