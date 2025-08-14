import React from 'react';
import { X, Calendar, User, Clock, Eye } from 'lucide-react';
import { Blog } from '../../types';

interface BlogPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: Blog | null;
}

const BlogPreviewModal: React.FC<BlogPreviewModalProps> = ({
  isOpen,
  onClose,
  blog
}) => {
  if (!isOpen || !blog) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string | boolean) => {
    if (typeof status === 'boolean') {
      return status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    }
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string | boolean) => {
    if (typeof status === 'boolean') {
      return status ? 'Published' : 'Draft';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Blog Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Blog Header */}
          <div className="p-6 border-b border-gray-200">
            {blog.thumbnail && (
              <img
                src={blog.thumbnail.startsWith('data:image/') || blog.thumbnail.startsWith('http') 
                  ? blog.thumbnail 
                  : 'https://images.pexels.com/photos/276452/pexels-photo-276452.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop'}
                alt={blog.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.error('BlogPreviewModal: Failed to load image:', target.src);
                  target.src = 'https://images.pexels.com/photos/276452/pexels-photo-276452.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop';
                }}
              />
            )}
            
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(blog.status)}`}>
                <Eye className="w-4 h-4 inline mr-1" />
                {getStatusText(blog.status)}
              </span>
              {blog.readTime && (
                <span className="text-sm text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {blog.readTime} min read
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {blog.title}
            </h1>

            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                {blog.authorAvatar && (
                  <img
                    src={blog.authorAvatar}
                    alt={blog.author}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <User className="w-4 h-4 mr-1" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
            </div>

            {blog.excerpt && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-blue-800 font-medium text-lg italic">
                  {blog.excerpt}
                </p>
              </div>
            )}
          </div>

          {/* Blog Content */}
          <div className="p-6">
            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {blog.description}
              </div>
            </div>
          </div>

          {/* Blog Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                {blog.createdAt && (
                  <span>Created: {formatDate(blog.createdAt)}</span>
                )}
              </div>
              <div>
                {blog.updatedAt && (
                  <span>Last updated: {formatDate(blog.updatedAt)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPreviewModal;