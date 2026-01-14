import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { mockCourses, calculateCourseProgress } from '@/data/mockData';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  PlayCircle, 
  ArrowRight,
  Trophy,
  CheckCircle
} from 'lucide-react';

const MyCourses: React.FC = () => {
  const { currentStudent } = useAuth();

  // TODO: Fetch purchased courses from API when backend is connected
  const purchasedCourses = mockCourses.filter(
    course => currentStudent?.purchasedCourses.includes(course.id)
  );

  const getCompletedVideosCount = (courseId: string) => {
    return currentStudent?.progress[courseId]?.completedVideos.length || 0;
  };

  const getTotalVideosCount = (courseId: string) => {
    const course = mockCourses.find(c => c.id === courseId);
    return course?.modules.reduce((acc, m) => acc + m.videos.length, 0) || 0;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">My Learning</h1>
        <p className="text-muted-foreground">Track your progress and continue where you left off</p>
      </div>

      {purchasedCourses.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You haven't purchased any courses yet. Browse our marketplace to find courses that match your learning goals.
          </p>
          <Link to="/student/marketplace">
            <Button size="lg">Browse Courses</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchasedCourses.map((course) => {
            const courseProgress = currentStudent?.progress[course.id];
            const progress = courseProgress 
              ? calculateCourseProgress(course, courseProgress.completedVideos)
              : 0;
            const completedVideos = getCompletedVideosCount(course.id);
            const totalVideos = getTotalVideosCount(course.id);
            const isCompleted = progress === 100;

            return (
              <div
                key={course.id}
                className="bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Course Image */}
                  <div className="w-full md:w-72 aspect-video md:aspect-auto relative">
                    <div className="absolute inset-0 gradient-hero opacity-90" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-primary-foreground opacity-80" />
                    </div>
                    {isCompleted && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-success text-success-foreground gap-1">
                          <Trophy className="w-3 h-3" /> Completed
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <p className="text-sm text-primary font-medium mb-1">{course.category}</p>
                        <h3 className="text-xl font-semibold text-foreground mb-2">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          by {course.instructor}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {course.duration}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            {course.modules.length} Modules
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            {completedVideos} / {totalVideos} Videos
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold text-foreground">{progress}%</span>
                        </div>
                        <Progress 
                          value={progress} 
                          className="h-2.5" 
                          indicatorClassName={isCompleted ? "gradient-success" : "gradient-primary"}
                        />
                        <div className="flex justify-end pt-2">
                          <Link to={`/student/course/${course.id}`}>
                            <Button className="gap-2">
                              {isCompleted ? 'Review Course' : progress > 0 ? 'Continue Learning' : 'Start Learning'}
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
