
import './App.css';
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [format, setFormat] = useState('jpeg');
  const [watermark, setWatermark] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('width', width);
    formData.append('height', height);
    formData.append('format', format);
    formData.append('watermarkText', watermark);

    try {
      const response = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(response.data.url);
    } catch (error) {
      console.error('Error uploading image', error);
    }
  };

  return (
    <div className="App">
      <h2>Image Uploader</h2>
      <input type="file" onChange={handleFileChange} />
      <input type="number" placeholder="Width" value={width} onChange={(e) => setWidth(e.target.value)} />
      <input type="number" placeholder="Height" value={height} onChange={(e) => setHeight(e.target.value)} />
      <select value={format} onChange={(e) => setFormat(e.target.value)}>
        <option value="jpeg">JPEG</option>
        <option value="png">PNG</option>
      </select>
      <input type="text" placeholder="Watermark Text" value={watermark} onChange={(e) => setWatermark(e.target.value)} />
      <button onClick={handleUpload}>Upload & Resize</button>
      {imageUrl && (
        <div>
          <h3>Resized Image</h3>
          <img src={imageUrl} alt="Resized" />
          <a href={imageUrl} download>
            Download Image
          </a>
        </div>
      )}
    </div>
  );

}

export default App;
