Feature: File and text Decryption
    Scenario: A user decrypts file using invalid key
        Given I have navigated to the decryption page
        And I press the “Upload File” button and select an encrypted file
        And select an decryption technique
        And enter a key that is invalid for the selected decryption technique
        When I press the decrypt button an error message pops up saying that the key was invalid

    Scenario: A user decrypts file using valid input, key and technique
        Given I have navigated to the decryption page
        And I press the “Upload File” button and select an encrypted file
        And select the encryption technique the file was encrypted with
        And enter the key that the file was encrypted with
        When I press the decrypt button, the submitted file is successfully decrypted and the original is downloaded

    Scenario: A user decrypts text using an invalid key
        Given I have navigated to the decryption page
        And I have entered a ciphertext
        And selected a decryption technique
        And entered a key that is invalid for the selected decryption technique
        When I press the decrypt button I get an error saying that the selected key is invalid
    
    Scenario: A user decrypts text using valid input, key and technique
        Given I have navigated to the decryption page
        And I have entered a ciphertext
        And select the encryption technique the file was encrypted with
        And enter the key that the file was encrypted with
        When I press the decrypt button, the ciphertext is decrypted and the plaintext is given as output
    
    Scenario: User selects a saved key to use in decryption form
        Given I have saved the key used during an encryption process
        And I have navigated to the decryption page
        Then the saved encryption key is visible in the encryption key dropdown
        When I select the saved encryption key from the dropdown
        Then the saved encryption key is present in the encryption key field
        
    Scenario: User uses copy button to copy plaintext output
        Given I have successfully decrypted ciphertext
        When I press the copy button on the output field
        Then the output content has been copied to my clipboard
