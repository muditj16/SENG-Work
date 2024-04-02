package tests;

import org.testng.annotations.Test;
import org.uranus.configuration.LoadProperties;
import org.uranus.pages.AdminPanelPage;
import org.uranus.pages.HomePage;

public class AdminPanelTest extends TestBase {
    HomePage homePage;
    AdminPanelPage adminPanelPage;


    @Test(priority = 3)
    public void checkThatEditRoleOfUseriIsWorkingSuccessfuly() {
        homePage = new HomePage(webDriver);
        adminPanelPage = new AdminPanelPage(webDriver);
        homePage.login(LoadProperties.env.getProperty("ADMIN_EMAIL"), LoadProperties.env.getProperty("ADMIN_PASSWORD"));
        homePage.openAdminPanel();
        assertIsEqual(adminPanelPage.adminPanelTitle, "ADMIN PANEL");
        adminPanelPage.editRole("User");
        assertIsEqual(homePage.toastMsg, "Role is Edited Successfully");
        softAssert.assertAll();
    }

}
