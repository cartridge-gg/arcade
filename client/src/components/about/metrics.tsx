import { useMemo, useState, useRef } from "react";
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
import zoomPlugin from "chartjs-plugin-zoom";

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
  const { metrics: allMetrics, status } = useMetrics();
  const chartRef = useRef<ChartJS<"line">>(null);

  const [activeTab, setActiveTab] = useState<"txs" | "players">("txs");
  const [isZoomed, setIsZoomed] = useState(false);

  const avgDailyTxs = useMemo(() => {
    let totalTxs = 0;
    let dayCount = 0;

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process all data points
    allMetrics.forEach((metrics) => {
      metrics.data.forEach(({ date, transactionCount }) => {
        // Calculate days difference
        const dayDiff = Math.floor(
          (today.getTime() - date.getTime()) / (24 * 60 * 60 * 1000),
        );

        // Only include data from the last 49 days (7 weeks)
        if (dayDiff >= 0 && dayDiff < 49) {
          totalTxs += transactionCount;
          dayCount++;
        }
      });
    });

    return dayCount > 0 ? totalTxs / dayCount : 0;
  }, [allMetrics]);

  const avgDailyPlayers = useMemo(() => {
    let totalPlayers = 0;
    let dayCount = 0;

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process all data points
    allMetrics.forEach((metrics) => {
      metrics.data.forEach(({ date, callerCount }) => {
        // Calculate days difference
        const dayDiff = Math.floor(
          (today.getTime() - date.getTime()) / (24 * 60 * 60 * 1000),
        );
        // Only include data from the last 49 days (7 weeks)
        if (dayDiff >= 0 && dayDiff < 49) {
          totalPlayers += callerCount;
          dayCount++;
        }
      });
    });

    return dayCount > 0 ? totalPlayers / dayCount : 0;
  }, [allMetrics]);

  const chartData = useMemo(() => {
    // Create a map to store daily data
    const dailyData = new Map();

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process all data points
    allMetrics.forEach((metrics) => {
      metrics.data.forEach(({ date, transactionCount, callerCount }) => {
        // Calculate days difference
        const dayDiff = Math.floor(
          (today.getTime() - date.getTime()) / (24 * 60 * 60 * 1000),
        );

        // Only include data from the last 49 days (7 weeks)
        if (dayDiff >= 0 && dayDiff < 49) {
          const dayKey = dayDiff;

          if (!dailyData.has(dayKey)) {
            dailyData.set(dayKey, {
              transactionCount: 0,
              callerCount: 0,
              date: date,
            });
          }

          const dayData = dailyData.get(dayKey);
          dayData.transactionCount += transactionCount;
          dayData.callerCount += callerCount;
        }
      });
    });

    // Convert to arrays for chart
    const dayLabels = [];
    const counts = [];

    // Process days in reverse order (most recent first)
    for (let i = 0; i < 49; i++) {
      if (dailyData.has(i)) {
        const dayData = dailyData.get(i);
        const date = dayData.date;

        // Format date as "M/D" (e.g., "2/20")
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed
        const day = date.getDate();
        dayLabels.unshift(`${month}/${day}`);

        counts.unshift(
          activeTab === "txs" ? dayData.transactionCount : dayData.callerCount,
        );
      } else {
        // If no data for a day, use placeholder
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        dayLabels.unshift(`${month}/${day}`);
        counts.unshift(0);
      }
    }

    const datasets = [
      {
        fill: true,
        label:
          activeTab === "txs" ? "Daily Transactions" : "Daily Active Players",
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
        pointRadius: 2,
        tension: 0.4,
      },
    ] satisfies ChartDataset<"line", unknown>[];
    return { labels: dayLabels, datasets };
  }, [theme, allMetrics, activeTab]);

  const options = useMemo(() => {
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
            drag: {
              enabled: true,
            },
            // wheel: {
            //   enabled: true,
            //   speed: 0.1,
            // },
            // pinch: {
            //   enabled: true
            // },
            mode: "x",
            onZoomComplete: () => {
              setIsZoomed(true);
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            maxTicksLimit: 7, // Show only 7 labels on the x-axis
          },
        },
        y: {
          border: {
            display: false,
          },
          ticks: {
            stepSize: activeTab === "txs" ? 200 : 20,
          },
          grid: {
            display: true,
            drawOnChartArea: true,
            color: "#252825",
          },
        },
      },
    } satisfies ChartOptions<"line">;
  }, [theme, activeTab]);

  const resetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
      setIsZoomed(false);
    }
  };

  if (allMetrics.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="h-10 flex items-center justify-between">
        <p className="text-xs tracking-wider font-semibold text-foreground-400">
          Metrics
        </p>
        {isZoomed && (
          <button
            onClick={resetZoom}
            className="px-3 py-1 text-xs bg-background-200 hover:bg-background-300 rounded transition-colors duration-200"
          >
            Reset Zoom
          </button>
        )}
      </div>
      <div className="flex flex-col gap-3 lg:gap-4 w-full">
        <div className="flex gap-3 lg:gap-4 w-full">
          <Tab
            label="Daily Transactions"
            value={
              status === "loading"
                ? "0"
                : Math.round(avgDailyTxs).toLocaleString()
            }
            active={activeTab === "txs"}
            onClick={() => setActiveTab("txs")}
          />
          <Tab
            label="Daily Active Players"
            value={
              status === "loading"
                ? "0"
                : Math.round(avgDailyPlayers).toLocaleString()
            }
            active={activeTab === "players"}
            onClick={() => setActiveTab("players")}
          />
        </div>
        {status === "loading" && (
          <div className="flex items-center justify-center h-64">
            <p className="text-xs lg:text-sm text-foreground-400">Loading...</p>
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center justify-center h-64">
            <p className="text-xs lg:text-sm text-red-500">
              Error loading metrics
            </p>
          </div>
        )}
        <div className="bg-background-200 rounded p-4">
          <Line ref={chartRef} data={chartData} options={options} />
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
        "w-1/2 px-4 py-3 lg:px-6 lg:py-4 flex flex-col gap-2 border border-transparent border-b-background-200 bg-background-100 cursor-pointer transition-all duration-300",
        "hover:bg-background-125 hover:border-b-background-300",
        "data-[active=true]:rounded data-[active=true]:border-primary data-[active=true]:bg-background-150",
        "data-[active=true]:hover:bg-background-200",
      )}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <p className="text-base lg:text-xl font-light text-foreground-100 font-mono">
        {value}
      </p>
      <p
        className={cn(
          "text-xs lg:text-sm text-foreground-300 transition-all duration-300",
          !hover && !active && "text-foreground-400",
        )}
      >
        {label}
      </p>
    </div>
  );
}

export default Metrics;
