import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, Shield, BookOpen, Users, TrendingUp, Award } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsStudent, loginAsAdmin } = useAuth();

  const handleStudentLogin = () => {
    // TODO: Replace with real authentication API call
    loginAsStudent();
    navigate('/student/dashboard');
  };

  const handleAdminLogin = () => {
    // TODO: Replace with real authentication API call
    loginAsAdmin();
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-foreground" />
            </div>
            <span className="text-2xl font-display font-bold text-primary-foreground">LearnHub</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-primary-foreground leading-tight">
            Unlock Your
            <br />
            <span className="text-accent">Data Career</span>
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Master Data Analytics, Engineering, and Science with industry-leading courses designed by experts.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <BookOpen className="w-5 h-5 text-accent" />
              <span className="text-sm">50+ Hours Content</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <Users className="w-5 h-5 text-accent" />
              <span className="text-sm">45,000+ Students</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-sm">Career Growth</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/90">
              <Award className="w-5 h-5 text-accent" />
              <span className="text-sm">Certificates</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-primary-foreground/60">
            © 2024 LearnHub. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Options */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">LearnHub</span>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display font-bold text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground">Choose how you'd like to access the platform</p>
          </div>

          <div className="space-y-4">
            {/* Student Login */}
            <button
              onClick={handleStudentLogin}
              className="w-full p-6 rounded-xl border-2 border-border bg-card hover:border-primary hover:shadow-card-hover transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center group-hover:gradient-primary transition-all duration-300">
                  <GraduationCap className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">Student Login</h3>
                  <p className="text-sm text-muted-foreground">
                    Access your courses, track progress, and continue learning
                  </p>
                </div>
              </div>
            </button>

            {/* Admin Login */}
            <button
              onClick={handleAdminLogin}
              className="w-full p-6 rounded-xl border-2 border-border bg-card hover:border-accent hover:shadow-card-hover transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center group-hover:gradient-accent transition-all duration-300">
                  <Shield className="w-7 h-7 text-primary group-hover:text-accent-foreground transition-colors" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">Admin Login</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage courses, students, and platform settings
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="pt-4">
            <p className="text-center text-sm text-muted-foreground">
              <span className="text-destructive font-medium">Demo Mode:</span> No password required. Click to simulate login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
