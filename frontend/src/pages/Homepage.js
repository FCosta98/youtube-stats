import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header.js';

import '../css/Homepage.css'
import '../css/Global.css'

const Homepage = () => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        console.log("FILE SELECTED :", event.target.files[0])
        setSelectedFile(event.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file!');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('http://127.0.0.1:8000/v1/complete-history', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                responseType: 'blob',
            });

            if (response.status === 200) {
                // Handle success response from backend
                console.log('File uploaded successfully!');
                // Create a blob object from the response data
                const blob = new Blob([response.data], { type: 'text/csv' });

                // Create a temporary URL for the blob
                const url = window.URL.createObjectURL(blob);

                // Create a link element
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'watch-history-extended.csv');
                document.body.appendChild(link);

                // Simulate a click to trigger the download
                link.click();

                // Remove the link after download
                document.body.removeChild(link);
                return;
            } else {
                console.error('Upload failed with status:', response.status);
            }
        } catch (error) {
            // Handle network errors or other exceptions
            console.error('Error occurred during file upload:', error);
        }
    };

    return (
        <div className='main-pages'>
            <Header />
            <div className="main-content">
                <h1>Get your YouTube analytics in 3 steps :</h1>
                <div className='content'>
                    <div className='step-section'>
                        <h2 className="step-section-title">1) Get your history from Google</h2>
                        <p>Get your youtube history from google takeout. <br/> Be sure to select the JSON format before downloading your youtube history</p>
                        <a className='step-section-cta' href='https://takeout.google.com/settings/takeout/custom/youtube?dest=email' target="_blank">Get your data</a>
                    </div>
                    <div className='step-section'>
                        <h2 className="step-section-title">2) Upload your watch-history.json file</h2>
                        <p>Normally you just get a file watch-history.json, we will complete this file with a lot of differents data in the file watch_history_extended.csv </p>
                        <input type="file" onChange={handleFileChange} />
                        <button onClick={handleFileUpload}>Upload</button>
                    </div>
                    <div className='step-section'>
                        <h2 className="step-section-title">3) See yours statistics</h2>
                        <p>Upload your watch_history_extended.csv file in the analytics section and have fun! </p>
                        <Link className='step-section-cta' to="/analytics"> Analytics</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Homepage;