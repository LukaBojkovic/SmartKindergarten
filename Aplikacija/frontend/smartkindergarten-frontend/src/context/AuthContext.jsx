import { useState } from "react";
import authApi from "../api/authApi";
import AuthContext from "./authContext";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    
    return storedUser ? JSON.parse(storedUser) : null;
  });


  const login = async (username, password) => {
    const loginResponse = await authApi.login(username, password);

    localStorage.setItem("token", loginResponse.token);
    localStorage.setItem("user", JSON.stringify(loginResponse));

    setToken(loginResponse.token);
    setUser(loginResponse);

    return loginResponse;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}