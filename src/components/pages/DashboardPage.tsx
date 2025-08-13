import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";
import { Blog } from "../../types";
import { Eye, ArrowUpRight, Play } from "lucide-react";
import BlogPreviewModal from "../common/BlogPreviewModal";
import VideoPlayerModal from "../common/VideoPlayerModal";
import { mockVideos } from "../../data/mockData";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Blog state management
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [expandedExcerpts, setExpandedExcerpts] = useState<{
    [key: string]: boolean;
  }>({});

  // Preview modal state
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    blog: Blog | null;
  }>({
    isOpen: false,
    blog: null,
  });

  // Video modal state (using mock data for now)
  const [videoPlayerModal, setVideoPlayerModal] = useState<{
    isOpen: boolean;
    videoTitle: string;
  }>({
    isOpen: false,
    videoTitle: "",
  });

  // Load blogs from API on component mount
  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Dashboard: Making GET request to blogs API...");
      const response = await apiService.getBlogs();
      console.log("Dashboard Blogs response:", response);

      if (response.success && response.data) {
        console.log("Dashboard Blogs data:", response.data);

        // Transform API data to match our Blog interface
        const transformedBlogs: Blog[] = response.data.map((blog) => ({
          id: blog._id,
          title: blog.title || "Untitled",
          excerpt: blog.excerpt || "No excerpt available",
          description: blog.description || "No description available",
          author: blog.author || "Unknown Author",
          authorAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
          publishedAt: blog.publishedAt || new Date().toISOString(),
          status: blog.status ? "published" : "draft",
          thumbnail: blog.thumbnail,
          readTime: blog.description
            ? Math.ceil((blog.description || "").split(" ").length / 200)
            : 1,
          createdAt: blog.createdAt,
          updatedAt: blog.updatedAt,
        }));

        console.log("Dashboard Transformed blogs:", transformedBlogs);
        setBlogs(transformedBlogs);
      } else {
        setError(response.error || "Failed to load blogs");
        console.error("Dashboard API Error:", response.error);
      }
    } catch (error) {
      setError("Failed to load blogs");
      console.error("Dashboard Error loading blogs:", error);
    }
    setLoading(false);
  };

  // Get image URL with proper fallback handling
  const getImageUrl = (thumbnail?: string) => {
    if (!thumbnail) {
      return "https://images.pexels.com/photos/276452/pexels-photo-276452.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop";
    }

    // If it's already a complete URL, use it
    if (thumbnail.startsWith("http")) {
      return thumbnail;
    }

    // Extract filename from full path (handles both Windows \ and Unix / separators)
    const filename =
      thumbnail.includes("\\") || thumbnail.includes("/")
        ? thumbnail.split(/[\\\/]/).pop()
        : thumbnail;

    // Construct the URL
    return `http://localhost:5000/uploads/${filename}`;
  };

  // Handle image load errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    console.error("Dashboard: Failed to load image:", target.src);
    target.src =
      "https://images.pexels.com/photos/276452/pexels-photo-276452.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop";
  };

  // Handle blog preview
  const handleBlogPreview = (blog: Blog) => {
    setPreviewModal({
      isOpen: true,
      blog: blog,
    });
  };

  const handleClosePreview = () => {
    setPreviewModal({
      isOpen: false,
      blog: null,
    });
  };

  // Handle video preview (using mock data)
  const handleVideoPreview = (videoTitle: string) => {
    setVideoPlayerModal({
      isOpen: true,
      videoTitle: videoTitle,
    });
  };

  const handleCloseVideoPlayer = () => {
    setVideoPlayerModal({
      isOpen: false,
      videoTitle: "",
    });
  };

  const toggleExcerpt = (id: string) => {
    setExpandedExcerpts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Get recent blogs (first 6)
  const recentBlogs = blogs.slice(0, 6);
  const recentVideos = mockVideos.slice(0, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 p-2 md:p-6">
      {/* Blog Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-blue-50 rounded-t-xl">
          <h3 className="text-lg font-semibold text-gray-900">
            Blog Management ({blogs.length})
          </h3>
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => navigate("/blogs")}
          >
            Details &gt;
          </button>
        </div>

        <div className="p-4 md:p-6">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={loadBlogs}
                className="mt-2 text-red-600 hover:text-red-700 underline text-sm"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && blogs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No blogs found</p>
              <button
                onClick={() => navigate("/blogs/add-project")}
                className="mt-2 text-blue-600 hover:text-blue-700 underline"
              >
                Create your first blog
              </button>
            </div>
          )}

          {/* Blog Cards Grid */}
          {!loading && !error && recentBlogs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              {recentBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="w-full max-w-[243px] h-auto bg-white border border-gray-100 rounded-xl shadow-sm p-3 flex flex-col mx-auto cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-200"
                >
                  <img
                    src={getImageUrl(blog.thumbnail)}
                    alt={blog.title}
                    className="w-full h-[100px] object-cover rounded-lg"
                    onError={handleImageError}
                  />
                  <h4 className="mt-3 text-[16px] font-semibold text-gray-800 leading-tight line-clamp-2">
                    {blog.title}
                  </h4>
                  <p
                    className={`text-[12px] text-gray-500 mt-1 ${
                      expandedExcerpts[blog.id] ? "" : "line-clamp-2"
                    }`}
                  >
                    {expandedExcerpts[blog.id]
                      ? blog.excerpt
                      : `${blog.excerpt.slice(0, 15)}....`}
                    <span
                      onClick={() => toggleExcerpt(blog.id)}
                      className="text-blue-600 cursor-pointer ml-1"
                    >
                      {expandedExcerpts[blog.id] ? " Read Less" : " Read More"}
                    </span>
                  </p>

                  {/* Author section with custom layout */}
                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      {/* Author Avatar */}
                      <img
                        src={blog.authorAvatar}
                        alt={blog.author}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      {/* Author Name and Read Time */}
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-600 font-medium">
                          {blog.author}
                        </span>
                        <span className="w-auto h-[13px] text-[10px] font-medium bg-[#DBEDFF] text-[#006ADA] rounded-full flex items-center justify-center mt-1 px-2">
                          {blog.readTime} min read
                        </span>
                      </div>

                      <ArrowUpRight
                        onClick={() => handleBlogPreview(blog)}
                        className="w-6 h-6 ml-auto text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Videos Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-blue-50 rounded-t-xl">
          <h3 className="text-lg font-semibold text-gray-900">
            Videos Management ({recentVideos.length})
          </h3>
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => navigate("/videos")}
          >
            Details &gt;
          </button>
        </div>
        <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recentVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => handleVideoPreview(video.title)}
              className="flex flex-col border border-gray-100 p-3 rounded-xl shadow-sm bg-white cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-200"
            >
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-28 rounded-lg object-cover"
                />
                <div className="absolute top-1 left-1 bg-blue-100 text-blue-600 text-[10px] font-semibold px-2 py-[2px] rounded-full">
                  Tutorial
                </div>
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-[10px] px-2 py-[2px] rounded-full">
                  {video.duration}
                </div>
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <Play className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <h4 className="text-sm max-w-[111px] font-medium text-gray-900 line-clamp-2 leading-snug">
                  {video.title}
                </h4>

                <Eye
                  className={`w-4 h-4 ${
                    video.status === "published"
                      ? "text-green-500"
                      : "text-gray-400"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blog Preview Modal */}
      <BlogPreviewModal
        isOpen={previewModal.isOpen}
        onClose={handleClosePreview}
        blog={previewModal.blog}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={videoPlayerModal.isOpen}
        onClose={handleCloseVideoPlayer}
        videoTitle={videoPlayerModal.videoTitle}
      />
    </div>
  );
};

export default DashboardPage;
