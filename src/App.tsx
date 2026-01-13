import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import LoginPage from "./pages/LoginPage";
import StudentLayout from "./components/layout/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import CourseMarketplace from "./pages/student/CourseMarketplace";
import MyCourses from "./pages/student/MyCourses";
import CourseDetail from "./pages/student/CourseDetail";
import StudentProfile from "./pages/student/StudentProfile";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminProfile from "./pages/admin/AdminProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Components
const StudentRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, userRole } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (userRole !== 'student') return <Navigate to="/admin/dashboard" />;
  return <StudentLayout>{children}</StudentLayout>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, userRole } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (userRole !== 'admin') return <Navigate to="/student/dashboard" />;
  return <AdminLayout>{children}</AdminLayout>;
};

const AppRoutes = () => {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <Routes>
      <Route path="/" element={
        isAuthenticated 
          ? <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />
          : <Navigate to="/login" />
      } />
      <Route path="/login" element={
        isAuthenticated 
          ? <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />
          : <LoginPage />
      } />
      
      {/* Student Routes */}
      <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
      <Route path="/student/marketplace" element={<StudentRoute><CourseMarketplace /></StudentRoute>} />
      <Route path="/student/my-courses" element={<StudentRoute><MyCourses /></StudentRoute>} />
      <Route path="/student/course/:courseId" element={<StudentRoute><CourseDetail /></StudentRoute>} />
      <Route path="/student/profile" element={<StudentRoute><StudentProfile /></StudentRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/courses" element={<AdminRoute><AdminCourses /></AdminRoute>} />
      <Route path="/admin/students" element={<AdminRoute><AdminStudents /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
