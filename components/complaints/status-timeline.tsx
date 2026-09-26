import { getStatusStep, formatDate } from "@/lib/utils";
import { Check, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusTimelineProps {
  currentStatus: string;
  createdAt: string;
  resolvedAt: string | null;
}

const steps = [
  { id: "submitted", label: "Submitted" },
  { id: "under_review", label: "Under Review" },
  { id: "in_progress", label: "In Progress" },
  { id: "resolved", label: "Resolved" },
];

export function StatusTimeline({ currentStatus, createdAt, resolvedAt }: StatusTimelineProps) {
  const currentStepIndex = getStatusStep(currentStatus);
  const isClosed = currentStatus === "closed";

  if (isClosed) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
          <Check className="h-4 w-4" />
        </div>
        This complaint was closed.
      </div>
    );
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isPending = index > currentStepIndex;

        return (
          <div key={step.id} className="relative flex items-center gap-4 md:justify-center">
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background z-10",
              isCompleted && "border-primary bg-primary text-primary-foreground",
              isCurrent && "border-primary text-primary",
              isPending && "border-muted text-muted-foreground"
            )}>
              {isCompleted ? <Check className="h-4 w-4" /> : isCurrent ? <Clock className="h-4 w-4" /> : <Circle className="h-2 w-2 fill-current" />}
            </div>
            <div className="flex-1 md:absolute md:w-48 md:text-right md:right-[calc(50%+2rem)] md:left-auto">
              {index % 2 === 0 ? (
                <div className="md:text-right">
                  <h4 className={cn("text-sm font-medium", isPending && "text-muted-foreground")}>{step.label}</h4>
                  {index === 0 && <p className="text-xs text-muted-foreground">{formatDate(createdAt)}</p>}
                </div>
              ) : (
                <div className="md:absolute md:w-48 md:text-left md:left-[calc(50%+2rem)] md:right-auto">
                  <h4 className={cn("text-sm font-medium", isPending && "text-muted-foreground")}>{step.label}</h4>
                  {index === 3 && resolvedAt && <p className="text-xs text-muted-foreground">{formatDate(resolvedAt)}</p>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
