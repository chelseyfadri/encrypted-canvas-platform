"use client";

import { useState, useEffect } from "react";
import { Eye, Heart, Lock, Globe, User, FileText } from "lucide-react";
import { useFHEBlog, BlogPost } from "@/hooks/useFHEBlog";
// import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";

type PageType = "welcome" | "blogs" | "my-blogs" | "create-blog";

interface BlogListPageProps {
  onNavigate: (page: PageType) => void;
}

export function BlogListPage({ onNavigate }: BlogListPageProps) {
  // const { accounts } = useMetaMaskEthersSigner();
  const {
    getTotalBlogs,
    getBlog,
    getBlogContent,
    likeBlog,
    unlikeBlog,
    isLoading,
    isLiking,
    error
  } = useFHEBlog();

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [decrypting, setDecrypting] = useState<number | null>(null);
  const [likingBlogId, setLikingBlogId] = useState<number | null>(null);

  // Load blogs from contract
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        const totalBlogs = await getTotalBlogs();

        const blogPromises = [];
        for (let i = 0; i < totalBlogs; i++) {
          blogPromises.push(getBlog(i));
        }

        const blogResults = await Promise.all(blogPromises);
        const validBlogs = blogResults.filter(blog => blog !== null) as BlogPost[];

        setBlogs(validBlogs);
      } catch (err) {
        console.error("Error loading blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, [getTotalBlogs, getBlog]);

  const handleDecrypt = async (blogId: number) => {
    if (!getBlogContent) return;

    setDecrypting(blogId);
    try {
      const content = await getBlogContent(blogId);
      setBlogs(prev => prev.map(blog =>
        blog.id === blogId
          ? {
              ...blog,
              isDecrypted: true,
              content: content || "Failed to decrypt content"
            }
          : blog
      ));
    } catch (err) {
      console.error("Error decrypting blog:", err);
      alert("Failed to decrypt blog content");
    } finally {
      setDecrypting(null);
    }
  };

  const handleLike = async (blogId: number) => {
    if (!likeBlog || !unlikeBlog) return;

    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return;

    setLikingBlogId(blogId);
    try {
      if (blog.hasLiked) {
        await unlikeBlog(blogId);
      } else {
        await likeBlog(blogId);
      }

      // Refresh the blogs list to get updated like counts
      const updatedBlog = await getBlog?.(blogId);
      if (updatedBlog) {
        setBlogs(prev => prev.map(blog =>
          blog.id === blogId ? updatedBlog : blog
        ));
      }
    } catch (err) {
      console.error("Error liking/unliking blog:", err);
      alert("Failed to update like status");
    } finally {
      setLikingBlogId(null);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading blogs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error loading blogs: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Blogs</h1>
          <p className="text-gray-600 mt-1">Discover and read encrypted blog posts</p>
        </div>
        <button
          onClick={() => onNavigate("create-blog")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Write a Blog
        </button>
      </div>

      {/* Blog List */}
      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No blogs yet</h3>
          <p className="text-gray-600 mb-4">Be the first to create a blog post!</p>
          <button
            onClick={() => onNavigate("create-blog")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create First Blog
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Blog Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{blog.title}</h2>
                    {blog.isPublic ? (
                      <Globe className="w-4 h-4 text-green-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{formatAddress(blog.author)}</span>
                    </div>
                    <span>{formatDate(blog.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLike(blog.id)}
                    disabled={likingBlogId === blog.id || isLiking}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      blog.hasLiked
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {likingBlogId === blog.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <Heart className={`w-4 h-4 ${blog.hasLiked ? 'fill-current' : ''}`} />
                    )}
                    <span>{blog.likeCount || 0}</span>
                  </button>
                </div>
              </div>

              {/* Blog Content */}
              {blog.isDecrypted && blog.content ? (
                <div className="prose prose-sm max-w-none mb-4">
                  <p className="text-gray-700 leading-relaxed">{blog.content}</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm">Content is encrypted</span>
                    </div>
                    {!blog.isPublic && (
                      <button
                        onClick={() => handleDecrypt(blog.id)}
                        disabled={decrypting === blog.id}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {decrypting === blog.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Decrypting...
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Decrypt
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  {!blog.isPublic && (
                    <p className="text-xs text-gray-500 mt-2">
                      This is a private blog. Click decrypt to view the content.
                    </p>
                  )}
                </div>
              )}

              {/* Blog Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{blog.likeCount || 0} likes</span>
                  {blog.isPublic && <span className="text-green-600">Public</span>}
                  {!blog.isPublic && <span className="text-orange-600">Private</span>}
                </div>
                <div className="flex gap-2">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    Share
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 text-sm">
                    Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
