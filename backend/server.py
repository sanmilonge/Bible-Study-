from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import List, Optional
import os
import logging
import jwt
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
import uuid
import openai
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'bible_study_db')]

# OpenAI configuration
openai_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here-bible-study-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Create FastAPI app
app = FastAPI(title="Bible Study App API", version="1.0.0")

# Create API router
api_router = APIRouter(prefix="/api")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class NoteCreate(BaseModel):
    title: str
    content: str
    book: str
    chapter: int
    verse: int

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class NoteResponse(BaseModel):
    id: str
    title: str
    content: str
    book: str
    chapter: int
    verse: int
    created_at: datetime
    updated_at: datetime

class HighlightCreate(BaseModel):
    book: str
    chapter: int
    verse: int
    text: str
    color: str

class HighlightResponse(BaseModel):
    id: str
    book: str
    chapter: int
    verse: int
    text: str
    color: str
    created_at: datetime

class BookmarkCreate(BaseModel):
    book: str
    chapter: int
    verse: int

class BookmarkResponse(BaseModel):
    id: str
    book: str
    chapter: int
    verse: int
    created_at: datetime

class FriendRequestCreate(BaseModel):
    friend_email: str

class FriendResponse(BaseModel):
    id: str
    name: str
    email: str
    status: str

class ReminderCreate(BaseModel):
    title: str
    description: str
    reminder_time: datetime
    friend_id: Optional[str] = None

class ReminderResponse(BaseModel):
    id: str
    title: str
    description: str
    reminder_time: datetime
    completed: bool
    friend_id: Optional[str] = None
    created_at: datetime

class ChatCreate(BaseModel):
    participant_id: str

class ChatResponse(BaseModel):
    id: str
    participants: List[str]
    created_at: datetime

class ChatMessageCreate(BaseModel):
    content: str

class ChatMessageResponse(BaseModel):
    id: str
    sender_id: str
    content: str
    created_at: datetime

class ChatbotMessage(BaseModel):
    message: str
    context: Optional[str] = None

class ChatbotResponse(BaseModel):
    response: str
    context: Optional[str] = None

