import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Bold, Italic, AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo, Redo } from 'lucide-react';
import { apiService } from '../../services/api';
import { Blog } from '../../types';

const EditBlogPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [blogData, setBlogData] = useState({
    title: '',
    date: '',
    writtenBy: ''
  });
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadBlog(id);
    }
  }, [id, navigate]);

  const loadBlog = async (blogId: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getBlogById(blogId);
      if (response.success && response.data) {
        const apiBlogs = response.data;
        const transformedBlog: Blog = {
          id: apiBlogs._id,
          title: apiBlogs.title,
          excerpt: apiBlogs.excerpt,
          description: apiBlogs.description,
          author: apiBlogs.author,
          authorAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          publishedAt: apiBlogs.publishedAt,
          status: apiBlogs.status ? 'published' : 'draft',
          thumbnail: apiBlogs.thumbnail,
          readTime: Math.ceil(apiBlogs.description.split(' ').length / 200),
          createdAt: apiBlogs.createdAt,
          updatedAt: apiBlogs.updatedAt
        };
        
        setBlog(transformedBlog);
        setBlogData({
          title: transformedBlog.title,
          date: transformedBlog.publishedAt.split('T')[0],
          writtenBy: transformedBlog.author
        });
        setSummary(transformedBlog.excerpt);
        setDescription(transformedBlog.description);
      } else {
        setError(response.error || 'Blog not found');
        navigate('/blogs');
      }
    } catch (error) {
      setError('Failed to load blog');
      navigate('/blogs');
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBlogData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!blogData.title || !blogData.date || !blogData.writtenBy || !summary || !description) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate upload completion
    setTimeout(async () => {
      try {
        if (id) {
          const updateData = {
            title: blogData.title,
            excerpt: summary,
            description: description,
            author: blogData.writtenBy,
            publishedAt: new Date(blogData.date).toISOString(),
            status: blog?.status === 'published' ? true : false,
            thumbnailFile: file || undefined
          };

          const response = await apiService.updateBlog(id, updateData);
          
          if (response.success) {
            setIsSubmitting(false);
            setIsUploading(false);
            navigate('/blogs');
          } else {
            setError(response.error || 'Failed to update blog');
            setIsSubmitting(false);
            setIsUploading(false);
          }
        }
      } catch (error) {
        setError('Failed to update blog');
        setIsSubmitting(false);
        setIsUploading(false);
      }
    }, 2000);
  };

  const cancelUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
  };

  const EditorToolbar = ({ onAction }: { onAction: (action: string) => void }) => (
    <div className="flex items-center space-x-2 p-3 border-b border-gray-200 bg-gray-50">
      <button
        type="button"
        onClick={() => onAction('undo')}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition duration-200"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onAction('redo')}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition duration-200"
      >
        <Redo className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-2"></div>
      <select className="text-sm border border-gray-300 rounded px-2 py-1">
        <option>Paragraph</option>
        <option>Heading 1</option>
        <option>Heading 2</option>
        <option>Heading 3</option>
      </select>
      <div className="w-px h-6 bg-gray-300 mx-2"></div>
      <button
        type="button"
        onClick={() => onAction('bold')}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition duration-200"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onAction('italic')}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition duration-200"
      >
        <Italic className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-2"></div>
      <button
        type="button"
        onClick={() => onAction('align-left')}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition duration-200"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onAction('align-center')}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition duration-200"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onAction('align-right')}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition duration-200"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onAction('align-justify')}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition duration-200"
      >
        <AlignJustify className="w-4 h-4" />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Blog not found</h2>
        <Link to="/blogs" className="text-blue-600 hover:text-blue-700">
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center">
        <Link
          to="/blogs"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Blogs
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Blog Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Blog Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={blogData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter blog title"
                required
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={blogData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="writtenBy" className="block text-sm font-medium text-gray-700 mb-2">
                Written By
              </label>
              <input
                type="text"
                id="writtenBy"
                name="writtenBy"
                value={blogData.writtenBy}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Author name"
                required
              />
            </div>
          </div>
        </div>

        {/* Features Section - Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Features</h2>
            <p className="text-sm text-gray-600 mt-1">Summary Section</p>
          </div>
          <EditorToolbar onAction={(action) => console.log('Summary action:', action)} />
          <div className="p-6">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full h-32 border-0 resize-none focus:ring-0 focus:outline-none"
              placeholder="Write your blog summary here..."
            />
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Description</h2>
          </div>
          <EditorToolbar onAction={(action) => console.log('Description action:', action)} />
          <div className="p-6">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-48 border-0 resize-none focus:ring-0 focus:outline-none"
              placeholder="Write your detailed blog description here..."
            />
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Update Image</h2>
          
          {/* Current Image */}
          {blog.thumbnail && !file && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Current Image:</p>
              <img
                src={blog.thumbnail}
                alt="Current blog thumbnail"
                className="w-32 h-20 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}
          
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition duration-200"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">Choose a new file or drag & drop it here</p>
              <p className="text-sm text-gray-500 mb-6">JPEG, PNG formats, up to 5MB</p>
              <label className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition duration-200">
                <input
                  type="file"
                  src={blog.thumbnail?.startsWith('http') ? blog.thumbnail : `http://localhost:5000/uploads/${blog.thumbnail?.split('/').pop() || 'default.jpg'}`}
                  onChange={handleFileSelect}
                  className="hidden"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/276452/pexels-photo-276452.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop';
                  }}
                />
                Browse File
              </label>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={isUploading || isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
            >
              {isSubmitting || isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isUploading ? 'Uploading...' : 'Updating...'}
                </>
              ) : (
                'Update Blog'
              )}
            </button>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{blogData.title || 'Updating Blog'}</h3>
                    <p className="text-sm text-gray-500">
                      {file ? formatFileSize(file.size) : '0 KB'} of {file ? formatFileSize(file.size) : '0 KB'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={cancelUpload}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{uploadProgress}% uploaded</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EditBlogPage;