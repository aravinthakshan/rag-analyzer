import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from 'react-markdown';
import { Upload, FileText, Loader2 } from 'lucide-react';

// make sure this doesnt change 

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
  const [showWarning, setShowWarning] = useState(false);

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
      formData.append("query", customQuery.trim() || "");
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
          query: customQuery.trim() || "",
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

  function handleUploadClick() {
    if (!file) {
      setShowWarning(true);
    }
  }

  const handleCategoryChange = (category) => {
    setAnalysisCategory(category);
    setIsSelectOpen(false);
  };

  const handleCloseWarning = () => setShowWarning(false);

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

        {/* Upload Document Section */}
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

        {/* Document Upload Warning */}
        {showWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-600">
            Please upload a document before proceeding.
            <button
              onClick={handleCloseWarning}
              className="ml-4 text-blue-600 hover:text-blue-700"
            >
              Close
            </button>
          </div>
        )}

        <div className="space-y-6 mt-6">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-lg flex items-center ${
                !isTextInput
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => handleInputMethodChange("file")}
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

          <div className="space-y-4">
            {/* Analysis Category Dropdown */}
            <div className="relative">
              <label className="block font-medium mb-2">Analysis Category</label>
              <div className="relative">
                <button
                  className="w-full px-4 py-2 text-left bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setIsSelectOpen((prev) => !prev)}
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

            {/* Text Input Area */}
            {isTextInput && (
              <div>
                <label className="block font-medium mb-2">Enter Text for Analysis</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your document text here"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 rounded-lg bg-green-600 text-white"
                onClick={isTextInput ? handleTextSubmit : handleUploadClick}
              >
                Submit
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
              <ReactMarkdown>{analysisResult}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalyzer;
