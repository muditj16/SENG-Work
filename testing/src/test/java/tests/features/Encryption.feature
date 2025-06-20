Feature: File and Text Encryption
    Scenario: Logged in user uses an invalid key during file encryption
        Given I am a logged in user
        When I navigate to the encryption service
        And I upload a file by clicking the “Upload File” button
        And select an encryption technique
        And I enter an invalid key for the chosen encryption technique
        And I click on the encrypt button
        Then I should get a pop up saying “Encryption key for Algorithm <selected algorithm> is not a valid key!”

    Scenario: Logged in user uses a valid key during file encryption
        Given I am a logged in user
        When I navigate to the encryption service
        And I upload a file by clicking the “Upload File” button
        And select an encryption technique
        And I enter a valid key for the chosen encryption technique
        And I click on the encrypt button
        Then the file output by the selected encryption technique, using the entered key is downloaded

    Scenario: Logged in user uses invalid key during text encryption
        Given I am an logged in user
        When I navigate to the encryption service
        And I enter text to encrypt
        And select an encryption technique
        And I enter an invalid key for the chosen encryption technique
        And I click on the encrypt button
        Then I should get a pop up saying “Encryption key for Algorithm <selected algorithm> is not a valid key!”

    Scenario: Logged in user uses valid key during text encryption
        Given I am a logged in user
        When I navigate to the encryption service
        And I enter text to encrypt
        And select an encryption technique
        And I enter a valid key for the chosen encryption technique
        And I click on the encrypt button
        Then then ciphertext that has been encrypted with the chosen key and technique should be output

    Scenario: User copies contents of key field in encryption form
        Given I am in the process of completing an encryption form
        And there is a value present in the key field
        When I press the copy button
        Then the contents of the key field are present in my clipboard

    Scenario: User copies contents of text encryption output
        Given I have successfully completed the text encryption process
        When I press the copy button on the ciphertext output field
        Then my clipboard contains the ciphertext

    Scenario: User saves a key to their profile
        Given I am in the process of completing an encryption form
        And there is a value present in the key field
        When I press the save key icon
        Then the key is saved to my profile and available to be used on the decryption form

    Scenario: User saves a blank key to their profile
        Given I am in the process of completing an encryption form
        And there is no value present in the key field
        When I press the save key icon
        Then the key is not saved to my profile and an error message is shown

    Scenario: User auto-generates a key after selecting encryption technique
        Given I am in the process of completing an encryption form
        And I have selected any encryption technique
        When I press the auto-generate key button
        Then valid key for the selected encryption technique is generated in the key field

    Scenario: User auto-generates a key without having selected an encryption technique
        Given I am in the process of completing an encryption form
        And I have not selected an encryption technique
        When I press the auto-generate key button
        Then I am prompted with an error saying an encryption type must be selected
