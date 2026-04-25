# BrainSync AI - Custom ChatBot Widget Builder 🧠🚀

BrainSync AI is a powerful SaaS platform that allows anyone to create a custom AI-powered chatbot by simply uploading documents or providing website URLs. Once trained, you get a lightweight JavaScript snippet that you can embed into any website to provide instant, intelligent support to your visitors.

<img width="1919" height="933" alt="image" src="https://github.com/user-attachments/assets/144bda77-ffc8-4ab7-89b8-04b99a369523" />


## ✨ Features

- **Knowledge Base Training**: Upload multiple PDFs, text files, or provide website URLs to train your bot.
- **RAG Implementation**: Uses Retrieval-Augmented Generation for accurate, data-backed responses.
- **Premium UI/UX**:
  - Interactive **Neural Network Background** that reacts to mouse movement.
  - **Glassmorphism Design** for a high-end, professional look.
  - Premium **Dark Mode** Chat Widget.
- **Easy Integration**: Generate a single line of script to add the bot to any website.
- **Multilingual**: Supports conversations in both **English and Bangla**.
- **Modern Tech Stack**: Built with FastAPI, LangChain, and Pinecone.

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI
- **AI Framework**: LangChain, OpenAI (GPT-3.5-Turbo & Text-Embeddings-3-Small)
- **Vector Database**: Pinecone
- **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism), JavaScript
- **Animations**: HTML5 Canvas (Neural Network Particle System)

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.8+
- OpenAI API Key
- Pinecone API Key (Index should have **1536 dimensions**)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/r0nY-0017/BrainSyncAI--Chatbot_Widget_Builder.git
cd BrainSyncAI--Chatbot_Widget_Builder
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_index_name
HOST_URL=http://localhost:8000
```

### 4. Running Locally
```bash
python main.py
# OR
uvicorn main:app --reload
```
Open `http://localhost:8000` in your browser.

## ☁️ Deployment (Render)

1. Connect this repo to **Render**.
2. Select **Web Service**.
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env` in the Render dashboard.

## 📜 License
MIT License - feel free to use this project for your own SaaS ventures!

---
Built with ❤️ by [BrainSync AI Team](https://github.com/r0nY-0017)
