import React, { useState } from 'react';
import Multiselect from 'multiselect-react-dropdown';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

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

export default function FilterBar({ handleFilter, searchCreator, multiselectRef}) {
    const [creatorList, setCreatorList] = useState([]);
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    const handleSelectChange = async (event, type) => {
        let selectedValue;
        if(type=="date_range"){
            selectedValue = event;
        }
        else{
            selectedValue = event.target.value;
        }
        const new_data = await handleFilter(selectedValue, type);
        return;
    };

    const showSuggestions = async (event) => {
        const searchTxt = event;
        if(event == ""){
            setCreatorList([]);
            return;
        }
        const new_data = await searchCreator(searchTxt);
        setCreatorList(new_data);
        return;
    };

    const onSelect = async (event) => {
        const selectedValue = event.join(",")
        const new_data = await handleFilter(selectedValue, "creator_filter");
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
            <div className="filter-section">
                <h3>Creator:</h3>
                <Multiselect
                    ref={multiselectRef}
                    options={creatorList} // Options to display in the dropdown
                    isObject={false}
                    onSearch={showSuggestions}
                    onSelect={onSelect} // Function will trigger on select event
                    onRemove={onSelect} // Function will trigger on remove event
                />
            </div>
            <div className="filter-section">
                <h3>Date:</h3>
                <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    dateFormat="dd/MM/yyyy"
                    onChange={(newRange) => {
                        setDateRange(newRange);

                        // Format the dates to [YYYY-MM-DD, YYYY-MM-DD]
                        const formattedRange = newRange.map(date =>
                            date ? format(date, 'yyyy-MM-dd') : null
                        );
                        handleSelectChange(formattedRange, "date_range");
                    }}
                />
            </div>
        </div>
    );
}