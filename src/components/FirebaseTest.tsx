import React, { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function FirebaseTest() {
  const [firebaseStatus, setFirebaseStatus] = useState<string>("Checking...");
  const [authStatus, setAuthStatus] = useState<string>("Checking...");

  useEffect(() => {
    // Test Firebase connection
    try {
      setFirebaseStatus("✅ Firebase connected successfully");

      // Test Auth state
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setAuthStatus(`✅ User authenticated: ${user.email}`);
        } else {
          setAuthStatus("ℹ️ No user authenticated");
        }
      });

      return () => unsubscribe();
    } catch (error) {
      setFirebaseStatus(`❌ Firebase error: ${error}`);
      setAuthStatus("❌ Auth error");
    }
  }, []);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Firebase Status</h3>
      <p className="text-sm mb-1">{firebaseStatus}</p>
      <p className="text-sm">{authStatus}</p>
    </div>
  );
}
