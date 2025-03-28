import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthUser {
  email: string;
  name: string;
  picture?: string;
  image?: string;
  sub?: string;
  is_host?: boolean;
  provider: 'google' | 'email';
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  getAuthHeader: () => { Authorization: string } | undefined;
  refreshUser: () => Promise<void>;
  session: Session | null;
}

// Define the profile interface to match the database structure
interface Profile {
  id: string;
  name: string;
  avatar_url?: string;
  is_host: boolean;
  created_at?: string;
  updated_at?: string;
  is_admin?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const getAuthHeader = () => {
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
    return undefined;
  };

  // Extract user data from Supabase User object
  const extractUserData = (supabaseUser: User): AuthUser => {
    return {
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata.name || supabaseUser.user_metadata.full_name || '',
      picture: supabaseUser.user_metadata.picture || supabaseUser.user_metadata.avatar_url,
      is_host: supabaseUser.user_metadata.is_host || false,
      provider: supabaseUser.app_metadata.provider === 'google' ? 'google' : 'email'
    };
  };

  useEffect(() => {
    // Set up the auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        // Only do synchronous updates to prevent potential deadlocks
        setSession(currentSession);
        
        if (currentSession?.user) {
          const userData = extractUserData(currentSession.user);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    // THEN check for an existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        const userData = extractUserData(currentSession.user);
        setUser(userData);
        setIsAuthenticated(true);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Successfully signed in!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('Registering user with name:', name);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name, // Store name in user_metadata
            full_name: name, // Also store as full_name for compatibility
            is_host: false
          }
        }
      });

      if (error) throw error;

      // Log the user metadata that was set
      console.log('User registered with metadata:', data?.user?.user_metadata);

      toast.success('Registration successful!');
      
      // If email confirmation is enabled, show a message
      if (!data.session) {
        toast.info('Please check your email for a confirmation link.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register');
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // These state updates will be triggered by the onAuthStateChange listener
      // but we can also set them here for immediate UI feedback
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      
      toast.success('Successfully signed out!');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Failed to logout');
    }
  };

  const refreshUser = async () => {
    try {
      if (!session?.user) return;
      
      // Refresh the user data from Supabase
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error refreshing user data:', error);
        return;
      }
      
      if (data?.user) {
        // Get user data from auth
        const userData = extractUserData(data.user);
        
        // Also check the profiles table for accurate is_host status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_host')
          .eq('id', data.user.id)
          .single();
          
        if (!profileError && profile) {
          // Update is_host from the profiles table (source of truth)
          userData.is_host = profile.is_host;
          
          // Also update the user metadata if it's different to keep in sync
          if (profile.is_host !== data.user.user_metadata.is_host) {
            console.log('Updating user metadata with is_host:', profile.is_host);
            await supabase.auth.updateUser({
              data: { is_host: profile.is_host }
            });
          }
        }
        
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const setUserAndPersist = (newUser: AuthUser | null) => {
    setUser(newUser);
    setIsAuthenticated(!!newUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      setUser: setUserAndPersist,
      loginWithEmail,
      register,
      getAuthHeader, 
      logout,
      refreshUser,
      session
    }}>
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
