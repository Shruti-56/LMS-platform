import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockStudents, mockAdmin, Student, AdminUser } from '@/data/mockData';

// TODO: Replace with real authentication when backend is connected

type UserRole = 'student' | 'admin' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  currentStudent: Student | null;
  currentAdmin: AdminUser | null;
  loginAsStudent: (studentId?: string) => void;
  loginAsAdmin: () => void;
  logout: () => void;
  updateStudentData: (updatedStudent: Student) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  // Simulated login as student
  const loginAsStudent = (studentId?: string) => {
    // Default to first student or find specific student
    const student = studentId 
      ? mockStudents.find(s => s.id === studentId) 
      : mockStudents[0];
    
    if (student) {
      setCurrentStudent({ ...student });
      setUserRole('student');
      setIsAuthenticated(true);
    }
  };

  // Simulated login as admin
  const loginAsAdmin = () => {
    setCurrentAdmin(mockAdmin);
    setUserRole('admin');
    setIsAuthenticated(true);
  };

  // Logout
  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentStudent(null);
    setCurrentAdmin(null);
  };

  // Update student data (for progress tracking, purchases, etc.)
  const updateStudentData = (updatedStudent: Student) => {
    setCurrentStudent(updatedStudent);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        currentStudent,
        currentAdmin,
        loginAsStudent,
        loginAsAdmin,
        logout,
        updateStudentData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
