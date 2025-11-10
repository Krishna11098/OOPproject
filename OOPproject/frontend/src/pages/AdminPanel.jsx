import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Alert, Modal, Nav } from 'react-bootstrap';
import './AdminPanel.css';

const AdminPanel = ({ user }) => {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    activeUsers: 0,
    bannedUsers: 0
  });
  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState([]);
  const [newAnnouncementData, setNewAnnouncementData] = useState({
    title: '',
    content: '',
    post_date: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banUserId, setBanUserId] = useState(null);
  const [banReason, setBanReason] = useState('');

  // Fetch user stats
  const fetchUserStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/stats/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalUsers: data.total_users,
          adminUsers: data.admin_users || 1,
          regularUsers: data.total_users - (data.admin_users || 1),
          activeUsers: data.active_users,
          bannedUsers: data.banned_users
        });
      } else {
        throw new Error('Failed to fetch user stats');
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setError('Failed to load user statistics');
    }
  };

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('http://localhost:8000/announcements', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      } else {
        throw new Error('Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  // Ban user
  const handleBanUser = async () => {
    console.log('handleBanUser called');
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${banUserId}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
        body: `ban_reason=${encodeURIComponent(banReason)}`
      });

      if (response.ok) {
        console.log('Ban successful, closing modal');
        setSuccess('User banned successfully!');
        
        // Close modal with explicit state updates
        setShowBanModal(false);
        setBanUserId(null);
        setBanReason('');
        
        // Refresh data after closing modal
        setTimeout(() => {
          fetchUsers(); // Refresh users list
          fetchUserStats(); // Refresh stats
        }, 200);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ban failed');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      setError(error.message || 'Failed to ban user');
      // Close modal even on error for now to prevent stuck modal
      setShowBanModal(false);
      setBanUserId(null);
      setBanReason('');
    }
  };

  // Helper function to close ban modal
  const closeBanModal = () => {
    console.log('closeBanModal called');
    setShowBanModal(false);
    setBanUserId(null);
    setBanReason('');
    setError('');
  };

  // Unban user
  const handleUnbanUser = async (userId) => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/unban`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('User unbanned successfully!');
        fetchUsers(); // Refresh users list
        fetchUserStats(); // Refresh stats
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Unban failed');
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
      setError(error.message || 'Failed to unban user');
    }
  };

  // Show ban confirmation
  const showBanConfirmation = (userId) => {
    setBanUserId(userId);
    setShowBanModal(true);
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchUserStats(), fetchAnnouncements()]);
      if (activeTab === 'users') {
        await fetchUsers();
      }
    };
    loadData();
  }, [activeTab]);

  // Handle create/update announcement
  const handleCreateUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newAnnouncementData.title || !newAnnouncementData.content || !newAnnouncementData.post_date) {
      setError('All fields are required');
      return;
    }

    try {
      const url = isEditing
        ? `http://localhost:8000/api/admin/announcements/${editingId}`
        : 'http://localhost:8000/api/admin/announcements/';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newAnnouncementData)
      });

      if (response.ok) {
        setSuccess(isEditing ? 'Announcement updated successfully!' : 'Announcement created successfully!');
        setNewAnnouncementData({ title: '', content: '', post_date: '' });
        setIsEditing(false);
        setEditingId(null);
        fetchAnnouncements(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      setError(error.message || 'Failed to save announcement');
    }
  }

  // Admin check
  if (!user || !user.is_admin) {
    return (
      <Container className="admin-panel mt-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Alert variant="danger" className="text-center">
              <h4>🚫 Access Denied</h4>
              <p>You don't have admin privileges to access this page.</p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  // Handle delete announcement
  const handleDelete = async (id) => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:8000/api/admin/announcements/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('Announcement deleted successfully!');
        fetchAnnouncements(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setError(error.message || 'Failed to delete announcement');
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  // Handle edit button click
  const handleEdit = (announcement) => {
    setNewAnnouncementData({
      title: announcement.title,
      content: announcement.content,
      post_date: announcement.post_date
    });
    setIsEditing(true);
    setEditingId(announcement.id);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setNewAnnouncementData({ title: '', content: '', post_date: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  // Show delete confirmation
  const showDeleteConfirmation = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <Container className="admin-panel mt-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading admin dashboard...</p>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="admin-panel">
      {/* Sidebar Toggle Button */}
      <button 
        className={`sidebar-toggle ${sidebarOpen ? 'hidden' : ''}`}
        onClick={toggleSidebar}
      >
        ☰
      </button>

      {/* Sidebar Overlay for mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      ></div>

      <Container fluid>
        <Row className="min-vh-100">
          {/* Sidebar */}
          <div className={`admin-sidebar ${sidebarOpen ? 'active' : ''}`}>
            <div className="sidebar-content">
              <div className="sidebar-header">
                <button className="sidebar-close" onClick={closeSidebar}>
                  ✕
                </button>
                <h4 className="sidebar-title">
                  <span className="sidebar-icon">🔑</span>
                  Admin Panel
                </h4>
              </div>
              
              <Nav className="flex-column sidebar-nav">
                <Nav.Item>
                  <Nav.Link 
                    className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('dashboard');
                      setSidebarOpen(false);
                    }}
                  >
                    <span className="nav-icon">📊</span>
                    Dashboard
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    className={`sidebar-link ${activeTab === 'announcements' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('announcements');
                      setSidebarOpen(false);
                    }}
                  >
                    <span className="nav-icon">📢</span>
                    Announcements
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('users');
                      setSidebarOpen(false);
                    }}
                  >
                    <span className="nav-icon">👥</span>
                    Users
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </div>
          </div>

          {/* Main Content */}
          <div className={`admin-main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="content-wrapper">
              {/* Header */}
              <div className="content-header">
                <h2 className="page-title">
                  {activeTab === 'dashboard' && '📊 Dashboard Overview'}
                  {activeTab === 'announcements' && '📢 Announcement Management'}
                  {activeTab === 'users' && '👥 User Management'}
                </h2>
              </div>

              {/* Alerts */}
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}

              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="dashboard-container">
                  {/* Statistics Cards - First Row: 3 cards */}
                  <Row className="mb-4">
                    <Col xs={12} md={4} className="mb-3">
                      <Card className="stats-card stats-card-primary">
                        <Card.Body className="text-center">
                          <div className="stats-icon">👥</div>
                          <h3 className="stats-number">{stats.totalUsers}</h3>
                          <p className="stats-label">Total Users</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={12} md={4} className="mb-3">
                      <Card className="stats-card stats-card-success">
                        <Card.Body className="text-center">
                          <div className="stats-icon">🔑</div>
                          <h3 className="stats-number">{stats.adminUsers}</h3>
                          <p className="stats-label">Admin Users</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={12} md={4} className="mb-3">
                      <Card className="stats-card stats-card-info">
                        <Card.Body className="text-center">
                          <div className="stats-icon">👤</div>
                          <h3 className="stats-number">{stats.regularUsers}</h3>
                          <p className="stats-label">Regular Users</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Second Row - 3 cards */}
                  <Row className="mb-4">
                    <Col xs={12} md={4} className="mb-3">
                      <Card className="stats-card stats-card-warning">
                        <Card.Body className="text-center">
                          <div className="stats-icon">📢</div>
                          <h3 className="stats-number">{announcements.length}</h3>
                          <p className="stats-label">Announcements</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={12} md={4} className="mb-3">
                      <Card className="stats-card stats-card-success">
                        <Card.Body className="text-center">
                          <div className="stats-icon">✅</div>
                          <h3 className="stats-number">{stats.activeUsers}</h3>
                          <p className="stats-label">Active Users</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={12} md={4} className="mb-3">
                      <Card className="stats-card stats-card-danger">
                        <Card.Body className="text-center">
                          <div className="stats-icon">🚫</div>
                          <h3 className="stats-number">{stats.bannedUsers}</h3>
                          <p className="stats-label">Banned Users</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Recent Activity */}
                  <Row>
                    <Col xs={12}>
                      <Card className="activity-card">
                        <Card.Header>
                          <h5 className="mb-0">📈 Recent Activity</h5>
                        </Card.Header>
                        <Card.Body>
                          <div className="activity-item">
                            <span className="activity-icon">📢</span>
                            <span className="activity-text">
                              {announcements.length} total announcements created
                            </span>
                          </div>
                          <div className="activity-item">
                            <span className="activity-icon">👥</span>
                            <span className="activity-text">
                              {stats.totalUsers} users registered on the platform
                            </span>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Announcements Tab */}
              {activeTab === 'announcements' && (
                <Row>
                  {/* Announcement Form */}
                  <Col lg={6} className="mb-4">
                    <Card className="form-card h-100">
                      <Card.Header className="announcement-form-header">
                        <h5 className="mb-0">
                          {isEditing ? '✏️ Edit Announcement' : '➕ Create New Announcement'}
                        </h5>
                      </Card.Header>
                      <Card.Body className="announcement-form-body">
                        <Form onSubmit={handleCreateUpdate}>
                          <Row className="form-row-layout">
                            {/* Left Column - Title and Date */}
                            <Col xs={12} sm={6} className="left-column">
                              <div className="left-form-section">
                                <Form.Group className="mb-4">
                                  <Form.Label className="form-label-spaced">Title: </Form.Label>
                                  <Form.Control
                                    type="text"
                                    className="form-input-spaced"
                                    value={newAnnouncementData.title}
                                    onChange={(e) => setNewAnnouncementData({
                                      ...newAnnouncementData,
                                      title: e.target.value
                                    })}
                                    placeholder="Enter announcement title"
                                    required
                                  />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                  <Form.Label className="form-label-spaced">Date: </Form.Label>
                                  <Form.Control
                                    type="date"
                                    className="form-input-spaced"
                                    value={newAnnouncementData.post_date}
                                    onChange={(e) => setNewAnnouncementData({
                                      ...newAnnouncementData,
                                      post_date: e.target.value
                                    })}
                                    required
                                  />
                                </Form.Group>
                              </div>
                            </Col>

                            {/* Right Column - Content */}
                            <Col xs={12} sm={6} className="right-column">
                              <div className="right-form-section">
                                <Form.Group className="mb-4 h-100">
                                  <Form.Label className="form-label-spaced">Content: </Form.Label>
                                  <Form.Control
                                    as="textarea"
                                    className="form-textarea-spaced form-textarea-tall"
                                    value={newAnnouncementData.content}
                                    onChange={(e) => setNewAnnouncementData({
                                      ...newAnnouncementData,
                                      content: e.target.value
                                    })}
                                    placeholder="Enter announcement content"
                                    required
                                  />
                                </Form.Group>
                              </div>
                            </Col>
                          </Row>
                          <div className="form-buttons-container">
                            <Button type="submit" variant="primary" className="form-button-primary">
                              {isEditing ? 'Update Announcement' : 'Create Announcement'}
                            </Button>
                            {isEditing && (
                              <Button type="button" variant="secondary" className="form-button-secondary" onClick={handleCancelEdit}>
                                Cancel
                              </Button>
                            )}
                          </div>
                        </Form>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Announcements List */}
                  <Col lg={6} className="mb-4">
                    <Card className="announcements-card h-100">
                      <Card.Header>
                        <h5 className="mb-0">📢 All Announcements</h5>
                      </Card.Header>
                      <Card.Body>
                        {announcements.length === 0 ? (
                          <div className="text-center text-muted py-4">
                            <div className="empty-state">
                              <span className="empty-icon">📢</span>
                              <p>No announcements found. Create your first announcement above!</p>
                            </div>
                          </div>
                        ) : (
                          <div className="announcements-scroll">
                            <Table responsive striped className="announcements-table">
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Title</th>
                                  <th>Content</th>
                                  <th>Date</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {announcements.map((announcement) => (
                                  <tr key={announcement.id}>
                                    <td>{announcement.id}</td>
                                    <td>{announcement.title}</td>
                                    <td className="content-cell">
                                      {announcement.content.length > 80 
                                        ? announcement.content.substring(0, 80) + '...'
                                        : announcement.content
                                      }
                                    </td>
                                    <td>{announcement.post_date}</td>
                                    <td>
                                      <div className="action-buttons">
                                        <Button
                                          size="sm"
                                          variant="outline-primary"
                                          onClick={() => handleEdit(announcement)}
                                          className="me-2"
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline-danger"
                                          onClick={() => showDeleteConfirmation(announcement.id)}
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <Row>
                  <Col xs={12}>
                    <Card className="users-card">
                      <Card.Header>
                        <h5 className="mb-0">👥 User Management</h5>
                      </Card.Header>
                      <Card.Body>
                        {users.length === 0 ? (
                          <div className="text-center text-muted py-4">
                            <div className="empty-state">
                              <span className="empty-icon">�</span>
                              <p>No users found. Loading...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="users-scroll">
                            <Table responsive striped className="users-table">
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Username</th>
                                  <th>Email</th>
                                  <th>Role</th>
                                  <th>Status</th>
                                  <th>Ban Reason</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {users.map((user) => (
                                  <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                      <span className={`badge ${user.is_admin ? 'bg-danger' : 'bg-secondary'}`}>
                                        {user.is_admin ? 'Admin' : 'User'}
                                      </span>
                                    </td>
                                    <td>
                                      <span className={`badge ${user.is_banned ? 'bg-danger' : 'bg-success'}`}>
                                        {user.is_banned ? 'Banned' : 'Active'}
                                      </span>
                                    </td>
                                    <td>{user.ban_reason || '-'}</td>
                                    <td>
                                      <div className="action-buttons">
                                        {!user.is_admin && (
                                          <>
                                            {user.is_banned ? (
                                              <Button
                                                size="sm"
                                                onClick={() => handleUnbanUser(user.id)}
                                                className="btn-unban me-2"
                                              >
                                                Unban
                                              </Button>
                                            ) : (
                                              <Button
                                                size="sm"
                                                onClick={() => showBanConfirmation(user.id)}
                                                className="btn-ban me-2"
                                              >
                                                Ban
                                              </Button>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

            </div>
          </div>
        </Row>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this announcement? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDelete(deleteId)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Ban User Modal */}
      <Modal 
        key={banUserId || 'ban-modal'}
        show={showBanModal} 
        onHide={closeBanModal}
        centered
        backdrop={true}
        keyboard={true}
        size="md"
        enforceFocus={false}
        restoreFocus={false}
      >
        <Modal.Header>
          <Modal.Title>Ban User</Modal.Title>
          <button 
            type="button" 
            className="custom-close-btn" 
            onClick={closeBanModal}
            aria-label="Close"
          >
            ✕
          </button>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to ban this user? They will be immediately logged out and unable to access the system.</p>
          <Form.Group className="mt-3">
            <Form.Label>Ban Reason (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter reason for banning this user..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeBanModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleBanUser}>
            Ban User
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPanel;