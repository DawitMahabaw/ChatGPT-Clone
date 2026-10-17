import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, signupUser, getCurrentUser } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("chatgpt_token"));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // 'login' or 'signup'

  // Hydrate user on initial load if token exists
  useEffect(() => {
    const hydrateUser = async () => {
      const savedToken = localStorage.getItem("chatgpt_token");
      if (savedToken) {
        try {
          const profile = await getCurrentUser();
          setUser(profile);
          setToken(savedToken);
        } catch (error) {
          console.warn("Failed to restore auth session:", error.message);
          localStorage.removeItem("chatgpt_token");
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    hydrateUser();
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    localStorage.setItem("chatgpt_token", data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
    return data;
  };

  const signup = async (credentials) => {
    const data = await signupUser(credentials);
    localStorage.setItem("chatgpt_token", data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("chatgpt_token");
    setToken(null);
    setUser(null);
  };

  const openLoginModal = () => {
    setAuthModalMode("login");
    setIsAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthModalMode("signup");
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openLoginModal,
        openSignupModal,
        closeAuthModal,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
