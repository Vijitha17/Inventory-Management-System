import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Home from "./pages/Home";  // layout with Sidebar + Topbar
import Dashboard from './pages/Dashboard';
import MyAssets from './pages/MyAssets';
import InventoryItems from './pages/InventoryItems';
import AssignedAssets from './pages/AssignedAssets';
import CreateEntities from './pages/CreateEntities';
import UserManagement from './pages/UserManagement';
import AssignAssets from './pages/AssignAssets';
import Requests from './pages/Requests';
import Reports from './pages/Reports';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/home" element={<Home />}>
          <Route index element={<Dashboard />} />
          <Route path="myassets" element={<MyAssets />} />
          <Route path="inventoryitems" element={<InventoryItems />} />
          <Route path="assignedassets" element={<AssignedAssets />} />
          <Route path="createentities" element={<CreateEntities />} />
          <Route path="usermanagement" element={<UserManagement />} />
          <Route path="assignassets" element={<AssignAssets />} />
          <Route path="requests" element={<Requests />} />
          <Route path="reports" element={<Reports />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

