import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./addnote.css";

export default function AddNote({ onNoteAdded }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [newTag, setNewTag] = useState("");
    const [error, setError] = useState({ title: false, content: false });
    const navigate = useNavigate();
    
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch("http://localhost:5555/tags");
                if (response.ok) {
                    const tagsData = await response.json();
                    setTags(tagsData);
                } else {
                    console.error("Failed to fetch tags");
                }
            } catch (error) {
                console.error("Error fetching tags:", error);
            }
        };
        fetchTags();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError({
            title: !title.trim(),
            content: !content.trim(),
        });

        if (!title.trim() || !content.trim()) return;

        if (!token) {
            console.error("Authentication token missing.");
            return;
        }

        if (!window.confirm("Are you sure you want to add this note?")) return;

        const noteData = {
            title,
            content,
            tags: selectedTags,
        };

        try {
            const response = await fetch("http://localhost:5555/notes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(noteData),
            });

            if (response.ok) {
                const newNote = await response.json();
                onNoteAdded(newNote.note);
                setTitle("");
                setContent("");
                setSelectedTags([]);
                alert("Note added successfully!");
                navigate("/dashboard"); // Redirect to dashboard
            } else {
                console.error("Failed to add note:", await response.json());
            }
        } catch (error) {
            console.error("Error adding note:", error);
        }
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleTagSelection = (tag) => {
        setSelectedTags((prevTags) =>
            prevTags.includes(tag)
                ? prevTags.filter((t) => t !== tag)
                : [...prevTags, tag]
        );
    };

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setSelectedTags([...selectedTags, newTag]);
            setNewTag("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="note-form">
            <h2>Add a New Note</h2>

            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={error.title ? "input-error" : ""}
            />

            <textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={error.content ? "input-error" : ""}
            />

            {/* Tag Dropdown */}
            <div className="tag-dropdown">
                <button type="button" onClick={toggleDropdown} className="dropdown-btn">
                    Select Tags ▼
                </button>

                {showDropdown && (
                    <div className="dropdown-content">
                        {tags.map((tag) => (
                            <label key={tag} className="dropdown-item">
                                <input
                                    type="checkbox"
                                    value={tag}
                                    checked={selectedTags.includes(tag)}
                                    onChange={() => handleTagSelection(tag)}
                                />
                                {tag}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Add New Tag */}
            <div className="add-tag">
                <input
                    type="text"
                    placeholder="Add new tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                />
                <button type="button" onClick={handleAddTag} className="add-tag-button">
                    Add Tag
                </button>
            </div>

            <button type="submit" className="submit-button">
                Add Note
            </button>
        </form>
    );
}
