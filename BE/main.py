import os
import requests
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from PyPDF2 import PdfReader
import docx
from rapidfuzz import fuzz
import re
from bs4 import BeautifulSoup
from nltk.corpus import stopwords
from nltk import download
from sentence_transformers import SentenceTransformer, util
from uvicorn import run
from datetime import datetime, timedelta

# Ensure stopwords are available
try:
    stop_words = set(stopwords.words('english'))
except LookupError:
    download('stopwords')
    stop_words = set(stopwords.words('english'))

# Load Sentence-BERT model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Replace with your actual Google credentials or environment variables
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CX = os.getenv("GOOGLE_CX")

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Example threshold for flagging high similarity
THRESHOLD = 70
CHUNK_SIZE = 2000  # Upper limit for splitting large text

# Normalize text for more consistent matching
def normalize_text(text):
    """
    Normalize the input text by:
    - Removing punctuation
    - Converting to lowercase
    - Removing stop words
    - Normalizing whitespace
    """
    text = re.sub(r"[^\w\s]", "", text)  # Remove punctuation
    text = text.lower().strip()  # Convert to lowercase and strip spaces
    words = text.split()  # Split into words
    words = [word for word in words if word not in stop_words]  # Remove stop words
    return " ".join(words)



# Function to split large text into chunks at spaces
def split_text_by_space(text, chunk_size):
    words = text.split()  # Split into words
    chunks = []
    current_chunk = []

    for word in words:
        # Add words to the current chunk until it exceeds chunk_size
        if sum(len(w) for w in current_chunk) + len(current_chunk) + len(word) > chunk_size:
            chunks.append(" ".join(current_chunk))  # Add the current chunk to the list
            current_chunk = []  # Start a new chunk
        current_chunk.append(word)

    if current_chunk:  # Add the last chunk if there's any remaining
        chunks.append(" ".join(current_chunk))
    
    return chunks

# Global variables to track the last status and its timestamp
last_checked = None
last_status = {"status": "unknown", "message": "No status available yet."}
cooldown_period = timedelta(seconds=3600)  # 1 hour cooldown

@app.get("/api-status/")
async def api_status():
    global last_checked, last_status
    now = datetime.now()

    # Check for rate-limiting
    if last_checked and (now - last_checked) < cooldown_period:
        print(f"Rate-limited: Last known status: {last_status}")  # Debug log
        return {
            "status": "rate_limited",
            "last_known_status": last_status["status"],
            "message": f"Rate-limited. Last known status: {last_status['status']}",
        }

    # Perform actual status check
    test_query = "test"
    query_url = (
        "https://www.googleapis.com/customsearch/v1"
        f"?key={GOOGLE_API_KEY}"
        f"&cx={GOOGLE_CX}"
        f"&q={requests.utils.quote(test_query)}"
    )
    try:
        response = requests.get(query_url, timeout=5)
        data = response.json()

        if "error" in data:
            last_status = {"status": "out_of_service", "message": data["error"].get("message", "Unknown error")}
            last_checked = now
            print(f"API Error: {last_status}")  # Debug log
            return last_status

        last_status = {"status": "in_service", "message": "API is operational"}
        last_checked = now
        print(f"API Success: {last_status}")  # Debug log
        return last_status

    except Exception as e:
        last_status = {"status": "out_of_service", "message": str(e)}
        last_checked = now
        print(f"Exception: {last_status}")  # Debug log
        return last_status


    except Exception as e:
        # Handle any exceptions during the status check
        last_status = {"status": "out_of_service", "message": str(e)}
        last_checked = now
        return last_status

@app.get("/")
async def root():
    return {"message": "Welcome to the Plagiarism Checker with Optimized Text Handling!"}

