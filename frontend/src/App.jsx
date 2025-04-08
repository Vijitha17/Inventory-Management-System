import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Home from "./pages/Home";  // layout with Sidebar + Topbar
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/home" element={<Home />}>
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<Assets />} />
         <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

