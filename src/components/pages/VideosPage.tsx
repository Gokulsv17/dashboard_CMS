import React, { useState } from 'react';
import { Plus, Filter, Search, Calendar, User, Play, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockVideos } from '../../data/mockData';
import { Video } from '../../types';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import DeleteSuccessModal from '../common/DeleteSuccessModal';

const VideosPage: React.FC = () => {
  const [videos] = useState<Video[]>(mockVideos);
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
    // TODO: Replace with actual API call
    // DELETE /api/videos/${deleteModal.videoId}
    
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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Video Management</h1>
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
                <option value="processing">Processing</option>
              </select>
            </div>
            <Link
              to="/videos/add-project"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Video
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
                  Video Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time of Video
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200">
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
                        <Edit className="w-4 h-4" />
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
    </div>
  );
};

export default VideosPage;