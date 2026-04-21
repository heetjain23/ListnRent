import React from "react";

const MetricCard = ({
  icon,
  label,
  value,
  change,
  changeType = "positive",
  className = "",
}) => {
  const isPositive = changeType === "positive";

  return (
    <div
      className={`bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">
            {value}
          </p>
        </div>
        {icon && <div className="text-3xl">{icon}</div>}
      </div>

      {change && (
        <div className="flex items-center gap-1 text-xs">
          <span
            className={`inline-block px-2 py-1 rounded-full font-semibold ${
              isPositive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isPositive ? "↑" : "↓"} {change}
          </span>
          <span className="text-gray-600">vs last month</span>
        </div>
      )}
    </div>
  );
};

const MetricsGrid = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {metrics.map((metric, idx) => (
        <MetricCard
          key={idx}
          icon={metric.icon}
          label={metric.label}
          value={metric.value}
          change={metric.change}
          changeType={metric.changeType}
        />
      ))}
    </div>
  );
};

export default MetricsGrid;
