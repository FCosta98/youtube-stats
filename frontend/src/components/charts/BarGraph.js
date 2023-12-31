import { Bar } from "react-chartjs-2";

export default function BarGraph({ chartData }){
  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Number of watched videos</h2>
      <Bar
        data={chartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Number of watched videos"
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