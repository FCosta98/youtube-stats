import { Doughnut } from "react-chartjs-2";

export default function DoughnutGraph({ chartData }){
  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Categories proportion</h2>
      <Doughnut
        data={chartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Categories proportion"
            },
            legend: {
              display: true
            }
          }
        }}
      />
    </div>
  );
};