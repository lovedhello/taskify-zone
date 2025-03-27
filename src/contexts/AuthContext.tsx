
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

  useEffect(() => {
    // Set up the auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        // Only do synchronous updates to prevent potential deadlocks
        setSession(currentSession);
        
        if (currentSession?.user) {
          const userData: AuthUser = {
            email: currentSession.user.email || '',
            name: currentSession.user.user_metadata.name || '',
            picture: currentSession.user.user_metadata.picture,
            is_host: currentSession.user.user_metadata.is_host,
            provider: currentSession.user.app_metadata.provider === 'google' ? 'google' : 'email'
          };
          setUser(userData);
          setIsAuthenticated(true);
          
          // Use setTimeout to defer the profile fetch to avoid deadlocks
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
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
        const userData: AuthUser = {
          email: currentSession.user.email || '',
          name: currentSession.user.user_metadata.name || '',
          picture: currentSession.user.user_metadata.picture,
          is_host: currentSession.user.user_metadata.is_host,
          provider: currentSession.user.app_metadata.provider === 'google' ? 'google' : 'email'
        };
        setUser(userData);
        setIsAuthenticated(true);
        
        fetchUserProfile(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Check if we have a profiles table with additional user data
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (profileData) {
        setUser(currentUser => {
          if (!currentUser) return null;
          return {
            ...currentUser,
            name: profileData.name || currentUser.name,
            picture: profileData.avatar_url || currentUser.picture,
            is_host: profileData.is_host || currentUser.is_host
          };
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            is_host: false
          }
        }
      });

      if (error) throw error;

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
      if (!session?.user?.id) return;
      
      await fetchUserProfile(session.user.id);
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
