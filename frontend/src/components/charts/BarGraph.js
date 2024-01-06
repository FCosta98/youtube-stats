import { Bar } from "react-chartjs-2";
import '../../css/BarGraph.css'

export default function BarGraph({ chartData, title }){
  return (
    <div className="main-container">
      <h2 style={{ textAlign: "center" }}>{title}</h2>
      <Bar
        data={chartData}
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