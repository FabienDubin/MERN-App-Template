import React, { useContext } from "react";
import { AuthContext } from "@/context/auth.context";
import { Navigate } from "react-router-dom";
import Loading from "@/components/Loading";

function IsPrivate({ children }) {
  //CONTEXT
  const { isLoggedIn, isLoading } = useContext(AuthContext);

  // If the authentication is still loading ⏳
  if (isLoading) {
    return <Loading />;
  }

  if (!isLoggedIn) {
    // If the user is not logged in navigate to the login page ❌
    return <Navigate to="/login" />;
  }
  // If the user is logged in, allow to see the page ✅
  return children;
}

export default IsPrivate;
