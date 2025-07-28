import React, { useState } from 'react';
import { Plus, Filter, Search, Calendar, User, Clock, Edit, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockBlogs, deleteBlog } from '../../data/mockData';
import { Blog } from '../../types';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import DeleteSuccessModal from '../common/DeleteSuccessModal';

const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>(mockBlogs);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredBlogs = blogs.filter(blog => {
    const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
      const success = deleteBlog(deleteModal.blogId);
      if (success) {
        setBlogs(mockBlogs); // Refresh the blogs list
      }
    }
    
    setDeleteModal({
      isOpen: false,
      blogId: null,
      blogTitle: ''
    });
    setSuccessModal(true);
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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filter by</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <Link
              to="/blogs/add-project"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Blog
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBlogs.map((blog, index) => (
                <tr key={blog.id} className="hover:bg-gray-50 transition duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
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

      {/* Empty State */}
      {filteredBlogs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
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
    </div>
  );
};

export default BlogsPage;