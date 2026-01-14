import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { GraduationCap, BookOpen, Users, TrendingUp, Award, Loader2 } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    try {
      if (isSignUp) {
        authSchema.parse({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        });
      } else {
        authSchema.omit({ fullName: true }).parse({
          email: formData.email,
          password: formData.password,
        });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          toast({
            title: 'Sign up failed',
            description: error.message || 'An error occurred during sign up',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'Account created! 🎉',
          description: 'Welcome to LearnHub! You can now access your dashboard.',
        });
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: 'Sign in failed',
            description: error.message || 'Invalid email or password',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'Welcome back! 👋',
          description: 'Successfully signed in to LearnHub.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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

      {/* Right Panel - Login Form */}
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
            <h2 className="text-3xl font-display font-bold text-foreground">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-muted-foreground">
              {isSignUp 
                ? 'Start your learning journey today' 
                : 'Sign in to continue your learning journey'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={errors.fullName ? 'border-destructive' : ''}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
