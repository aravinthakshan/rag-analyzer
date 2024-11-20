import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from 'react-markdown';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import Layout from './Layout';

const BACKEND_URL = "http://localhost:8000";

const DocumentAnalyzer = () => {
  const [files, setFiles] = useState([]);
  const [text, setText] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [analysisCategory, setAnalysisCategory] = useState("summary");
  const [isTextInput, setIsTextInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: true
  });

  async function handleFileDrop(acceptedFiles) {
    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);
  }

  const removeFile = (fileToRemove) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  async function handleAnalysis() {
    try {
      setIsLoading(true);
      setError("");

      const formData = new FormData();
      files.forEach(file => formData.append("files", file));
      formData.append("query", customQuery.trim() || "Analyze these documents comprehensively");
      formData.append("category", analysisCategory);

      const response = await fetch(`${BACKEND_URL}/analyze_multiple`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysisResult(data.result);
    } catch (error) {
      setError(`Error analyzing documents: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="space-y-6">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-lg flex items-center ${
                !isTextInput 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-700 text-gray-300"
              }`}
              onClick={() => setIsTextInput(false)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </button>
            <button
              className={`px-4 py-2 rounded-lg flex items-center ${
                isTextInput 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-700 text-gray-300"
              }`}
              onClick={() => setIsTextInput(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Enter Text
            </button>
          </div>

          {!isTextInput ? (
            <div
              {...getRootProps()}
              className="border-2 border-dashed rounded-lg p-8 text-center transition-colors border-gray-600 hover:border-blue-500 cursor-pointer"
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2 text-gray-300">Drop your files here, or click to select</p>
              <p className="text-sm text-gray-500">
                Supported formats: PDF, DOCX, TXT
              </p>
            </div>
          ) : (
            <textarea
              className="w-full min-h-[200px] px-4 py-2 bg-gray-700 text-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your text here"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}

          {files.length > 0 && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-gray-100">Uploaded Files</h3>
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-600 text-gray-100 px-3 py-1 rounded-full flex items-center space-x-2"
                  >
                    <span>{file.name}</span>
                    <button 
                      onClick={() => removeFile(file)}
                      className="text-gray-300 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2 text-gray-300">Analysis Category</label>
              <select
                className="w-full px-4 py-2 bg-gray-700 text-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={analysisCategory}
                onChange={(e) => setAnalysisCategory(e.target.value)}
              >
                {["summary", "sentiment", "keywords", "entity-recognition"].map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2 text-gray-300">Custom Query (Optional)</label>
              <input
                className="w-full px-4 py-2 bg-gray-700 text-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter specific analysis question..."
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
              />
            </div>

            <button
              onClick={handleAnalysis}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              disabled={isLoading || (files.length === 0 && !text.trim())}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </div>
              ) : (
                "Analyze"
              )}
            </button>

            {analysisResult && (
              <div className="mt-6 bg-gray-700 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-100">Analysis Result</h3>
                <ReactMarkdown className="prose prose-invert">{analysisResult}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentAnalyzer;