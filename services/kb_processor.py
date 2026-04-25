import os
import io
import uuid
import requests
from bs4 import BeautifulSoup
import PyPDF2
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from pinecone import Pinecone

# Initialize Pinecone Client directly
def get_pinecone_index():
    api_key = os.getenv("PINECONE_API_KEY")
    index_name = os.getenv("PINECONE_INDEX_NAME")
    if not api_key or not index_name:
        raise ValueError("PINECONE_API_KEY or PINECONE_INDEX_NAME is missing in .env")
    
    pc = Pinecone(api_key=api_key)
    return pc.Index(index_name)

def extract_text_from_pdf_bytes(file_bytes):
    text = ""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def extract_text_from_url(url):
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        # Extract text from p, h1-h6, li
        tags = soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'])
        text = "\n".join([tag.get_text(strip=True) for tag in tags])
        return text
    except Exception as e:
        print(f"Error reading URL: {e}")
        return ""

def process_and_store_kb(bot_id, source_type, file_bytes=None, url=None):
    text = ""
    if source_type == "file" and file_bytes:
        text = extract_text_from_pdf_bytes(file_bytes)
    elif source_type == "url" and url:
        text = extract_text_from_url(url)
        
    if not text.strip():
        return False
        
    # Split text
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_text(text)
    
    if not chunks:
        return False
        
    # Generate embeddings and store in Pinecone directly
    embeddings_model = OpenAIEmbeddings()
    embeddings = embeddings_model.embed_documents(chunks)
    
    vectors = []
    for i, chunk in enumerate(chunks):
        vectors.append({
            "id": f"{bot_id}-{uuid.uuid4()}",
            "values": embeddings[i],
            "metadata": {"text": chunk, "bot_id": bot_id}
        })
    
    index = get_pinecone_index()
    # Upsert in batches of 100
    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        index.upsert(vectors=vectors[i:i + batch_size])
    
    return True

def retrieve_from_pinecone(query, bot_id, k=4):
    embeddings_model = OpenAIEmbeddings()
    query_embedding = embeddings_model.embed_query(query)
    
    index = get_pinecone_index()
    results = index.query(
        vector=query_embedding,
        filter={"bot_id": bot_id},
        top_k=k,
        include_metadata=True
    )
    
    # Extract text from matches
    docs = [match["metadata"]["text"] for match in results["matches"] if "metadata" in match and "text" in match["metadata"]]
    return docs

def format_docs(docs):
    return "\n\n".join(docs)

def get_chat_response(bot_id, user_message):
    try:
        llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.3)
        
        system_prompt = (
            "You are a helpful AI assistant for a business. "
            "Use the following pieces of retrieved context to answer the user's question. "
            "If you don't know the answer, just say that you don't know based on the provided information. "
            "If the user asks in Bengali, answer in Bengali. If they ask in English, answer in English.\n\n"
            "Context: {context}"
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])
        
        # Custom retriever to bypass Langchain's Pinecone integration bugs
        def custom_retriever(query):
            return retrieve_from_pinecone(query, bot_id)
            
        rag_chain = (
            {"context": RunnableLambda(custom_retriever) | format_docs, "input": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )
        
        response = rag_chain.invoke(user_message)
        return response
    except Exception as e:
        print(f"Error generating response: {e}")
        return "Sorry, I am having trouble connecting to my brain right now."
