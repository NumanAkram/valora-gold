import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isCollapsed={isCollapsed} />
      <div className="flex-1 flex flex-col">
        <AdminHeader onToggleSidebar={() => setIsCollapsed((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

