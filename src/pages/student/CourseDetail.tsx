import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCourse, useEnrollments, useVideoProgress, useToggleVideoComplete, calculateCourseProgress, calculateModuleProgress } from '@/hooks/useCourses';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { 
  PlayCircle, 
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronRight,
  Clock,
  ArrowLeft,
  Lock,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: enrollments = [] } = useEnrollments();
  const { data: videoProgress = [] } = useVideoProgress();
  const toggleComplete = useToggleVideoComplete();
  
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [currentVideo, setCurrentVideo] = useState<{ moduleId: string; videoId: string } | null>(null);

  const isPurchased = enrollments.some(e => e.course_id === courseId);
  const completedVideoIds = videoProgress.filter(p => p.completed).map(p => p.video_id);

  // Initialize first video and expanded module when course loads
  useEffect(() => {
    if (course && course.modules.length > 0 && course.modules[0].videos.length > 0 && !currentVideo) {
      setCurrentVideo({
        moduleId: course.modules[0].id,
        videoId: course.modules[0].videos[0].id
      });
      setExpandedModules([course.modules[0].id]);
    }
  }, [course, currentVideo]);

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return <Navigate to="/student/marketplace" />;
  }

  const progress = calculateCourseProgress(course, completedVideoIds);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const isVideoCompleted = (videoId: string) => completedVideoIds.includes(videoId);

  const handleVideoClick = (moduleId: string, videoId: string) => {
    if (!isPurchased) {
      toast({
        title: "Course not purchased",
        description: "Please purchase this course to access the content.",
        variant: "destructive"
      });
      return;
    }
    setCurrentVideo({ moduleId, videoId });
  };

  const handleMarkComplete = async () => {
    if (!currentVideo || !user) return;

    const videoId = currentVideo.videoId;
    const isCompleted = isVideoCompleted(videoId);

    try {
      await toggleComplete.mutateAsync({
        videoId,
        completed: !isCompleted
      });

      if (!isCompleted) {
        toast({
          title: "Video Completed! 🎉",
          description: "Great job! Keep up the momentum."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update video progress.",
        variant: "destructive"
      });
    }
  };

  const getCurrentVideoData = () => {
    if (!currentVideo) return null;
    const module = course.modules.find(m => m.id === currentVideo.moduleId);
    const video = module?.videos.find(v => v.id === currentVideo.videoId);
    return { module, video };
  };

  const currentVideoData = getCurrentVideoData();

  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <Link 
        to="/student/my-courses" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Courses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player Placeholder */}
          <div className="bg-foreground/5 rounded-xl overflow-hidden aspect-video relative">
            {!isPurchased ? (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/10 backdrop-blur-sm">
                <div className="text-center">
                  <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-4">Purchase to unlock this course</p>
                  <Link to="/student/marketplace">
                    <Button>View in Marketplace</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 gradient-hero flex items-center justify-center">
                <div className="text-center">
                  <PlayCircle className="w-16 h-16 text-primary-foreground mb-4 mx-auto" />
                  <p className="text-primary-foreground font-medium">
                    {currentVideoData?.video?.title || 'Select a video'}
                  </p>
                  <p className="text-primary-foreground/60 text-sm mt-1">
                    Video player placeholder
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Current Video Info */}
          {isPurchased && currentVideoData?.video && (
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-primary font-medium mb-1">
                    {currentVideoData.module?.title}
                  </p>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {currentVideoData.video.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {currentVideoData.video.duration}
                  </div>
                </div>
                <Button
                  variant={isVideoCompleted(currentVideoData.video.id) ? "secondary" : "success"}
                  onClick={handleMarkComplete}
                  className="gap-2"
                  disabled={toggleComplete.isPending}
                >
                  {toggleComplete.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {isVideoCompleted(currentVideoData.video.id) ? 'Completed' : 'Mark Complete'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Course Curriculum */}
        <div className="space-y-4">
          {/* Course Header */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h1 className="text-lg font-semibold text-foreground mb-2">{course.title}</h1>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Course Progress</span>
                <span className="font-semibold text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" indicatorClassName="gradient-success" />
            </div>
          </div>

          {/* Modules List */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {course.modules.map((module) => {
                const moduleProgress = calculateModuleProgress(module, completedVideoIds);
                const isExpanded = expandedModules.includes(module.id);

                return (
                  <div key={module.id}>
                    {/* Module Header */}
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full px-4 py-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm truncate">
                          {module.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {module.videos.length} videos • {moduleProgress}% complete
                        </p>
                      </div>
                    </button>

                    {/* Videos List */}
                    {isExpanded && (
                      <div className="bg-muted/30 divide-y divide-border">
                        {module.videos.map((video) => {
                          const isCompleted = isVideoCompleted(video.id);
                          const isActive = currentVideo?.videoId === video.id;

                          return (
                            <button
                              key={video.id}
                              onClick={() => handleVideoClick(module.id, video.id)}
                              className={cn(
                                "w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left",
                                isActive && "bg-primary/5 border-l-2 border-l-primary"
                              )}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-sm truncate",
                                  isActive ? "text-primary font-medium" : "text-foreground"
                                )}>
                                  {video.title}
                                </p>
                                <p className="text-xs text-muted-foreground">{video.duration}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
