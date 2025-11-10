import React, { useState, useRef } from "react";
import "./DiseaseDetection.css";

const DiseaseDetection = ({ selectedPlant, onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // FastAPI backend URL
  const API_BASE_URL = "http://localhost:3000";

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("Image size should be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
      setError("");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size should be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
      setError("");
    }
  };

  // ✅ PLACE THE API CALL HERE - This is the main analyze function
  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("plant_type", selectedPlant);

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Analysis failed:", error);
      setError(error.message || "Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setResults(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="detection-container">
      <header className="detection-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Plants
        </button>
        <h1>Analyze {selectedPlant}</h1>
        <p>
          Upload an image to detect diseases and get treatment recommendations
        </p>
      </header>

      {error && <div className="error-message">⚠️ {error}</div>}

      <div className="upload-section">
        {!results ? (
          <>
            <div
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">📷</div>
              <p className="upload-text">
                Drag & drop your {selectedPlant} image here or click to browse
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: "none" }}
              />
              <button className="upload-btn">Choose Image</button>
              {selectedFile && (
                <p className="selected-file">Selected: {selectedFile.name}</p>
              )}
            </div>

            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}

            {/* ✅ This button triggers the API call */}
            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div className="loading-spinner"></div>
                  Analyzing...
                </>
              ) : (
                "Analyze Plant"
              )}
            </button>
          </>
        ) : (
          <div className="results-section">
            <h2>Analysis Results</h2>
            <div className="results-grid">
              <div className="result-card disease-card">
                <h3>🌱 Plant Information</h3>
                <p>
                  <strong>Type:</strong> {selectedPlant}
                </p>
                <p>
                  <strong>Disease Detected:</strong>{" "}
                  {results.disease || "No disease detected"}
                </p>
                {results.confidence && (
                  <div className="confidence">
                    Confidence: {results.confidence}
                  </div>
                )}
              </div>

              <div className="result-card treatment-card">
                <h3>💊 Recommended Treatment</h3>
                {/* ✅ Display treatments as list */}
                {results.treatments && Array.isArray(results.treatments) ? (
                  <ul style={{ paddingLeft: "20px", margin: "10px 0" }}>
                    {results.treatments.map((treatment, index) => (
                      <li
                        key={index}
                        style={{ marginBottom: "8px", lineHeight: "1.5" }}
                      >
                        {treatment}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    {results.treatments ||
                      "No specific treatment information available."}
                  </p>
                )}
              </div>

              {results.additional_info && (
                <div className="result-card info-card">
                  <h3>📋 Additional Information</h3>
                  <p>{results.additional_info}</p>
                </div>
              )}
            </div>

            <div className="action-buttons">
              <button className="analyze-btn" onClick={handleNewAnalysis}>
                Analyze Another Image
              </button>
              <button className="back-button" onClick={onBack}>
                Back to Plant Selection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseDetection;
