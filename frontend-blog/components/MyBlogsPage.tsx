"use client";

import { useState, useEffect } from "react";
import { Eye, Heart, Lock, Globe, Edit, Trash2 } from "lucide-react";
import { useFHEBlog, BlogPost } from "@/hooks/useFHEBlog";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";

type PageType = "welcome" | "blogs" | "my-blogs" | "create-blog";

interface MyBlogsPageProps {
  onNavigate: (page: PageType) => void;
}

export function MyBlogsPage({ onNavigate }: MyBlogsPageProps) {
  const { accounts } = useMetaMaskEthersSigner();
  const {
    getUserBlogs,
    getBlog,
    getBlogContent,
    isLoading,
    error
  } = useFHEBlog();

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [decryptingBlogId, setDecryptingBlogId] = useState<number | null>(null);

  // Load user's blogs from contract
  useEffect(() => {
    const loadUserBlogs = async () => {
      if (!accounts?.[0] || !getUserBlogs) return;

      try {
        setLoading(true);
        const blogIds = await getUserBlogs(accounts[0]);

        const blogPromises = blogIds.map(id => getBlog?.(id));
        const blogResults = await Promise.all(blogPromises);
        const validBlogs = blogResults.filter(blog => blog !== null) as BlogPost[];

        // For user's own blogs, show as not decrypted initially
        // They can decrypt when they want to read
        setBlogs(validBlogs.map(blog => ({
          ...blog,
          isDecrypted: false,
          content: undefined
        })));
      } catch (err) {
        console.error("Error loading user blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserBlogs();
  }, [accounts, getUserBlogs, getBlog, getBlogContent]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDecrypt = async (blogId: number) => {
    if (!getBlogContent) return;

    setDecryptingBlogId(blogId);
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
      setDecryptingBlogId(null);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      // Note: In the current contract implementation, blogs cannot be deleted
      // This is a limitation of blockchain immutability
      alert('Blog deletion is not supported in the current contract implementation. Blogs are immutable on the blockchain.');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading your blogs...</span>
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

  if (!accounts?.[0]) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">Please connect your wallet to view your blogs</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Blogs</h1>
          <p className="text-gray-600 mt-1">Manage your blog posts</p>
        </div>
        <button
          onClick={() => onNavigate("create-blog")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Write New Blog
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{blogs.length}</div>
            <div className="text-sm text-gray-600">Total Blogs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {blogs.filter(blog => blog.isPublic).length}
            </div>
            <div className="text-sm text-gray-600">Public</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {blogs.filter(blog => !blog.isPublic).length}
            </div>
            <div className="text-sm text-gray-600">Private</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {blogs.reduce((sum, blog) => sum + (blog.likeCount || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Likes</div>
          </div>
        </div>
      </div>

      {/* Blog List */}
      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <Edit className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No blogs yet</h3>
          <p className="text-gray-600 mb-4">Start sharing your thoughts with the world!</p>
          <button
            onClick={() => onNavigate("create-blog")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Your First Blog
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
                    <span>{formatDate(blog.createdAt)}</span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {blog.likeCount || 0} likes
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate("create-blog")}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    title="Edit blog"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    title="Delete blog"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Blog Content Preview */}
              <div className="prose prose-sm max-w-none mb-4">
                {blog.isDecrypted && blog.content ? (
                  <p className="text-gray-700 leading-relaxed">
                    {blog.content.length > 200
                      ? `${blog.content.substring(0, 200)}...`
                      : blog.content
                    }
                  </p>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Lock className="w-4 h-4" />
                        <span>Content is encrypted</span>
                      </div>
                      <button
                        onClick={() => handleDecrypt(blog.id)}
                        disabled={decryptingBlogId === blog.id}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {decryptingBlogId === blog.id ? (
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
                    </div>
                  </div>
                )}
              </div>

              {/* Blog Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    blog.isPublic
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {blog.isPublic ? 'Public' : 'Private'}
                  </span>
                  <span>Blog #{blog.id}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigate("blogs")}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View Full Post
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 text-sm">
                    Analytics
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
