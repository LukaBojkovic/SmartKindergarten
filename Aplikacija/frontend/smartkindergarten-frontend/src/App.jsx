import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import AppNavbar from "./components/AppNavbar";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import ChildrenPage from "./pages/ChildrenPage";
import GroupsPage from "./pages/GroupsPage";
import AttendancePage from "./pages/AttendancePage";
import DevelopmentProfilePage from "./pages/DevelopmentProfilePage";
import DailyReportsPage from "./pages/DailyReportsPage";
import NotificationsPage from "./pages/NotificationsPage";
import FinancePage from "./pages/FinancePage";
import SystemSettingsPage from "./pages/SystemSettingsPage";
import AccountPage from "./pages/AccountPage";
import { USER_ROLES } from "./constants/userRoles";

function App() {
  useEffect(() => {
    const handleInvalidField = (event) => {
      event.preventDefault();

      toast.warning("Popuni sva obavezna polja pre čuvanja.", {
        toastId: "required-fields-warning",
      });
    };

    document.addEventListener("invalid", handleInvalidField, true);

    return () => {
      document.removeEventListener("invalid", handleInvalidField, true);
    };
  }, []);

  return (
    <>
      <AppNavbar />

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/account"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.ADMINISTRATOR,
                USER_ROLES.TEACHER,
                USER_ROLES.PARENT,
                USER_ROLES.ADMINISTRATIVE_STAFF,]}>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={[
              USER_ROLES.ADMINISTRATOR
              ]}>
              <UsersPage
                title="Korisnici"
                description="Pregled i upravljanje korisničkim nalozima."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/children"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.ADMINISTRATOR,
                USER_ROLES.TEACHER,
                USER_ROLES.ADMINISTRATIVE_STAFF,
              ]}
            >
              <ChildrenPage
                title="Deca"
                description="Pregled i upravljanje podacima o deci."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups"
          element={
            <ProtectedRoute
              allowedRoles={[USER_ROLES.ADMINISTRATOR, USER_ROLES.TEACHER]}
            >
              <GroupsPage
                title="Grupe"
                description="Pregled i upravljanje vrtićkim grupama."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/development-profile"
          element={
            <ProtectedRoute allowedRoles={[
              USER_ROLES.ADMINISTRATOR,
              USER_ROLES.TEACHER,
               USER_ROLES.PARENT,
               ]}>
              <DevelopmentProfilePage
                title="Razvojni profil deteta"
                description="Beleške, procene i grafički prikaz napretka deteta."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={ 
            <ProtectedRoute allowedRoles={[
              USER_ROLES.ADMINISTRATOR,
              USER_ROLES.TEACHER,
              ]}>
              <AttendancePage
                title="Prisustvo"
                description="Evidencija prisustva dece po grupi i datumu."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/daily-reports"
          element={
            <ProtectedRoute allowedRoles={[
               USER_ROLES.ADMINISTRATOR,
               USER_ROLES.TEACHER,
               USER_ROLES.PARENT,
               ]}>
              <DailyReportsPage
                title="Dnevni izveštaji"
                description="Kreiranje, izmena i pregled dnevnih izveštaja."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={[
              USER_ROLES.ADMINISTRATOR,
              USER_ROLES.TEACHER, 
              USER_ROLES.PARENT, 
              USER_ROLES.ADMINISTRATIVE_STAFF
              ]}>
              <NotificationsPage
                title="Obaveštenja"
                description="Pregled i slanje obaveštenja."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/finance"
          element={
            <ProtectedRoute allowedRoles={[
              USER_ROLES.PARENT, 
              USER_ROLES.ADMINISTRATIVE_STAFF, 
              USER_ROLES.ADMINISTRATOR]}>
              <FinancePage
                title="Finansije"
                description="Pregled uplata i finansijskog statusa deteta."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/system-settings"
          element={
            <ProtectedRoute allowedRoles={[
              USER_ROLES.ADMINISTRATOR,
              ]}>
              <SystemSettingsPage
                title="Sistemska podešavanja"
                description="Pregled i izmena osnovnih podešavanja aplikacije."
              />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
