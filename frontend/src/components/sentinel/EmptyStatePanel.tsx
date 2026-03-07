import { cn } from "@/lib/utils";

interface EmptyStatePanelProps {
  title: string;
  message: string;
  className?: string;
}

const EmptyStatePanel = ({ title, message, className }: EmptyStatePanelProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center p-8 text-center border border-dashed border-mc-panel-border rounded",
      className
    )}
  >
    <p className="font-mono text-sm font-semibold text-foreground mb-1">{title}</p>
    <p className="font-mono text-[10px] text-muted-foreground max-w-[280px]">{message}</p>
  </div>
);

export default EmptyStatePanel;
