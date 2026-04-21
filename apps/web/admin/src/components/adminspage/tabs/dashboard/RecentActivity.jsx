import React from "react";
import Badge from "../../../shared/Badge";

const RecentActivity = ({ activities = [] }) => {
  const mockActivities = [
    {
      id: "#BK-9021",
      user: "Priya Sharma",
      avatar: "👤",
      type: "RECURRING",
      timestamp: "Today, 14:24",
      amount: "₹2,500",
      status: "COMPLETED",
    },
    {
      id: "#USR-442",
      user: "Kabir Singh",
      avatar: "👤",
      type: "INDIVIDUAL",
      timestamp: "Today, 12:10",
      amount: "--",
      status: "VERIFIED",
    },
    {
      id: "#BK-9018",
      user: "Rohan Verma",
      avatar: "👤",
      type: "SINGLE",
      timestamp: "Yesterday, 18:45",
      amount: "₹4,200",
      status: "PENDING",
    },
    {
      id: "#BK-8992",
      user: "Ananya Iyer",
      avatar: "👤",
      type: "VIP ACCESS",
      timestamp: "Yesterday, 16:30",
      amount: "₹28,900",
      status: "COMPLETED",
    },
  ];

  const data = activities.length > 0 ? activities : mockActivities;

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "VERIFIED":
        return "success";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Atelier Activity</h3>

      <div className="space-y-4">
        {data.map((activity, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                {activity.avatar}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {activity.id}
                  </p>
                  <Badge variant="default" size="sm">
                    {activity.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>{activity.user}</span>
                  <span>{activity.timestamp}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-4">
              <p className="text-sm font-semibold text-gray-900 w-20 text-right">
                {activity.amount}
              </p>
              <Badge variant={getStatusColor(activity.status)} size="sm">
                {activity.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <button className="text-teal-600 hover:text-teal-700 font-semibold text-sm mt-6 transition">
        View all activity →
      </button>
    </div>
  );
};

export default RecentActivity;
