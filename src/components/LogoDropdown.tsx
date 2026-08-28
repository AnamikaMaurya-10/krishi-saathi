import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.svg";
import { Home, User, ShieldCheck, LogOut } from "lucide-react";
import { useNavigate } from "react-router";

export function LogoDropdown() {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <img
            src={logo}
            alt="Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={() => navigate("/")} className="cursor-pointer">
          <Home className="mr-2 h-4 w-4" />
          Landing Page
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/login")} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          Farmer View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/officer")} className="cursor-pointer">
          <ShieldCheck className="mr-2 h-4 w-4" />
          Officer View
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate("/login")}
          className="cursor-pointer text-muted-foreground"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Switch Role
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
