from flask import Flask, request, jsonify, Blueprint
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_restful import Api
from flask_bcrypt import Bcrypt
from models import db, User, Note, Tag, NoteTag, CalendarEvent
from datetime import datetime, timedelta
import jwt
import os
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity


app = Flask(__name__)

# ✅ Load configuration from environment variables
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///notesapp.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_secret_key')  

# Initialize Extensions
db.init_app(app)
CORS(app, supports_credentials=True)
migrate = Migrate(app, db)
api = Api(app)
bcrypt = Bcrypt(app)
# jwt = JWTManager(app)

BLACKLISTED_TOKENS = set()  # Consider using Redis for persistence


# 🔑 Helper Function: Generate JWT Token
def generate_token(user_id):
    payload = {'user_id': user_id, 'exp': datetime.utcnow() + timedelta(hours=10)}
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')



# 🔐 Token required decorator
def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"message": "Token is missing!"}), 400

        token = token.replace("Bearer ", "")

        if token in BLACKLISTED_TOKENS:
            return jsonify({"message": "Token has been revoked. Please log in again."}), 401

        try:
            decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(decoded_token['user_id'])
            if not current_user:
                return jsonify({"message": "User not found!"}), 404
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token!"}), 401

        return f(current_user, *args, **kwargs)
    return decorated_function


# ✅ User Registration
@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()

    if not all([data.get('username'), data.get('email'), data.get('password')]):
        return jsonify({"message": "Missing required fields"}), 400

    email = data['email']
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], email=email, password_hash=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201

@app.route('/auth-check', methods=['GET'])
@token_required
def auth_check(current_user):
    token = request.headers.get('Authorization').replace("Bearer ", "")
    if token in BLACKLISTED_TOKENS:
        return jsonify({"message": "Token has been revoked"}), 401
    return jsonify({"user": current_user.to_dict()}), 200


# ✅ User Login
@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()

    if not data or not all([data.get('email'), data.get('password')]):
        return jsonify({'message': 'Missing JSON body or required fields'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        token = generate_token(user.id)
        response = jsonify({'token': token, 'user': user.to_dict()})
        response.set_cookie('token', token, httponly=True, samesite='Strict')
        return response, 200

    return jsonify({'message': 'Invalid credentials'}), 401


# ✅ Logout and Blacklist Token
@app.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    token = request.headers.get('Authorization').replace("Bearer ", "")
    BLACKLISTED_TOKENS.add(token)

    response = jsonify({"message": "Successfully logged out"})
    response.set_cookie('token', '', expires=0, httponly=True, samesite='Strict')

    return response, 200


@app.route('/settings', methods=['PATCH', 'PUT'])
@token_required
def update_login_settings(current_user):
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "No data provided"}), 400
    email = data.get("email")
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    # Validate the provided current password
    if not bcrypt.check_password_hash(current_user.password_hash, current_password):
        return jsonify({"message": "Incorrect current password"}), 401
    # Update email if provided and not already taken
    if email:
        existing_user = User.query.filter_by(email=email).first()
        if existing_user and existing_user.id != current_user.id:
            return jsonify({"message": "Email already in use"}), 400
        current_user.email = email
    # Update password if a new one is provided
    if new_password:
        hashed_password = bcrypt.generate_password_hash(new_password).decode("utf-8")
        current_user.password_hash = hashed_password
    try:
        db.session.commit()
        return jsonify({"message": "Login settings updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to update settings", "error": str(e)}), 500



# ✅ Fetch Notes for Logged-in User
@app.route('/notes', methods=['GET'])
@token_required
def get_notes(current_user):
    try:
        notes = Note.query.filter_by(user_id=current_user.id).all()
        return jsonify([note.to_dict() for note in notes]), 200
    except Exception as e:
        return jsonify({"message": "An error occurred while fetching notes", "error": str(e)}), 500

@app.route('/tags', methods=['GET'])
def get_tags():
    tags = Tag.query.all()
    return jsonify([tag.name for tag in tags]), 200

