import React, { useState } from 'react';
import { mockStudents, mockCourses, calculateCourseProgress, Student } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Ban,
  CheckCircle,
  Mail,
  Calendar,
  BookOpen,
  Eye
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';

const AdminStudents: React.FC = () => {
  // TODO: Fetch students from API when backend is connected
  const [students, setStudents] = useState(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleBlockStatus = (studentId: string) => {
    // TODO: Update block status via API when backend is connected
    setStudents(prev => 
      prev.map(s => 
        s.id === studentId ? { ...s, isBlocked: !s.isBlocked } : s
      )
    );
    
    const student = students.find(s => s.id === studentId);
    toast({
      title: student?.isBlocked ? "Student Unblocked" : "Student Blocked",
      description: `${student?.name} has been ${student?.isBlocked ? 'unblocked' : 'blocked'}.`
    });
  };

  const getStudentProgress = (student: Student) => {
    if (student.purchasedCourses.length === 0) return 0;
    
    let totalProgress = 0;
    student.purchasedCourses.forEach(courseId => {
      const course = mockCourses.find(c => c.id === courseId);
      const progress = student.progress[courseId];
      if (course && progress) {
        totalProgress += calculateCourseProgress(course, progress.completedVideos);
      }
    });
    
    return Math.round(totalProgress / student.purchasedCourses.length);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Student Management</h1>
        <p className="text-muted-foreground">View and manage enrolled students</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search students by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Students Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Student</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Courses</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Progress</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.map((student) => {
                const avgProgress = getStudentProgress(student);
                
                return (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-primary">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(student.joinedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{student.purchasedCourses.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <Progress value={avgProgress} className="h-2 flex-1" />
                        <span className="text-sm text-muted-foreground w-10">{avgProgress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={student.isBlocked 
                        ? 'bg-destructive/10 text-destructive' 
                        : 'bg-success/10 text-success'
                      }>
                        {student.isBlocked ? 'Blocked' : 'Active'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className={student.isBlocked ? 'text-success' : 'text-destructive'}
                          onClick={() => toggleBlockStatus(student.id)}
                        >
                          {student.isBlocked ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6 mt-4">
              {/* Student Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {selectedStudent.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{selectedStudent.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {selectedStudent.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(selectedStudent.joinedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Purchased Courses */}
              <div>
                <h4 className="font-medium text-foreground mb-3">Purchased Courses</h4>
                {selectedStudent.purchasedCourses.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No courses purchased</p>
                ) : (
                  <div className="space-y-3">
                    {selectedStudent.purchasedCourses.map(courseId => {
                      const course = mockCourses.find(c => c.id === courseId);
                      const progress = selectedStudent.progress[courseId];
                      const progressPercent = course && progress 
                        ? calculateCourseProgress(course, progress.completedVideos)
                        : 0;
                      
                      return course ? (
                        <div key={courseId} className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-foreground">{course.title}</p>
                            <span className="text-sm text-muted-foreground">{progressPercent}%</span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-2">
                            {progress?.completedVideos.length || 0} videos completed
                          </p>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStudents;
