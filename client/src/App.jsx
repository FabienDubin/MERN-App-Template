import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import "./index.css";

//COMPONENTS
import { ThemeProvider } from "@/components/ThemeProvider";
import IsAnonymous from "@/components/IsAnonymous";
import IsPrivate from "@/components/IsPrivate";
import IsAdmin from "./components/IsAdmin";
import { Button } from "@/components/ui/button";

//PAGES
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import UsersDashboard from "./pages/Dashboard/UsersDashboard";
import NotFound from "./pages/NotFound";
import NotAuthorized from "./pages/NotAuthorized";
import Layout from "./components/Sidebar/Layout";
import SettingsDashboard from "./pages/Dashboard/SettingsDashboard";
import RootLayout from "./components/ToastLayout";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  //LOCATION
  const location = useLocation();
  //remove the navbar on the signup the login a,d the dashboard page
  const noNavbarRoutes = ["/login", "/signup"];
  const hideNavbar =
    noNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/reset-password");

  return (
    <>
      <ThemeProvider>
        {!hideNavbar && <Navbar />}

        <RootLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                <IsAnonymous>
                  <Login />
                </IsAnonymous>
              }
            />
            <Route
              path="/reset-password"
              element={
                <IsAnonymous>
                  <ForgotPassword />
                </IsAnonymous>
              }
            />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route
              path="/signup"
              element={
                <IsAnonymous>
                  <Signup />
                </IsAnonymous>
              }
            />
            <Route
              path="/dashboard/*"
              element={
                <IsPrivate>
                  <IsAdmin>
                    <Layout>
                      <Routes>
                        {/* Here are all the pages of the admin dashboard */}
                        <Route path="" element={<AdminDashboard />} />
                        <Route path="users" element={<UsersDashboard />} />
                        <Route
                          path="settings"
                          element={<SettingsDashboard />}
                        />
                      </Routes>
                    </Layout>
                  </IsAdmin>
                </IsPrivate>
              }
            />
            <Route
              path="/profile"
              element={
                <IsPrivate>
                  <Profile />
                </IsPrivate>
              }
            />
            <Route path="/not-authorized" element={<NotAuthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RootLayout>
      </ThemeProvider>
    </>
  );
}

export default App;