@app.post("/check-plagiarism/")
async def check_plagiarism(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None)
):
    """
    Processes the input text or file:
    - Reads the text from a file or form input.
    - If the text length exceeds CHUNK_SIZE, breaks it into chunks at spaces.
    - Sends each chunk (or full text if small) to Google Custom Search for similarity checks.
    """
    # -----------------------
    # Extract or Combine Text
    # -----------------------
    extracted_text = ""

    if file is not None:
        extension = os.path.splitext(file.filename)[1].lower()
        file_bytes = await file.read()

        if extension == ".txt":
            extracted_text = file_bytes.decode("utf-8", errors="ignore")

        elif extension == ".pdf":
            temp_pdf_name = "temp_upload.pdf"
            with open(temp_pdf_name, "wb") as temp_pdf:
                temp_pdf.write(file_bytes)

            reader = PdfReader(temp_pdf_name)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    extracted_text += page_text
            os.remove(temp_pdf_name)

        elif extension == ".docx":
            temp_docx_name = "temp_upload.docx"
            with open(temp_docx_name, "wb") as temp_docx:
                temp_docx.write(file_bytes)

            doc_obj = docx.Document(temp_docx_name)
            for para in doc_obj.paragraphs:
                extracted_text += para.text + "\n"
            os.remove(temp_docx_name)

        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Allowed: .txt, .pdf, .docx"
            )

    # If text is provided, combine or use as the primary input
    if text:
        if extracted_text.strip():
            extracted_text += f"\n{text}"
        else:
            extracted_text = text

    if not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail="No valid text found. Please upload a file or provide text."
        )

    # -----------------------
    # Determine Chunks or Single Block
    # -----------------------
    if len(extracted_text) <= CHUNK_SIZE:
        chunks = [extracted_text]  # Process the entire text as a single chunk
    else:
        chunks = split_text_by_space(extracted_text, CHUNK_SIZE)

    # -----------------------
    # Search & Calculate Scores
    # -----------------------
    total_score = 0.0
    total_matches = 0
    search_results = []
    flagged_pieces = []  # Chunks that exceed similarity threshold
    title_counts = {}  # Track the most common titles

    for chunk_index, chunk in enumerate(chunks):
        query_url = (
            "https://www.googleapis.com/customsearch/v1"
            f"?key={GOOGLE_API_KEY}"
            f"&cx={GOOGLE_CX}"
            f"&q={requests.utils.quote(chunk[:512])}"
        )

        chunk_matches = []
        try:
            response = requests.get(query_url, timeout=10)
            data = response.json()
            items = data.get("items", [])

            for item in items:
                title = item.get("title")
                snippet = item.get("snippet")
                link = item.get("link")

                # Normalize and perform fuzzy + semantic similarity on chunk vs snippet
                chunk_normalized = normalize_text(chunk)
                snippet_normalized = normalize_text(snippet)

                # Fuzzy similarity using token_set_ratio
                fuzzy_similarity = fuzz.token_set_ratio(chunk_normalized, snippet_normalized)

                # Semantic similarity using Sentence-BERT
                chunk_embedding = model.encode(chunk_normalized, convert_to_tensor=True)
                snippet_embedding = model.encode(snippet_normalized, convert_to_tensor=True)
                semantic_similarity = util.pytorch_cos_sim(chunk_embedding, snippet_embedding).item()

                # Combined similarity score
                similarity_score = 0.5 * fuzzy_similarity + 0.5 * (semantic_similarity * 100)

                chunk_matches.append({
                    "title": title,
                    "link": link,
                    "snippet": snippet,
                    "similarity_score": similarity_score
                })

                # Track global scores
                total_score += similarity_score
                total_matches += 1

        except Exception as e:
            chunk_matches.append({"error": str(e)})

        # Sort matches in descending order of similarity
        chunk_matches.sort(key=lambda m: m.get('similarity_score', -1), reverse=True)

        # Identify top match and flag chunks if necessary
        top_match_score = 0
        top_match_title = None
        if chunk_matches and 'similarity_score' in chunk_matches[0]:
            top_match_score = chunk_matches[0]['similarity_score']
            top_match_title = chunk_matches[0].get('title')

        if top_match_score >= THRESHOLD:
            flagged_pieces.append({
                "chunk_index": chunk_index,
                "chunk_text_snippet": chunk[:50],
                "top_match_score": top_match_score
            })
            if top_match_title:
                title_counts[top_match_title] = title_counts.get(top_match_title, 0) + 1

        search_results.append({
            "chunk_index": chunk_index,
            "chunk_text_snippet": chunk[:50],
            "matches": chunk_matches
        })

    # -----------------------
    # Compute Average Similarity
    # -----------------------
    average_similarity_score = 0.0
    if total_matches > 0:
        average_similarity_score = round(total_score / total_matches, 2)

    return {
        "file_uploaded": file.filename if file else None,
        "provided_text_length": len(text) if text else None,
        "total_extracted_length": len(extracted_text),
        "num_chunks": len(chunks),
        "average_similarity_score": average_similarity_score,
        "search_results": search_results,
        "flagged_pieces": flagged_pieces,
        "threshold_used": THRESHOLD
    }
    
if __name__ == "__main__":
    port = int(os.getenv("PORT", 10000))  # Use the dynamic PORT variable
    print(f"Starting server on 0.0.0.0:{port}")  # Debugging info for Render logs
    run(app, host="0.0.0.0", port=port)

