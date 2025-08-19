import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import TeacherLogin from "./pages/TeacherLogin";
import StudentLogin from "./pages/StudentLogin";
import AdminDashboard from "./pages/AdminDashboard";
import StudentQuiz from "./pages/StudentQuiz";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: string[];
}> = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, userRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// App Routes Component (needs to be inside AuthProvider)
const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
        
        {/* Protected Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student-quiz/:studentId" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentQuizWrapper />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student-quiz" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentQuizWrapper />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

// Wrapper component for StudentQuiz to handle logout
const StudentQuizWrapper: React.FC = () => {
  const { logout } = useAuth();
  
  // Get student ID from URL params or sessionStorage
  const studentId = new URLSearchParams(window.location.search).get('studentId') || 
                   sessionStorage.getItem('currentStudentId') || 
                   window.location.pathname.split('/').pop() || '';
  
  const handleLogout = () => {
    sessionStorage.removeItem('currentStudentId');
    logout();
  };
  
  return <StudentQuiz studentId={studentId} onLogout={handleLogout} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;