import React, { useState } from 'react';
import { mockCourses, Course } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Clock,
  Eye,
  EyeOff,
  Search,
  MoreVertical
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';

const AdminCourses: React.FC = () => {
  // TODO: Fetch courses from API when backend is connected
  const [courses, setCourses] = useState(mockCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCourseVisibility = (courseId: string) => {
    // TODO: Update visibility via API when backend is connected
    toast({
      title: "Visibility Updated",
      description: "Course visibility has been toggled."
    });
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save course via API when backend is connected
    toast({
      title: editingCourse ? "Course Updated" : "Course Created",
      description: editingCourse 
        ? "The course has been updated successfully."
        : "A new course has been created."
    });
    setIsDialogOpen(false);
    setEditingCourse(null);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-success/10 text-success';
      case 'Intermediate': return 'bg-warning/10 text-warning';
      case 'Advanced': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Course Management</h1>
          <p className="text-muted-foreground">Manage your platform's courses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setEditingCourse(null)}>
              <Plus className="w-4 h-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveCourse} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Course Title</label>
                  <input
                    type="text"
                    defaultValue={editingCourse?.title}
                    placeholder="Enter course title"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground">
                    <option>Data Analytics</option>
                    <option>Data Engineering</option>
                    <option>Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Level</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Price ($)</label>
                  <input
                    type="number"
                    defaultValue={editingCourse?.price}
                    placeholder="99.99"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Duration</label>
                  <input
                    type="text"
                    defaultValue={editingCourse?.duration}
                    placeholder="e.g., 42 hours"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <textarea
                    defaultValue={editingCourse?.description}
                    placeholder="Enter course description"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground resize-none"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Instructor</label>
                  <input
                    type="text"
                    defaultValue={editingCourse?.instructor}
                    placeholder="Enter instructor name"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Courses Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Course</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Level</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Price</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Students</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Visible</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg gradient-hero flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary-foreground">
                          {course.category.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate max-w-[200px]">
                          {course.title}
                        </p>
                        <p className="text-sm text-muted-foreground">{course.instructor}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground">{course.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">${course.price}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{course.studentsEnrolled.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Switch 
                      defaultChecked={true}
                      onCheckedChange={() => toggleCourseVisibility(course.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingCourse(course);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;
