// src/components/Blogs.jsx
import React, { useEffect, useState } from "react";
import "./Blog.css";

const API = "http://localhost:8000";

export default function Blogs({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(user);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showComments, setShowComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    setCurrentUser(user);
    fetchBlogs();
  }, [user]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/blogs`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch blogs");
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      console.error("fetch blogs err", err);
      alert("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      return alert("Title and content are required");
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API}/blogs`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: newContent })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error creating blog");
      }
      
      setNewTitle("");
      setNewContent("");
      await fetchBlogs();
      alert("Blog created successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (blog) => {
    setEditingBlog(blog.id);
    setEditTitle(blog.title);
    setEditContent(blog.content);
  };

  const cancelEdit = () => {
    setEditingBlog(null);
    setEditTitle("");
    setEditContent("");
  };

  const handleUpdate = async (id) => {
    if (!editTitle.trim() || !editContent.trim()) {
      return alert("Title and content are required");
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API}/blogs/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error updating blog");
      }
      
      setEditingBlog(null);
      setEditTitle("");
      setEditContent("");
      await fetchBlogs();
      alert("Blog updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this blog? This action cannot be undone.")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API}/blogs/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error deleting blog");
      }
      
      await fetchBlogs();
      alert("Blog deleted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    try {
      const res = await fetch(`${API}/blogs/${id}/like`, {
        method: "POST",
        credentials: "include"
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error liking blog");
      }
      
      await fetchBlogs();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDislike = async (id) => {
    try {
      const res = await fetch(`${API}/blogs/${id}/dislike`, {
        method: "POST",
        credentials: "include"
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error disliking blog");
      }
      
      await fetchBlogs();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const toggleComments = (id) => {
    setShowComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddComment = async (id) => {
    const text = (commentInputs[id] || "").trim();
    if (!text) return alert("Comment cannot be empty");
    
    try {
      const res = await fetch(`${API}/blogs/${id}/comment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error adding comment");
      }
      
      setCommentInputs(prev => ({ ...prev, [id]: "" }));
      await fetchBlogs();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="blog-container">
        <div className="blog-loading">Loading blogs...</div>
      </div>
    );
  }

  return (
    <div className="blog-container">
      <h1 className="blog-header">Blog Platform</h1>

      {currentUser ? (
        <div className="blog-create">
          <h2 className="blog-subheader">Create New Blog</h2>
          <input
            className="blog-input"
            placeholder="Enter blog title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={loading}
          />
          <textarea
            className="blog-textarea"
            placeholder="Write your blog content here..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows="6"
            disabled={loading}
          />
          <button 
            className="blog-button primary" 
            onClick={handleCreate}
            disabled={loading || !newTitle.trim() || !newContent.trim()}
          >
            {loading ? "Creating..." : "Create Blog"}
          </button>
        </div>
      ) : (
        <div className="blog-note">
          <p>Please log in to create, like, or comment on blogs.</p>
        </div>
      )}

      <div className="blog-list">
        {blogs.length === 0 ? (
          <div className="blog-empty">
            <p>No blogs yet. {currentUser ? "Create the first one!" : "Log in to create the first blog!"}</p>
          </div>
        ) : (
          blogs.map(blog => (
            <div key={blog.id} className="blog-card">
              <div className="blog-head">
                <div className="blog-title-section">
                  {editingBlog === blog.id ? (
                    <input
                      className="blog-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      disabled={loading}
                    />
                  ) : (
                    <h3 className="blog-title">{blog.title}</h3>
                  )}
                  <div className="blog-meta">
                    <span className="blog-author">By {blog.author.username}</span>
                    <span className="blog-date">{formatDate(blog.created_at)}</span>
                  </div>
                </div>
                
                {currentUser && currentUser.id === blog.author.id && (
                  <div className="blog-owner-actions">
                    {editingBlog === blog.id ? (
                      <>
                        <button 
                          className="blog-button success" 
                          onClick={() => handleUpdate(blog.id)}
                          disabled={loading}
                        >
                          Save
                        </button>
                        <button 
                          className="blog-button secondary" 
                          onClick={cancelEdit}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="blog-button warning" 
                          onClick={() => startEdit(blog)}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button 
                          className="blog-button danger" 
                          onClick={() => handleDelete(blog.id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="blog-content-section">
                {editingBlog === blog.id ? (
                  <textarea
                    className="blog-textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows="6"
                    disabled={loading}
                  />
                ) : (
                  <p className="blog-content">{blog.content}</p>
                )}
              </div>

              <div className="blog-actions">
                <div className="blog-reactions">
                  <button 
                    className={`blog-like ${!currentUser ? 'disabled' : ''}`}
                    onClick={() => handleLike(blog.id)}
                    disabled={!currentUser || loading}
                    title={currentUser ? "Like this blog" : "Log in to like"}
                  >
                    👍 {blog.likes}
                  </button>
                  <button 
                    className={`blog-dislike ${!currentUser ? 'disabled' : ''}`}
                    onClick={() => handleDislike(blog.id)}
                    disabled={!currentUser || loading}
                    title={currentUser ? "Dislike this blog" : "Log in to dislike"}
                  >
                    👎 {blog.dislikes}
                  </button>
                </div>

                <button 
                  className="blog-comment-toggle"
                  onClick={() => toggleComments(blog.id)}
                >
                  💬 Comments ({blog.comments.length})
                </button>
              </div>

              {showComments[blog.id] && (
                <div className="blog-comments">
                  <h4 className="blog-comments-header">Comments ({blog.comments.length})</h4>
                  
                  {blog.comments.length === 0 ? (
                    <p className="blog-no-comments">No comments yet. Be the first to comment!</p>
                  ) : (
                    blog.comments.map(comment => (
                      <div key={comment.id} className="blog-comment">
                        <div className="blog-comment-header">
                          <span className="blog-comment-user">{comment.user.username}</span>
                          <span className="blog-comment-date">{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="blog-comment-text">{comment.text}</p>
                      </div>
                    ))
                  )}

                  {currentUser ? (
                    <div className="blog-add-comment">
                      <input
                        className="blog-input"
                        placeholder="Write a comment..."
                        value={commentInputs[blog.id] || ""}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [blog.id]: e.target.value }))}
                        disabled={loading}
                      />
                      <button 
                        className="blog-button primary"
                        onClick={() => handleAddComment(blog.id)}
                        disabled={loading || !commentInputs[blog.id]?.trim()}
                      >
                        Post Comment
                      </button>
                    </div>
                  ) : (
                    <div className="blog-note">
                      <p>Please log in to add a comment.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}