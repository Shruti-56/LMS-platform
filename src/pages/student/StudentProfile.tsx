import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockCourses, calculateCourseProgress } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Trophy,
  Award,
  Edit2,
  Download
} from 'lucide-react';

const StudentProfile: React.FC = () => {
  const { currentStudent } = useAuth();

  // TODO: Fetch student profile from API when backend is connected
  const purchasedCourses = mockCourses.filter(
    course => currentStudent?.purchasedCourses.includes(course.id)
  );

  const completedCourses = purchasedCourses.filter(course => {
    const progress = currentStudent?.progress[course.id];
    return progress && calculateCourseProgress(course, progress.completedVideos) === 100;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="h-32 gradient-hero" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="w-24 h-24 rounded-xl bg-card border-4 border-card flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-primary">
                {currentStudent?.name.charAt(0) || 'S'}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-foreground">
                {currentStudent?.name || 'Student Name'}
              </h1>
              <p className="text-muted-foreground">Data Enthusiast</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enrolled</p>
              <p className="text-2xl font-bold text-foreground">{purchasedCourses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-foreground">{completedCourses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Certificates</p>
              <p className="text-2xl font-bold text-foreground">{completedCourses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <User className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="text-sm font-medium text-foreground">{currentStudent?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{currentStudent?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Joined</p>
              <p className="text-sm font-medium text-foreground">
                {currentStudent?.joinedDate 
                  ? new Date(currentStudent.joinedDate).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">My Certificates</h2>
        
        {completedCourses.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Complete a course to earn your first certificate!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedCourses.map(course => (
              <div 
                key={course.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-accent rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{course.title}</p>
                    <p className="text-sm text-muted-foreground">Certificate of Completion</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
