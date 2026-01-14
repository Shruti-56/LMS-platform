import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Course, Module, Video } from './useCourses';

export interface StudentWithProgress {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  enrollments: {
    course_id: string;
    course_title: string;
  }[];
  totalProgress: number;
}

// Admin: Fetch all courses (including hidden)
export const useAdminCourses = () => {
  const { userRole } = useAuth();

  return useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
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
    enabled: userRole === 'admin',
  });
};

// Admin: Fetch all students with their enrollments
export const useAdminStudents = () => {
  const { userRole } = useAuth();

  return useQuery({
    queryKey: ['admin-students'],
    queryFn: async () => {
      // Get all profiles (students)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;

      // Get all enrollments
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('user_id, course_id');

      if (enrollError) throw enrollError;

      // Get all courses for titles
      const { data: courses, error: courseError } = await supabase
        .from('courses')
        .select('id, title');

      if (courseError) throw courseError;

      // Get all video progress
      const { data: progress, error: progressError } = await supabase
        .from('video_progress')
        .select('user_id, completed');

      if (progressError) throw progressError;

      // Get all videos count
      const { data: videos, error: videoError } = await supabase
        .from('videos')
        .select('id');

      if (videoError) throw videoError;

      const totalVideos = videos?.length || 1;

      // Combine data
      const studentsWithProgress: StudentWithProgress[] = (profiles || []).map(profile => {
        const studentEnrollments = (enrollments || [])
          .filter(e => e.user_id === profile.id)
          .map(e => ({
            course_id: e.course_id,
            course_title: courses?.find(c => c.id === e.course_id)?.title || 'Unknown Course',
          }));

        const completedVideos = (progress || [])
          .filter(p => p.user_id === profile.id && p.completed)
          .length;

        return {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          enrollments: studentEnrollments,
          totalProgress: Math.round((completedVideos / totalVideos) * 100),
        };
      });

      return studentsWithProgress;
    },
    enabled: userRole === 'admin',
  });
};

// Admin: Get platform statistics
export const useAdminStats = () => {
  const { userRole } = useAuth();

  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Count students (profiles)
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Count courses
      const { count: courseCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // Count enrollments
      const { count: enrollmentCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true });

      // Get courses for revenue calculation
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id');

      const { data: courses } = await supabase
        .from('courses')
        .select('id, price');

      // Calculate total revenue
      const totalRevenue = (enrollments || []).reduce((acc, enrollment) => {
        const course = courses?.find(c => c.id === enrollment.course_id);
        return acc + (course?.price || 0);
      }, 0);

      // Get completion stats
      const { data: allProgress } = await supabase
        .from('video_progress')
        .select('completed');

      const { data: allVideos } = await supabase
        .from('videos')
        .select('id');

      const completedCount = allProgress?.filter(p => p.completed).length || 0;
      const totalVideos = allVideos?.length || 1;
      const avgCompletion = Math.round((completedCount / totalVideos) * 100);

      return {
        totalStudents: studentCount || 0,
        totalCourses: courseCount || 0,
        totalEnrollments: enrollmentCount || 0,
        totalRevenue,
        averageCompletionRate: avgCompletion,
      };
    },
    enabled: userRole === 'admin',
  });
};

// Admin: Toggle course visibility
export const useToggleCourseVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, isVisible }: { courseId: string; isVisible: boolean }) => {
      const { data, error } = await supabase
        .from('courses')
        .update({ is_visible: isVisible })
        .eq('id', courseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

// Admin: Create course
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseData: {
      title: string;
      description: string;
      category: string;
      level: string;
      price: number;
      duration: string;
    }) => {
      const { data, error } = await supabase
        .from('courses')
        .insert(courseData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

// Admin: Update course
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, ...courseData }: {
      courseId: string;
      title?: string;
      description?: string;
      category?: string;
      level?: string;
      price?: number;
      duration?: string;
    }) => {
      const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', courseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

// Admin: Delete course
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};
