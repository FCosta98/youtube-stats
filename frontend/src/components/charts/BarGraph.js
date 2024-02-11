import React, { useState, useEffect } from 'react';
import { Bar } from "react-chartjs-2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faArrowLeftLong, faArrowRightLong } from '@fortawesome/free-solid-svg-icons'
import '../../css/BarGraph.css'

const filterOptions = {
  "all_videos": ["Month", "Year"],
  "hours_watched": ["General", "Mean"],
}
const filterParams = {
  "all_videos": "by",
  "hours_watched": "isMean",
}

export default function BarGraph({ chartData, title, handleFilter, has_dropdown, graph_type, next_page, previous_page, no_pagination, handleNewPage }){
  const [chartData2, setChartData2] = useState(chartData);
  const [noPagination, setNoPagination] = useState(false);
  const filters = filterOptions[graph_type];

  const handleSelectChange = async (event) => {
    const selectedValue = event.target.value;
    if(selectedValue === "Year"){
      setNoPagination(true);
    }
    else{
      setNoPagination(false);
    }
    const type = filterParams[graph_type]
    const new_data = await handleFilter(graph_type, selectedValue, type);
    setChartData2(new_data);
  };

  useEffect(() => {
    setChartData2(chartData);
    return;
  }, [chartData]);

  return (
    <div className="main-container">
      <div className="top-container">
        <h2 style={{ textAlign: "center" }}>{title}</h2>
        {has_dropdown != null &&
          <select className="custom-dropdown" onChange={(event) => handleSelectChange(event)}>
            {filters.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        }
      </div>
      <Bar
        data={chartData2}
        options={{
          plugins: {
            title: {
              display: false,
              text: "Number of watched prout"
            },
            legend: {
              display: false
            }
          },
        }}
      />
      <div className="pagination-container">
        {no_pagination || noPagination ?
          null
        :
          <>
            <button onClick={() => handleNewPage(graph_type, previous_page)} className={previous_page ? "pagination-element pagination-element-enabled" : "pagination-element pagination-element-disabled"}><FontAwesomeIcon icon={faArrowLeftLong} /></button>
            <button onClick={() => handleNewPage(graph_type, next_page)} className={next_page ? "pagination-element pagination-element-enabled" : "pagination-element pagination-element-disabled"}><FontAwesomeIcon icon={faArrowRightLong} /></button>
          </>
        }
      </div>
    </div>
  );
};