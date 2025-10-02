// src/components/Blogs.jsx
import React, { useEffect, useState } from "react";
import "./Blog.css";

const API = "http://127.0.0.1:8000";

export default function Blogs({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(user);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showComments, setShowComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    setCurrentUser(user);
    fetchBlogs();
  }, [user]);


  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${API}/blogs`, { credentials: "include" });
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      console.error("fetch blogs err", err);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return alert("Title and content required");
    try {
      const res = await fetch(`${API}/blogs`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: newContent })
      });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.detail || "Error creating blog");
      }
      setNewTitle("");
      setNewContent("");
      fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id, currentTitle, currentContent) => {
    const title = prompt("New Title", currentTitle);
    const content = prompt("New Content", currentContent);
    if (title === null || content === null) return; // cancelled
    try {
      const res = await fetch(`${API}/blogs/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
      });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.detail || "Error updating blog");
      }
      fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this blog?")) return;
    try {
      const res = await fetch(`${API}/blogs/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.detail || "Error deleting blog");
      }
      fetchBlogs();
    } catch (err) {
      console.error(err);
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
        return alert(err.detail || "Error Liking");
      }
      fetchBlogs();
    } catch (err) {
      console.error(err);
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
        return alert(err.detail || "Error Disliking");
      }
      fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComments = (id) => {
    setShowComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddComment = async (id) => {
    const text = (commentInputs[id] || "").trim();
    if (!text) return alert("Comment can't be empty");
    try {
      const res = await fetch(`${API}/blogs/${id}/comment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!res.ok) {
        
        const err = await res.json();
        return alert(err.detail || "Error adding comment");
      }
      setCommentInputs(prev => ({ ...prev, [id]: "" }));
      fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="blog-container">
      <h1 className="blog-header">Blog Platform</h1>

      {currentUser ? (
        <div className="blog-create">
          <h2 className="blog-subheader">Create Blog</h2>
          <input
            className="blog-input"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            className="blog-textarea"
            placeholder="Write something..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <button className="blog-button" onClick={handleCreate}>Create Blog</button>
        </div>
      ) : (
        <div className="blog-note">Log in to create, like, or comment on blogs.</div>
      )}

      <div className="blog-list">
        {blogs.map(b => (
          <div key={b.id} className="blog-card">
            <div className="blog-head">
              <h3 className="blog-title">{b.title}</h3>
              <span className="blog-meta">By {b.author.username}</span>
            </div>

            <p className="blog-content">{b.content}</p>

            <div className="blog-actions">
              <button className="blog-like" onClick={() => handleLike(b.id)}>👍 {b.likes}</button>
              <button className="blog-dislike" onClick={() => handleDislike(b.id)}>👎 {b.dislikes}</button>

              <button className="blog-comment-toggle" onClick={() => toggleComments(b.id)}>
                💬 Comments ({b.comments.length})
              </button>

              {currentUser && currentUser.id === b.author.id && (
                <div className="blog-owner-actions">
                  <button className="blog-update" onClick={() => handleUpdate(b.id, b.title, b.content)}>✏️ Update</button>
                  <button className="blog-delete" onClick={() => handleDelete(b.id)}>🗑 Delete</button>
                </div>
              )}
            </div>

            {showComments[b.id] && (
              <div className="blog-comments">
                {b.comments.map(c => (
                  <div key={c.id} className="blog-comment">
                    <span className="blog-comment-user">{c.user.username}:</span>
                    <span className="blog-comment-text">{c.text}</span>
                  </div>
                ))}

                {currentUser ? (
                  <div className="blog-add-comment">
                    <input
                      className="blog-input"
                      placeholder="Add a comment..."
                      value={commentInputs[b.id] || ""}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [b.id]: e.target.value }))}
                    />
                    <button className="blog-button" onClick={() => handleAddComment(b.id)}>Post</button>
                  </div>
                ) : (
                  <div className="blog-note">Log in to comment.</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
