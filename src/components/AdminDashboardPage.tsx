import React from "react";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";

export default function AdminDashboardPage() {
  const { isAdmin, isLoading } = useFirebaseAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    navigate("/admin");
    return null;
  }

  return <AdminDashboard onBack={() => navigate("/")} />;
}
