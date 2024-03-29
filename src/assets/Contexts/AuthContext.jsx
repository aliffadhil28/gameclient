/* eslint-disable react/prop-types */
import React, { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const socket = io.connect("https://gametrust.localgems.my.id");
  const BaseUrl = axios.create({
    baseURL: "https://gametrust.localgems.my.id",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  const [user, setUser] = useState(() => {
    let userProfile = localStorage.getItem("userProfile");
    if (userProfile && userProfile !== "undefined") {
      try {
        return JSON.parse(userProfile);
      } catch (error) {
        console.error("Error parsing user profile:", error);
      }
    }
    return null;
  });

  const navigate = useNavigate();
  const login = async (payload) => {
    try {
      let profile = await BaseUrl.post("/auth/login", payload);
      localStorage.setItem("userProfile", JSON.stringify(profile.data.user));
      setUser(profile.data.user);
      navigate("/");
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login,socket,BaseUrl }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
