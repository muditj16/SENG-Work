# UCrypt Web Application Project

A secure encryption web application built with Java Spring Boot backend and Angular frontend.

## Project Structure

- **crypto-back/**: Java Spring Boot backend application with encryption services
- **UCryptPortal/**: Angular frontend application 
- **testing/**: Automated testing suite with Selenium and TestNG
- **azure-pipelines.yml**: CI/CD pipeline configuration

## Features

- User authentication and role management
- Text and file encryption/decryption with multiple algorithms (AES, Triple DES, Blowfish)
- Secure file upload and download
- Key management system
- Admin dashboard for user management

## Security Enhancements

- Path traversal vulnerability protection
- AES/GCM encryption implementation
- Input validation and sanitization
- Secure file handling

## Technologies Used

- **Backend**: Java Spring Boot, Maven, JPA/Hibernate
- **Frontend**: Angular, TypeScript, HTML/CSS
- **Testing**: Selenium WebDriver, TestNG, Cucumber
- **Security**: SonarQube, OWASP ZAP
- **Deployment**: Docker, Azure DevOps
