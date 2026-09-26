import { Badge } from "@/components/ui/badge";
import { COMPLAINT_STATUS_LABELS, COMPLAINT_STATUS_COLORS, PRIORITY_COLORS } from "@/lib/utils";

export function ComplaintStatusBadge({ status }: { status: string }) {
  const colorClass = COMPLAINT_STATUS_COLORS[status as keyof typeof COMPLAINT_STATUS_COLORS] || "bg-slate-100 text-slate-800 border-slate-200";
  
  return (
    <Badge className={`${colorClass} text-xs font-medium hover:${colorClass}`}>
      {COMPLAINT_STATUS_LABELS[status as keyof typeof COMPLAINT_STATUS_LABELS] || status}
    </Badge>
  );
}

export function PriorityBadge({ status }: { status: string }) {
  const colorClass = PRIORITY_COLORS[status as keyof typeof PRIORITY_COLORS] || "text-slate-500 bg-slate-50 border-slate-200";
  
  return (
    <Badge variant="outline" className={`${colorClass} text-xs capitalize`}>
      {status}
    </Badge>
  );
}

export function RoleBadge({ status }: { status: string }) {
  if (status === 'admin') {
    return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 text-xs">Admin</Badge>;
  }
  if (status === 'moderator') {
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 text-xs">Moderator</Badge>;
  }
  return <Badge variant="outline" className="text-xs">Student</Badge>;
}
