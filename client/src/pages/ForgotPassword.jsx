// This page is a form that triggers an email via the server with a unique token to the Reset Password page
import { useState } from "react";
import authService from "@/services/auth.service";
import { Link } from "react-router-dom";

//MEDIAS
import Logo from "@/components/Logo";
import { Send } from "lucide-react";

//COMPONENTS
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ForgotPassword = () => {
  //STATES
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  //HANDLERS
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return console.log("email is not defined");
    try {
      const request = { email };
      const response = await authService.forgotPassword(request);
      setMessage(response.data.message);
    } catch (error) {
      console.log(error);
      setMessage(error.message);
    }
  };

  return (
    <div>
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
              <CardTitle className="text-3xl font-bold">
                Forgot password
              </CardTitle>
              <CardDescription>
                Fill the form to send a reset link
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col w-full">
              {!message && (
                <form onSubmit={handleSubmit}>
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

                  <Button className="mt-4 w-full">
                    <Send />
                    Send reset link
                  </Button>
                </form>
              )}
              {message && (
                <div>
                  <p>
                    Check your emails and follow the link to reset your
                    password...
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