# ✅ Create Note
@app.route('/notes', methods=['POST'])
@token_required
def create_note(current_user):
    data = request.get_json()
    if not all([data.get('title'), data.get('content')]):
        return jsonify({"message": "Title and content are required"}), 400
    try:
        # Create the note
        new_note = Note(user_id=current_user.id, title=data['title'], content=data['content'])
        db.session.add(new_note)
        db.session.commit()
        # Handle tags
        if 'tags' in data and isinstance(data['tags'], list):
            for tag_name in data['tags']:
                tag = Tag.query.filter_by(name=tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.session.add(tag)
                    db.session.commit()
                # Associate tag with the note
                note_tag = NoteTag(note_id=new_note.id, tag_id=tag.id)
                db.session.add(note_tag)
            db.session.commit()
        return jsonify({
            "message": "Note created successfully",
            "note": new_note.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "An error occurred while creating the note", "error": str(e)}), 500


# ✅ Update Note
@app.route('/notes/<int:note_id>', methods=['PUT'])
@token_required
def update_note(current_user, note_id):
    data = request.get_json()

    if not data.get('content'):
        return jsonify({"message": "Content is required"}), 400
    note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()
    if not note:
        return jsonify({"message": "Note not found"}), 404
    try:
        note.content = data['content']
        note.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({"message": "Note updated successfully", "note": note.to_dict()}), 200
    except Exception as e:
        return jsonify({"message": "Failed to update note", "error": str(e)}), 500

# ✅ Delete Note
@app.route('/notes/<int:note_id>', methods=['DELETE'])
@token_required
def delete_note(current_user, note_id):
    note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()

    if not note:
        return jsonify({"message": "Note not found"}), 404

    try:
        db.session.delete(note)
        db.session.commit()

        return jsonify({"message": "Note deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": "Failed to delete note", "error": str(e)}), 500

#pinned notes
@app.route('/notes/<int:note_id>/pin', methods=['PATCH'])
@token_required
def toggle_pin(current_user, note_id):
    note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()
    if not note:
        return jsonify({"message": "Note not found"}), 404

    note.pinned = not note.pinned
    db.session.commit()
    return jsonify({"message": "Pin status updated", "pinned": note.pinned}), 200


@app.route('/notes/pinned', methods=['GET'])
@token_required
def get_pinned_notes(current_user):
    pinned_notes = Note.query.filter_by(user_id=current_user.id, pinned=True).all()
    return jsonify([note.to_dict() for note in pinned_notes]), 200

#events routes 
@app.route('/calendar-events', methods=['GET'])
@token_required
def get_calendar_events(current_user):
    try:
        events = CalendarEvent.query.filter_by(user_id=current_user.id).all()
        return jsonify([event.to_dict() for event in events]), 200
    except Exception as e:
        return jsonify({"message": "An error occurred while fetching calendar events", "error": str(e)}), 500

#adds new events to the calendar
@app.route('/calendar-events', methods=['POST'])
@token_required
def create_calendar_event(current_user):
    try:
        data = request.get_json()
        title = data.get("title")
        description = data.get("description")
        start_time = data.get("start_time")
        end_time = data.get("end_time")
        if not title or not start_time or not end_time:
            return jsonify({"message": "Title, start time, and end time are required"}), 400
        new_event = CalendarEvent(
            title=title,
            description=description,
            start_time = datetime.fromisoformat(data.get("start_time")),
            end_time = datetime.fromisoformat(data.get("end_time")),
            user_id=current_user.id
        )
        db.session.add(new_event)
        db.session.commit()
        return jsonify(new_event.to_dict()), 201  # Return the created event
    except Exception as e:
        return jsonify({"message": "Failed to create event", "error": str(e)}), 500

@app.route('/calendar-events/<int:event_id>', methods=['PATCH'])
@token_required
def update_calendar_event(current_user, event_id):
    try:
        event = CalendarEvent.query.filter_by(id=event_id, user_id=current_user.id).first()

        if not event:
            return jsonify({"message": "Event not found"}), 404
        
        data = request.get_json()
        # Validate and update fields only if new values are provided
        if "title" in data:
            event.title = data["title"]
        if "description" in data:
            event.description = data["description"]

        # Ensure datetime fields are correctly formatted
        try:
            if "start_time" in data and data["start_time"]:
                event.start_time = datetime.fromisoformat(data["start_time"])
            if "end_time" in data and data["end_time"]:
                event.end_time = datetime.fromisoformat(data["end_time"])
        except ValueError:
            return jsonify({"message": "Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}), 400
        db.session.commit()
        return jsonify({"message": "Event updated successfully", "event": event.to_dict()}), 200
    except Exception as e:
        db.session.rollback()  # Rollback transaction if any error occurs
        return jsonify({"message": "Failed to update event", "error": str(e)}), 500

# Delete an event
@app.route('/calendar-events/<int:event_id>', methods=['DELETE'])
@token_required
def delete_calendar_event(current_user, event_id):
    try:
        event = CalendarEvent.query.filter_by(id=event_id, user_id=current_user.id).first()
        
        if not event:
            return jsonify({"message": "Event not found"}), 404
        
        db.session.delete(event)
        db.session.commit()
        
        return jsonify({"message": "Event deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": "Failed to delete event", "error": str(e)}), 500
    

if __name__ == '__main__':
    app.run(port=5555, debug=True)
