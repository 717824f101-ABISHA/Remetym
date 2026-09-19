import React from 'react';
import { Sidebar } from '../common/Sidebar';
import { Header } from '../common/Header';

export const DashboardLayout = ({ title, children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header title={title} />
        <main className="page-container">{children}</main>
      </div>
    </div>
  );
};
