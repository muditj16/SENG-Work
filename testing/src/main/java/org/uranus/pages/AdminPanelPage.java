package org.uranus.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.uranus.driver.UranusDriver;
import org.uranus.model.UserRegistrationModel;

public class AdminPanelPage extends PageBase {
    public AdminPanelPage(WebDriver webDriver) {
        super(webDriver);
    }

    public AdminPanelPage(UranusDriver uranusDriver) {
        super(uranusDriver.webDriver);
    }

    public By adminPanelTitle = By.cssSelector(".text-uppercase");
    public By email = By.cssSelector("app-accounts .active .p-datatable-wrapper tbody tr:nth-child(1) td:nth-child(2) span");
    public By name = By.cssSelector("app-accounts .active .p-datatable-wrapper tbody tr:nth-child(1) td:nth-child(3) span");
    public By roleNewAccount = By.cssSelector("app-accounts .active .p-datatable-wrapper tbody tr:nth-child(1) td:nth-child(4) p-celleditor");
    By approve = By.cssSelector("app-accounts .active .p-datatable-wrapper tbody tr:nth-child(1) td:nth-child(6) .approve");
    By reject = By.cssSelector("app-accounts .active .p-datatable-wrapper tbody tr:nth-child(1) td:nth-child(6) .reject");
    By staffAccountsTab = By.cssSelector("app-accounts ul #staff-tab");
    By btnEditRoleStaff = By.cssSelector("#staff tbody tr:nth-child(1) td:nth-child(6) button");
    By listStafRolesField = By.cssSelector("app-accounts .active .p-datatable-wrapper tbody tr:nth-child(1) td:nth-child(4) p-celleditor select");
    By saveEditIcon = By.cssSelector("app-accounts .active .p-datatable-wrapper tbody tr:nth-child(1) td:nth-child(6) button:nth-child(1)");
    By pendingRegistrationTable = By.cssSelector("table");
    public By profileDropdown = By.cssSelector("#collapsibleNavId > div > ul > li");
    public By profileDropdownLogoutLink = By.cssSelector("#collapsibleNavId > div > ul > li > div > a:nth-child(2)");
    By newAccountsTab = By.id("new-tab");
    By staffTab = By.id("staff-tab");
    By registeredUsersTab = By.id("reg-tab");
    By allUsersTab = By.id("All-tab");

    public void approveSignUpRequest(UserRegistrationModel user) {
        click(newAccountsTab);

        WebElement registrationTable = webDriver.findElement(pendingRegistrationTable);
        for (WebElement row : registrationTable.findElements(By.cssSelector("tbody tr"))) {
            String emailText = row.findElement(By.cssSelector("td:nth-child(2) span")).getText();
            System.out.println("Checking email: " + emailText);
            if (emailText.equals(user.email)) {
                WebElement approveButton = row.findElement(approve);
                approveButton.click();
            }
        }
    }

    public void editRole(String newRole) {
        click(staffAccountsTab);
        click(btnEditRoleStaff);
        click(roleNewAccount);
        select(listStafRolesField, newRole);
        click(saveEditIcon);
    }

    public void logout() {
        click(profileDropdown);
        click(profileDropdownLogoutLink);
    }
}
