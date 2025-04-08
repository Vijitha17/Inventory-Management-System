import React from "react";

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-blue-500 text-white p-6 rounded-lg shadow text-center">
        <p className="text-2xl font-bold">2</p>
        <p>Total Assets</p>
      </div>
      <div className="bg-red-400 text-white p-6 rounded-lg shadow text-center">
        <p className="text-2xl font-bold">8</p>
        <p>Total Departments</p>
      </div>
      <div className="bg-blue-400 text-white p-6 rounded-lg shadow text-center">
        <p className="text-2xl font-bold">3</p>
        <p>Total Suppliers</p>
      </div>
      <div className="bg-red-400 text-white p-6 rounded-lg shadow text-center">
        <p className="text-2xl font-bold">3</p>
        <p>Total Employees</p>
      </div>
    </div>
  );
};

export default Dashboard;




