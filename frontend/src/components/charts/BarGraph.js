import React, { useState, useEffect } from 'react';
import { Bar } from "react-chartjs-2";
import '../../css/BarGraph.css'

const filterOptions = {
  "all_videos": ['Month', 'Year'],
  "": []
}

export default function BarGraph({ chartData, title, handleFilter, graph_type }){
  const [chartData2, setChartData2] = useState(chartData);
  const filters = filterOptions[graph_type];

  const handleSelectChange = async (event) => {
    const selectedValue = event.target.value;
    const additionalParams = {
      "by": selectedValue,
    };
    const new_data = await handleFilter(graph_type, additionalParams);
    setChartData2(new_data);
  };

  useEffect(() => {
    setChartData2(chartData);
  }, [chartData]);

  return (
    <div className="main-container">
      <div className="top-container">
        <h2 style={{ textAlign: "center" }}>{title}</h2>
        {graph_type != null &&
          <select className="custom-dropdown" onChange={handleSelectChange}>
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
          }
        }}
      />
    </div>
  );
};