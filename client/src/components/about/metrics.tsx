import { useMemo, useState, useRef } from "react";
import { cn, useMediaQuery } from "@cartridge/ui-next";
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
  const isMobile = useMediaQuery("(max-width: 1024px)");

  const [activeTab, setActiveTab] = useState<"txs" | "players">("txs");

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

    // Variable to track the most recent date with data
    let mostRecentDateWithData: number | null = null;

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

          // Update the most recent date that has data
          if (
            mostRecentDateWithData === null ||
            dayDiff < mostRecentDateWithData
          ) {
            mostRecentDateWithData = dayDiff;
          }
        }
      });
    });

    // If we didn't find any data, set a default (show last 30 days)
    if (mostRecentDateWithData === null) {
      mostRecentDateWithData = 0;
    }

    // Convert to arrays for chart
    const dayLabels = [];
    const counts = [];

    // Get the furthest we want to go back (up to 49 days)
    const oldestDayToInclude = 49;

    // Process days in reverse order (oldest to newest)
    for (let i = oldestDayToInclude; i >= mostRecentDateWithData; i--) {
      if (dailyData.has(i)) {
        const dayData = dailyData.get(i);
        const date = dayData.date;

        // Format date as "M/D" (e.g., "2/20")
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed
        const day = date.getDate();
        dayLabels.push(`${month}/${day}`);

        counts.push(
          activeTab === "txs" ? dayData.transactionCount : dayData.callerCount,
        );
      } else {
        // If no data for a day, use placeholder with 0 value
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        dayLabels.push(`${month}/${day}`);
        counts.push(0);
      }
    }
    const pointBorderWidth = isMobile ? 1 : 2;
    const pointRadius = isMobile ? 2 : 4;
    const pointHoverRadius = isMobile ? 3 : 6;

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
        pointBorderWidth,
        pointRadius,
        pointHoverRadius,
        tension: 0.4,
      },
    ] satisfies ChartDataset<"line", unknown>[];
    return { labels: dayLabels, datasets, mostRecentDateWithData };
  }, [theme, allMetrics, activeTab, isMobile]);

  const options = useMemo(() => {
    return {
      clip: false,
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
          limits: {
            x: { min: "original", max: "original", minRange: 6 },
          },
          // zoom: {
          //   enabled: false, // Completely disable zoom
          // },
          pan: {
            enabled: true,
            mode: "x",
            scaleMode: "x",
            threshold: 5, // Distance in pixels for mouse movement to be considered panning
            modifierKey: "shift",
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
          // Only show the last 6 points or fewer if there's less data
          min: Math.max(0, chartData.labels.length - 6),
          // Only show up to the last data point we have
          max: chartData.labels.length - 1,
        },
        y: {
          border: {
            display: false,
          },
          // Explicitly set the minimum to 0
          min: 0,
          ticks: {
            // Calculate step size based on max data value
            callback: function (value) {
              return Math.round(Number(value));
            },
          },
          grid: {
            display: true,
            drawOnChartArea: true,
            color: "#252825",
          },
        },
      },
    } satisfies ChartOptions<"line">;
  }, [theme, chartData]);

  if (allMetrics.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="h-10 flex items-center justify-between">
        <p className="text-xs tracking-wider font-semibold text-foreground-400">
          Metrics
        </p>
      </div>
      <div className="flex flex-col gap-4 w-full">
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
        <div className="bg-background-200 rounded p-1 sm:p-4">
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
