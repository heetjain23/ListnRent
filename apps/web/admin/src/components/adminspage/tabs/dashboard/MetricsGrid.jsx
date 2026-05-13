import React from "react";

const MetricCard = ({
  icon,
  label,
  value,
  caption,
  loading = false,
  className = "",
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-amber-50 p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-200/30 blur-2xl" />

      <div className="relative mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
          {loading ? (
            <div className="mt-3 h-9 w-28 animate-pulse rounded-md bg-slate-200" />
          ) : (
            <p className="mt-2 text-2xl font-black text-slate-900 lg:text-3xl">{value}</p>
          )}
        </div>
        {icon && (
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-amber-300/40 bg-amber-100/70 text-2xl shadow-sm">
            {icon}
          </div>
        )}
      </div>

      {caption && (
        <div className="relative mt-1 rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-xs font-medium text-slate-600">
          {caption}
        </div>
      )}
    </div>
  );
};

const MetricsGrid = ({ metrics, loading = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {metrics.map((metric, idx) => (
        <MetricCard
          key={idx}
          icon={metric.icon}
          label={metric.label}
          value={metric.value}
          caption={metric.caption}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default MetricsGrid;
