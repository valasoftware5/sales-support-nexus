import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Handshake, 
  CheckSquare, 
  BarChart3, 
  Settings,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  Zap,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCRMAuth } from "@/hooks/useCRMAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "@/lib/navigation";
import { toast } from "sonner";

interface SalesCRMLayoutProps {
  children: React.ReactNode;
}

const SalesCRMLayout = ({ children }: SalesCRMLayoutProps) => {
  const { user, signOut } = useCRMAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/sales-crm/auth');
  };

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-[hsl(225,30%,96%)]">
      {/* Main Content */}
      <div>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-16 bg-white border-b border-[hsl(225,20%,90%)] flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(225,15%,50%)]" />
              <Input 
                placeholder="Search leads, customers, deals..." 
                className="pl-10 bg-[hsl(225,30%,97%)] border-[hsl(225,20%,90%)] focus:bg-white focus:border-[hsl(225,85%,55%)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-[hsl(225,30%,40%)]">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[hsl(0,80%,55%)] text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 pl-4 border-l border-[hsl(225,20%,90%)] cursor-pointer hover:opacity-80">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-[hsl(225,85%,55%)] text-white">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-[hsl(225,30%,20%)]">{user?.email?.split('@')[0] || 'User'}</p>
                    <p className="text-xs text-[hsl(225,15%,50%)]">Sales Manager</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[hsl(225,15%,50%)]" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SalesCRMLayout;
