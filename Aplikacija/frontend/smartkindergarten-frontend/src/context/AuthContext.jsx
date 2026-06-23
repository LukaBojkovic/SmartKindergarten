import { useEffect, useState } from "react";
import authApi from "../api/authApi";
import AuthContext from "./authContext";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken || isTokenExpired(storedToken)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }

    return storedToken;
  });

  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!storedToken || isTokenExpired(storedToken) || !storedUser) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setToken(null);
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

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

  function isTokenExpired(token) 
  {
  if (!token)
    return true;

  try 
  {
    const payload = parseJwtPayload(token);

    if (!payload?.exp) {
      return true;
    }

    return payload.exp * 1000 <= Date.now();
  } 
  catch 
  {
    return true;
  }
}

function parseJwtPayload(token) 
  {
  const payloadBase64Url = token.split(".")[1];

  const payloadBase64 = payloadBase64Url
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const payloadJson = atob(payloadBase64);

  return JSON.parse(payloadJson);
  }
}