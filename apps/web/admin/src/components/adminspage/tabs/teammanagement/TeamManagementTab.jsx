import React from "react";
import PageHeader from "../../../shared/PageHeader";
import Badge from "../../../shared/Badge";
import TableWrapper from "../../../shared/TableWrapper";
import UsersManager from "./subtabs/UsersManager";
import AdminsManager from "./subtabs/AdminsManager";
import DeliveryPartnerManager from "./subtabs/DeliveryPartnerManager";
import SupportTeamManager from "./subtabs/SupportTeamManager";
import { useAdminAuth } from "../../../../hooks/useAdminAuth";
import { useAdminUsers } from "../../../../hooks/useAdminUsers";
import { useDeliveryPartners } from "../../../../hooks/useDeliveryPartners";
import { useSupportTeam } from "../../../../hooks/useSupportTeam";
import { isSuperAdmin } from "../../../../utils/permissions";

const TeamManagementTab = () => {
  const { admin } = useAdminAuth();
  const { users, fetchUsers, admins, fetchAdmins } = useAdminUsers();
  const { deliveryPartners, fetchDeliveryPartners } = useDeliveryPartners();
  const { supportTeamMembers, fetchSupportTeamMembers } = useSupportTeam();
  const [activeTab, setActiveTab] = React.useState("users");
  const isSuper = isSuperAdmin(admin?.role);

  // Fetch users, admins, delivery partners, and support team members on component mount
  React.useEffect(() => {
    fetchUsers();
    fetchAdmins();
    fetchDeliveryPartners();
    fetchSupportTeamMembers();
  }, [fetchUsers, fetchAdmins, fetchDeliveryPartners, fetchSupportTeamMembers]);

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
            { 
              id: "support_team", 
              label: "Support Team", 
              count: supportTeamMembers.length.toLocaleString() 
            },
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

        {activeTab === "support_team" && <SupportTeamManager />}
      </div>
    </>
  );
};

export default TeamManagementTab;
