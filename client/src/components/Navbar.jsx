import React, { useContext } from "react";
import { AuthContext } from "@/context/auth.context";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeProvider";

//COMPONENTS
import Logo from "@/components/Logo";
import { FALLBACK_IMG } from "@/config/envVar.config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sun,
  Moon,
  SunMoon,
  UserRoundPlus,
  LogIn,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  //CONTEXT
  const { user, isLoggedIn, logOutUser } = useContext(AuthContext);

  //THEME
  const { theme, setTheme } = useTheme();

  //NAVIGATION
  const nav = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <Link to="/" className="m-4 h-12 w-auto">
        <Logo />
      </Link>

      {/* When the user is loggedin */}
      {isLoggedIn && (
        <div>
          {/* // Desktop version */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="m-4">
                  <AvatarImage src={user.image ? user.image : FALLBACK_IMG} />
                  <AvatarFallback>??</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <Link to="/profile">
                  <DropdownMenuItem>My Profile</DropdownMenuItem>
                </Link>

                {/* Admin access to dashboard */}
                {user.role === "admin" && (
                  <Link to="/dashboard">
                    <DropdownMenuItem>Admin Dashboard</DropdownMenuItem>
                  </Link>
                )}

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        value={theme}
                        onValueChange={setTheme}
                      >
                        <DropdownMenuRadioItem value="light">
                          <Sun className="mr-2 h-4" /> Light
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="dark">
                          <Moon className="mr-2 h-4" /> Dark
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="system">
                          <SunMoon className="mr-2 h-4" />
                          System
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 font-bold"
                  onClick={logOutUser}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* // Mobile version */}
          <div className=" md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Menu />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <Link to="/profile">
                  <DropdownMenuItem>Mon Profil</DropdownMenuItem>
                </Link>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        value={theme}
                        onValueChange={setTheme}
                      >
                        <DropdownMenuRadioItem value="light">
                          <Sun className="mr-2 h-4" /> Light
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="dark">
                          <Moon className="mr-2 h-4" /> Dark
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="system">
                          <SunMoon className="mr-2 h-4" />
                          System
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>
                  <LogOut />
                  Logout
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* When the user is not logged in, show the login and sign up buttons. */}
      {!isLoggedIn && (
        <div>
          <Button
            variant="secondary"
            className="mx-2"
            onClick={() => nav("/signup")}
          >
            <UserRoundPlus />
            SignUp
          </Button>
          <Button className="mr-4" onClick={() => nav("/login")}>
            <LogIn /> Login
          </Button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
