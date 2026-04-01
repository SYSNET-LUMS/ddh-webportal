import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Show } from "@clerk/react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import HomeAssignments from "./pages/HomeAssignments";
import ClassActivity from "./pages/ClassActivity";
import ActivityPage from "./pages/ActivityPage";
import LiveActivityPage from "./pages/LiveActivityPage";
import BigScreenPage from "./pages/BigScreenPage";

function App() {
  return (
    <BrowserRouter basename="/ddh-portal/">
      <Routes>
        {/* Unprotected BigScreen Projector Route */}
        <Route path="/big-screen" element={<BigScreenPage />} />

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
        <Route path="/activity" element={
          <Show when='signed-in' fallback={<Navigate to="/" replace />}>
            <ActivityPage />
          </Show>
        } />
        <Route path="/live-activity" element={
          <Show when='signed-in' fallback={<Navigate to="/" replace />}>
            <LiveActivityPage />
          </Show>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
