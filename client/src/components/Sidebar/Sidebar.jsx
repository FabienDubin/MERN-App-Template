import { useContext } from "react";
import { AuthContext } from "@/context/auth.context";
import { Link } from "react-router-dom";
import { FALLBACK_IMG } from "@/config/fallbackimg.config";

//COMPONENTS
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

//MEDIAS
import { Home, SquareUserRound, Settings2 } from "lucide-react";
import Monogram from "../Monogram";

//List of Items in the Sidebar
//Add here all the components available in the dashboard
const items = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Users", url: "/dashboard/users", icon: SquareUserRound },
  { title: "Setting", url: "/dashboard/settings", icon: Settings2 },
];

export function AppSidebar() {
  //CONTEXT
  const { user } = useContext(AuthContext);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex flex-row items-center w-full">
          <div className="w-1/5 gap-2">
            <Monogram />
          </div>

          <div className="w-3/5 ml-4 flex-col justify-start items-stretch">
            <h1 className="text-l font-bold">Dashboard</h1>
            <p className="text-sm font-thin">Admin</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col justify-between">
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <Link to="/">
            <Button className="w-full">
              <Home />
              Go to Home
            </Button>
          </Link>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center">
          <Avatar>
            <AvatarImage
              src={user.image || FALLBACK_IMG}
              className="rounded-full border-2 border-gray-100"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center ml-4">
            <h1 className="font-semibold">{user.name}</h1>
            <h2 className="text-xs font-thin">{user.email}</h2>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
