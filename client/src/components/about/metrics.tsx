import { useMemo, useState, useRef, useEffect } from "react";
import { useMediaQuery } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
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
import { useSidebar } from "@/hooks/sidebar";

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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const { setDisableSwipe } = useSidebar();

  const [activeTab, setActiveTab] = useState<"txs" | "players">("txs");
  const [isPanning, setIsPanning] = useState(false);
  const [visibleRange, setVisibleRange] = useState<{
    min: number;
    max: number;
  } | null>(null);

  // Add useEffect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        // Force the chart to resize
        chartRef.current.resize();
      }
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Set up a resize observer for more reliable detection
    let resizeObserver: ResizeObserver | null = null;
    if (chartContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (chartRef.current) {
          // Properly resize the chart when container changes size
          setTimeout(() => {
            chartRef.current?.resize();
          }, 0);
        }
      });
      resizeObserver.observe(chartContainerRef.current);
    }

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  // Also add dependency to re-initialize chart when relevant states change
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [activeTab, isMobile, allMetrics, theme]);

  // Effect to handle panning cursor state
  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    if (!chartContainer) return;

    // Timer to detect long press
    let longPressTimer: ReturnType<typeof setTimeout>;
    const longPressDuration = 300; // ms

    const handleMouseDown = () => {
      longPressTimer = setTimeout(() => {
        setIsPanning(true);
      }, longPressDuration);

      // Disable sidebar swipe while interacting with chart
      setDisableSwipe(true);
    };

    const handleMouseUp = () => {
      clearTimeout(longPressTimer);
      setIsPanning(false);

      // Re-enable sidebar swipe after interaction
      setDisableSwipe(false);
    };

    const handleMouseLeave = () => {
      clearTimeout(longPressTimer);
      setIsPanning(false);

      // Re-enable sidebar swipe after interaction
      setDisableSwipe(false);
    };

    // Add event listeners
    chartContainer.addEventListener("mousedown", handleMouseDown);
    chartContainer.addEventListener("touchstart", handleMouseDown, {
      passive: true,
    });
    chartContainer.addEventListener("mouseup", handleMouseUp);
    chartContainer.addEventListener("touchend", handleMouseUp);
    chartContainer.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      // Clean up
      chartContainer.removeEventListener("mousedown", handleMouseDown);
      chartContainer.removeEventListener("touchstart", handleMouseDown);
      chartContainer.removeEventListener("mouseup", handleMouseUp);
      chartContainer.removeEventListener("touchend", handleMouseUp);
      chartContainer.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(longPressTimer);
    };
  }, []);

  // Get the latest transaction count
  const latestDailyTxs = useMemo(() => {
    if (allMetrics.length === 0) return 0;

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the most recent data point
    let mostRecentDate: Date | null = null;
    let mostRecentTxCount = 0;

    allMetrics.forEach((metrics) => {
      metrics.data.forEach(({ date, transactionCount }) => {
        // If we don't have a date yet, or if this date is more recent
        if (!mostRecentDate || date > mostRecentDate) {
          mostRecentDate = date;
          mostRecentTxCount = transactionCount;
        }
      });
    });

    return mostRecentTxCount;
  }, [allMetrics]);

  // Get the latest player count
  const latestDailyPlayers = useMemo(() => {
    if (allMetrics.length === 0) return 0;

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the most recent data point
    let mostRecentDate: Date | null = null;
    let mostRecentPlayerCount = 0;

    allMetrics.forEach((metrics) => {
      metrics.data.forEach(({ date, callerCount }) => {
        // If we don't have a date yet, or if this date is more recent
        if (!mostRecentDate || date > mostRecentDate) {
          mostRecentDate = date;
          mostRecentPlayerCount = callerCount;
        }
      });
    });

    return mostRecentPlayerCount;
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
        pointHoverBackgroundColor: `${theme?.colors?.primary}` || "#fbcb4a",
        pointBorderWidth,
        pointRadius,
        pointHoverRadius,
        tension: 0.4,
      },
    ] satisfies ChartDataset<"line", unknown>[];
    return { labels: dayLabels, datasets, mostRecentDateWithData };
  }, [theme, allMetrics, activeTab, isMobile]);

  const options = useMemo(() => {
    const clipSize = isMobile ? 5 : 8;

    // Use stored visibleRange if available, otherwise calculate default
    const defaultMin = Math.max(0, chartData.labels.length - 6);
    const defaultMax = chartData.labels.length - 1;

    const visibleMin = visibleRange?.min ?? defaultMin;
    const visibleMax = visibleRange?.max ?? defaultMax;

    // Extract only the visible data points
    const visibleData = (chartData.datasets[0].data as number[]).slice(
      visibleMin,
      visibleMax + 1,
    );

    // Find the maximum value in the visible data
    const maxValue = visibleData.length > 0 ? Math.max(...visibleData) : 0;

    // If max value is less than 10, set rounded max to 10, otherwise round up
    const roundedMax = maxValue < 10 ? 10 : Math.ceil(maxValue);

    // Calculate the step size to have just 2 grid steps
    const stepSize = roundedMax / 2;

    // Set different aspect ratio based on screen size
    const aspectRatio = isMobile ? 1.5 : 2.5;

    return {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio,
      clip: clipSize,
      interaction: {
        intersect: isPanning,
        mode: isPanning ? "nearest" : "index",
      },
      animation: isPanning
        ? false
        : {
            duration: 300,
          },
      events: isPanning
        ? []
        : ["mousemove", "mouseout", "click", "touchstart", "touchmove"],
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: "x",
            threshold: 10, // minimum distance required to trigger pan
            // Custom options
            onPanStart: () => {
              setIsPanning(true);
              if (chartRef.current) {
                // Force update to apply the new interaction mode
                chartRef.current.update();
              }
              return true; // continue with the pan
            },
            onPan: ({ chart }) => {
              // Get the current range from the chart
              const min = chart.scales.x.min;
              const max = chart.scales.x.max;

              // If the range changed significantly, update our state
              if (
                !visibleRange ||
                Math.abs(min - visibleRange.min) > 0.5 ||
                Math.abs(max - visibleRange.max) > 0.5
              ) {
                setVisibleRange({
                  min: Math.floor(min),
                  max: Math.ceil(max),
                });
              }
            },
            onPanComplete: () => {
              setIsPanning(false);
              if (chartRef.current) {
                // Force update to apply the new interaction mode
                chartRef.current.update();
              }
            },
          },
        },
        tooltip: {
          enabled: !isPanning,
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
          min: visibleMin,
          // Only show up to the last data point we have
          max: visibleMax,
        },
        y: {
          border: {
            display: false,
          },
          // Explicitly set the minimum to 0
          min: 0,
          max: roundedMax,
          ticks: {
            stepSize,
          },
          grid: {
            display: true,
            drawOnChartArea: true,
            color: "#252825",
          },
        },
      },
    } satisfies ChartOptions<"line">;
  }, [theme, chartData, isMobile, visibleRange, isPanning]);

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
                : Math.round(latestDailyTxs).toLocaleString()
            }
            active={activeTab === "txs"}
            onClick={() => {
              setActiveTab("txs");
              setVisibleRange(null);
            }}
          />
          <Tab
            label="Daily Active Players"
            value={
              status === "loading"
                ? "0"
                : Math.round(latestDailyPlayers).toLocaleString()
            }
            active={activeTab === "players"}
            onClick={() => {
              setActiveTab("players");
              setVisibleRange(null);
            }}
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
        <div
          ref={chartContainerRef}
          className={cn(
            "bg-background-200 rounded p-1 sm:p-4 h-[240px] sm:h-auto",
            isPanning ? "cursor-grabbing" : "cursor-default",
          )}
        >
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
