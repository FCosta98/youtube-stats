import axios from "axios"
import React, { useEffect, useState } from 'react';
import Header from '../components/Header.js';

//chart.js import
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
import BarGraph from "../components/charts/BarGraph.js"
import DoughnutGraph from "../components/charts/DoughnutGraph.js"


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function Analytics() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [videosWatchedChartData, setVideosWatchedChartData] = useState(null)
    const [creatorWatchedChartData, setCreatorWatchedChartData] = useState(null)
    const [categoriesChartData, setCategoriesChartData] = useState(null)

    const handleFileChange = (event) => {
        console.log("FILE SELECTED :", event.target.files[0])
        setSelectedFile(event.target.files[0]);
    };

    const generateGraph = async () => {
        if (!selectedFile) {
            alert('Please select a file!');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('http://127.0.0.1:8000/generate-graph', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                console.log('File uploaded successfully!');
                setVideosWatchedChartData(response.data["videos_watched_graph"]);
                setCreatorWatchedChartData(response.data["creator_watched_graph"]);
                setCategoriesChartData(response.data["category_graph_data"]);
                return;
                // window.location.href = "/analytics"
            } else {
                console.error('Upload failed with status:', response.status);
            }
        } catch (error) {
            console.error('Error occurred during file upload:', error);
        }
    };

    return (
        <div>
            <Header />
            <h1>Drag and drop your extended-history.csv file</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={generateGraph}>Generate yours graphs</button>

            {videosWatchedChartData !== null && <BarGraph chartData={videosWatchedChartData} />}
            {creatorWatchedChartData !== null && <BarGraph chartData={creatorWatchedChartData} />}
            {categoriesChartData !== null && <DoughnutGraph chartData={categoriesChartData} />}
        </div>
    )
}