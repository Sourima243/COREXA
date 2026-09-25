import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const VitalChart = ({ data, unit }) => {
  const chartData = [...data]
    .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
    .map((d) => ({
      date: new Date(d.recordedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: d.value,
      secondaryValue: d.secondaryValue,
    }));

  if (chartData.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No data logged yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} unit={unit ? ` ${unit}` : ""} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#1fae82" strokeWidth={2} dot={{ r: 3 }} name="Value" />
        {chartData.some((d) => d.secondaryValue != null) && (
          <Line
            type="monotone"
            dataKey="secondaryValue"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Diastolic"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default VitalChart;
