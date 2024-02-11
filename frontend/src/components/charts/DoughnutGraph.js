import { Doughnut } from "react-chartjs-2";
import '../../css/BarGraph.css'

export default function DoughnutGraph({ chartData, title}){



 
  return (
    <div className="main-container">
      <h2 style={{ textAlign: "center" }}>{title}</h2>
      <Doughnut
        data={chartData}
        options={{
          plugins: {
            title: {
              display: false,
              text: "Categories proportion"
            },
            legend: {
              display: false,
              // maxHeight: 30
            }
          }
        }}
      />
    </div>
  );
};