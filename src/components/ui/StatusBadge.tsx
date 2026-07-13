import { cn } from "@/lib/utils";
import { InvoiceStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles: Record<InvoiceStatus, string> = {
    'payée': 'bg-green-100 text-green-700',
    'envoyée': 'bg-orange-100 text-orange-700',
    'brouillon': 'bg-gray-100 text-gray-700',
    'en retard': 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<InvoiceStatus, string> = {
    'payée': 'Payée',
    'envoyée': 'Envoyée',
    'brouillon': 'Brouillon',
    'en retard': 'En retard',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
