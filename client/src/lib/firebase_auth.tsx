import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
  UserCredential
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import type { User, Vendor, Driver, Hotel, Profession } from "@shared/schema";
import { COLLECTIONS } from "@shared/schema";
import { auth, db } from "@/lib/firebase";
import { sign } from "crypto";

interface AuthContextType {
  user: Vendor | Driver | null;
  vendor: Vendor | null;
  driver: Driver | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  signUp: (email: string, password: string, role: "vendor" | "driver" | "hotel_manager" | "skilled_professional") => Promise<void>;
  loginWithProfile: (email: string, password: string, userRole: "vendor" | "driver" | "hotel_manager" | "skilled_professional") => Promise<Vendor | Driver | Hotel | Profession>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  refreshVendor: () => Promise<void>;
  refreshDriver: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<Vendor | Driver>({} as Vendor | Driver);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completeUser, setCompleteUser] = useState<{}>(false);

  const fetchUserProfile = async (uid: string, userRole: string) => {
    console.log("Fetching user profile for UID:", uid);
    try {
      console.log("Current user role:", userRole);
      const collection = userRole === "vendor" ? "shops" : userRole === "driver" ? 'drivers' : userRole === 'hotel_manager' ? 'hotels' : 'professionals';
    console.log("Using collection:", collection);
      const userDoc = await getDoc(doc(db, collection, uid));
      console.log(userDoc.exists());
      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() } as Vendor | Driver;
        setCompleteUser(userData);
        setUser(userData);
        if (userData.role === "vendor") {
          await fetchVendorProfile(uid);
        } else if (userData.role === "driver") {
          await fetchDriverProfile(uid);
        }
        return userData;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Fetch vendor profile
  const fetchVendorProfile = async (userId: string) => {
    try {
      const vendorsSnapshot = await getDoc(doc(db, COLLECTIONS.VENDORS, userId));
      if (vendorsSnapshot.exists()) {
        const vendorData = { id: vendorsSnapshot.id, ...vendorsSnapshot.data() } as Vendor;
        setVendor(vendorData);
      }
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
    }
  };

  // Fetch driver profile
  const fetchDriverProfile = async (userId: string) => {
    try {
      const driverSnapshot = await getDoc(doc(db, COLLECTIONS.DRIVERS, userId));
      if (driverSnapshot.exists()) {
        const driverData = { id: driverSnapshot.id, ...driverSnapshot.data() } as Driver;
        setDriver(driverData);
      }
    } catch (error) {
      console.error("Error fetching driver profile:", error);
    }
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid, 'driver');
      } else {
        setUser({} as Vendor | Driver);
        setVendor(null);
        setDriver(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, role: "vendor" | "driver" | "hotel_manager" | "skilled_professional") => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const userData = {
        email,
        role,
        onboardingComplete: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };



      await setDoc(doc(db, COLLECTIONS.USERS, uid), userData);
      
      await fetchUserProfile(uid, role);
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };


  const loginWithProfile = async (email: string, password: string, userRole: string): Promise<Vendor | Driver | Hotel | Profession> => {
    try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential);
    const fireStoreUser = await fetchUserProfile(userCredential.user.uid, userRole);
    const role = fireStoreUser?.role;
    console.log(fireStoreUser);
    const signedInUser = role === 'vendor' ? { ...fireStoreUser } as Vendor : { ...fireStoreUser } as Driver;
    setUser(signedInUser);
    return signedInUser;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};
  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser({} as Vendor | Driver);
      setVendor(null);
      setDriver(null);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  const updateUser = async (updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!firebaseUser) {
      throw new Error("No user logged in");
    }

    try {
      const collection = user.role === "vendor" ? "shops" : "drivers";
      const userRef = doc(db, collection, firebaseUser.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      if (user) {
        setUser({ ...user, ...updates });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const refreshVendor = async () => {
    if (firebaseUser) {
      await fetchVendorProfile(firebaseUser.uid);
    }
  };

  const refreshDriver = async () => {
    if (firebaseUser) {
      await fetchDriverProfile(firebaseUser.uid);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      vendor,
      driver,
      firebaseUser,
      isLoading,
      signUp,
      loginWithProfile,
      logout,
      updateUser,
      refreshVendor,
      refreshDriver,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}