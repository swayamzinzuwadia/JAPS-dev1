import React, { useEffect, useState } from "react";
import { initializeSampleData } from "../lib/firestoreService";

interface DataInitializerProps {
  children: React.ReactNode;
}

export default function DataInitializer({ children }: DataInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log("🔄 Starting data initialization...");
        await initializeSampleData();
        console.log("✅ Data initialization completed");
        setIsInitialized(true);
      } catch (error: any) {
        console.error("❌ Failed to initialize sample data:", error);
        setError(error.message || "Failed to initialize data");
        // Still show the app even if initialization fails
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("⚠️ Data initialization timeout - showing app anyway");
        setIsLoading(false);
        setIsInitialized(true);
      }
    }, 10000); // 10 second timeout

    initializeData();

    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Initializing data...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This may take a few moments
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg max-w-md mx-auto">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
