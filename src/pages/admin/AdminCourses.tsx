import React, { useState } from 'react';
import { useAdminCourses, useToggleCourseVisibility, useCreateCourse, useUpdateCourse } from '@/hooks/useAdmin';
import { Course } from '@/hooks/useCourses';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, Users, Search, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';

const AdminCourses: React.FC = () => {
  const { data: courses = [], isLoading } = useAdminCourses();
  const toggleVisibility = useToggleCourseVisibility();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Data Analytics', level: 'Beginner', price: 49.99, duration: '40 hours' });

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateCourse.mutateAsync({ courseId: editingCourse.id, ...formData });
        toast({ title: "Course Updated", description: "The course has been updated successfully." });
      } else {
        await createCourse.mutateAsync(formData);
        toast({ title: "Course Created", description: "A new course has been created." });
      }
      setIsDialogOpen(false);
      setEditingCourse(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save course.", variant: "destructive" });
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-success/10 text-success';
      case 'Intermediate': return 'bg-warning/10 text-warning';
      case 'Advanced': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Course Management</h1>
          <p className="text-muted-foreground">Manage your platform's courses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { setEditingCourse(null); setFormData({ title: '', description: '', category: 'Data Analytics', level: 'Beginner', price: 49.99, duration: '40 hours' }); }}>
              <Plus className="w-4 h-4" /> Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSaveCourse} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Course Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter course title" className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground">
                    <option>Data Analytics</option><option>Data Engineering</option><option>Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Level</label>
                  <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground">
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Price ($)</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Duration</label>
                  <input type="text" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g., 42 hours" className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Enter course description" rows={3} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground resize-none" required />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createCourse.isPending || updateCourse.isPending}>{editingCourse ? 'Update Course' : 'Create Course'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input type="text" placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Course</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Level</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Price</th>
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
                        <span className="text-sm font-bold text-primary-foreground">{course.category.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate max-w-[200px]">{course.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-sm text-foreground">{course.category}</span></td>
                  <td className="px-6 py-4"><Badge className={getLevelColor(course.level)}>{course.level}</Badge></td>
                  <td className="px-6 py-4"><span className="font-medium text-foreground">${Number(course.price).toFixed(2)}</span></td>
                  <td className="px-6 py-4">
                    <Switch checked={course.is_visible} onCheckedChange={(checked) => toggleVisibility.mutate({ courseId: course.id, isVisible: checked })} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingCourse(course); setFormData({ title: course.title, description: course.description || '', category: course.category, level: course.level, price: Number(course.price), duration: course.duration }); setIsDialogOpen(true); }}>
                        <Edit2 className="w-4 h-4" />
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
