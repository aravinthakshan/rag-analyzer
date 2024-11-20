import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from 'react-markdown';
import { Upload, FileText, Loader2 } from 'lucide-react';

const BACKEND_URL = "http://localhost:8000";

const DocumentAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [analysisCategory, setAnalysisCategory] = useState("summary");
  const [isTextInput, setIsTextInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  async function checkBackendHealth() {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      const data = await response.json();
      setIsBackendAvailable(data.status === "healthy");
    } catch (error) {
      setIsBackendAvailable(false);
      setError("Cannot connect to backend server. Please ensure it's running.");
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  async function handleFileDrop(acceptedFiles) {
    try {
      setIsLoading(true);
      setError("");
      const uploadedFile = acceptedFiles[0];
      setFile(uploadedFile);

      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("query", customQuery.trim() || "Analyze the document");
      formData.append("category", analysisCategory);

      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysisResult(data.result || data.extracted_text);
    } catch (error) {
      setError(`Error uploading file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTextSubmit() {
    try {
      setIsLoading(true);
      setError("");

      if (!text.trim()) {
        throw new Error("Please enter some text to analyze");
      }

      const response = await fetch(`${BACKEND_URL}/analyze_text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text, 
          query: customQuery.trim() || "Analyze this text and provide key insights",
          category: analysisCategory
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysisResult(data.result);
    } catch (error) {
      setError(`Error analyzing text: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  function handleInputMethodChange(method) {
    setIsTextInput(method === "text");
    setFile(null);
    setText("");
    setCustomQuery("");
    setAnalysisResult("");
    setError("");
  }

  // Handling the analysis category dropdown
  const handleCategoryChange = (category) => {
    setAnalysisCategory(category);
    setIsSelectOpen(false);
  };

  // Warn if no document is uploaded and user tries to switch to text input mode
  const handleUploadButtonClick = () => {
    if (!file && !isTextInput) {
      setError("Please upload a document before proceeding!");
      return;
    }
    setError(""); // Clear error if everything is fine
    setIsTextInput(false); // Switch to text input mode
  };

  if (!isBackendAvailable) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            Cannot connect to backend server. Please ensure it's running at {BACKEND_URL}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Document Analyzer</h2>
        
        <div className="space-y-6">
          {/* File Upload or Text Input Toggle */}
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-lg flex items-center ${
                !isTextInput 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => handleInputMethodChange("file")}
              disabled={isTextInput}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </button>
            <button
              className={`px-4 py-2 rounded-lg flex items-center ${
                isTextInput 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => handleInputMethodChange("text")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Enter Text
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {/* Upload Document Section */}
          {!isTextInput && (
            <div
              {...getRootProps()}
              className="border-2 border-dashed rounded-lg p-8 text-center transition-colors hover:border-blue-500 cursor-pointer"
            >
              <input {...getInputProps()} />
              {isLoading ? (
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-gray-500">Processing file...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-2">Drop your file here, or click to select</p>
                  <p className="text-sm text-gray-500">
                    Supported formats: PDF, DOCX, TXT
                  </p>
                </>
              )}
            </div>
          )}

          {/* Analysis Category Dropdown */}
          <div className="relative">
            <label className="block font-medium mb-2">Analysis Category</label>
            <div className="relative">
              <button
                className="w-full px-4 py-2 text-left bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setIsSelectOpen(!isSelectOpen)}
              >
                {analysisCategory.charAt(0).toUpperCase() + analysisCategory.slice(1)}
              </button>
              {isSelectOpen && (
                <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-10">
                  {["summary", "sentiment", "keywords", "entity-recognition"].map((category) => (
                    <button
                      key={category}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom Query */}
          <div>
            <label className="block font-medium mb-2">Custom Query (Optional)</label>
            <input
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter specific analysis question..."
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
            />
          </div>

          {/* Handle Text Input or File Upload */}
          {isTextInput ? (
            <>
              <textarea
                className="w-full min-h-[200px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste your text here"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                onClick={handleTextSubmit}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg"
                disabled={isLoading || !text.trim()}
              >
                Analyze Text
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleUploadButtonClick}
                className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4"
                disabled={isLoading || !file}
              >
                Upload and Analyze
              </button>
            </>
          )}

          {/* Displaying Analysis Results */}
          {analysisResult && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Analysis Result</h3>
              <ReactMarkdown className="prose">{analysisResult}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalyzer;
