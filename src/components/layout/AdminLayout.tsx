import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/courses', label: 'Courses', icon: BookOpen },
    { path: '/admin/students', label: 'Students', icon: Users },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/profile', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <span className="text-lg font-display font-bold text-sidebar-foreground">LearnHub</span>
            <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
              isActive(item.path)
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
            <ChevronRight className={cn(
              "w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity",
              isActive(item.path) && "opacity-100"
            )} />
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent">
          <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-primary-foreground">
              {profile?.full_name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.full_name || 'Admin User'}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {profile?.email || 'admin@learnhub.com'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-sidebar fixed left-0 top-0 bottom-0 border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-sidebar border-b border-sidebar-border flex items-center px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 ml-4">
          <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-foreground" />
          </div>
          <span className="text-lg font-display font-bold text-sidebar-foreground">LearnHub</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
