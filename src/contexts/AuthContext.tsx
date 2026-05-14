import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Profile } from '../types';
import { isAdminEmail } from '../constants/admins';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchProfile(user.uid);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const docRef = doc(db, 'profiles', userId);
      let docSnap;
      
      try {
        docSnap = await getDoc(docRef);
      } catch (getErr: any) {
        // Only log if it's not a permission error or similar that we might expect if profile doesn't exist
        // Actually, getDoc shouldn't fail if document doesn't exist, it should just return exists() === false
        // If it throws, it's likely a permission issue.
        if (getErr.code === 'permission-denied') {
          console.error('Permission denied while fetching profile:', userId);
        }
        throw getErr;
      }

      if (docSnap.exists()) {
        const data = docSnap.data() as Profile;
        setProfile(data);
      } else {
        // Profile doesn't exist yet
        setProfile(null);
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    } finally {
      setLoading(false);
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const isAdmin = profile?.role === 'admin' || isAdminEmail(user?.email);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
