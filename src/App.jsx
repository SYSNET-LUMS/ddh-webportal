import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Show } from "@clerk/react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import HomeAssignments from "./pages/HomeAssignments";
import HomeAssignmentEditor from "./pages/HomeAssignmentEditor";
import ClassActivity from "./pages/ClassActivity";
import ActivityPage from "./pages/ActivityPage";
import LiveActivityPage from "./pages/LiveActivityPage";
import BigScreenPage from "./pages/BigScreenPage";
import AdminPage from "./pages/AdminPage";
import Help from "./pages/Help";
import Assignment0 from "./pages/assignments/Assignment0";
import Assignment1 from "./pages/assignments/Assignment1";
import LiveSensorStream from "./pages/assignments/LiveSensorStream";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <BrowserRouter basename="/ddh-portal/">
      <Sidebar />
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
        <Route path="/help" element={
          <Show when='signed-in' fallback={<Navigate to="/" replace />}>
            <Help />
          </Show>
        } />
        <Route path="/home-assignments" element={
          <Show when='signed-in' fallback={<Navigate to="/" replace />}>
            <HomeAssignments />
          </Show>
        } />
        <Route path="/assignments/0" element={
          <Show when='signed-in' fallback={<Navigate to="/" replace />}>
            <Assignment0 />
          </Show>
        } />
        <Route path="/assignments/1" element={
          <Show when='signed-in' fallback={<Navigate to="/" replace />}>
            <Assignment1 />
          </Show>
        } />
        <Route path="/assignments/0/live-sensor-stream" element={
          <Show when='signed-in' fallback={<Navigate to="/" replace />}>
            <LiveSensorStream />
          </Show>
        } />
        <Route path="/home-assignments/editor/:id" element={
          <Show when='signed-in' fallback={<Navigate to="/" replace />}>
            <HomeAssignmentEditor />
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
        <Route path="/admin-control" element={
          <Show when='signed-in' fallback={<Navigate to="/" replace />}>
            <AdminPage />
          </Show>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
