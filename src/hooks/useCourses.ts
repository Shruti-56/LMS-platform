import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Video {
  id: string;
  module_id: string;
  title: string;
  duration: string;
  video_url: string | null;
  order_index: number;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  videos: Video[];
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  duration: string;
  level: string;
  price: number;
  image_url: string | null;
  is_visible: boolean;
  created_at: string;
  modules: Module[];
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
}

export interface VideoProgress {
  id: string;
  user_id: string;
  video_id: string;
  completed: boolean;
  completed_at: string | null;
}

// Fetch all visible courses (for marketplace)
export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch modules for each course
      const coursesWithModules: Course[] = await Promise.all(
        (courses || []).map(async (course) => {
          const { data: modules } = await supabase
            .from('modules')
            .select('*')
            .eq('course_id', course.id)
            .order('order_index');

          const modulesWithVideos: Module[] = await Promise.all(
            (modules || []).map(async (module) => {
              const { data: videos } = await supabase
                .from('videos')
                .select('*')
                .eq('module_id', module.id)
                .order('order_index');

              return {
                ...module,
                videos: videos || [],
              };
            })
          );

          return {
            ...course,
            modules: modulesWithVideos,
          };
        })
      );

      return coursesWithModules;
    },
  });
};

// Fetch single course with modules and videos
export const useCourse = (courseId: string | undefined) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return null;

      const { data: course, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle();

      if (error) throw error;
      if (!course) return null;

      const { data: modules } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      const modulesWithVideos: Module[] = await Promise.all(
        (modules || []).map(async (module) => {
          const { data: videos } = await supabase
            .from('videos')
            .select('*')
            .eq('module_id', module.id)
            .order('order_index');

          return {
            ...module,
            videos: videos || [],
          };
        })
      );

      return {
        ...course,
        modules: modulesWithVideos,
      } as Course;
    },
    enabled: !!courseId,
  });
};

// Fetch user's enrollments
export const useEnrollments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as Enrollment[];
    },
    enabled: !!user,
  });
};

// Fetch user's enrolled courses with full details
export const useEnrolledCourses = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enrolled-courses', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id);

      if (enrollError) throw enrollError;

      const courseIds = enrollments?.map(e => e.course_id) || [];
      
      if (courseIds.length === 0) return [];

      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds);

      if (coursesError) throw coursesError;

      // Fetch modules and videos for each course
      const coursesWithModules: Course[] = await Promise.all(
        (courses || []).map(async (course) => {
          const { data: modules } = await supabase
            .from('modules')
            .select('*')
            .eq('course_id', course.id)
            .order('order_index');

          const modulesWithVideos: Module[] = await Promise.all(
            (modules || []).map(async (module) => {
              const { data: videos } = await supabase
                .from('videos')
                .select('*')
                .eq('module_id', module.id)
                .order('order_index');

              return {
                ...module,
                videos: videos || [],
              };
            })
          );

          return {
            ...course,
            modules: modulesWithVideos,
          };
        })
      );

      return coursesWithModules;
    },
    enabled: !!user,
  });
};

// Fetch user's video progress
export const useVideoProgress = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['video-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('video_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as VideoProgress[];
    },
    enabled: !!user,
  });
};

// Enroll in a course (purchase)
export const useEnrollCourse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] });
    },
  });
};

// Mark video as complete/incomplete
export const useToggleVideoComplete = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ videoId, completed }: { videoId: string; completed: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      if (completed) {
        const { data, error } = await supabase
          .from('video_progress')
          .upsert({
            user_id: user.id,
            video_id: videoId,
            completed: true,
            completed_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,video_id'
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { error } = await supabase
          .from('video_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', videoId);

        if (error) throw error;
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-progress'] });
    },
  });
};

// Calculate course progress
export const calculateCourseProgress = (
  course: Course,
  completedVideoIds: string[]
): number => {
  const totalVideos = course.modules.reduce(
    (acc, module) => acc + module.videos.length,
    0
  );

  if (totalVideos === 0) return 0;

  const completedVideos = course.modules.reduce((acc, module) => {
    return acc + module.videos.filter(v => completedVideoIds.includes(v.id)).length;
  }, 0);

  return Math.round((completedVideos / totalVideos) * 100);
};

// Calculate module progress
export const calculateModuleProgress = (
  module: Module,
  completedVideoIds: string[]
): number => {
  if (module.videos.length === 0) return 0;

  const completedVideos = module.videos.filter(v => 
    completedVideoIds.includes(v.id)
  ).length;

  return Math.round((completedVideos / module.videos.length) * 100);
};
