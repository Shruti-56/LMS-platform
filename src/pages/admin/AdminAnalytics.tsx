import React from 'react';
import { mockCourses, mockStudents, calculateCourseProgress } from '@/data/mockData';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users,
  BookOpen,
  Clock
} from 'lucide-react';

const AdminAnalytics: React.FC = () => {
  // TODO: Fetch analytics from API when backend is connected

  // Calculate course-wise analytics
  const courseAnalytics = mockCourses.map(course => {
    const enrolledStudents = mockStudents.filter(s => 
      s.purchasedCourses.includes(course.id)
    );
    
    const totalProgress = enrolledStudents.reduce((acc, student) => {
      const progress = student.progress[course.id];
      if (progress) {
        return acc + calculateCourseProgress(course, progress.completedVideos);
      }
      return acc;
    }, 0);

    const avgProgress = enrolledStudents.length > 0 
      ? Math.round(totalProgress / enrolledStudents.length) 
      : 0;

    // Calculate module-level stats
    const moduleStats = course.modules.map(module => {
      let completedCount = 0;
      enrolledStudents.forEach(student => {
        const progress = student.progress[course.id];
        if (progress) {
          module.videos.forEach(video => {
            if (progress.completedVideos.includes(video.id)) {
              completedCount++;
            }
          });
        }
      });
      
      const totalPossible = module.videos.length * enrolledStudents.length;
      const percentage = totalPossible > 0 
        ? Math.round((completedCount / totalPossible) * 100)
        : 0;
      
      return {
        ...module,
        completionRate: percentage
      };
    });

    return {
      ...course,
      enrolledCount: enrolledStudents.length,
      avgProgress,
      moduleStats
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track course performance and student engagement</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold text-foreground">{mockStudents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Courses</p>
              <p className="text-2xl font-bold text-foreground">{mockCourses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Completion</p>
              <p className="text-2xl font-bold text-foreground">
                {Math.round(
                  courseAnalytics.reduce((acc, c) => acc + c.avgProgress, 0) / courseAnalytics.length
                )}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course-wise Analytics */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Course Performance</h2>
        
        {courseAnalytics.map((course) => (
          <div key={course.id} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            {/* Course Header */}
            <div className="p-6 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">{course.category}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{course.enrolledCount}</p>
                    <p className="text-xs text-muted-foreground">Enrolled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{course.avgProgress}%</p>
                    <p className="text-xs text-muted-foreground">Avg. Progress</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Module Progress */}
            <div className="p-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Module Completion Rates</h4>
              <div className="space-y-4">
                {course.moduleStats.map((module) => (
                  <div key={module.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground">{module.title}</span>
                      <span className="text-sm font-medium text-foreground">{module.completionRate}%</span>
                    </div>
                    <Progress 
                      value={module.completionRate} 
                      className="h-2"
                      indicatorClassName={
                        module.completionRate > 70 
                          ? 'bg-success' 
                          : module.completionRate > 40 
                          ? 'bg-warning' 
                          : 'bg-destructive'
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Engagement Chart Placeholder */}
            <div className="px-6 pb-6">
              <div className="h-40 bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {/* TODO: Add engagement chart with recharts */}
                    Engagement chart placeholder
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAnalytics;
