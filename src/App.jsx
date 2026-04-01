import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Show } from "@clerk/react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import HomeAssignments from "./pages/HomeAssignments";
import ClassActivity from "./pages/ClassActivity";

function App() {
  return (
    <BrowserRouter basename="/ddh-portal/">
      <Routes>
        {/* If Not Authenticated, Show Login. Otherwise, Redirect to Dashboard */}
        <Route path="/" element={
          <>
            <Show when='signed-out'>
              <Login />
            </Show>
            <Show when='signed-in'>
              <Navigate to="/dashboard" replace />
            </Show>
          </>
        } />

        {/* Protect Dashboard: Only Show when Authenticated */}
        <Route path="/dashboard" element={
          <Show when='signed-in' fallback={<Navigate to="/" replace />}>
            <Dashboard />
          </Show>
        } />
        <Route path="/home-assignments" element={
          <Show when='signed-in' fallback={<Navigate to="/" replace />}>
            <HomeAssignments />
          </Show>
        } />
        <Route path="/class-activity" element={
          <Show when='signed-in' fallback={<Navigate to="/" replace />}>
            <ClassActivity />
          </Show>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
