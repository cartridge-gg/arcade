import { useState } from "react";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Tooltip,
//   Filler,
//   ChartOptions,
//   ChartDataset,
//   TooltipItem,
// } from "chart.js";
// import { Line } from "react-chartjs-2";
import { cn } from "@cartridge/ui-next";
// import { useTheme } from "@/hooks/context";
import { useMetrics } from "@/hooks/metrics";
import { simulateData, ZoomableChart } from "./charts";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Tooltip,
//   Filler,
// );

export interface MetricsProps {
  txsCount: number;
  playerCount: number;
}

export function Metrics({ txsCount, playerCount }: MetricsProps) {
  // const { theme } = useTheme();
  const { isLoading, isError } = useMetrics("dopewarsbal");

  const [activeTab, setActiveTab] = useState<"txs" | "players">("txs");

  // const chartData = useMemo(() => {
  //   const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  //   const datasets: ChartDataset<"line", unknown>[] = [
  //     {
  //       fill: true,
  //       label: "Daily Transactions",
  //       data: [50, 200, 210, 120, 30, 60, 350],
  //       borderColor: "#2A2F2A",
  //       backgroundColor: "#212621",
  //       borderDash: [5, 5],
  //       borderWidth: 1,
  //       pointBorderColor: function () {
  //         return `${theme?.colors?.primary}` || "#fbcb4a";
  //       },
  //       pointBackgroundColor: "#242824",
  //       pointBorderWidth: 1,
  //       pointRadius: 4,
  //       tension: 0.4,
  //     },
  //   ];
  //   return { labels, datasets };
  // }, [theme]);


  // const data = useMemo(() => {
  //   const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  //   const datasets: ChartDataset<"line", unknown>[] = [
  //     {
  //       fill: true,
  //       label: "Daily Transactions",
  //       data: [50, 200, 210, 120, 30, 60, 350],
  //       borderColor: "#2A2F2A",
  //       backgroundColor: "#212621",
  //       borderDash: [5, 5],
  //       borderWidth: 1,
  //       pointBorderColor: function () {
  //         return `${theme?.colors?.primary}` || "#fbcb4a";
  //       },
  //       pointBackgroundColor: "#242824",
  //       pointBorderWidth: 1,
  //       pointRadius: 4,
  //       tension: 0.4,
  //     },
  //   ];
  //   return { labels, datasets };
  // }, [theme]);

  // const options: ChartOptions<"line"> = useMemo(() => {
  //   return {
  //     responsive: true,
  //     interaction: {
  //       intersect: false,
  //       mode: "index",
  //     },
  //     plugins: {
  //       tooltip: {
  //         backgroundColor: "transparent",
  //         borderWidth: 1,
  //         borderColor: `${theme?.colors?.primary}` || "#fbcb4a",
  //         cornerRadius: 12,
  //         caretSize: 0,
  //         displayColors: false,
  //         bodyFont: {
  //           size: 12,
  //         },
  //         padding: {
  //           top: 4,
  //           bottom: 4,
  //           left: 8,
  //           right: 8,
  //         },
  //         margin: 8,
  //         bodyColor: `${theme?.colors?.primary}` || "#fbcb4a",
  //         callbacks: {
  //           title: () => "",
  //           label: (context: TooltipItem<"line">) => {
  //             const y = context.parsed.y;
  //             return `${y}`;
  //           },
  //         },
  //         xAlign: "center",
  //         yAlign: "bottom",
  //         caretPadding: 12,
  //       },
  //     },
  //     scales: {
  //       x: {
  //         grid: {
  //           display: false,
  //         },
  //       },
  //       y: {
  //         border: {
  //           display: false,
  //         },
  //         ticks: {
  //           stepSize: 200,
  //         },
  //         grid: {
  //           display: true,
  //           drawOnChartArea: true,
  //           color: "#252825",
  //         },
  //       },
  //     },
  //   };
  // }, [theme]);

  return (
    <div className="flex flex-col gap-2">
      <div className="h-10 flex items-center justify-between">
        <p className="text-xs tracking-wider font-semibold text-foreground-400">
          Metrics
        </p>
      </div>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex gap-4 w-full">
          <Tab
            label="Daily Transactions"
            value={txsCount.toLocaleString()}
            active={activeTab === "txs"}
            onClick={() => setActiveTab("txs")}
          />
          <Tab
            label="Daily Active Players"
            value={playerCount.toLocaleString()}
            active={activeTab === "players"}
            onClick={() => setActiveTab("players")}
          />
        </div>
        {
          isLoading && (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-foreground-400">Loading...</p>
            </div>
          )
        }
        {
          isError && (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-red-500">Error loading metrics</p>
            </div>
          )
        }
        {/* { */}
        {/*   metrics && ( */}
        {/*     <div className="flex items-center justify-center h-64"> */}
        {/*       <p className="text-sm text-foreground-400">Metrics loaded successfully</p> */}
        {/*       <p className="text-sm text-foreground-400">{JSON.stringify(metrics, undefined, 2)}</p> */}
        {/*     </div> */}
        {/*   ) */}
        {/* } */}
        <div className="bg-background-200 rounded p-4">
          {/* <Line data={chartData} options={options} /> */}
          <ZoomableChart data={simulateData()} />
        </div>
      </div>
    </div>
  );
}

function Tab({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      data-active={active}
      className={cn(
        "grow px-6 py-4 flex flex-col gap-2 border border-transparent border-b-background-200 bg-background-100 cursor-pointer transition-all duration-300",
        "hover:bg-background-125 hover:border-b-background-300",
        "data-[active=true]:rounded data-[active=true]:border-primary data-[active=true]:bg-background-150",
        "data-[active=true]:hover:bg-background-200",
      )}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <p className="text-xl font-light text-foreground-100 font-mono">
        {value}
      </p>
      <p
        className={cn(
          "text-sm text-foreground-300 transition-all duration-300",
          !hover && !active && "text-foreground-400",
        )}
      >
        {label}
      </p>
    </div>
  );
}

export default Metrics;
