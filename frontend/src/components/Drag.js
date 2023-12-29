import React, { useState } from 'react';
import axios from 'axios';

const Drag = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFile2, setSelectedFile2] = useState(null);

    const handleFileChange = (event) => {
        console.log("FILE SELECTED :", event.target.files[0])
        setSelectedFile(event.target.files[0]);
    };

    const handleFileChange2 = (event) => {
        console.log("FILE SELECTED :", event.target.files[0])
        setSelectedFile2(event.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file!');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('http://127.0.0.1:8000/upload-history', formData, {
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
            } else {
                console.error('Upload failed with status:', response.status);
            }
        } catch (error) {
            // Handle network errors or other exceptions
            console.error('Error occurred during file upload:', error);
        }
    };

    const generateGraph = async () => {
        if (!selectedFile2) {
            alert('Please select a file!');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile2);

        try {
            const response = await axios.post('http://127.0.0.1:8000/generate-graph', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                // Handle success response from backend
                console.log('File uploaded successfully!');
            } else {
                console.error('Upload failed with status:', response.status);
            }
        } catch (error) {
            console.error('Error occurred during file upload:', error);
        }
    };

    return (
        <div>
            <h1>Drag and drop your JSON history file</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleFileUpload}>Upload</button>
            <h1>Drag and drop your extended-history.csv file</h1>
            <input type="file" onChange={handleFileChange2} />
            <button onClick={generateGraph}>Generate yours graphs</button>
        </div>
    );
};

export default Drag;