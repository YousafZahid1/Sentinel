import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface KpiIndicatorCardProps {
  label: string;
  value: number;
  delta_value?: number;
  delta_direction?: "up" | "down" | "neutral";
  time_window?: string;
}

const KpiIndicatorCard = ({
  label,
  value,
  delta_value = 0,
  delta_direction = "neutral",
  time_window = "24h",
}: KpiIndicatorCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <div className="mc-panel h-full p-3 rounded flex flex-col justify-between min-w-[120px]">
      <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-2xl font-bold tabular-nums">{displayValue}</span>
        {delta_value !== 0 && (
          <span
            className={cn(
              "font-mono text-[9px]",
              delta_direction === "up" && "text-mc-red",
              delta_direction === "down" && "text-mc-green",
              delta_direction === "neutral" && "text-muted-foreground"
            )}
          >
            {delta_direction === "up" && "+"}
            {delta_value} {time_window}
          </span>
        )}
      </div>
    </div>
  );
};

export default KpiIndicatorCard;
