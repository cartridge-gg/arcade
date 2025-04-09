import { useMemo, useState } from "react";
import { cn } from "@cartridge/ui-next";
import { useMetrics } from "@/hooks/metrics";
import { ZoomableChart } from "./charts";

export interface MetricsProps {
  txsCount: number;
  playerCount: number;
}

interface DataPoint {
  date: string;
  events: number;
};

export function Metrics() {
  const { data, isLoading, isError } = useMetrics("dopewarsbal");

  const [activeTab, setActiveTab] = useState<"txs" | "players">("txs");

  const chartData: DataPoint[] = useMemo(() => {
    return data.flatMap((item) =>
      item.metrics.map((metric) => ({
        date: metric.transactionDate,
        events: activeTab === "txs" ? metric.transactionCount : metric.callerCount,
      }))
    )
  }, [data, activeTab]);

  const avgDailyTxs = useMemo(() => {

    let totalTxs = 0;

    data.forEach((item) => {
      item.metrics.forEach((metric) => {
        totalTxs += metric.transactionCount;
      });
    });

    return totalTxs / data.length;
  }, [data]);

  const avgDailyPlayers = useMemo(() => {

    let totalPlayers = 0;

    data.forEach((item) => {
      item.metrics.forEach((metric) => {
        totalPlayers += metric.callerCount;
      });
    });

    return totalPlayers / data.length;
  }, [data]);


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
            value={avgDailyTxs.toLocaleString()}
            active={activeTab === "txs"}
            onClick={() => setActiveTab("txs")}
          />
          <Tab
            label="Daily Active Players"
            value={avgDailyPlayers.toLocaleString()}
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
        {/*       <p className="text-sm text-foreground-400">{JSON.stringify(metrics, undefined, 2)}</p> */}
        {/*   ) */}
        {/* } */}
        <div className="bg-background-200 rounded p-4">
          {/* <Line data={chartData} options={options} /> */}
          <ZoomableChart data={chartData} />
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
