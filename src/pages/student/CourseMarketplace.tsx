import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockCourses, Course } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Star, 
  Clock, 
  Users, 
  BarChart, 
  ShoppingCart,
  Check,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const CourseMarketplace: React.FC = () => {
  const { currentStudent, updateStudentData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // TODO: Fetch courses from API when backend is connected
  const categories = ['all', ...new Set(mockCourses.map(c => c.category))];

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isPurchased = (courseId: string) => {
    return currentStudent?.purchasedCourses.includes(courseId);
  };

  const handlePurchase = (course: Course) => {
    if (!currentStudent) return;

    // TODO: Integrate real payment gateway when backend is connected
    // Simulated purchase - update local state
    const updatedStudent = {
      ...currentStudent,
      purchasedCourses: [...currentStudent.purchasedCourses, course.id],
      progress: {
        ...currentStudent.progress,
        [course.id]: { completedVideos: [] }
      }
    };

    updateStudentData(updatedStudent);
    
    toast({
      title: "Course Purchased! 🎉",
      description: `You now have access to "${course.title}"`,
    });
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
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Course Marketplace</h1>
        <p className="text-muted-foreground">Discover courses to accelerate your data career</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {category === 'all' ? 'All Courses' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {filteredCourses.map((course) => {
          const purchased = isPurchased(course.id);

          return (
            <div
              key={course.id}
              className="bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Course Image */}
              <div className="aspect-video bg-muted relative">
                <div className="absolute inset-0 gradient-hero opacity-90" />
                <div className="absolute top-4 left-4">
                  <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                </div>
                {purchased && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-success text-success-foreground">
                      <Check className="w-3 h-3 mr-1" /> Purchased
                    </Badge>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs text-primary-foreground/80 mb-1">{course.category}</p>
                  <h3 className="text-lg font-semibold text-primary-foreground line-clamp-2">
                    {course.title}
                  </h3>
                </div>
              </div>

              {/* Course Details */}
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {course.studentsEnrolled.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    {course.rating}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BarChart className="w-4 h-4" />
                    {course.modules.length} Modules
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  by <span className="text-foreground font-medium">{course.instructor}</span>
                </p>

                <div className="mt-auto pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-foreground">${course.price}</span>
                      {course.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          ${course.originalPrice}
                        </span>
                      )}
                    </div>
                    {purchased ? (
                      <Link to={`/student/course/${course.id}`}>
                        <Button variant="secondary">
                          Go to Course
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        variant="accent" 
                        onClick={() => handlePurchase(course)}
                        className="gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Buy Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default CourseMarketplace;
