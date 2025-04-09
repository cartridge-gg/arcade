import { useMemo, useState } from "react";
import { cn } from "@cartridge/ui-next";
import { useMetrics } from "@/hooks/metrics";
import { useTheme } from "@/hooks/context";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  ChartOptions,
  ChartDataset,
  TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  zoomPlugin,
);

export interface MetricsProps {
  txsCount: number;
  playerCount: number;
}

export function Metrics() {
  const { theme } = useTheme();
  const { data, isLoading, isError } = useMetrics("dopewarsbal");

  const [activeTab, setActiveTab] = useState<"txs" | "players">("txs");

  const avgDailyTxs = useMemo(() => {
    let totalTxs = 0;
    let weekCount = 0;

    // Group data by week
    const weeklyData = new Map();
    
    // Get today's date
    const today = new Date();
    
    // Process all data points
    data.forEach((item) => {
      item.metrics.forEach((metric) => {
        const date = new Date(metric.transactionDate);
        
        // Calculate week number (0-6, where 0 is the current week)
        const weekDiff = Math.floor((today.getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        // Only include data from the last 7 weeks
        if (weekDiff >= 0 && weekDiff < 7) {
          const weekKey = weekDiff;
          
          if (!weeklyData.has(weekKey)) {
            weeklyData.set(weekKey, {
              transactionCount: 0,
              callerCount: 0
            });
            weekCount++;
          }
          
          const weekData = weeklyData.get(weekKey);
          weekData.transactionCount += metric.transactionCount;
          weekData.callerCount += metric.callerCount;
        }
      });
    });

    // Sum up weekly transaction counts
    weeklyData.forEach(weekData => {
      totalTxs += weekData.transactionCount;
    });

    return weekCount > 0 ? totalTxs / weekCount : 0;
  }, [data]);

  const avgDailyPlayers = useMemo(() => {
    let totalPlayers = 0;
    let weekCount = 0;

    // Group data by week
    const weeklyData = new Map();
    
    // Get today's date
    const today = new Date();
    
    // Process all data points
    data.forEach((item) => {
      item.metrics.forEach((metric) => {
        const date = new Date(metric.transactionDate);
        
        // Calculate week number (0-6, where 0 is the current week)
        const weekDiff = Math.floor((today.getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        // Only include data from the last 7 weeks
        if (weekDiff >= 0 && weekDiff < 7) {
          const weekKey = weekDiff;
          
          if (!weeklyData.has(weekKey)) {
            weeklyData.set(weekKey, {
              transactionCount: 0,
              callerCount: 0
            });
            weekCount++;
          }
          
          const weekData = weeklyData.get(weekKey);
          weekData.transactionCount += metric.transactionCount;
          weekData.callerCount += metric.callerCount;
        }
      });
    });

    // Sum up weekly player counts
    weeklyData.forEach(weekData => {
      totalPlayers += weekData.callerCount;
    });

    return weekCount > 0 ? totalPlayers / weekCount : 0;
  }, [data]);

  const chartData = useMemo(() => {
    // Group data by week
    const weeklyData = new Map();
    
    // Get today's date
    const today = new Date();
    
    // Process all data points
    data.forEach((item) => {
      item.metrics.forEach((metric) => {
        const date = new Date(metric.transactionDate);
        
        // Calculate week number (0-6, where 0 is the current week)
        const weekDiff = Math.floor((today.getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        // Only include data from the last 7 weeks
        if (weekDiff >= 0 && weekDiff < 7) {
          const weekKey = weekDiff;
          
          if (!weeklyData.has(weekKey)) {
            weeklyData.set(weekKey, {
              transactionCount: 0,
              callerCount: 0,
              date: date
            });
          }
          
          const weekData = weeklyData.get(weekKey);
          weekData.transactionCount += metric.transactionCount;
          weekData.callerCount += metric.callerCount;
        }
      });
    });
    
    // Convert to arrays for chart
    const weekLabels = [];
    const counts = [];
    
    // Process weeks in reverse order (most recent first)
    for (let i = 0; i < 7; i++) {
      if (weeklyData.has(i)) {
        const weekData = weeklyData.get(i);
        const date = weekData.date;
        
        // Format date as "M/D" (e.g., "2/20")
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed
        const day = date.getDate();
        weekLabels.unshift(`${month}/${day}`);
        
        counts.unshift(activeTab === "txs" ? weekData.transactionCount : weekData.callerCount);
      } else {
        // If no data for a week, use placeholder
        weekLabels.unshift("No data");
        counts.unshift(0);
      }
    }

    const datasets: ChartDataset<"line", unknown>[] = [
      {
        fill: true,
        label: activeTab === "txs" ? "Weekly Transactions" : "Weekly Active Players",
        data: counts,
        borderColor: "#2A2F2A",
        backgroundColor: "#212621",
        borderDash: [5, 5],
        borderWidth: 1,
        pointBorderColor: function () {
          return `${theme?.colors?.primary}` || "#fbcb4a";
        },
        pointBackgroundColor: "#242824",
        pointBorderWidth: 1,
        pointRadius: 4,
        tension: 0.4,
      },
    ];
    return { labels: weekLabels, datasets };
  }, [theme, data, activeTab]);

  const options: ChartOptions<"line"> = useMemo(() => {
    return {
      responsive: true,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        tooltip: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: `${theme?.colors?.primary}` || "#fbcb4a",
          cornerRadius: 12,
          caretSize: 0,
          displayColors: false,
          bodyFont: {
            size: 12,
          },
          padding: {
            top: 4,
            bottom: 4,
            left: 8,
            right: 8,
          },
          margin: 8,
          bodyColor: `${theme?.colors?.primary}` || "#fbcb4a",
          callbacks: {
            title: () => "",
            label: (context: TooltipItem<"line">) => {
              const y = context.parsed.y;
              return `${y}`;
            },
          },
          xAlign: "center",
          yAlign: "bottom",
          caretPadding: 12,
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
              speed: 0.1,
            },
            pinch: {
              enabled: true
            },
            mode: "x",
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          border: {
            display: false,
          },
          ticks: {
            stepSize: activeTab === "txs" ? 1000 : 20,
          },
          grid: {
            display: true,
            drawOnChartArea: true,
            color: "#252825",
          },
        },
      },
    };
  }, [theme, activeTab]);

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
            label="Weekly Transactions"
            value={isLoading ? "0" : avgDailyTxs.toLocaleString()}
            active={activeTab === "txs"}
            onClick={() => setActiveTab("txs")}
          />
          <Tab
            label="Weekly Active Players"
            value={isLoading ? "0" : avgDailyPlayers.toLocaleString()}
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
        <div className="bg-background-200 rounded p-4">
          <Line data={chartData} options={options} />
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
