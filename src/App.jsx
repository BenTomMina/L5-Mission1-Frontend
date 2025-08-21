// Imports
import { useState } from "react";
import "./App.css";

// Get the API_HOST from the .env file
const API_HOST = import.meta.env.VITE_API_HOST;
console.log("API_HOST:", API_HOST);

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function uploaded an image file
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  // Function to run the prediction for the uploaded image - will not run if no image uploaded
  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select an image first!");

    const formData = new FormData();
    formData.append("image", selectedFile);

    setLoading(true);
    setResult(null);

    // Fetching data from the Prediction API
    try {
      const response = await fetch(`${API_HOST}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data); //Updating JSON file for prediction results
    } catch (err) {
      console.error(err);
      alert("Error uploading image.");
    } finally {
      setLoading(false);
    }
  };

  // Finding the highest probability prediction
  const getTopPrediction = () => {
    if (
      !result?.predictions ||
      !Array.isArray(result.predictions) ||
      result.predictions.length === 0
    )
      return null;
    return result.predictions.reduce((prev, current) =>
      prev.probability > current.probability ? prev : current
    );
  };

  const topPrediction = getTopPrediction();

  return (
    <>
      <div className="mainWindow">
        <h1>Car Image Predictor</h1>

        {/* Input to upload image */}
        <input type="file" accept="image/*" onChange={handleFileChange} />

        {/* Starts blank. Image appears once uploaded */}
        {preview && (
          <div className="imageContainer">
            <img className="image" src={preview} alt="Car Image" />
          </div>
        )}

        {/* Does prediction once image is uploaded */}
        <button className="button" onClick={handleUpload}>
          {loading ? "Predicting..." : "Predict Image"}
        </button>

        {/* Initially blank. Shows Prediction Results once an image has been processed */}
        {result?.predictions && result?.predictions?.length > 0 && (
          <div className="results">
            <h3>Prediction Result</h3>
            {topPrediction && (
              <p>
                <strong>Car Type: </strong> {topPrediction.tagName} (
                {(topPrediction.probability * 100).toFixed(2)}%)
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
