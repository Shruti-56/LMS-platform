import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  PlayCircle, 
  ArrowRight,
  TrendingUp,
  Megaphone
} from 'lucide-react';
import PromoBanner from '@/components/PromoBanner';

type Enrollment = {
  id: string;
  enrolledAt: string;
  completedAt: string | null;
  course: {
    id: string;
    title: string;
    category: string;
    level: string;
    thumbnailUrl: string | null;
    durationHours: number;
  };
  progress: number;
  totalVideos: number;
  completedVideos: number;
};

type OverallProgress = {
  enrolledCourses: number;
  completedCourses: number;
  totalVideos: number;
  completedVideos: number;
  overallProgress: number;
};

type Notice = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

const StudentDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [overallProgress, setOverallProgress] = useState<OverallProgress | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [enrollmentsRes, progressRes, noticesRes] = await Promise.all([
          api.get('/enrollments'),
          api.get('/progress/overall'),
          api.get('/notices'),
        ]);

        if (enrollmentsRes.ok) {
          const enrollmentsData = await enrollmentsRes.json();
          setEnrollments(enrollmentsData);
        }

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setOverallProgress(progressData);
        }

        if (noticesRes.ok) {
          const noticesData = await noticesRes.json();
          setNotices(noticesData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-12 text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const firstName = user?.fullName?.split(' ')[0] || 'Student';
  const completedCourses = enrollments.filter(e => e.completedAt !== null || e.progress === 100).length;

  const acknowledgeNotice = async (noticeId: string, action: 'dismissed' | 'remind_later') => {
    try {
      const res = await api.post(`/notices/${noticeId}/acknowledge`, { action });
      if (res.ok) setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    } catch (e) {
      console.error('Acknowledge failed', e);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="gradient-hero rounded-2xl p-8 text-primary-foreground">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-primary-foreground/80">
              Ready to continue your learning journey?
            </p>
          </div>
          {enrollments.length > 0 && (
            <Link to={`/student/course/${enrollments[0].course.id}`}>
              <Button variant="accent" size="lg" className="gap-2">
                <PlayCircle className="w-5 h-5" />
                Continue Learning
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Promo banners (admin-managed carousel) */}
      <PromoBanner />

      {/* Notices from admin – below welcome strip, catchy cards with acknowledge */}
      {notices.length > 0 && (
        <div className="space-y-4">
          {notices.map((n) => (
            <div
              key={n.id}
              className="relative overflow-hidden rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800/50 p-5 shadow-lg"
            >
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Megaphone className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-lg">{n.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{n.body}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-300 bg-white/80 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/50 dark:hover:bg-amber-900/50"
                      onClick={() => acknowledgeNotice(n.id, 'remind_later')}
                    >
                      Remind later
                    </Button>
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                      onClick={() => acknowledgeNotice(n.id, 'dismissed')}
                    >
                      Got it
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enrolled Courses</p>
              <p className="text-2xl font-bold text-foreground">
                {overallProgress?.enrolledCourses || enrollments.length}
              </p>
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
              <p className="text-2xl font-bold text-foreground">
                {overallProgress?.overallProgress || 0}%
              </p>
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
              <p className="text-2xl font-bold text-foreground">
                {overallProgress?.completedCourses || completedCourses}
              </p>
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

        {enrollments.length === 0 ? (
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
            {enrollments.slice(0, 3).map((enrollment) => (
              <Link 
                key={enrollment.id} 
                to={`/student/course/${enrollment.course.id}`}
                className="bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
              >
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 gradient-hero opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-primary-foreground opacity-80 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-primary font-medium mb-1">{enrollment.course.category}</p>
                  <h3 className="font-semibold text-foreground mb-3 line-clamp-2">{enrollment.course.title}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">{enrollment.progress}%</span>
                    </div>
                    <Progress value={enrollment.progress} className="h-2" indicatorClassName="gradient-success" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
