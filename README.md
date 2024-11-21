# **Document Analyzer**

A document analysis application using **FastAPI** (backend) and **React** (frontend) to process and analyze text from documents or user input, powered by **Google Gemini AI** and **LangChain**.

### Original UI

<img src="https://github.com/user-attachments/assets/ac83669c-e14f-4b44-8551-3145ea81abcd" width="600" />

### Improved UI and Capability

<img src="https://github.com/user-attachments/assets/f87967a4-bce5-4fee-86d3-193dbb07f755" width="600" />

## **Features**
- Upload files (**PDF**, **DOCX**, **TXT**) or input text.
- Analyze using categories:
  - **Summary**: Extract main points.
  - **Sentiment**: Detect emotional tone.
  - **Keywords**: Identify key terms.
  - **Entity Recognition**: Extract entities like names, locations, etc.
- Custom query support for tailored analysis.

## **Setup**

### **Backend (FastAPI)**
1. Install dependencies:
   ```bash
   pip install fastapi uvicorn python-docx PyPDF2 langchain-google-genai langchain-core langchain-community faiss-gpu
   ```
2. Add your **GEMINI_API_KEY** to a `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Run the server:
   ```bash
   uvicorn app:app --reload
   ```

### **Frontend (React)**
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```

## **Usage**
1. Run the backend (`FastAPI`) and frontend (`React`).
2. Open the app (default: `http://localhost:3000`).
3. Upload files or input text for analysis.

## **Endpoints**
- `GET /health`: Check server status.
- `POST /upload`: Upload a single file for analysis.
- `POST /analyze_multiple`: Analyze multiple files.
- `POST /analyze_text`: Analyze direct text input.

## **Tech Stack**
- **Backend**: FastAPI, LangChain, Google Generative AI.
- **Frontend**: React, TailwindCSS.

