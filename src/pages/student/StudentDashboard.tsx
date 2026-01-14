import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useEnrolledCourses, useVideoProgress, calculateCourseProgress } from '@/hooks/useCourses';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  PlayCircle, 
  ArrowRight,
  TrendingUp,
  Loader2
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { data: enrolledCourses = [], isLoading: coursesLoading } = useEnrolledCourses();
  const { data: videoProgress = [] } = useVideoProgress();

  const completedVideoIds = videoProgress.filter(p => p.completed).map(p => p.video_id);

  const getOverallProgress = () => {
    if (enrolledCourses.length === 0) return 0;
    const totalProgress = enrolledCourses.reduce((acc, course) => {
      return acc + calculateCourseProgress(course, completedVideoIds);
    }, 0);
    return Math.round(totalProgress / enrolledCourses.length);
  };

  const completedCourses = enrolledCourses.filter(course => 
    calculateCourseProgress(course, completedVideoIds) === 100
  );

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="gradient-hero rounded-2xl p-8 text-primary-foreground">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-primary-foreground/80">
              Ready to continue your learning journey?
            </p>
          </div>
          {enrolledCourses.length > 0 && (
            <Link to={`/student/course/${enrolledCourses[0].id}`}>
              <Button variant="accent" size="lg" className="gap-2">
                <PlayCircle className="w-5 h-5" />
                Continue Learning
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enrolled Courses</p>
              <p className="text-2xl font-bold text-foreground">{enrolledCourses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <p className="text-2xl font-bold text-foreground">{getOverallProgress()}%</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Certificates</p>
              <p className="text-2xl font-bold text-foreground">{completedCourses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">My Courses</h2>
          <Link to="/student/my-courses" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">Start your learning journey by browsing our courses.</p>
            <Link to="/student/marketplace">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {enrolledCourses.slice(0, 3).map((course) => {
              const progress = calculateCourseProgress(course, completedVideoIds);

              return (
                <Link 
                  key={course.id} 
                  to={`/student/course/${course.id}`}
                  className="bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
                >
                  <div className="aspect-video bg-muted relative">
                    <div className="absolute inset-0 gradient-hero opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-primary-foreground opacity-80 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-primary font-medium mb-1">{course.category}</p>
                    <h3 className="font-semibold text-foreground mb-3 line-clamp-2">{course.title}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" indicatorClassName="gradient-success" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
