import React from "react";
import { useNavigate } from "react-router-dom";
import { mockBlogs, mockVideos } from "../../data/mockData";
import { Eye, ArrowUpRight } from "lucide-react";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const recentBlogs = mockBlogs.slice(0, 6);
  const recentVideos = mockVideos.slice(0, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 p-2 md:p-6">
      {/* Blog Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-blue-50 rounded-t-xl">
          <h3 className="text-lg font-semibold text-gray-900">
            Blog Management
          </h3>
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => navigate("/blogs")}
          >
            Details &gt;
          </button>
        </div>
        <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          {recentBlogs.map((blog) => (
            <div
              key={blog.id}
              className="w-full max-w-[243px] h-[287px] bg-white border border-gray-100 rounded-xl shadow-sm p-3 flex flex-col mx-auto"
            >
              <img
                src={blog.thumbnail}
                alt={blog.title}
                className="w-full h-[100px] object-cover rounded-lg"
              />
              <h4 className="mt-3 text-[16px] font-semibold text-gray-800 leading-tight line-clamp-2">
                {blog.title}
              </h4>
              <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">
                {blog.description?.slice(0, 50)}....
                <span className="text-blue-600"> Read More</span>
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
                    <span className="w-auto h-[13px] text-[10px] font-medium bg-[#DBEDFF] text-[#006ADA] rounded-full flex items-center justify-center mt-1">
                      {blog.readTime} min read
                    </span>
                  </div>

                  <ArrowUpRight className="w-6 h-6 ml-auto text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Videos Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-blue-50 rounded-t-xl">
          <h3 className="text-lg font-semibold text-gray-900">
            Videos Management
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
              className="flex flex-col border border-gray-100 p-3 rounded-xl shadow-sm bg-white"
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
              {/* <p className="text-xs text-gray-500">{video.views.toLocaleString()} views</p> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
