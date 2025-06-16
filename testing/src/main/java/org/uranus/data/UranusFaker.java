package org.uranus.data;

import org.uranus.model.UserModel;

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
