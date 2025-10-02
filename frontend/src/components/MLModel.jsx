import React, { useState } from "react";
import PlantSelection from "./PlantSelection";
import DiseaseDetection from "./DiseaseDetection";
import "./MLModel.css";

function MLModel() {
  const [currentPage, setCurrentPage] = useState("selection");
  const [selectedPlant, setSelectedPlant] = useState("");

  const handlePlantSelect = (plant) => {
    setSelectedPlant(plant);
    setCurrentPage("detection");
  };

  const handleBackToSelection = () => {
    setSelectedPlant("");
    setCurrentPage("selection");
  };

  return (
    <div className="MLModel">
      {currentPage === "selection" && (
        <PlantSelection onPlantSelect={handlePlantSelect} />
      )}
      {currentPage === "detection" && (
        <DiseaseDetection
          selectedPlant={selectedPlant}
          onBack={handleBackToSelection}
        />
      )}
    </div>
  );
}

export default MLModel;
