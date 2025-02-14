import authService from "@/services/auth.service";
import { useContext, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

//MEDIAS
import Logo from "@/components/Logo";
import { Send, Siren } from "lucide-react";

//COMPONENTS
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/context/auth.context";

const ResetPassword = () => {
  //STATES
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  //CONTEXT
  const { isLoggedIn } = useContext(AuthContext);

  //PARAMS
  const { token } = useParams();
  const nav = useNavigate();

  //TOAST
  const { toast } = useToast();

  //HANDLERS
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return console.log("Password is not defined");
    try {
      const response = await authService.resetPassword(token, { password });
      if (isLoggedIn) {
        toast({
          title: "Password updated",
          description: "Redirecting to profile page",
        });
        nav("/profile");
      } else {
        toast({
          title: "Password updated",
          description: "Redirecting to login page",
        });
        nav("/login");
      }
    } catch (error) {
      setMessage(error.response.data.message);
      console.log(error);
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
                Password reset
              </CardTitle>
              <CardDescription>Please choose a new password</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col w-full">
              <form onSubmit={handleSubmit}>
                <div>
                  <Input
                    className="mb-2"
                    type="password"
                    placeholder="Your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button className="mt-4 w-full">
                  <Send />
                  Save
                </Button>
              </form>
            </CardContent>
            <CardFooter className="w-full">
              {message && (
                <Alert className="mt-4 w-full">
                  <Siren className="h-4 w-4" />
                  <AlertTitle>Oups!</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
