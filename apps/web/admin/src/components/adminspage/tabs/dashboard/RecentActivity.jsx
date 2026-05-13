import React from "react";
import Badge from "../../../shared/Badge";

const formatDate = (value) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Recently'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const RecentActivity = ({ activities = [], loading = false }) => {
  const data = activities.slice(0, 5)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900">Recent Purchases</h3>
          <p className="mt-1 text-sm text-slate-500">Last 5 bookings with customer and payment details</p>
        </div>
        <Badge variant="default" size="sm">
          LIVE
        </Badge>
      </div>

      <div className="space-y-4">
        {loading &&
          Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            </div>
          ))}

        {!loading && data.map((activity, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="h-11 w-11 overflow-hidden rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-700">
                {activity.clientImage ? (
                  <img
                    src={activity.clientImage}
                    alt={activity.clientName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{activity.clientName?.[0] || '👤'}</span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-900">{activity.clientName}</p>
                  <Badge variant="default" size="sm">BOOKING</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>{formatDate(activity.date)}</span>
                  <span>Rent {formatCurrency(activity.rentAmount)}</span>
                  <span>Deposit {formatCurrency(activity.depositAmount)}</span>
                </div>
              </div>
            </div>

            <div className="ml-4 text-right">
              <p className="text-sm font-semibold text-slate-900">{formatCurrency(activity.rentAmount)}</p>
              <p className="text-xs text-slate-500">Rent collected</p>
            </div>
          </div>
        ))}
      </div>

      {!loading && data.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          No recent bookings found.
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
