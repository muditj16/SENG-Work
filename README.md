# Cryptonite Final Version (not cryptonight ;) )

## New Feature: 
   As an admin I want to delete a resource at admin panel so that I can remove unnecessary/oudated files.
## What files did I change to implement this feature?
### Frondend
   I have modified these files: (1. service/file.service.ts, 2. resources/resources.component.html, 3. resources/resources.component.ts)
### Backend
   I have modified these files: (1. services/FileService.java (added deleteFile() method), 2. repositories/FileRepository.java, 3. api/v1/FileController.java)
## Bug Fix:
   I have fixed the role change bug.
## What files did I modify to fix this bug?
### Frontend Only: 
   I did change the attribute value's value to Capital format by adjusting the getRoles() for both displayName and value in all three componenents.ts  and changed the [value]='role.value'> of components.html files at (admin/components/ 1.new-accounts/, 2.staff-accounts/, 3.user.accounts/). 

## To run the application: 
   * You need to have Docker Desktop and MySQL Server
   * You need a fresh ucrypt database on your MySQL Server
   * You can modify the application.properties file to change the admin email and password.
   * For MySQl connection, you will need to modify the file application.properties and docker-compose.yml file (username, password, etc.
   * Then start the Docker Desktop(better to delete old images and containers if any)
   * Then open the repo and cd to crypto-back and run "docker-compose build" wait for it to finish successfully, and then run "docker-compose up".
   * Visit localhost obviously port 80.
   * Try changing role.
   * Try uploading and then deleting files at admin resources section.

  
