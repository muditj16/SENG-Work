Feature: User Registration
    Scenario: Successful User Sign Up
        Given I am a new user on the sign up page
        When I enter all mandatory registration details correctly
        Then I should be able to register successfully and receive a confirmation email

    Scenario: Unsuccessful User Sign Up with weak password
        Given I am a new user on the sign up page 
        When I enter weak password in the password field
        Then I should get an error message showing the number of characters needed for the password for successful sign up

    Scenario: Unsuccessful User Sign Up with mismatch in password and confirm password field
        Given I am a new user on the sign up page 
        When I enter password in confirm password field that doesn’t match with password entered in password field 
        Then I should get an error message indicating that the passwords do not match

    Scenario: Unsuccessful User Sign Up with invalid email address that matches email address format (email@domain.com)
        Given I am a new user on the sign up page 
        When I enter an invalid email address that matches email address format (email@domain.com) with all other required field correctly
        Then I should get an error message saying that this email doesn’t exist

    Scenario: Unsuccessful User Sign Up with invalid email address that doesn’t email address format  (email@domain.com)
        Given I am a new user on the sign up page 
        When I enter an invalid email address that doesn’t matche email address format (email@domain.com) with all other required field correctly
        Then I should get an error message saying that this email provided is invalid
