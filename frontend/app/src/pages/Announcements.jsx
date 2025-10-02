import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import './Announcements.css';
const Announcements = () => {
    const initialAnnouncements = async () => {
        const response = await fetch('http://127.0.0.1:8000/announcements', {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    };

    const [announcements, setAnnouncements] = useState(initialAnnouncements);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAnnouncement, setCurrentAnnouncement] = useState({
        id: null,
        title: '',
        content: '',
        date: '',
        author: ''
    });

    // Dialog handlers
    const handleOpenDeleteDialog = (id) => {
        setDeleteId(id);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setDeleteId(null);
    };

    // Delete announcement
    const handleDelete = () => {
        setAnnouncements(announcements.filter(announcement => announcement.id !== deleteId));
        handleCloseDialog();
    };

    // Set form data for editing
    const handleEdit = (announcement) => {
        setIsEditing(true);
        setCurrentAnnouncement(announcement);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentAnnouncement({ ...currentAnnouncement, [name]: value });
    };

    // Submit form (add or edit)
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            // Update existing announcement
            setAnnouncements(
                announcements.map(announcement => 
                    announcement.id === currentAnnouncement.id ? currentAnnouncement : announcement
                )
            );
            setIsEditing(false);
        } else {
            // Add new announcement
            const newAnnouncement = {
                ...currentAnnouncement,
                id: Math.max(...announcements.map(a => a.id), 0) + 1,
                date: new Date().toISOString().split('T')[0] // Current date
            };
            setAnnouncements([newAnnouncement, ...announcements]);
        }

        // Reset form
        setCurrentAnnouncement({
            id: null,
            title: '',
            content: '',
            date: '',
            author: ''
        });
    };

    return (
        <div className="announcements-container">
            <Container>
                <div className="announcements-header">
                    <h1 className="announcements-title">📢 Announcements</h1>
                    <p className="announcements-subtitle">Stay updated with the latest news and updates</p>
                </div>
                
                {/* Admin form to add/edit announcements */}
                <Card className="announcement-form-card">
                    <div className="form-card-header">
                        <h5 className="form-card-title">
                            {isEditing ? '✏️ Edit Announcement' : '➕ Create New Announcement'}
                        </h5>
                    </div>
                    <Card.Body className="announcement-form">
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
                                    <div className="form-group-custom">
                                        <label className="form-label-custom">Title *</label>
                                        <Form.Control
                                            type="text"
                                            name="title"
                                            value={currentAnnouncement.title}
                                            onChange={handleInputChange}
                                            required
                                            className="form-control-custom"
                                        />
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="form-group-custom">
                                        <label className="form-label-custom">Author *</label>
                                        <Form.Control
                                            type="text"
                                            name="author"
                                            value={currentAnnouncement.author}
                                            onChange={handleInputChange}
                                            required
                                            className="form-control-custom"
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <div className="form-group-custom">
                                <label className="form-label-custom">Content *</label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="content"
                                    value={currentAnnouncement.content}
                                    onChange={handleInputChange}
                                    required
                                    className="form-control-custom form-textarea-custom"
                                />
                            </div>
                            <Button type="submit" className="btn-primary-custom me-2">
                                {isEditing ? '✏️ Update Announcement' : '➕ Post Announcement'}
                            </Button>
                            {isEditing && (
                                <Button
                                    type="button"
                                    className="btn-secondary-custom"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setCurrentAnnouncement({
                                            id: null,
                                            title: '',
                                            content: '',
                                            date: '',
                                            author: ''
                                        });
                                    }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </Form>
                    </Card.Body>
                </Card>

                {/* List of announcements */}
                <h5 className="announcements-section-header">All Announcements</h5>
                
                {announcements.length > 0 ? (
                    announcements.map((announcement) => (
                        <Card key={announcement.id} className="announcement-card">
                            <Card.Body className="announcement-card-body">
                                <h6 className="announcement-card-title">{announcement.title}</h6>
                                <div className="announcement-card-meta">
                                    <span className="announcement-date">
                                        📅 Posted on {announcement.date}
                                    </span>
                                    <span className="announcement-author">
                                        👤 by {announcement.author}
                                    </span>
                                </div>
                                <p className="announcement-card-content">
                                    {announcement.content}
                                </p>
                                <div className="announcement-actions">
                                    <Button
                                        className="btn-action btn-edit"
                                        onClick={() => handleEdit(announcement)}
                                    >
                                        ✏️ Edit
                                    </Button>
                                    <Button
                                        className="btn-action btn-delete"
                                        onClick={() => handleOpenDeleteDialog(announcement.id)}
                                    >
                                        🗑️ Delete
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    ))
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <p className="empty-state-text">No announcements available.</p>
                    </div>
                )}

                {/* Confirmation Modal for Delete */}
                <Modal show={openDialog} onHide={handleCloseDialog}>
                    <div className="modal-content-custom">
                        <Modal.Header closeButton className="modal-header-custom">
                            <Modal.Title className="modal-title-custom">⚠️ Confirm Deletion</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="modal-body-custom">
                            Are you sure you want to delete this announcement? This action cannot be undone.
                        </Modal.Body>
                        <Modal.Footer className="modal-footer-custom">
                            <Button onClick={handleCloseDialog} className="btn-modal-cancel">
                                Cancel
                            </Button>
                            <Button onClick={handleDelete} className="btn-modal-danger">
                                Delete
                            </Button>
                        </Modal.Footer>
                    </div>
                </Modal>
            </Container>
        </div>
    );
};

export default Announcements;