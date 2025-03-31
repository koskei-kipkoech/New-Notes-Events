# Notes App

A full-stack web application for managing notes and calendar events with tagging functionality. The application provides a modern interface for creating, organizing, and managing your notes and schedule efficiently.

## Features

- **Notes Management**

  - Create, read, update, and delete notes
  - Pin important notes
  - Tag-based organization
  - Rich text content support

- **Calendar Events**

  - Schedule and manage events
  - Event details with title, description, start time, and end time
  - User-specific calendar management

- **Tag System**

  - Create and manage tags
  - Associate multiple tags with notes
  - Filter notes by tags

- **User Authentication**
  - Secure user registration and login
  - Password encryption
  - User-specific data isolation

## Tech Stack

### Frontend

- React.js
- Modern JavaScript (ES6+)
- CSS for styling

### Backend

- Flask (Python web framework)
- SQLAlchemy ORM
- Flask-SQLAlchemy for database operations
- Flask-Bcrypt for password hashing
- JWT for authentication

## Project Structure

```
├── frontend/           # React frontend application
│   ├── public/         # Static files
│   └── src/            # Source files
│       ├── components/ # React components
│       └── context/    # React context
└── server/            # Flask backend application
    ├── app.py         # Main application file
    ├── models.py      # Database models
    ├── migrations/    # Database migrations
    └── seed.py        # Database seeding
```

## Setup Instructions

### Backend Setup

1. Navigate to the project root directory
2. Create and activate a virtual environment:
   ```bash
   pipenv install
   pipenv shell
   ```
3. Install dependencies:
   ```bash
   pipenv install
   ```
4. Set up the database:
   ```bash
   flask db upgrade
   python seed.py  # Optional: to seed the database
   ```
5. Start the Flask server:
   ```bash
   python server/app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Database Models

### User

- Manages user authentication and profile
- Fields: username, email, password_hash
- Relationships with notes and calendar events

### Note

- Stores user notes
- Fields: title, content, pinned status, timestamps
- Many-to-many relationship with tags

### CalendarEvent

- Manages user calendar events
- Fields: title, description, start_time, end_time

### Tag

- Organizes notes through tagging
- Fields: name
- Many-to-many relationship with notes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
