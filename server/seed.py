import random
from faker import Faker
from app import app, db
from models import User, Note, CalendarEvent, Tag, NoteTag

# Initialize Faker
fake = Faker()

def seed_users():
    users = []
    for _ in range(10):  # Create 10 users
        user = User(
            username=fake.user_name(),
            email=fake.unique.email(),  # Ensure email is unique
            password_hash=fake.password(),
        )
        users.append(user)
    db.session.bulk_save_objects(users)
    db.session.commit()

def seed_notes():
    notes = []
    for _ in range(30):  # Create 30 notes
        note = Note(
            user_id=random.randint(1, 10),  # Randomly assign to a user
            title=fake.sentence(),
            content=fake.text(),
        )
        notes.append(note)
    db.session.bulk_save_objects(notes)
    db.session.commit()

def seed_calendar_events():
    events = []
    for _ in range(15):  # Create 15 calendar events
        event = CalendarEvent(
            user_id=random.randint(1, 10),
            title=fake.sentence(),
            description=fake.text(),
            start_time=fake.date_time_this_year(),
            end_time=fake.date_time_this_year(),
        )
        events.append(event)
    db.session.bulk_save_objects(events)
    db.session.commit()

def seed_tags():
    tags = []
    for _ in range(10):  # Create 10 tags
        tag = Tag(name=fake.unique.word())  # Ensure tag name is unique
        tags.append(tag)
    db.session.bulk_save_objects(tags)
    db.session.commit()

def seed_note_tags():
    note_tags = []
    notes = Note.query.all()
    tags = Tag.query.all()
    
    for note in notes:
        # Randomly assign tags to notes
        for _ in range(random.randint(1, 3)):  # Each note gets 1-3 tags
            note_tag = NoteTag(note_id=note.id, tag_id=random.choice(tags).id)
            note_tags.append(note_tag)

    db.session.bulk_save_objects(note_tags)
    db.session.commit()

def seed_database():
    with app.app_context():
        # Clear existing data (Optional)
        db.drop_all()
        db.create_all()

        # Seed new data
        print("Seeding Users...")
        seed_users()
        print("Seeding Notes...")
        seed_notes()
        print("Seeding Calendar Events...")
        seed_calendar_events()
        print("Seeding Tags...")
        seed_tags()
        print("Seeding NoteTags...")
        seed_note_tags()

if __name__ == '__main__':
    seed_database()
