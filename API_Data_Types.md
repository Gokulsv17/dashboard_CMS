# API Data Types Documentation

## User Data Type
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Blog Data Type
```typescript
interface Blog {
  id: string;
  title: string;
  excerpt: string;
  description: string;
  author: string;
  authorAvatar: string;
  publishedAt: string;
  status: 'published' | 'draft' | 'archived';
  thumbnail?: string;
  readTime: number;
  createdAt: string;
  updatedAt: string;
  templateData?: SelectedTemplate;
  detailedContentSections?: DetailedContentSection[];
  subheadingGroups?: SubheadingGroup[];
}
```

## Blog Template Data Types
```typescript
interface SelectedTemplate {
  templateId: string;
  widgets: TemplateWidget[];
}

interface TemplateWidget {
  id: string;
  type: 'header' | 'content-with-sidebar' | 'detailed-content';
  name: string;
  preview: string;
  fields: WidgetField[];
}

interface WidgetField {
  id: string;
  type: 'text' | 'textarea' | 'image' | 'rich-text' | 'list';
  label: string;
  placeholder?: string;
  value: string;
  formatting?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    alignment?: 'left' | 'center' | 'right' | 'justify';
  };
  listItems?: string[];
}

interface DetailedContentSection {
  id: string;
  type: 'main-heading' | 'main-content' | 'subheading-groups' | 'content-image';
  label: string;
  order: number;
  data: any;
}

interface SubheadingGroup {
  id: string;
  subheading: string;
  content: string;
}
```

## Video Data Type
```typescript
interface Video {
  id: string;
  title: string;
  description: string;
  author: string;
  uploadedAt: string;
  duration: string;
  views: number;
  status: 'published' | 'draft' | 'processing';
  thumbnail?: string;
  videoUrl: string;
  createdAt: string;
  updatedAt: string;
}
```

## Authentication Response
```typescript
interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}
```

## Pagination Response
```typescript
interface PaginationResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

## Dashboard Stats
```typescript
interface DashboardStats {
  totalBlogs: number;
  totalVideos: number;
  totalViews: number;
  totalUsers: number;
  recentBlogs: Blog[];
  recentVideos: Video[];
}
```

## File Upload Response
```typescript
interface FileUploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  duration?: string; // For video files
}
```

## Error Response
```typescript
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}
```

## Search Response
```typescript
interface SearchResponse {
  results: {
    blogs: Blog[];
    videos: Video[];
  };
  totalResults: number;
  query: string;
}
```

## Status Enums
```typescript
// Blog Status
type BlogStatus = 'published' | 'draft' | 'archived';

// Video Status  
type VideoStatus = 'published' | 'draft' | 'processing';

// User Roles (if needed)
type UserRole = 'admin' | 'editor' | 'viewer';
```

## Request Headers
All authenticated requests should include:
```
Authorization: Bearer <token>
Content-Type: application/json
```

For file uploads:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

## Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

### Filtering
- `status`: Filter by status
- `search`: Search term
- `author`: Filter by author
- `dateFrom`: Filter from date (ISO string)
- `dateTo`: Filter to date (ISO string)

### Sorting
- `sortBy`: Field to sort by
- `sortOrder`: 'asc' | 'desc' (default: 'desc')