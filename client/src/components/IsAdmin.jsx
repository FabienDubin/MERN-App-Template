import React, { useContext } from "react";
import { AuthContext } from "@/context/auth.context";
import Loading from "@/components/Loading";
import { Navigate } from "react-router-dom";

const IsAdmin = ({ children }) => {
  //CONTEXT
  const { isLoggedIn, isLoading, user } = useContext(AuthContext);

  if (isLoading) {
    return <Loading />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/not-authorized" />;
  }
  return children;
};

export default IsAdmin;
