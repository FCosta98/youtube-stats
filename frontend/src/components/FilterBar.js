import React, { useState } from 'react';

import '../css/FilterBar.css';

const filterOptions = {
    "time": ["ALL", "1min", "3min", "10min", "20min"],
    "categories_filter": [
        "ALL",
        "Film & Animation",
        "Autos & Vehicles",
        "Music",
        "Pets & Animals",
        "Sports",
        "Short Movies",
        "Travel & Events",
        "Gaming",
        "Videoblogging",
        "People & Blogs",
        "Comedy",
        "Entertainment",
        "News & Politics",
        "How to & Style",
        "Education",
        "Science & Technology",
        "Nonprofits & Activism",
        "Movies",
        "Anime/Animation",
        "Action/Adventure",
        "Classics",
        "Comedy",
        "Documentary",
        "Drama",
        "Family",
        "Foreign",
        "Horror",
        "Sci-Fi/Fantasy",
        "Thriller",
        "Shorts",
        "Shows",
        "Trailers"
    ],
}

export default function FilterBar({ handleFilter }) {

    const handleSelectChange = async (event, type) => {
        const selectedValue = event.target.value;
        const new_data = await handleFilter(selectedValue, type);
        return;
    };

    return (
        <div className="filter-container">
            <div className="filter-section">
                <h3>Max Time:</h3>
                <select className="custom-dropdown" onChange={(event) => handleSelectChange(event, "max_time")}>
                    {filterOptions["time"].map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
            <div className="filter-section">
            <h3>Min Time:</h3>
                <select className="custom-dropdown" onChange={(event) => handleSelectChange(event, "min_time")}>
                    {filterOptions["time"].map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
            <div className="filter-section">
            <h3>Category:</h3>
                <select className="custom-dropdown" onChange={(event) => handleSelectChange(event, "categories_filter")}>
                    {filterOptions["categories_filter"].map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}