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
  type ChartOptions,
  type ChartDataset,
  type TooltipItem,
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

export const AboutMetrics = () => {
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

  useEffect(() => {
    const handleResize = () => {
      chartRef.current?.resize();
    };

    window.addEventListener("resize", handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (chartContainerRef.current) {
      resizeObserver = new ResizeObserver(() => chartRef.current?.resize());
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    chartRef.current?.update();
  }, [activeTab, isMobile, allMetrics, theme]);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    let longPressTimer: ReturnType<typeof setTimeout>;
    const longPressDuration = 300;

    const handleStart = () => {
      longPressTimer = setTimeout(() => setIsPanning(true), longPressDuration);
      setDisableSwipe(true);
    };

    const handleEnd = () => {
      clearTimeout(longPressTimer);
      setIsPanning(false);
      setDisableSwipe(false);
    };

    container.addEventListener("mousedown", handleStart);
    container.addEventListener("touchstart", handleStart, { passive: true });
    container.addEventListener("mouseup", handleEnd);
    container.addEventListener("touchend", handleEnd);
    container.addEventListener("mouseleave", handleEnd);

    return () => {
      container.removeEventListener("mousedown", handleStart);
      container.removeEventListener("touchstart", handleStart);
      container.removeEventListener("mouseup", handleEnd);
      container.removeEventListener("touchend", handleEnd);
      container.removeEventListener("mouseleave", handleEnd);
      clearTimeout(longPressTimer);
    };
  }, [setDisableSwipe]);

  const latestDailyTxs = useMemo(() => {
    if (allMetrics.length === 0) return 0;
    let mostRecentDate: Date | null = null;
    let mostRecentTxCount = 0;
    allMetrics.forEach((metrics) => {
      metrics.data.forEach(({ date, transactionCount }) => {
        if (!mostRecentDate || date > mostRecentDate) {
          mostRecentDate = date;
          mostRecentTxCount = transactionCount;
        }
      });
    });
    return mostRecentTxCount;
  }, [allMetrics]);

  const latestDailyPlayers = useMemo(() => {
    if (allMetrics.length === 0) return 0;
    let mostRecentDate: Date | null = null;
    let mostRecentPlayerCount = 0;
    allMetrics.forEach((metrics) => {
      metrics.data.forEach(({ date, callerCount }) => {
        if (!mostRecentDate || date > mostRecentDate) {
          mostRecentDate = date;
          mostRecentPlayerCount = callerCount;
        }
      });
    });
    return mostRecentPlayerCount;
  }, [allMetrics]);

  const chartData = useMemo(() => {
    const dailyData = new Map<
      number,
      { date: Date; transactionCount: number; callerCount: number }
    >();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    allMetrics.forEach((metrics) => {
      metrics.data.forEach(({ date, transactionCount, callerCount }) => {
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round(
          (today.getTime() - normalizedDate.getTime()) / (24 * 60 * 60 * 1000),
        );
        if (diffDays >= 0 && diffDays <= 49) {
          dailyData.set(diffDays, {
            date: normalizedDate,
            transactionCount,
            callerCount,
          });
        }
      });
    });

    let mostRecent = 0;
    dailyData.forEach((_, diff) => {
      mostRecent = Math.max(mostRecent, diff);
    });

    const labels: string[] = [];
    const counts: number[] = [];
    for (let i = Math.min(49, mostRecent); i >= 0; i--) {
      const entry = dailyData.get(i);
      const date =
        entry?.date ?? new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      labels.push(`${month}/${day}`);
      counts.push(
        entry
          ? activeTab === "txs"
            ? entry.transactionCount
            : entry.callerCount
          : 0,
      );
    }

    const pointBorderWidth = isMobile ? 1 : 2;
    const pointRadius = isMobile ? 2 : 4;
    const pointHoverRadius = isMobile ? 3 : 6;

    const datasets: ChartDataset<"line", number[]>[] = [
      {
        fill: true,
        label:
          activeTab === "txs" ? "Daily Transactions" : "Daily Active Players",
        data: counts,
        borderColor: "#2A2F2A",
        backgroundColor: "#212621",
        borderDash: [5, 5],
        borderWidth: 1,
        pointBorderColor: () => `${theme?.colors?.primary}` || "#fbcb4a",
        pointBackgroundColor: "#242824",
        pointHoverBackgroundColor: `${theme?.colors?.primary}` || "#fbcb4a",
        pointBorderWidth,
        pointRadius,
        pointHoverRadius,
        tension: 0.4,
      },
    ];

    return { labels, datasets };
  }, [theme, allMetrics, activeTab, isMobile]);

  const options = useMemo(() => {
    const clipSize = isMobile ? 5 : 8;

    const defaultMin = Math.max(0, chartData.labels.length - 6);
    const defaultMax = chartData.labels.length - 1;

    const visibleMin = visibleRange?.min ?? defaultMin;
    const visibleMax = visibleRange?.max ?? defaultMax;

    const visibleData = (chartData.datasets[0].data as number[]).slice(
      visibleMin,
      visibleMax + 1,
    );
    const maxValue = visibleData.length > 0 ? Math.max(...visibleData) : 0;
    const roundedMax = maxValue < 10 ? 10 : Math.ceil(maxValue);
    const stepSize = roundedMax / 2;
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
      animation: isPanning ? false : { duration: 300 },
      events: isPanning
        ? []
        : ["mousemove", "mouseout", "click", "touchstart", "touchmove"],
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: "x",
            threshold: 10,
            onPan: ({ chart }) => {
              const min = chart.scales.x.min;
              const max = chart.scales.x.max;
              setVisibleRange({ min: Math.floor(min), max: Math.ceil(max) });
            },
            onPanComplete: () => setIsPanning(false),
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
          bodyFont: { size: 12 },
          padding: { top: 4, bottom: 4, left: 8, right: 8 },
          bodyColor: `${theme?.colors?.primary}` || "#fbcb4a",
          callbacks: {
            title: () => "",
            label: (context: TooltipItem<"line">) => `${context.parsed.y}`,
          },
          xAlign: "center",
          yAlign: "bottom",
          caretPadding: 12,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            maxTicksLimit: 7,
          },
          min: visibleMin,
          max: visibleMax,
        },
        y: {
          border: { display: false },
          min: 0,
          max: roundedMax,
          ticks: { stepSize },
          grid: { display: true, drawOnChartArea: true, color: "#252825" },
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
          <MetricTab
            label="Daily Transactions"
            value={
              status === "pending"
                ? "0"
                : Math.round(latestDailyTxs).toLocaleString()
            }
            active={activeTab === "txs"}
            onClick={() => {
              setActiveTab("txs");
              setVisibleRange(null);
            }}
          />
          <MetricTab
            label="Daily Active Players"
            value={
              status === "pending"
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
};

const MetricTab = ({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
}) => {
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
};
