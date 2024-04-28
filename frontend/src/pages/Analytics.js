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
    const [hoursWatchedChartData, setHoursWatchedChartData] = useState(null)
    const [favouriteVideosChartData, setFavouriteVideosChartData] = useState(null)

    const [filters, setFilters] = useState({
        "max_time": "ALL",
        "min_time": "ALL",
        "categories_filter": "ALL",
        "by": "Month",
        "isMean": "General",
        "creator_filter": "",
    });
    const [pagination, setPagination] = useState({
        "next_year": null,
        "current_year": null,
        "prev_year": null,
        "next_top_creator_page": 2,
        "prev_top_creator_page": null,
        "next_top_videos_page": 2,
        "prev_top_videos_page": null,
    });

    const handleFileChange = (event) => {
        console.log("FILE SELECTED :", event.target.files[0])
        setSelectedFile(event.target.files[0]);
    };

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

        if(graph_type==="all_videos"){
            url.searchParams.append("year", pagination["current_year"]);
        }

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

    async function update_data_filter_bar(new_value, type, reset=false){
        if (!selectedFile) {
            alert('Please select a file!');
            return;
        }

        let additionalParams = filters;
        if(reset){
            additionalParams = {
                "max_time": "ALL",
                "min_time": "ALL",
                "categories_filter": "ALL",
                "by": "Month",
                "isMean": "General",
                "creator_filter": "",
            };
            // //reset the select item
            var selects = document.querySelectorAll('select'); // Select all <select> elements
            selects.forEach(function(select) {
                select.selectedIndex = 0; // Set selectedIndex to 0 for each <select>
            });
        }
        else{
            additionalParams[type] = new_value;
        }
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
                setHoursWatchedChartData(response.data["hours_watched_graph_data"]);
                setFavouriteVideosChartData(response.data["favourites_videos_graph_data"]);

                pagination["current_year"] = response.data["current_year"];
                pagination["next_year"] = response.data["next_year"];
                pagination["prev_year"] = response.data["prev_year"];
                pagination["next_top_creator_page"] = 2;
                pagination["prev_top_creator_page"] = null;
                pagination["next_top_videos_page"] = 2;
                pagination["prev_top_videos_page"] = null;
                setPagination(pagination);
                return;
            } else {
                console.error('Upload failed with status:', response.status);
            }
        } catch (error) {
            console.error('Error occurred during file upload:', error);
        }
    }

    function update_pagination(graph_type, data){
        if(graph_type==="all_videos"){
            setVideosWatchedChartData(data["data_graph"]);
            pagination["current_year"] = data["current_year"];
            pagination["next_year"] = data["next_year"];
            pagination["prev_year"] = data["prev_year"];
            setPagination(pagination);
        }
        else if(graph_type==="favourite_creators"){
            setCreatorWatchedChartData(data["data_graph"]);
            pagination["next_top_creator_page"] = data["next_top_creator_page"];
            pagination["prev_top_creator_page"] = data["prev_top_creator_page"];
            setPagination(pagination);
        }
        else{
            setFavouriteVideosChartData(data["data_graph"]);
            pagination["next_top_videos_page"] = data["next_top_videos_page"];
            pagination["prev_top_videos_page"] = data["prev_top_videos_page"];
            setPagination(pagination);
        }
    }

    async function get_new_page(graph_type, page){
        if (!selectedFile) {
            alert('Please select a file!');
            return;
        }

        const additionalParams = filters;

        const formData = new FormData();
        formData.append('file', selectedFile);

        const url = new URL('http://127.0.0.1:8000/v1/analytics/pagination');

        // Append additional parameters to the URL
        Object.keys(additionalParams).forEach(key => {
            url.searchParams.append(key, additionalParams[key]);
        });
        url.searchParams.append("page", page);
        url.searchParams.append("graph_type", graph_type);

        try {
            const response = await axios.post(url.toString(), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                console.log('File PAGINATED successfully!', response.data);
                update_pagination(graph_type, response.data);
                return;
            } else {
                console.error('Upload failed with status:', response.status);
            }
        } catch (error) {
            console.error('Error occurred during file upload:', error);
        }
    }

    async function show_suggestions(creator) {
        if (!selectedFile) {
            alert('Please select a file!');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        const url = new URL('http://127.0.0.1:8000/v1/analytics/search_creator');
        url.searchParams.append("creator", creator);

        try {
            const response = await axios.post(url.toString(), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                console.log('File CREATOR LIST successfully!', response.data);
                return response.data;
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
                <button className="upload-btn" onClick={() => update_data_filter_bar("","",true)}>Generate yours graphs</button>
            </div>
            <FilterBar handleFilter={update_data_filter_bar} searchCreator={show_suggestions} />
            <div className="graph-container">
                {videosWatchedChartData !== null && <BarGraph chartData={videosWatchedChartData} title={"Total of watched videos"} has_dropdown={true} graph_type={"all_videos"} handleFilter={get_data_from_filter} next_page={pagination["next_year"]} previous_page={pagination["prev_year"]} handleNewPage={get_new_page}/>}
                {creatorWatchedChartData !== null && <BarGraph chartData={creatorWatchedChartData} title={"Most watched creators"} graph_type={"favourite_creators"} next_page={pagination["next_top_creator_page"]} previous_page={pagination["prev_top_creator_page"]} handleNewPage={get_new_page}/>}
            </div>
            <div className="graph-container">
                {favouriteVideosChartData !== null && <BarGraph chartData={favouriteVideosChartData} title={"Most watched videos"} graph_type={"favourite_videos"} next_page={pagination["next_top_videos_page"]} previous_page={pagination["prev_top_videos_page"]} handleNewPage={get_new_page}/>}
                {hoursWatchedChartData !== null && <BarGraph chartData={hoursWatchedChartData} title={"When do you watch your videos ?"} has_dropdown={true} graph_type={"hours_watched"} handleFilter={get_data_from_filter} no_pagination={true}/>}
            </div>
            <div className="graph-container">
                {categoriesChartData !== null && <DoughnutGraph chartData={categoriesChartData} title={"Proportion of category watched"} />}
            </div>
        </div>
    )
}