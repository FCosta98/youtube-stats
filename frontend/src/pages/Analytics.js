import axios from "axios"
import React, { useState, useEffect } from 'react';
import Header from '../components/Header.js';

import '../css/Analytics.css'

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
import FilterBar from "../components/FilterBar.js";


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

    const [filters, setFilters] = useState({
        "max_time": "ALL",
        "min_time": "ALL",
        "categories_filter": "ALL",
        "by": "Month",
    });

    const handleFileChange = (event) => {
        console.log("FILE SELECTED :", event.target.files[0])
        setSelectedFile(event.target.files[0]);
    };

    const generateGraph = async () => {
        if (!selectedFile) {
            alert('Please select a file!');
            return;
        }

        setFilters({
            "max_time": "ALL",
            "min_time": "ALL",
            "categories_filter": "ALL",
            "by": "Month",
        });

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('http://127.0.0.1:8000/v1/analytics/generate-graph', formData, {
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
            } else {
                console.error('Upload failed with status:', response.status);
            }
        } catch (error) {
            console.error('Error occurred during file upload:', error);
        }
    };

    // async function get_data_from_filter(graph_type, filters = {}){
    async function get_data_from_filter(graph_type, new_value, type){
        if (!selectedFile) {
            alert('Please select a file!');
            return;
        }

        const additionalParams = filters;
        additionalParams[type] = new_value;
        setFilters(additionalParams);

        const formData = new FormData();
        formData.append('file', selectedFile);

        const url = new URL('http://127.0.0.1:8000/v1/analytics/' + graph_type);

        // Append additional parameters to the URL
        Object.keys(additionalParams).forEach(key => {
            url.searchParams.append(key, additionalParams[key]);
        });

        try {
            const response = await axios.post(url.toString(), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                console.log('File Filtered successfully!');
                return response.data["filtered_data"];
            } else {
                console.error('Upload failed with status:', response.status);
            }
        } catch (error) {
            console.error('Error occurred during file upload:', error);
        }
    }

    async function update_data_filter_bar(new_value, type){
        if (!selectedFile) {
            alert('Please select a file!');
            return;
        }

        const additionalParams = filters;
        additionalParams[type] = new_value;
        setFilters(additionalParams);

        const formData = new FormData();
        formData.append('file', selectedFile);

        const url = new URL('http://127.0.0.1:8000/v1/analytics/filters');

        // Append additional parameters to the URL
        Object.keys(additionalParams).forEach(key => {
            url.searchParams.append(key, additionalParams[key]);
        });

        try {
            const response = await axios.post(url.toString(), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                console.log('File FILTERED successfully!');
                setVideosWatchedChartData(response.data["videos_watched_graph"]);
                setCreatorWatchedChartData(response.data["creator_watched_graph"]);
                setCategoriesChartData(response.data["category_graph_data"]);
                return;
            } else {
                console.error('Upload failed with status:', response.status);
            }
        } catch (error) {
            console.error('Error occurred during file upload:', error);
        }
    }

    return (
        <div className="page-container">
            <Header />
            <div className="upload-section">
                <h1 className="upload-section-title">Drag and drop your extended-history.csv file</h1>
                <input type="file" onChange={handleFileChange} />
                <button className="upload-btn" onClick={generateGraph}>Generate yours graphs</button>
            </div>
            <FilterBar handleFilter={update_data_filter_bar} />
            <div className="graph-container">
                {videosWatchedChartData !== null && <BarGraph chartData={videosWatchedChartData} title={"Total of watched videos"} graph_type={"all_videos"} handleFilter={get_data_from_filter}/>}
                {creatorWatchedChartData !== null && <BarGraph chartData={creatorWatchedChartData} title={"Total of creator watched"} />}
            </div>
            <div className="graph-container">
                {categoriesChartData !== null && <DoughnutGraph chartData={categoriesChartData} title={"Proportion of category watched"} />}
            </div>
        </div>
    )
}