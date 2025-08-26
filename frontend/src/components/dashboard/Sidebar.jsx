import React from 'react';
import {
  UserPlus, BookOpen, CheckSquare, LayoutDashboard,
} from "lucide-react";

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  title = "Contact Book",
  customItems = null 
}) => {
  const defaultSidebarItems = [
    { id: "contacts", label: "Home", icon: LayoutDashboard },
    { id: "documents", label: "Documents", icon: BookOpen },
    { id: "groups", label: "Groups", icon: UserPlus },
    { id: "task", label: "Task", icon: CheckSquare },
  ];

  const sidebarItems = customItems || defaultSidebarItems;

  return (
    <>
      {/* Sidebar collapsible */}
      <div className="fixed left-0 top-0 h-screen bg-white dark:bg-[#161b22] border-r border-slate-200 dark:border-[#30363d] z-50 group hover:w-60 w-16 transition-all duration-200 overflow-hidden flex flex-col">
        <div className="flex flex-col flex-shrink-0">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-300 my-8 px-4 h-[40px] flex items-center">
            <span className="overflow-hidden whitespace-nowrap transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs">
              {title}
            </span>
          </h2>
        </div>
        <nav className="flex flex-col space-y-2 px-2 flex-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center pl-3.5 py-2 rounded-xl cursor-pointer ${
                  activeTab === item.id
                    ? "bg-blue-100 dark:bg-indigo-300 text-blue-700 dark:text-indigo-900"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                } transition-all duration-100 ease-in-out`}
              >
                <Icon size={20} className="flex-shrink-0 " />
                <span className="ml-3 overflow-hidden whitespace-nowrap transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs">
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Dimming overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-45"></div>
    </>
  );
};

export default Sidebar;
