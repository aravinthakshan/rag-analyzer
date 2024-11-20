import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-800 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;