# Utility functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"_id": user_id})
    if user is None:
        raise credentials_exception
    return user

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# Main app endpoints (without /api prefix)
@app.get("/")
async def main_root():
    return {"message": "Bible Study API is running", "version": "1.0.0", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Bible Study API is running"}

# API Router endpoints (with /api prefix)
@api_router.get("/")
async def api_root():
    return {"message": "Bible Study App API", "version": "1.0.0"}

# Authentication endpoints
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(user_doc)
    
    return UserResponse(
        id=user_id,
        name=user.name,
        email=user.email,
        created_at=user_doc["created_at"]
    )

@api_router.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    user = await db.users.find_one({"email": user_credentials.email})
    if not user or not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["_id"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/auth/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["_id"],
        name=current_user["name"],
        email=current_user["email"],
        created_at=current_user["created_at"]
    )

# Bible endpoints
@api_router.get("/bible/books")
async def get_bible_books():
    books = [
        "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
        "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
        "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
        "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
        "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
        "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel",
        "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
        "Zephaniah", "Haggai", "Zechariah", "Malachi",
        "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
        "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
        "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
        "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
        "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
        "Jude", "Revelation"
    ]
    return {"books": books}

# Notes endpoints
@api_router.get("/notes", response_model=List[NoteResponse])
async def get_notes(current_user: dict = Depends(get_current_user)):
    notes = await db.notes.find({"user_id": current_user["_id"]}).to_list(100)
    return [
        NoteResponse(
            id=note["_id"],
            title=note["title"],
            content=note["content"],
            book=note["book"],
            chapter=note["chapter"],
            verse=note["verse"],
            created_at=note["created_at"],
            updated_at=note["updated_at"]
        )
        for note in notes
    ]

@api_router.post("/notes", response_model=NoteResponse)
async def create_note(note: NoteCreate, current_user: dict = Depends(get_current_user)):
    note_id = str(uuid.uuid4())
    note_doc = {
        "_id": note_id,
        "user_id": current_user["_id"],
        "title": note.title,
        "content": note.content,
        "book": note.book,
        "chapter": note.chapter,
        "verse": note.verse,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.notes.insert_one(note_doc)
    
    return NoteResponse(
        id=note_id,
        title=note.title,
        content=note.content,
        book=note.book,
        chapter=note.chapter,
        verse=note.verse,
        created_at=note_doc["created_at"],
        updated_at=note_doc["updated_at"]
    )

@api_router.put("/notes/{note_id}", response_model=NoteResponse)
async def update_note(note_id: str, note_update: NoteUpdate, current_user: dict = Depends(get_current_user)):
    existing_note = await db.notes.find_one({"_id": note_id, "user_id": current_user["_id"]})
    if not existing_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    update_data = {k: v for k, v in note_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.notes.update_one(
        {"_id": note_id, "user_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    updated_note = await db.notes.find_one({"_id": note_id, "user_id": current_user["_id"]})
    
    return NoteResponse(
        id=updated_note["_id"],
        title=updated_note["title"],
        content=updated_note["content"],
        book=updated_note["book"],
        chapter=updated_note["chapter"],
        verse=updated_note["verse"],
        created_at=updated_note["created_at"],
        updated_at=updated_note["updated_at"]
    )

@api_router.delete("/notes/{note_id}")
async def delete_note(note_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.notes.delete_one({"_id": note_id, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted successfully"}

# Highlights endpoints
@api_router.get("/highlights", response_model=List[HighlightResponse])
async def get_highlights(current_user: dict = Depends(get_current_user)):
    highlights = await db.highlights.find({"user_id": current_user["_id"]}).to_list(100)
    return [
        HighlightResponse(
            id=highlight["_id"],
            book=highlight["book"],
            chapter=highlight["chapter"],
            verse=highlight["verse"],
            text=highlight["text"],
            color=highlight["color"],
            created_at=highlight["created_at"]
        )
        for highlight in highlights
    ]

@api_router.post("/highlights", response_model=HighlightResponse)
async def create_highlight(highlight: HighlightCreate, current_user: dict = Depends(get_current_user)):
    highlight_id = str(uuid.uuid4())
    highlight_doc = {
        "_id": highlight_id,
        "user_id": current_user["_id"],
        "book": highlight.book,
        "chapter": highlight.chapter,
        "verse": highlight.verse,
        "text": highlight.text,
        "color": highlight.color,
        "created_at": datetime.utcnow()
    }
    
    await db.highlights.insert_one(highlight_doc)
    
    return HighlightResponse(
        id=highlight_id,
        book=highlight.book,
        chapter=highlight.chapter,
        verse=highlight.verse,
        text=highlight.text,
        color=highlight.color,
        created_at=highlight_doc["created_at"]
    )

@api_router.delete("/highlights/{highlight_id}")
async def delete_highlight(highlight_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.highlights.delete_one({"_id": highlight_id, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Highlight not found")
    return {"message": "Highlight deleted successfully"}

# Bookmarks endpoints
@api_router.get("/bookmarks", response_model=List[BookmarkResponse])
async def get_bookmarks(current_user: dict = Depends(get_current_user)):
    bookmarks = await db.bookmarks.find({"user_id": current_user["_id"]}).to_list(100)
    return [
        BookmarkResponse(
            id=bookmark["_id"],
            book=bookmark["book"],
            chapter=bookmark["chapter"],
            verse=bookmark["verse"],
            created_at=bookmark["created_at"]
        )
        for bookmark in bookmarks
    ]

@api_router.post("/bookmarks", response_model=BookmarkResponse)
async def create_bookmark(bookmark: BookmarkCreate, current_user: dict = Depends(get_current_user)):
    bookmark_id = str(uuid.uuid4())
    bookmark_doc = {
        "_id": bookmark_id,
        "user_id": current_user["_id"],
        "book": bookmark.book,
        "chapter": bookmark.chapter,
        "verse": bookmark.verse,
        "created_at": datetime.utcnow()
    }
    
    await db.bookmarks.insert_one(bookmark_doc)
    
    return BookmarkResponse(
        id=bookmark_id,
        book=bookmark.book,
        chapter=bookmark.chapter,
        verse=bookmark.verse,
        created_at=bookmark_doc["created_at"]
    )

@api_router.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark(bookmark_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.bookmarks.delete_one({"_id": bookmark_id, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return {"message": "Bookmark deleted successfully"}

# Friends endpoints
@api_router.get("/friends", response_model=List[FriendResponse])
async def get_friends(current_user: dict = Depends(get_current_user)):
    friends = await db.friends.find({"user_id": current_user["_id"], "status": "accepted"}).to_list(100)
    friend_users = []
    for friend in friends:
        friend_user = await db.users.find_one({"_id": friend["friend_id"]})
        if friend_user:
            friend_users.append(
                FriendResponse(
                    id=friend_user["_id"],
                    name=friend_user["name"],
                    email=friend_user["email"],
                    status="accepted"
                )
            )
    return friend_users

@api_router.get("/friends/requests", response_model=List[FriendResponse])
async def get_friend_requests(current_user: dict = Depends(get_current_user)):
    requests = await db.friends.find({"friend_id": current_user["_id"], "status": "pending"}).to_list(100)
    request_users = []
    for request in requests:
        request_user = await db.users.find_one({"_id": request["user_id"]})
        if request_user:
            request_users.append(
                FriendResponse(
                    id=request_user["_id"],
                    name=request_user["name"],
                    email=request_user["email"],
                    status="pending"
                )
            )
    return request_users

@api_router.post("/friends/request")
async def send_friend_request(request: FriendRequestCreate, current_user: dict = Depends(get_current_user)):
    friend_user = await db.users.find_one({"email": request.friend_email})
    if not friend_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if friend_user["_id"] == current_user["_id"]:
        raise HTTPException(status_code=400, detail="Cannot add yourself as friend")
    
    # Check if friendship already exists
    existing_friend = await db.friends.find_one({
        "$or": [
            {"user_id": current_user["_id"], "friend_id": friend_user["_id"]},
            {"user_id": friend_user["_id"], "friend_id": current_user["_id"]}
        ]
    })
    
    if existing_friend:
        raise HTTPException(status_code=400, detail="Friend request already exists")
    
    friend_doc = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user["_id"],
        "friend_id": friend_user["_id"],
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    
    await db.friends.insert_one(friend_doc)
    
    return {"message": "Friend request sent successfully"}

# Reminders endpoints
@api_router.get("/reminders", response_model=List[ReminderResponse])
async def get_reminders(current_user: dict = Depends(get_current_user)):
    reminders = await db.reminders.find({"user_id": current_user["_id"]}).to_list(100)
    return [
        ReminderResponse(
            id=reminder["_id"],
            title=reminder["title"],
            description=reminder["description"],
            reminder_time=reminder["reminder_time"],
            completed=reminder["completed"],
            friend_id=reminder.get("friend_id"),
            created_at=reminder["created_at"]
        )
        for reminder in reminders
    ]

@api_router.post("/reminders", response_model=ReminderResponse)
async def create_reminder(reminder: ReminderCreate, current_user: dict = Depends(get_current_user)):
    reminder_id = str(uuid.uuid4())
    reminder_doc = {
        "_id": reminder_id,
        "user_id": current_user["_id"],
        "title": reminder.title,
        "description": reminder.description,
        "reminder_time": reminder.reminder_time,
        "completed": False,
        "friend_id": reminder.friend_id,
        "created_at": datetime.utcnow()
    }
    
    await db.reminders.insert_one(reminder_doc)
    
    return ReminderResponse(
        id=reminder_id,
        title=reminder.title,
        description=reminder.description,
        reminder_time=reminder.reminder_time,
        completed=False,
        friend_id=reminder.friend_id,
        created_at=reminder_doc["created_at"]
    )

@api_router.post("/reminders/{reminder_id}/complete")
async def complete_reminder(reminder_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.reminders.update_one(
        {"_id": reminder_id, "user_id": current_user["_id"]},
        {"$set": {"completed": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Reminder completed successfully"}

# Chat endpoints
@api_router.get("/chats", response_model=List[ChatResponse])
async def get_chats(current_user: dict = Depends(get_current_user)):
    chats = await db.chats.find({"participants": current_user["_id"]}).to_list(100)
    return [
        ChatResponse(
            id=chat["_id"],
            participants=chat["participants"],
            created_at=chat["created_at"]
        )
        for chat in chats
    ]

@api_router.post("/chats", response_model=ChatResponse)
async def create_chat(chat: ChatCreate, current_user: dict = Depends(get_current_user)):
    chat_id = str(uuid.uuid4())
    chat_doc = {
        "_id": chat_id,
        "participants": [current_user["_id"], chat.participant_id],
        "created_at": datetime.utcnow()
    }
    
    await db.chats.insert_one(chat_doc)
    
    return ChatResponse(
        id=chat_id,
        participants=chat_doc["participants"],
        created_at=chat_doc["created_at"]
    )

@api_router.get("/chats/{chat_id}/messages", response_model=List[ChatMessageResponse])
async def get_chat_messages(chat_id: str, current_user: dict = Depends(get_current_user)):
    chat = await db.chats.find_one({"_id": chat_id, "participants": current_user["_id"]})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    messages = await db.chat_messages.find({"chat_id": chat_id}).to_list(100)
    return [
        ChatMessageResponse(
            id=message["_id"],
            sender_id=message["sender_id"],
            content=message["content"],
            created_at=message["created_at"]
        )
        for message in messages
    ]

@api_router.post("/chats/{chat_id}/messages", response_model=ChatMessageResponse)
async def send_chat_message(chat_id: str, message: ChatMessageCreate, current_user: dict = Depends(get_current_user)):
    chat = await db.chats.find_one({"_id": chat_id, "participants": current_user["_id"]})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    message_id = str(uuid.uuid4())
    message_doc = {
        "_id": message_id,
        "chat_id": chat_id,
        "sender_id": current_user["_id"],
        "content": message.content,
        "created_at": datetime.utcnow()
    }
    
    await db.chat_messages.insert_one(message_doc)
    
    return ChatMessageResponse(
        id=message_id,
        sender_id=current_user["_id"],
        content=message.content,
        created_at=message_doc["created_at"]
    )

# ChatGPT endpoints
async def get_chatbot_response(message: str, context: str = None):
    try:
        system_prompt = """You are a helpful Bible study assistant. You help people understand Biblical passages, 
        answer questions about Christian faith, and provide biblical guidance. Always be respectful and grounded in 
        Biblical truth. If you don't know something, say so rather than making up information."""
        
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        if context:
            messages.append({"role": "user", "content": f"Context: {context}"})
        
        messages.append({"role": "user", "content": message})
        
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        
        return {
            "response": response.choices[0].message.content,
            "context": context
        }
    except Exception as e:
        return {
            "response": f"I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later. (Error: {str(e)})",
            "context": context
        }

@api_router.post("/chatbot/ask", response_model=ChatbotResponse)
async def ask_chatbot(message: ChatbotMessage, current_user: dict = Depends(get_current_user)):
    response = await get_chatbot_response(message.message, message.context)
    return response

@api_router.post("/chatbot/explain-verse", response_model=ChatbotResponse)
async def explain_verse(message: ChatbotMessage, current_user: dict = Depends(get_current_user)):
    context = f"Please explain this Bible verse: {message.context}" if message.context else None
    response = await get_chatbot_response(message.message, context)
    return response

# Include the API router
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Server startup
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
