import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './dashboard.css';

function Dashboard() {
    const [notes, setNotes] = useState([]);
    const [pinnedNotes, setPinnedNotes] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [editNote, setEditNote] = useState(null);
    const [updatedTitle, setUpdatedTitle] = useState('');
    const [updatedContent, setUpdatedContent] = useState('');
    const [showPinned, setShowPinned] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchNotes();
        } else {
            setError('Please log in to access your notes.');
        }
    }, [user]);

    const fetchNotes = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Unauthorized: Please log in.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.get('http://localhost:5555/notes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const allNotes = response.data;
            setNotes(allNotes.filter(note => !note.pinned));
            setPinnedNotes(allNotes.filter(note => note.pinned));
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch notes');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Unauthorized: Please log in.');
            return;
        }

        try {
            await axios.delete(`http://localhost:5555/notes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotes();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete note');
        }
    };

    const handleEdit = (note) => {
        setEditNote(note);
        setUpdatedTitle(note.title);
        setUpdatedContent(note.content);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Unauthorized: Please log in.');
            return;
        }
    
        try {
            await axios.put(`http://localhost:5555/notes/${editNote.id}`, {
                title: updatedTitle,
                content: updatedContent
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            // Fetch updated notes
            fetchNotes();
    
            // Reset state
            setEditNote(null);
            setUpdatedTitle('');
            setUpdatedContent('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update note');
        }
    };
    
    
    const handlePinToggle = async (id) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Unauthorized: Please log in.');
            return;
        }

        try {
            await axios.patch(`http://localhost:5555/notes/${id}/pin`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotes();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to pin/unpin note');
        }
    };

    return (
        <div className="dashboard">
            <h2>Your Notes</h2>
            <button onClick={fetchNotes} className="refresh-btn">Refresh Notes</button>
            <button onClick={() => setShowPinned(!showPinned)} className="toggle-btn">
                {showPinned ? "Show All Notes" : "Show Pinned Notes"}
            </button>
            
            {error && <p className="error-message">{error} <button onClick={fetchNotes}>Retry</button></p>}

            {loading ? <p>Loading....</p> : (
                <div className="notes-list">
                    {(showPinned ? pinnedNotes : notes).map(note => (
                        <div key={note.id} className={`note-card ${note.pinned ? "pinned" : ""}`}>
                            <div className="note-header">
                                <h3>{note.title}</h3>
                                <div className="note-actions">
                                    <span onClick={() => handleEdit(note)} className="edit-icon">✏️</span>
                                    <span onClick={() => handleDelete(note.id)} className="delete-icon">🗑️</span>
                                </div>
                            </div>
                            <p>{note.content}</p>
                            <small>Tags: {note.tags?.join(", ")}</small>
                            <p className="note-date">Created: {formatDate(note.created_at)}</p>
                            <button onClick={() => handlePinToggle(note.id)}>
                                {note.pinned ? "📌 Unpin" : "📍 Pin"}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {editNote && (
                <div className="edit-modal">
                    <div className="modal-content">
                        <h3>Edit Note</h3>
                        <form onSubmit={handleUpdate}>
                            <label>Title</label>
                            <input type="text" value={updatedTitle} onChange={(e) => setUpdatedTitle(e.target.value)} />
                            <label>Content</label>
                            <textarea value={updatedContent} onChange={(e) => setUpdatedContent(e.target.value)}></textarea>
                            <div className="modal-actions">
                                <button type="submit" className="save-btn">Save Changes</button>
                                <button type="button" className="cancel-btn" onClick={() => setEditNote(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;