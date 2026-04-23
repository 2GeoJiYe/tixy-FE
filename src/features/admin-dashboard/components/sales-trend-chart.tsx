import { useMemo } from "react";
import type { SalesTrendPoint } from "@/features/admin-dashboard/types";
import { formatCurrency } from "@/shared/lib/format";

interface SalesTrendChartProps {
  points: SalesTrendPoint[];
}

export function SalesTrendChart({ points }: SalesTrendChartProps) {
  const chart = useMemo(() => {
    if (points.length === 0) {
      return null;
    }

    const width = 640;
    const height = 240;
    const padding = 24;
    const max = Math.max(...points.map((point) => point.paidAmount), 1);

    const coordinates = points.map((point, index) => {
      const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - (point.paidAmount / max) * (height - padding * 2);
      return { x, y, point };
    });

    return {
      width,
      height,
      path: coordinates
        .map((coordinate, index) =>
          `${index === 0 ? "M" : "L"} ${coordinate.x.toFixed(2)} ${coordinate.y.toFixed(2)}`,
        )
        .join(" "),
      coordinates,
    };
  }, [points]);

  if (!chart) {
    return (
      <div className="rounded-card border border-dashed border-border bg-panel px-4 py-12 text-center text-sm text-muted-foreground">
        선택한 기간의 추이 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">기간 추이</h2>
          <p className="mt-1 text-sm text-muted-foreground">결제 금액 기준 라인 차트</p>
        </div>
        <p className="text-sm text-muted-foreground">최대 {formatCurrency(Math.max(...points.map((point) => point.paidAmount), 0))}</p>
      </div>
      <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-64 w-full">
        <rect x="0" y="0" width={chart.width} height={chart.height} rx="18" fill="rgb(248 250 252)" />
        <path d={chart.path} fill="none" stroke="rgb(225 29 72)" strokeWidth="3" />
        {chart.coordinates.map((coordinate) => (
          <g key={coordinate.point.bucket}>
            <circle cx={coordinate.x} cy={coordinate.y} r="4.5" fill="rgb(225 29 72)" />
            <text
              x={coordinate.x}
              y={chart.height - 8}
              textAnchor="middle"
              fontSize="10"
              fill="rgb(100 116 139)"
            >
              {coordinate.point.bucket}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
