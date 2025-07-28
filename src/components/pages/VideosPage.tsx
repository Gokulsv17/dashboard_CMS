import React, { useState } from 'react';
import { Plus, Filter, Search, Calendar, User, Play, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockVideos, deleteVideo, updateVideo } from '../../data/mockData';
import { Video } from '../../types';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import DeleteSuccessModal from '../common/DeleteSuccessModal';
import VideoPlayerModal from '../common/VideoPlayerModal';

const VideosPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>(mockVideos);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    videoId: string | null;
    videoTitle: string;
  }>({
    isOpen: false,
    videoId: null,
    videoTitle: ''
  });
  const [successModal, setSuccessModal] = useState(false);
  const [videoPlayerModal, setVideoPlayerModal] = useState<{
    isOpen: boolean;
    video: Video | null;
  }>({
    isOpen: false,
    video: null
  });

  const filteredVideos = videos.filter(video => {
    const matchesStatus = filterStatus === 'all' || video.status === filterStatus;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.author.toLowerCase().includes(searchQuery.toLowerCase());
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

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const handleDeleteClick = (video: Video) => {
    setDeleteModal({
      isOpen: true,
      videoId: video.id,
      videoTitle: video.title
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.videoId) {
      const success = deleteVideo(deleteModal.videoId);
      if (success) {
        setVideos(mockVideos); // Refresh the videos list
      }
    }
    
    setDeleteModal({
      isOpen: false,
      videoId: null,
      videoTitle: ''
    });
    setSuccessModal(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      videoId: null,
      videoTitle: ''
    });
  };

  const handleSuccessClose = () => {
    setSuccessModal(false);
  };

  const handlePlayVideo = (video: Video) => {
    setVideoPlayerModal({
      isOpen: true,
      video: video
    });
  };

  const handleCloseVideoPlayer = () => {
    setVideoPlayerModal({
      isOpen: false,
      video: null
    });
  };

  const togglePublishStatus = (video: Video) => {
    const newStatus = video.status === 'published' ? 'draft' : 'published';
    updateVideo(video.id, { status: newStatus });
    setVideos([...mockVideos]); // Refresh the videos list
  };
  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Video Management</h1>
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
                <option value="processing">Processing</option>
              </select>
            </div>
            <Link
              to="/videos/add-project"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add New Video</span>
              <span className="sm:hidden">Add Video</span>
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
          placeholder="Search videos..."
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
                  Video Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time of Video
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
              {filteredVideos.map((video, index) => (
                <tr key={video.id} className="hover:bg-gray-50 transition duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs">
                      <p className="font-medium">{video.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(video.uploadedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {video.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => togglePublishStatus(video)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition duration-200 ${
                        video.status === 'published'
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                    >
                      {video.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handlePlayVideo(video)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition duration-200 ${
                          video.status === 'published'
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={video.status === 'published' ? 'Published' : 'Not Published'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200">
                        <Link to={`/videos/edit/${video.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(video)}
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
        {filteredVideos.map((video, index) => (
          <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover"
                />
                <button 
                  onClick={() => handlePlayVideo(video)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg hover:bg-opacity-70 transition duration-200"
                >
                  <Play className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm md:text-base font-medium text-gray-900 line-clamp-2">
                      {video.title}
                    </h3>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-gray-500">{video.author}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{formatDate(video.uploadedAt)}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{video.duration}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">#{index + 1}</span>
                </div>
                
                <p className="text-xs md:text-sm text-gray-600 mt-2 line-clamp-2">
                  {video.description}
                </p>
                
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => togglePublishStatus(video)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition duration-200 ${
                      video.status === 'published'
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    {video.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      className={`p-2 rounded-lg transition duration-200 ${
                        video.status === 'published'
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={video.status === 'published' ? 'Published' : 'Not Published'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <Link 
                      to={`/videos/edit/${video.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteClick(video)}
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
      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Are you sure you want to delete?"
        message={`This will permanently delete "${deleteModal.videoTitle}". This action cannot be undone.`}
        type="video"
      />

      {/* Delete Success Modal */}
      <DeleteSuccessModal
        isOpen={successModal}
        onClose={handleSuccessClose}
        type="video"
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={videoPlayerModal.isOpen}
        onClose={handleCloseVideoPlayer}
        videoTitle={videoPlayerModal.video?.title || ''}
      />
    </div>
  );
};

export default VideosPage;