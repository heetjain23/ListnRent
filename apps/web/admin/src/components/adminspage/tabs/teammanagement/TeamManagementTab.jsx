import React from "react";
import PageHeader from "../../../shared/PageHeader";
import Badge from "../../../shared/Badge";
import TableWrapper from "../../../shared/TableWrapper";
import UsersManager from "./subtabs/UsersManager";
import AdminsManager from "./subtabs/AdminsManager";
import DeliveryPartnerManager from "./subtabs/DeliveryPartnerManager";
import { useAdminAuth } from "../../../../hooks/useAdminAuth";
import { useAdminUsers } from "../../../../hooks/useAdminUsers";
import { useDeliveryPartners } from "../../../../hooks/useDeliveryPartners";
import { isSuperAdmin } from "../../../../utils/permissions";

const TeamManagementTab = () => {
  const { admin } = useAdminAuth();
  const { users, fetchUsers, admins, fetchAdmins } = useAdminUsers();
  const { deliveryPartners, fetchDeliveryPartners } = useDeliveryPartners();
  const [activeTab, setActiveTab] = React.useState("users");
  const isSuper = isSuperAdmin(admin?.role);

  // Fetch users, admins, and delivery partners on component mount
  React.useEffect(() => {
    fetchUsers();
    fetchAdmins();
    fetchDeliveryPartners();
  }, [fetchUsers, fetchAdmins, fetchDeliveryPartners]);

  const supportTeamData = [
    {
      id: 1,
      name: "Maya Patel",
      email: "maya@support.atelier.in",
      role: "Support Lead",
      permissions: "Full Access",
      status: "ACTIVE",
    },
    {
      id: 2,
      name: "Rohan Singh",
      email: "rohan@support.atelier.in",
      role: "Support Agent",
      permissions: "Limited",
      status: "ACTIVE",
    },
  ];

  return (
    <>
      <PageHeader
        title="Team Management"
        subtitle="Manage users, admins, delivery partners, and support team"
      />

      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto">
          {[
            {
              id: "users",
              label: "Users",
              count: users.length.toLocaleString(),
            },
            {
              id: "admins",
              label: "Admins",
              count: admins.length.toLocaleString(),
            },
            {
              id: "delivery_partners",
              label: "Delivery Partners",
              count: deliveryPartners.length.toLocaleString(),
            },
            { id: "support_team", label: "Support Team", count: "8" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-2 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        {activeTab === "users" && <UsersManager />}

        {activeTab === "admins" && <AdminsManager />}

        {activeTab === "delivery_partners" && <DeliveryPartnerManager />}

        {activeTab === "support_team" && (
          <div>
            <div className="mb-4">
              <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition">
                + Add Support Member
              </button>
            </div>
            <TableWrapper
              columns={[
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "role", label: "Role" },
                { key: "permissions", label: "Permissions" },
                {
                  key: "status",
                  label: "Status",
                  render: (val) => <Badge variant="success">{val}</Badge>,
                },
              ]}
              data={supportTeamData}
              actions={() => (
                <button className="text-teal-600 hover:text-teal-700 font-semibold text-sm">
                  Edit
                </button>
              )}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default TeamManagementTab;
