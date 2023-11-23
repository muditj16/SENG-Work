CREATE TABLE users (
   id bigint IDENTITY (1, 1) NOT NULL,
   created_by_user_id bigint,
   last_modified_by_user_id bigint,
   created_at datetime,
   updated_at datetime,
   name varchar(60) NOT NULL,
   email varchar(255) NOT NULL,
   password varchar(255) NOT NULL,
   status varchar(255) NOT NULL,
   role_id bigint NOT NULL,
   CONSTRAINT pk_users PRIMARY KEY (id)
)
GO

CREATE TABLE roles (
  id bigint IDENTITY (1, 1) NOT NULL,
   created_by_user_id bigint,
   last_modified_by_user_id bigint,
   created_at datetime,
   updated_at datetime,
   name varchar(255) NOT NULL,
   display_name varchar(60) NOT NULL,
   description varchar(255),
   CONSTRAINT pk_roles PRIMARY KEY (id)
)
GO

-- Constraints for users table
ALTER TABLE users ADD CONSTRAINT uc_users_email UNIQUE (email)
GO
ALTER TABLE users ADD CONSTRAINT FK_USERS_ON_CREATED_BY_USER FOREIGN KEY (created_by_user_id) REFERENCES users (id)
GO
ALTER TABLE users ADD CONSTRAINT FK_USERS_ON_LAST_MODIFIED_BY_USER FOREIGN KEY (last_modified_by_user_id) REFERENCES users (id)
GO
ALTER TABLE users ADD CONSTRAINT FK_USERS_ON_ROLE FOREIGN KEY (role_id) REFERENCES roles (id)
GO

-- Constraints for roles table
ALTER TABLE roles ADD CONSTRAINT uc_roles_display_name UNIQUE (display_name)
GO
ALTER TABLE roles ADD CONSTRAINT uc_roles_name UNIQUE (name)
GO
ALTER TABLE roles ADD CONSTRAINT FK_ROLES_ON_CREATED_BY_USER FOREIGN KEY (created_by_user_id) REFERENCES users (id)
GO
ALTER TABLE roles ADD CONSTRAINT FK_ROLES_ON_LAST_MODIFIED_BY_USER FOREIGN KEY (last_modified_by_user_id) REFERENCES users (id)
GO