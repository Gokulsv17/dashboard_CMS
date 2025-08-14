import React, { useState } from 'react';
import { Plus, Filter, Search, Calendar, User, Clock, Edit, Trash2, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Blog } from '../../types';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import DeleteSuccessModal from '../common/DeleteSuccessModal';
import BlogPreviewModal from '../common/BlogPreviewModal';
import Pagination from '../common/Pagination';

const BlogsPage: React.FC = () => {
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    blogId: string | null;
    blogTitle: string;
  }>({
    isOpen: false,
    blogId: null,
    blogTitle: ''
  });
  const [successModal, setSuccessModal] = useState(false);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    blog: Blog | null;
  }>({
    isOpen: false,
    blog: null
  });

  const filteredBlogs = blogs.filter(blog => {
    const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination calculations
  const totalItems = filteredBlogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery, itemsPerPage]);

  // Load blogs from API
  React.useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getBlogs();
      // console.log("Blogs response:", response);
      if (response.success && response.data) {
        // console.log("Blogs data:", response.data[0]._id);
        // Transform API data to match our Blog interface
        const transformedBlogs: Blog[] = response.data.map(blog => ({
          id: blog._id,
          title: blog.title,
          excerpt: blog.excerpt,  
          description: blog.description || '',
          author: blog.author,
          authorAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          publishedAt: blog.publishedAt,
          status: blog.status ? 'published' : 'draft',
          thumbnail: blog.thumbnail,
          readTime:blog.description ? Math.ceil(blog.description.split(' ').length / 200): 0, // Assuming average reading speed of 200 words per minute
          createdAt: blog.createdAt,
          updatedAt: blog.updatedAt
        }));
        setBlogs(transformedBlogs);
        // console.log("Transformed blogs:", transformedBlogs);
       
      } else {
        setError(response.error || 'Failed to load blogs');

      }
      
    } catch (error) {
      setError('Failed to load blogs');
      console.error('Error loading blogs:', error);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const toggleDescription = (blogId: string) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(blogId)) {
      newExpanded.delete(blogId);
    } else {
      newExpanded.add(blogId);
    }
    setExpandedDescriptions(newExpanded);
  };

  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  const handleDeleteClick = (blog: Blog) => {
    setDeleteModal({
      isOpen: true,
      blogId: blog.id,
      blogTitle: blog.title
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.blogId) {
      deleteBlogFromAPI(deleteModal.blogId);
    }
    
    setDeleteModal({
      isOpen: false,
      blogId: null,
      blogTitle: ''
    });
    setSuccessModal(true);
  };

  const deleteBlogFromAPI = async (blogId: string) => {
    try {
      const response = await apiService.deleteBlog(blogId);
      if (response.success) {
        // Remove blog from local state
        setBlogs(prevBlogs => prevBlogs.filter(blog => blog.id !== blogId));
      } else {
        setError(response.error || 'Failed to delete blog');
      }
    } catch (error) {
      setError('Failed to delete blog');
      console.error('Error deleting blog:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      blogId: null,
      blogTitle: ''
    });
  };

  const handleSuccessClose = () => {
    setSuccessModal(false);
  };

  const handlePreviewClick = (blog: Blog) => {
    setPreviewModal({
      isOpen: true,
      blog: blog
    });
  };

  const handleClosePreview = () => {
    setPreviewModal({
      isOpen: false,
      blog: null
    });
  };

  const togglePublishStatus = async (blog: Blog) => {
    setStatusUpdating(blog.id);
    setError('');
    
    try {
      const newStatus = blog.status === 'published' ? false : true;
      // console.log(`Updating blog ${blog.id} status to: ${newStatus ? 'published' : 'draft'}`);
      
      const response = await apiService.updateBlogStatus(blog.id, newStatus);
      
      if (response.success) {
        // console.log('Status updated successfully in database');
        // Update local state
        setBlogs(prevBlogs => 
          prevBlogs.map(b => 
            b.id === blog.id 
              ? { ...b, status: newStatus ? 'published' : 'draft' }
              : b
          )
        );
        // console.log(`UI updated: Blog ${blog.id} is now ${newStatus ? 'published' : 'draft'}`);
      } else {
        console.error('Status update failed:', response.error);
        setError(response.error || 'Failed to update blog status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      setError('Failed to update blog status');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error} {blogs.length}</p>
          <button
            onClick={loadBlogs}
            className="mt-2 text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Blog Management</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filter by</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <Link
              to="/blogs/add-project"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add New Blog</span>
              <span className="sm:hidden">Add Blog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          placeholder="Search blogs..."
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blog Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Written By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBlogs.map((blog, index) => (
                <tr key={blog.id} className="hover:bg-gray-50 transition duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs">
                      <p className="font-medium">{blog.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(blog.publishedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <img
                        src={blog.authorAvatar}
                        alt={blog.author}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <span>{blog.author}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-sm">
                      <p>
                        {expandedDescriptions.has(blog.id) 
                          ? blog.excerpt 
                          : truncateDescription(blog.excerpt)
                        }
                        {blog.excerpt.length > 100 && (
                          <button
                            onClick={() => toggleDescription(blog.id)}
                            className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {expandedDescriptions.has(blog.id) ? 'Read less' : 'Read more'}
                          </button>
                        )}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => togglePublishStatus(blog)}
                      disabled={statusUpdating === blog.id}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition duration-200 ${
                        blog.status === 'published'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {statusUpdating === blog.id ? (
                        <div className="flex items-center">
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                          Updating...
                        </div>
                      ) : (
                        blog.status === 'published' ? 'Published' : 'Draft'
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handlePreviewClick(blog)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition duration-200"
                        title="Preview Blog"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition duration-200 ${
                          blog.status === 'published'
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={blog.status === 'published' ? 'Published' : 'Not Published'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200">
                        <Link to={`/blogs/edit/${blog.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(blog)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden space-y-4">
        {paginatedBlogs.map((blog, index) => (
          <div key={blog.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={blog.thumbnail || 'https://images.pexels.com/photos/276452/pexels-photo-276452.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop'}
                  alt={blog.title}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm md:text-base font-medium text-gray-900 line-clamp-2">
                      {blog.title}
                    </h3>
                    <div className="flex items-center mt-1 space-x-2">
                      <img
                        src={blog.authorAvatar}
                        alt={blog.author}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-xs text-gray-500">{blog.author}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{formatDate(blog.publishedAt)}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">#{startIndex + index + 1}</span>
                </div>
                
                <p className="text-xs md:text-sm text-gray-600 mt-2 line-clamp-2">
                  {blog.excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => togglePublishStatus(blog)}
                    disabled={statusUpdating === blog.id}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition duration-200 ${
                      blog.status === 'published'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {statusUpdating === blog.id ? (
                      <div className="flex items-center">
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                        Updating...
                      </div>
                    ) : (
                      blog.status === 'published' ? 'Published' : 'Draft'
                    )}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePreviewClick(blog)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition duration-200"
                      title="Preview Blog"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-2 rounded-lg transition duration-200 ${
                        blog.status === 'published'
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={blog.status === 'published' ? 'Published' : 'Not Published'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <Link 
                      to={`/blogs/edit/${blog.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteClick(blog)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {totalItems === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Are you sure you want to delete?"
        message={`This will permanently delete "${deleteModal.blogTitle}". This action cannot be undone.`}
        type="blog"
      />

      {/* Delete Success Modal */}
      <DeleteSuccessModal
        isOpen={successModal}
        onClose={handleSuccessClose}
        type="blog"
      />

      {/* Blog Preview Modal */}
      <BlogPreviewModal
        isOpen={previewModal.isOpen}
        onClose={handleClosePreview}
        blog={previewModal.blog}
      />
    </div>
  );
};

export default BlogsPage;