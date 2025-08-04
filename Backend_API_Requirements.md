# Backend API Requirements for Your Node.js Application

Based on your existing authentication APIs, here are the additional endpoints you need to implement:

## 🔐 **Existing Authentication APIs** ✅
- `POST /api/users/register` ✅
- `POST /api/auth/login` ✅  
- `POST /api/auth/refresh-token` ✅
- `GET /api/auth/logout` ✅
- `PUT /api/users/change-password` ✅

## 📝 **Blog Management APIs** (Need to implement)

### Blog CRUD Operations
```javascript
// GET /api/blogs - Get all blogs with pagination
// Query params: page, limit, status, search
// Response: { success: true, data: { blogs: [], pagination: {} } }

// GET /api/blogs/:id - Get single blog
// Response: { success: true, data: blogObject }

// POST /api/blogs - Create new blog
// Body: FormData with title, excerpt, description, author, thumbnail
// Response: { success: true, data: createdBlog }

// PUT /api/blogs/:id - Update blog
// Body: FormData with updated fields
// Response: { success: true, data: updatedBlog }

// DELETE /api/blogs/:id - Delete blog
// Response: { success: true, message: "Blog deleted" }

// PATCH /api/blogs/:id/status - Update blog status
// Body: { status: "published" | "draft" | "archived" }
// Response: { success: true, data: updatedBlog }
```

### MongoDB Blog Schema
```javascript
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 500 },
  excerpt: { type: String, maxlength: 1000 },
  description: { type: String, required: true },
  author: { type: String, required: true },
  authorAvatar: { type: String },
  publishedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['published', 'draft', 'archived'], 
    default: 'draft' 
  },
  thumbnail: { type: String },
  readTime: { type: Number }, // in minutes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

## 🎥 **Video Management APIs** (Need to implement)

### Video CRUD Operations
```javascript
// GET /api/videos - Get all videos with pagination
// GET /api/videos/:id - Get single video
// POST /api/videos - Create new video
// PUT /api/videos/:id - Update video
// DELETE /api/videos/:id - Delete video
// PATCH /api/videos/:id/status - Update video status
// POST /api/videos/:id/views - Increment view count
```

### MongoDB Video Schema
```javascript
const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 500 },
  description: { type: String, maxlength: 2000 },
  author: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  duration: { type: String }, // "15:30" format
  views: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['published', 'draft', 'processing'], 
    default: 'draft' 
  },
  thumbnail: { type: String },
  videoUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

## 📊 **Dashboard API** (Need to implement)

```javascript
// GET /api/dashboard/stats
// Response: {
//   success: true,
//   data: {
//     totalBlogs: 248,
//     totalVideos: 156,
//     totalViews: 89543,
//     totalUsers: 1247,
//     recentBlogs: [...],
//     recentVideos: [...]
//   }
// }
```

## 📁 **File Upload APIs** (Need to implement)

```javascript
// POST /api/upload/image
// Body: FormData with 'image' field
// Response: { success: true, data: { url, filename, size } }

// POST /api/upload/video  
// Body: FormData with 'video' field
// Response: { success: true, data: { url, filename, size, duration } }
```

### Multer Configuration Example
```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.fieldname === 'video' ? 'uploads/videos/' : 'uploads/images/';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: file.fieldname === 'video' ? 100 * 1024 * 1024 : 5 * 1024 * 1024 // 100MB for videos, 5MB for images
  }
});
```

## 🔍 **Search API** (Need to implement)

```javascript
// GET /api/search?q=searchTerm&type=blog|video
// Response: {
//   success: true,
//   data: {
//     results: { blogs: [], videos: [] },
//     totalResults: 25
//   }
// }
```

## 🛡️ **Middleware Requirements**

### Authentication Middleware
```javascript
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

### Error Handling Middleware
```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

## 📋 **Response Format Standard**

All APIs should follow this response format:

### Success Response
```javascript
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```javascript
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

### Pagination Response
```javascript
{
  "success": true,
  "data": {
    "blogs": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

## 🚀 **Implementation Priority**

1. **High Priority**: Blog CRUD APIs
2. **High Priority**: Video CRUD APIs  
3. **Medium Priority**: File Upload APIs
4. **Medium Priority**: Dashboard Stats API
5. **Low Priority**: Search API

## 🔧 **Environment Variables to Add**

```env
# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE_IMAGE=5242880  # 5MB
MAX_FILE_SIZE_VIDEO=104857600  # 100MB

# Pagination
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

This documentation provides everything your backend developer needs to implement the remaining APIs to fully integrate with your React frontend.