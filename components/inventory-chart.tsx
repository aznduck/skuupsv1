"use client";
import { useState } from "react";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Label } from "@/components/ui/label";

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  maxQuantity: number;
  alertThreshold?: number;
  supplier?: string;
  orderUrl?: string;
}

interface InventoryChartProps {
  ingredients: Ingredient[];
}

export default function InventoryChart({ ingredients }: InventoryChartProps) {
  // Transform ingredients data for the chart
  const chartData = ingredients.map((ingredient) => {
    const percentFull = Math.round(
      (ingredient.quantity / ingredient.maxQuantity) * 100
    );
    const threshold = ingredient.alertThreshold || 20; // Default to 20% if not set
    return {
      id: ingredient.id,
      name: ingredient.name,
      stock: percentFull,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      max: ingredient.maxQuantity,
      threshold: threshold,
      belowThreshold: percentFull < threshold,
    };
  });

  // Custom tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-md shadow-sm p-2 text-xs">
          <p className="font-medium">{data.name}</p>
          <p>
            Current: {data.quantity} {data.unit} ({data.stock}%)
          </p>
          <p>
            Max: {data.max} {data.unit}
          </p>
          <p>Alert Threshold: {data.threshold}%</p>
          <p className={data.belowThreshold ? "text-red-500 font-medium" : ""}>
            {data.belowThreshold ? "Below threshold!" : "Stock level normal"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">
            Inventory Levels with Alert Thresholds
          </Label>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Red dots show thresholds for ingredients with low stock levels
        </p>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickCount={6}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* No reference lines, just dots for thresholds */}

            {/* Stock level line */}
            <Line
              type="monotone"
              dataKey="stock"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{
                fill: "hsl(var(--background))",
                stroke: "hsl(var(--chart-1))",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                fill: "hsl(var(--chart-1))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
                r: 6,
              }}
            />

            {/* Threshold dots */}
            <Line
              type="monotone"
              dataKey="threshold"
              stroke="none"
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={payload.belowThreshold ? "red" : "#888"}
                    stroke="white"
                    strokeWidth={1.5}
                  />
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
