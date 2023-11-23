CREATE TABLE encryption_keys (
  id bigint IDENTITY (1, 1) NOT NULL,
   created_by_user_id bigint,
   last_modified_by_user_id bigint,
   created_at datetime,
   updated_at datetime,
   value varchar(60) NOT NULL,
   user_id bigint NOT NULL,
   CONSTRAINT pk_encryption_keys PRIMARY KEY (id)
)
GO

ALTER TABLE encryption_keys ADD CONSTRAINT FK_ENCRYPTION_KEYS_ON_CREATED_BY_USER FOREIGN KEY (created_by_user_id) REFERENCES users (id)
GO

ALTER TABLE encryption_keys ADD CONSTRAINT FK_ENCRYPTION_KEYS_ON_LAST_MODIFIED_BY_USER FOREIGN KEY (last_modified_by_user_id) REFERENCES users (id)
GO

ALTER TABLE encryption_keys ADD CONSTRAINT FK_ENCRYPTION_KEYS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id)
GO

CREATE NONCLUSTERED INDEX idx_encryption_keys_user_id ON encryption_keys(user_id)
GO