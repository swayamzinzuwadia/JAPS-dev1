import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import {
  FirebaseAuthProvider,
  useFirebaseAuth,
} from "./contexts/FirebaseAuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import AboutUs from "./components/AboutUs";
import BookingCalendar from "./components/BookingCalendar";
import BookingForm from "./components/BookingForm";
import ContactUs from "./components/ContactUs";
import AuthModal from "./components/AuthModal";
import AdminLoginModal from "./components/AdminLoginModal";
import AdminLoginPage from "./components/AdminLoginPage";
import AdminDashboardPage from "./components/AdminDashboardPage";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import DataInitializer from "./components/DataInitializer";
import FirebaseTest from "./components/FirebaseTest";
import FirestorePopulator from "./components/FirestorePopulator";
import QuickBookingForm from "./components/QuickBookingForm";

function HomePage() {
  const { user, isAdmin } = useAuth();
  const { user: firebaseUser, isAdmin: firebaseIsAdmin } = useFirebaseAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [view, setView] = useState<
    "home" | "user-dashboard" | "admin-dashboard"
  >("home");

  // Use Firebase auth for admin, Supabase for regular users
  const currentUser = firebaseIsAdmin ? firebaseUser : user;
  const currentIsAdmin = firebaseIsAdmin;

  const handleBookNow = () => {
    if (!currentUser) {
      setShowAuthModal(true);
    } else {
      setShowBookingForm(true);
    }
  };

  const handleAdminClick = () => {
    if (currentIsAdmin) {
      setView("admin-dashboard");
    } else {
      setShowAdminLoginModal(true);
    }
  };

  if (view === "user-dashboard" && currentUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header
          onAuthClick={() => setShowAuthModal(true)}
          onDashboardClick={() => setView("home")}
          onAdminClick={handleAdminClick}
        />
        <UserDashboard onBack={() => setView("home")} />
      </div>
    );
  }

  if (view === "admin-dashboard" && currentIsAdmin) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header
          onAuthClick={() => setShowAuthModal(true)}
          onDashboardClick={() => setView("home")}
          onAdminClick={() => setView("home")}
        />
        <AdminDashboard onBack={() => setView("home")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header
        onAuthClick={() => setShowAuthModal(true)}
        onDashboardClick={() => setView("user-dashboard")}
        onAdminClick={handleAdminClick}
      />
      <Hero onBookNow={handleBookNow} />
      <AboutUs />
      <BookingCalendar />

      {/* Temporary Firebase Test Component */}
      <section className="py-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FirebaseTest />
        </div>
      </section>

      {/* Firestore Populator */}
      <section className="py-8 bg-blue-50 dark:bg-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FirestorePopulator />
        </div>
      </section>

      
      <ContactUs />

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {showAdminLoginModal && (
        <AdminLoginModal onClose={() => setShowAdminLoginModal(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <FirebaseAuthProvider>
        <AuthProvider>
          <DataInitializer>
            <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/admin" element={<AdminLoginPage />} />
                <Route
                  path="/admin-dashboard"
                  element={<AdminDashboardPage />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </DataInitializer>
        </AuthProvider>
      </FirebaseAuthProvider>
    </ThemeProvider>
  );
}

export default App;
