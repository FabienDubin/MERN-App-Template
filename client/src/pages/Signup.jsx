import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "@/services/auth.service";
import { AuthContext } from "@/context/auth.context";
import ReCAPTCHA from "react-google-recaptcha";

//COMPONENTS
import { Siren, UserRoundPlus } from "lucide-react";
import Logo from "@/components/Logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
function Signup() {
  //STATES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const [errorMessage, setErrorMessage] = useState(undefined);

  //CONTEXT
  const { storeToken, authenticateUser } = useContext(AuthContext);

  //NAVIGATION
  const nav = useNavigate();

  //HANDLERS
  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      // Creating the new user object
      const newUser = { email, password, firstName, lastName, recaptchaToken };

      //Posting the request
      const response = await authService.signup(newUser);
      // Storing the token in the context
      storeToken(response.data.user.token);
      //Checking the token and login the user
      await authenticateUser();
      // If the POST request is successful redirect to the home page
      nav("/");
    } catch (error) {
      // If the request resolves with an error, set the error message in the state
      console.log(error);
      const errorDescription = error.response.data.message;
      setErrorMessage(errorDescription);
    }
  };

  return (
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
          <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
          <CardDescription>
            Fill the form to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col w-full">
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col ">
              <Label className="text-lg font-medium my-1">Firstname</Label>
              <Input
                className="mb-2"
                type="text"
                placeholder="This will be on your profile"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col ">
              <Label className="text-lg font-medium my-1">Lastname</Label>
              <Input
                className="mb-2"
                type="text"
                placeholder="This will be on your profile"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
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
                placeholder="...don't put pass123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-lg font-medium my-1">
                Confirm Password
              </Label>
              <Input
                className="mb-2"
                type="password"
                placeholder="...don't put pass123"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={(token) => setRecaptchaToken(token)}
              className="my-4"
            />
            <Button
              className=" w-full"
              disabled={
                !recaptchaToken ||
                !email ||
                !password ||
                !confirmPassword ||
                !firstName ||
                !lastName ||
                password !== confirmPassword
              }
            >
              <UserRoundPlus />
              Sign Up
            </Button>
          </form>
          {errorMessage && (
            <Alert className="mt-4">
              <Siren className="h-4 w-4" />
              <AlertTitle>Oups!</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm mt-8 text-center">
            Already have an account? Go to the{" "}
            <a href="/login" className=" hover:text-gray-700 underline">
              login page!
            </a>
          </p>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}

export default Signup;
