from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
from dotenv import load_dotenv

# Load environment variables (OPENAI_API_KEY, PINECONE_API_KEY, etc)
load_dotenv()

from services.kb_processor import process_and_store_kb, get_chat_response

app = FastAPI(title="ChatBot SaaS API")

# Allow CORS for the widget
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
WIDGET_DIR = os.path.join(BASE_DIR, "widget")

# Mount static files
app.mount("/static", StaticFiles(directory=TEMPLATES_DIR), name="static")
app.mount("/widget", StaticFiles(directory=WIDGET_DIR), name="widget")

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open(os.path.join(TEMPLATES_DIR, "index.html"), "r", encoding="utf-8") as f:
        return f.read()

from typing import List

@app.post("/api/upload-kb")
async def upload_knowledge_base(files: List[UploadFile] = File(None), url: str = Form(None)):
    bot_id = str(uuid.uuid4())
    success = False
    
    if files and len(files) > 0 and getattr(files[0], "filename", "") != "":
        for file in files:
            file_bytes = await file.read()
            if process_and_store_kb(bot_id, "file", file_bytes=file_bytes):
                success = True
        
    elif url:
        # Process URL and store in Pinecone
        success = process_and_store_kb(bot_id, "url", url=url)
        
    if not success:
        return {
            "status": "error", 
            "message": "Failed to process the knowledge base. Please check the file/URL."
        }
    
    # Generate the embed code
    # HOST_URL will be https://your-domain.com in production
    host_url = os.getenv("HOST_URL", "http://localhost:8000")
    
    embed_code = f"""<!-- Botify AI Widget -->
<script 
  async 
  defer 
  src="{host_url}/widget/widget.js" 
  data-bot-id="{bot_id}">
</script>"""
    
    return {
        "status": "success", 
        "bot_id": bot_id, 
        "message": "Knowledge base processed successfully.",
        "embed_code": embed_code
    }

@app.post("/api/chat/{bot_id}")
async def chat_with_bot(bot_id: str, message: dict):
    user_msg = message.get("message", "")
    if not user_msg:
        return {"reply": "Please send a message."}
        
    reply = get_chat_response(bot_id, user_msg)
    
    return {"reply": reply}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
