package org.uranus.data;

import org.uranus.model.UserModel;
import org.uranus.model.UserRegistrationModel;

public class UranusFaker {
    public static String getRandomEmail() {
        return "test" + System.currentTimeMillis() + "@example.com";
    }

    public static String getRandomPassword() {
        return "password" + System.currentTimeMillis();
    }

    public static String getRandomName() {
        return "User" + System.currentTimeMillis();
    }

    public static UserRegistrationModel getRandomBaseUserRegistration() {
        UserRegistrationModel user = new UserRegistrationModel();
        user.email = getRandomEmail();
        user.password = getRandomPassword();
        user.name = getRandomName();
        user.confirmPassword = user.password; // Confirm password should match
        return user;
    }

    public static UserRegistrationModel getRandomUserRegistration() {
        UserRegistrationModel user = getRandomBaseUserRegistration();
        user.role = "USER";
        return user;
    }

    public static UserRegistrationModel getRandomAdminRegistration() {
        UserRegistrationModel user = getRandomBaseUserRegistration();
        user.role = "ADMIN";
        return user;
    }

    public static UserRegistrationModel getRandomEmployeeRegistration() {
        UserRegistrationModel user = getRandomBaseUserRegistration();
        user.role = "EMPLOYEE";
        return user;
    }

    private static UserModel getRandomBaseUser() {
        UserModel user = new UserModel();
        user.email = getRandomEmail();
        user.password = getRandomPassword();
        user.name = getRandomName();
        return user;
    }
    
    public static UserModel getRandomUser() {
        UserModel user = getRandomBaseUser();
        user.role = "USER";
        return user;
    }

    public static UserModel getRandomAdmin() {
        UserModel user = getRandomBaseUser();
        user.role = "ADMIN";
        return user;
    }

    public static UserModel getRandomEmployee() {
        UserModel user = getRandomBaseUser();
        user.role = "EMPLOYEE";
        return user;
    }
}
