import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "@/services/auth.service";
import { AuthContext } from "@/context/auth.context";

//COMPONENTS
import Logo from "@/components/Logo";
import { LogIn, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Login = () => {
  //STATES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(undefined);

  //NAVIGATION
  const nav = useNavigate();

  //CONTEXT
  const { user, storeToken, authenticateUser } = useContext(AuthContext);

  //HANDLES
  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    try {
      const request = { email, password };
      //Posting the login request
      const response = await authService.login(request);
      //Store the token in the local storage
      storeToken(response.data.authToken);
      //Set the authenticated user
      await authenticateUser();
      //Redirect to the home page
      nav("/");
    } catch (error) {
      console.log(error);
      setErrorMessage(error.response.data.message);
    }
  };

  // EFFECT: Listen for Cmd+Enter or Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        handleLogin();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [email, password]);

  return (
    <div>
      <div className="flex flex-col justify-center items-center md:block md:relative ">
        <Link
          to="/"
          className="hidden md:w-2/3 h-lvh  absolute  left-0 z-[-1] md:flex flex-col items-center justify-center"
        >
          <Logo />
        </Link>
        <Card className="w-full md:w-1/2 xl:w-1/3 h-lvh md:absolute md:right-0 flex flex-col justify-center items-center">
          <Link to="/" className=" md:hidden ">
            <Logo />
          </Link>
          <CardHeader className="w-full">
            <CardTitle className="text-3xl font-bold">Login</CardTitle>
            <CardDescription>Fill the form to access the app</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col w-full">
            <form onSubmit={handleLogin}>
              <div>
                <Label className="text-lg font-medium my-1">Email</Label>
                <Input
                  className="mb-2"
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="text-lg font-medium my-1">Password</Label>
                <Input
                  className="mb-2"
                  type="password"
                  placeholder="Your super secret password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <p className="text-sm">
                Don't have an account yet? Go to the{" "}
                <a href="/signup" className=" hover:text-gray-700 underline">
                  signup page!
                </a>
              </p>
              <Button className="mt-4 w-full">
                <LogIn />
                Login
              </Button>
            </form>
            {errorMessage && (
              <Alert className="mt-4">
                <Siren className="h-4 w-4" />
                <AlertTitle>Oups!</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-sm">
              <a
                href="/reset-password"
                className=" hover:text-gray-700 underline"
              >
                Forgot password ?
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
