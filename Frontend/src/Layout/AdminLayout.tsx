
import Sidebar from "../Components/Sidebar";
import { Outlet } from "react-router";
import { useState } from "react";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen">
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-content2 border-r border-divider`}>
          <Sidebar />
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto m-5 bg-content2 rounded-2xl">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
}
