# API Implementation Notes for Backend Developer

## Authentication & Security

### JWT Token Implementation
- Use JWT tokens for authentication
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- Store refresh tokens securely in database
- Implement token blacklisting for logout

### Password Security
- Hash passwords using bcrypt (minimum 12 rounds)
- Implement password strength validation
- Rate limiting for login attempts (5 attempts per 15 minutes)

### Session Management
- Implement session timeout (10 minutes of inactivity)
- Track user activity for session renewal
- Secure logout that invalidates all tokens

## File Upload Requirements

### Image Upload
- Supported formats: JPEG, PNG, WebP
- Maximum size: 5MB
- Generate thumbnails automatically
- Store in cloud storage (AWS S3, Cloudinary, etc.)
- Implement image optimization

### Video Upload
- Supported formats: MP4, MOV, AVI
- Maximum size: 100MB
- Extract video duration automatically
- Generate video thumbnails
- Implement video compression/transcoding
- Progress tracking for large uploads

## Database Schema Suggestions

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Blogs Table
```sql
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  excerpt TEXT,
  description TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  author_avatar TEXT,
  published_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft',
  thumbnail_url TEXT,
  read_time INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Videos Table
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  author VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  duration VARCHAR(20),
  views INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft',
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Response Standards

### Success Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Email is required"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Validation Rules

### Blog Validation
- Title: Required, 1-500 characters
- Excerpt: Optional, max 1000 characters
- Description: Required, min 10 characters
- Author: Required, 1-255 characters
- Status: Must be 'published', 'draft', or 'archived'

### Video Validation
- Title: Required, 1-500 characters
- Description: Optional, max 2000 characters
- Author: Required, 1-255 characters
- Status: Must be 'published', 'draft', or 'processing'

### User Validation
- Email: Required, valid email format, unique
- Password: Required, min 8 characters, must contain uppercase, lowercase, number
- Name: Required, 1-255 characters

## Rate Limiting
- Authentication endpoints: 5 requests per minute
- File upload endpoints: 10 requests per hour
- General API endpoints: 100 requests per minute
- Search endpoints: 30 requests per minute

## Caching Strategy
- Cache dashboard stats for 5 minutes
- Cache blog/video lists for 2 minutes
- Cache individual blog/video for 10 minutes
- Invalidate cache on create/update/delete operations

## Error Codes
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Insufficient permissions
- `VALID_001`: Validation error
- `NOT_FOUND_001`: Resource not found
- `UPLOAD_001`: File upload error
- `RATE_LIMIT_001`: Rate limit exceeded

## Environment Variables Needed
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name
REDIS_URL=redis://...
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```