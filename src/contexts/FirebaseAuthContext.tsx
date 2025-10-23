import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  auth,
  signInAsAdmin,
  signOutUser,
  ADMIN_CREDENTIALS,
} from "../lib/firebase";

interface FirebaseAuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signInAsAdmin: () => Promise<User>;
  signOut: () => Promise<void>;
  adminCredentials: typeof ADMIN_CREDENTIALS;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(
  undefined
);

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error(
      "useFirebaseAuth must be used within a FirebaseAuthProvider"
    );
  }
  return context;
};

interface FirebaseAuthProviderProps {
  children: React.ReactNode;
}

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = user?.email === ADMIN_CREDENTIALS.email;

  const signIn = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInAsAdmin();
      return userCredential;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await signOutUser();
    } finally {
      setIsLoading(false);
    }
  };

  const value: FirebaseAuthContextType = {
    user,
    isAdmin,
    isLoading,
    signInAsAdmin: signIn,
    signOut,
    adminCredentials: ADMIN_CREDENTIALS,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
