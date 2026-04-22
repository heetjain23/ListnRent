import React from 'react'
import { TbTruckDelivery } from "react-icons/tb";
import { FiMessageCircle } from "react-icons/fi";
import { MdOutlineDashboardCustomize , MdOutlineSupportAgent  } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { RxExit } from "react-icons/rx";


const TruckIcon = () => (
  <TbTruckDelivery size={18} />
)

const MessageIcon = () => (
  <FiMessageCircle size={18} />
)

const GridIcon = () => (
  <MdOutlineDashboardCustomize size={18} />
)

const UserIcon = () => (
  <CgProfile size={18} />
)

const SupportIcon = () => (
  <MdOutlineSupportAgent size={18} />
)

const LogoutIcon = () => (
  <RxExit size={18} />
)

const tabIcons = {
  deliveries: TruckIcon,
  messages: MessageIcon,
  dashboard: GridIcon,
  profile: UserIcon,
}

const DeliveryPartnerSidebar = ({ activeTab, setActiveTab, navTabs, onLogout }) => {
  return (
    <aside className="w-full border-b border-[#d8d6c8] bg-[#fbfaee] px-3 py-4 lg:h-screen lg:w-52.5 lg:border-b-0 lg:border-r lg:px-4 lg:py-5">
      <div className="flex h-full flex-col">
        <div>
          <h2 className="text-[34px] font-extrabold leading-none text-teal-950">ListnRent</h2>
          <p className="mt-1 text-sm text-stone-500">Partner Portal</p>
        </div>

        <nav className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1 lg:gap-2">
          {navTabs.map((tab) => {
            const Icon = tabIcons[tab.key] || GridIcon

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[15px] font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-teal-900 text-white shadow-[0_8px_18px_rgba(0,69,62,0.28)]'
                    : 'bg-transparent text-stone-500 hover:bg-stone-200 hover:text-teal-900'
                }`}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="mt-6 border border-dashed border-[#dbd8c9] lg:mt-auto" />

        <div className="mt-3 grid gap-1.5 border border-dashed border-[#dbd8c9] p-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[15px] font-medium text-stone-500 transition hover:bg-stone-200 hover:text-teal-900"
          >
            <SupportIcon />
            <span>Support</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[15px] font-medium text-stone-500 transition hover:bg-stone-200 hover:text-teal-900"
          >
            <LogoutIcon />
            <span>Sign Out</span>
          </button>
          <button
            type="button"
            className="mt-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-zinc-200 transition hover:bg-green-700"
          >
            Go Offline
          </button>
        </div>
      </div>
    </aside>
  )
}

export default DeliveryPartnerSidebar
