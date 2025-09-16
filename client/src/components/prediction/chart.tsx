import { useRef, useMemo, useEffect, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
  ScriptableContext,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { UserAvatar } from "../user/avatar";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

export interface Player {
  name: string;
  color: string;
  baseValue: number; // Base percentage value around which to randomize
  variance: number; // Amount of randomization (+/-)
}

interface ChartData {
  day: number;
  playerData: Record<string, number>;
}

export interface PredictionPageProps {
  players?: Player[];
}

export function MarketChart({ players }: PredictionPageProps) {
  const chartRef = useRef<ChartJS<"line">>(null);

  // Default players if none provided
  const defaultPlayers: Player[] = [
    { name: "bal7hazar", color: "#60A5FA", baseValue: 20, variance: 4 },
    { name: "clicksave", color: "#FB923C", baseValue: 11, variance: 3 },
    { name: "flipper", color: "#4ADE80", baseValue: 7, variance: 3 },
  ];

  const activePlayers = players || defaultPlayers;

  // Generate 7 days of mock data ending with today
  const generateMockData = useCallback((): ChartData[] => {
    const data: ChartData[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const day = date.getDate();

      const playerData: Record<string, number> = {};
      activePlayers.forEach((player) => {
        playerData[player.name] =
          player.baseValue + (Math.random() - 0.5) * 2 * player.variance;
      });

      data.push({
        day,
        playerData,
      });
    }

    return data;
  }, [activePlayers]);

  const chartData = useMemo(() => {
    const mockData = generateMockData();

    return {
      labels: mockData.map((d) => d.day.toString()),
      datasets: activePlayers.map((player) => ({
        label: player.name,
        data: mockData.map((d) => d.playerData[player.name]),
        borderColor: player.color,
        backgroundColor: player.color,
        borderWidth: 1,
        pointRadius: (ctx: ScriptableContext<"line">) => {
          // Only show point at the last data point
          return ctx.dataIndex === ctx.dataset.data.length - 1 ? 3 : 0;
        },
        pointHoverRadius: 6,
        fill: false,
      })),
    };
  }, [activePlayers, generateMockData]);

  const options = useMemo((): ChartOptions<"line"> => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // We'll create custom legend
        },
        tooltip: {
          backgroundColor: "#1F2937",
          titleColor: "#F9FAFB",
          bodyColor: "#F9FAFB",
          borderColor: "#374151",
          borderWidth: 1,
          callbacks: {
            label: (context) => {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
            color: "rgba(255, 255, 255, 0.1)",
          },
          border: {
            display: false,
          },
          ticks: {
            color: "#505050",
            font: {
              size: 12,
            },
          },
        },
        y: {
          position: "right",
          min: 0,
          max: 28,
          grid: {
            display: false,
            color: "rgba(255, 255, 255, 0.1)",
          },
          border: {
            display: false,
          },
          ticks: {
            color: "#505050",
            font: {
              size: 12,
            },
            callback: (value) => `${value}%`,
            stepSize: 7,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    };
  }, []);

  // Handle chart resize
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.resize();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Legend */}
      <div className="flex gap-6 mb-6 relative z-10 flex-wrap">
        {activePlayers.map((player) => (
          <div key={player.name} className="flex items-center gap-2">
            <div
              className="size-1.5 rounded-full"
              style={{ backgroundColor: player.color }}
            />
            <UserAvatar
              username={player.name}
              size="xs"
              className="text-foreground-100"
            />
            <span className="text-foreground-100 text-xs font-normal">
              {player.name}
            </span>
          </div>
        ))}
      </div>

      {/* Chart Container */}
      <div className="relative h-80 z-10">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </>
  );
}
