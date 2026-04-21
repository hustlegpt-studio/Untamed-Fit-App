import React from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ProgressGraphProps {
  data: Array<{
    date: string;
    value: number;
    label?: string;
  }>;
  type?: 'line' | 'area';
  color?: string;
  title?: string;
  description?: string;
  height?: number;
  valueLabel?: string;
}

export function ProgressGraph({ 
  data, 
  type = 'line', 
  color = '#8884d8',
  title,
  description,
  height = 300,
  valueLabel = 'Value'
}: ProgressGraphProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  return (
    <div className="space-y-2">
      {title && (
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            formatter={(value: any) => [`${value} ${valueLabel}`, valueLabel]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <DataComponent 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            fill={type === 'area' ? color : undefined}
            strokeWidth={2}
          />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
