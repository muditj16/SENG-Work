# Entity-Relationship Diagram (ERD)
## RAS Safety Forms Database

```
┌─────────────────────────┐
│        USERS            │
├─────────────────────────┤
│ PK  id (UUID)           │
│     email (VARCHAR)     │
│     full_name (VARCHAR) │
│     role (ENUM)         │
│     created_at (TS)     │
│     updated_at (TS)     │
└───────────┬─────────────┘
            │
            │ 1:N
            │
            ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│   SAFETY_SUBMISSIONS    │ N:1     │      JOB_SITES          │
├─────────────────────────┤─────────┤─────────────────────────┤
│ PK  id (UUID)           │         │ PK  id (UUID)           │
│ FK  user_id (UUID)      │         │     site_name (VARCHAR) │
│ FK  job_site_id (UUID)  │         │     location (VARCHAR)  │
│     submission_date     │         │     is_active (BOOL)    │
│     ppe_worn (BOOL)     │         │     created_at (TS)     │
│     hard_hat (BOOL)     │         │     updated_at (TS)     │
│     safety_vest (BOOL)  │         └─────────────────────────┘
│     steel_toe_boots     │
│     eye_protection      │
│     fall_protection     │
│     ladders_inspected   │
│     tools_condition     │
│     hazards_identified  │
│     notes (TEXT)        │
│     status (ENUM)       │
│     created_at (TS)     │
│     updated_at (TS)     │
└───────────┬─────────────┘
            │
            │ 1:N
            │
            ▼
┌─────────────────────────┐
│   SUBMISSION_PHOTOS     │
├─────────────────────────┤
│ PK  id (UUID)           │
│ FK  submission_id (UUID)│
│     photo_url (VARCHAR) │
│     file_name (VARCHAR) │
│     file_size (INT)     │
│     photo_type (ENUM)   │
│     created_at (TS)     │
└─────────────────────────┘
```

## Relationships

### 1. USERS ↔ SAFETY_SUBMISSIONS (One-to-Many)
- **Cardinality**: 1:N
- **Description**: One user (framer) can have many safety submissions
- **Foreign Key**: `safety_submissions.user_id` → `users.id`
- **Delete Rule**: CASCADE (if user deleted, all their submissions are deleted)

### 2. JOB_SITES ↔ SAFETY_SUBMISSIONS (One-to-Many)
- **Cardinality**: 1:N
- **Description**: One job site can have many safety submissions
- **Foreign Key**: `safety_submissions.job_site_id` → `job_sites.id`
- **Delete Rule**: CASCADE (if site deleted, all submissions for that site are deleted)

### 3. SAFETY_SUBMISSIONS ↔ SUBMISSION_PHOTOS (One-to-Many)
- **Cardinality**: 1:N
- **Description**: One safety submission can have multiple photos
- **Foreign Key**: `submission_photos.submission_id` → `safety_submissions.id`
- **Delete Rule**: CASCADE (if submission deleted, all associated photos are deleted)

## Key Constraints

### Primary Keys
- All tables use UUID as primary key for distributed scalability
- Auto-generated using `uuid_generate_v4()`

### Unique Constraints
- `users.email` - No duplicate email addresses
- `job_sites.site_name` - No duplicate site names
- `(user_id, job_site_id, submission_date)` on `safety_submissions` - One submission per worker per site per day

### Indexes
- `idx_safety_submissions_user_id` - Fast lookup of submissions by user
- `idx_safety_submissions_job_site_id` - Fast lookup of submissions by site
- `idx_safety_submissions_submission_date` - Fast filtering by date
- `idx_submission_photos_submission_id` - Fast photo lookup for submissions

## ENUM Types

### user_role
- `framer` - Construction worker who submits forms
- `admin` - Administrator who reviews all submissions

### submission_status
- `submitted` - Initial state when form is submitted
- `reviewed` - Admin has reviewed the submission

### photo_type
- `site_condition` - Photos showing site conditions
- `ppe` - Photos showing Personal Protective Equipment
- `hazard` - Photos documenting hazards
- `other` - Other types of photos

## Row Level Security (RLS)

### Framers
- **SELECT**: Can only view their own submissions and photos
- **INSERT**: Can only create submissions for themselves
- **UPDATE**: Can only update their own submissions

### Admins
- **SELECT**: Can view all submissions, photos, and users
- **UPDATE**: Can update any submission (e.g., mark as reviewed)
- **INSERT/DELETE**: Full access to all tables

## Data Integrity Rules

1. **Referential Integrity**: All foreign keys enforced with CASCADE on delete
2. **Temporal Integrity**: `created_at` and `updated_at` automatically maintained
3. **Business Logic**: 
   - Unique constraint prevents duplicate submissions for same worker/site/date
   - Active job sites can be toggled without deletion
   - Photo uploads validated at application level (5MB max, image types only)

## Sample Query Patterns

### Get all submissions for a site with user details
```sql
SELECT s.*, u.full_name, u.email
FROM safety_submissions s
JOIN users u ON s.user_id = u.id
WHERE s.job_site_id = 'site-uuid'
ORDER BY s.submission_date DESC;
```

### Get submissions with photo count
```sql
SELECT s.*, COUNT(p.id) as photo_count
FROM safety_submissions s
LEFT JOIN submission_photos p ON s.id = p.submission_id
GROUP BY s.id;
```

### Find workers without submission today
```sql
SELECT u.*
FROM users u
WHERE u.role = 'framer'
AND u.id NOT IN (
  SELECT user_id FROM safety_submissions
  WHERE submission_date = CURRENT_DATE
);
```

## Scalability Considerations

- UUIDs allow for distributed database sharding
- Indexes on frequently queried columns
- RLS policies enforced at database level
- Pagination can be added with LIMIT/OFFSET
- Photo storage handled separately in Supabase Storage (not in database)

---

**Diagram Legend:**
- PK = Primary Key
- FK = Foreign Key
- TS = Timestamp
- BOOL = Boolean
- ENUM = Enumerated Type
- 1:N = One-to-Many Relationship
- N:1 = Many-to-One Relationship
