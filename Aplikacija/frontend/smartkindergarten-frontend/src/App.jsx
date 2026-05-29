import { Navigate, Route, Routes } from "react-router-dom";
import AppNavbar from "./components/AppNavbar";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import TemporaryPage from "./pages/TemporaryPage";
import UsersPage from "./pages/UsersPage";

function App() {
  return (
    <>
      <AppNavbar />

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
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]}>
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
                "Administrator",
                "Teacher",
                "Parent",
                "AdministrativeStaff",
              ]}
            >
              <TemporaryPage
                title="Deca"
                description="Pregled i upravljanje podacima o deci."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups"
          element={
            <ProtectedRoute allowedRoles={["Administrator", "Teacher"]}>
              <TemporaryPage
                title="Grupe"
                description="Pregled i upravljanje vrtićkim grupama."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/development-profile"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "Parent"]}>
              <TemporaryPage
                title="Razvojni profil deteta"
                description="Beleške, procene i grafički prikaz napretka deteta."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={["Teacher"]}>
              <TemporaryPage
                title="Prisustvo"
                description="Evidencija prisustva dece po grupi i datumu."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/daily-reports"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "Parent"]}>
              <TemporaryPage
                title="Dnevni izveštaji"
                description="Kreiranje, izmena i pregled dnevnih izveštaja."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "Parent", "Administrator"]}>
              <TemporaryPage
                title="Obaveštenja"
                description="Pregled i slanje obaveštenja."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/finance"
          element={
            <ProtectedRoute allowedRoles={["Parent", "AdministrativeStaff", "Administrator"]}>
              <TemporaryPage
                title="Finansije"
                description="Pregled uplata i finansijskog statusa deteta."
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/system-settings"
          element={
            <ProtectedRoute allowedRoles={["Administrator"]}>
              <TemporaryPage
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