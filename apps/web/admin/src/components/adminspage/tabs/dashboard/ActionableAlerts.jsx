import React from "react";
import Badge from "../../../shared/Badge";

const ActionableAlerts = ({ alerts = [] }) => {
  const mockAlerts = [
    {
      id: 1,
      icon: "⚠️",
      title: "Pending Dispute",
      description: "High-priority dispute awaiting resolution",
      count: null,
      color: "bg-red-100 border-red-200",
    },
    {
      id: 2,
      icon: "📦",
      title: "Low Inventory",
      description: "8% stock undergoing critical status",
      count: null,
      color: "bg-yellow-100 border-yellow-200",
    },
    {
      id: 3,
      icon: "🚚",
      title: "Delivery Issue",
      description: "Payment collected from address returned twice",
      count: null,
      color: "bg-blue-100 border-blue-200",
    },
  ];

  const data = alerts.length > 0 ? alerts : mockAlerts;

  return (
    <div className="bg-teal-900 rounded-lg p-6 text-white">
      <h3 className="text-lg font-bold mb-6">Actionable Alerts</h3>

      <div className="space-y-3">
        {data.map((alert) => (
          <div
            key={alert.id}
            className={`${alert.color} rounded-lg p-4 border-l-4 transition hover:shadow-md`}
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl shrink-0">{alert.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{alert.title}</p>
                <p className="text-sm text-gray-700 mt-1">
                  {alert.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="text-white hover:text-gray-100 font-semibold text-sm mt-6 transition">
        VIEW ALL CRITICAL ALERTS →
      </button>
    </div>
  );
};

export default ActionableAlerts;
