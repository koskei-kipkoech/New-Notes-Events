import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import for routing
import './events.css';

const CalendarEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ id: null, title: "", description: "", start_time: "", end_time: "" });
    const [isEditing, setIsEditing] = useState(false); // Track if editing
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:5555/calendar-events", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error("Failed to fetch events");

                const data = await response.json();
                setEvents(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Handle form input change
    const handleChange = (e) => {
        setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
    };

    // Handle form submission (Create or Update event)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const formattedEvent = {
                ...newEvent,
                start_time: newEvent.start_time.includes(":") ? newEvent.start_time : newEvent.start_time + ":00",
                end_time: newEvent.end_time.includes(":") ? newEvent.end_time : newEvent.end_time + ":00",
            };
    
            let url = "http://localhost:5555/calendar-events";
            let method = "POST";
    
            if (isEditing) {
                url = `http://localhost:5555/calendar-events/${newEvent.id}`;
                method = "PATCH";
            }
    
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formattedEvent),
            });
    
            if (!response.ok) throw new Error(`Failed to ${isEditing ? "update" : "create"} event`);
    
            // Re-fetch events to get latest data
            const updatedResponse = await fetch("http://localhost:5555/calendar-events", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const updatedEvents = await updatedResponse.json();
            setEvents(updatedEvents);
    
            setShowModal(false);
            setNewEvent({ id: null, title: "", description: "", start_time: "", end_time: "" });
            setIsEditing(false);
    
            // Navigate after updating/creating
            navigate("/addevents"); // Change to your desired path
        } catch (err) {
            setError(err.message);
        }
    };
    

    // Open modal for editing an event
    const handleEdit = (event) => {
        setNewEvent({
            ...event,
            start_time: event.start_time.slice(0, 16), // Ensure correct format for datetime-local
            end_time: event.end_time.slice(0, 16),
        });
        setIsEditing(true);
        setShowModal(true);
    };

    // Handle event deletion
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5555/calendar-events/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to delete event");

            setEvents((prevEvents) => prevEvents.filter(event => event.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p className="loading">Loading events...</p>;
    if (error) return <p className="error">Error: {error}</p>;

    return (
        <div className="calendar-container">
            <h2>Your Calendar Events</h2>
            <button className="new-event-btn" onClick={() => { setShowModal(true); setIsEditing(false); }}>+ New Event</button>

            {events.length > 0 ? (
                <ul className="event-list">
                    {events.map((event) => (
                        <li key={event.id} className="event-item">
                            <h3 className="event-title">{event.title}</h3>
                            <p className="event-description">{event.description}</p>
                            <p className="event-time">
                                <strong>Start:</strong> {new Date(event.start_time).toLocaleString()}
                            </p>
                            <p className="event-time">
                                <strong>End:</strong> {new Date(event.end_time).toLocaleString()}
                            </p>
                            <div className="event-actions">
                                <span className="edit-icon" onClick={() => handleEdit(event)}>🖊️</span>
                                <span className="delete-icon" onClick={() => handleDelete(event.id)}>🗑️</span>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No events found.</p>
            )}

            {/* Modal Popup */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                        <h3>{isEditing ? "Edit Event" : "Create New Event"}</h3>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="title" placeholder="Event Title" value={newEvent.title} onChange={handleChange} required />
                            <textarea name="description" placeholder="Event Description" value={newEvent.description} onChange={handleChange} required />
                            <input type="datetime-local" name="start_time" value={newEvent.start_time} onChange={handleChange} required />
                            <input type="datetime-local" name="end_time" value={newEvent.end_time} onChange={handleChange} required />
                            <button type="submit" className="save-btn">{isEditing ? "Update" : "Save"} Event</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarEvents;
