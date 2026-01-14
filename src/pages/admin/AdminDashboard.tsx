import React from 'react';
import { useAdminStats } from '@/hooks/useAdmin';
import { 
  Users, 
  BookOpen, 
  ShoppingCart, 
  TrendingUp,
  DollarSign,
  ArrowUp,
  Loader2
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statsDisplay = [
    {
      label: 'Total Students',
      value: stats?.totalStudents?.toLocaleString() || '0',
      change: '+12%',
      isPositive: true,
      icon: Users,
      color: 'bg-primary/10 text-primary'
    },
    {
      label: 'Total Courses',
      value: stats?.totalCourses || '0',
      change: '+3',
      isPositive: true,
      icon: BookOpen,
      color: 'bg-success/10 text-success'
    },
    {
      label: 'Total Enrollments',
      value: stats?.totalEnrollments?.toLocaleString() || '0',
      change: '+8%',
      isPositive: true,
      icon: ShoppingCart,
      color: 'bg-accent/10 text-accent'
    },
    {
      label: 'Avg. Completion',
      value: `${stats?.averageCompletionRate || 0}%`,
      change: '+5%',
      isPositive: true,
      icon: TrendingUp,
      color: 'bg-warning/10 text-warning'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsDisplay.map((stat, index) => (
          <div key={index} className="bg-card rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium text-success`}>
                <ArrowUp className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Revenue</h2>
          </div>
          <div className="flex items-end gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-success" />
              <span className="text-4xl font-bold text-foreground">
                {(stats?.totalRevenue || 0).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="mt-6 h-40 bg-muted/50 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Revenue chart placeholder</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-6">Active Users</h2>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold text-foreground">{stats?.totalStudents || 0}</span>
            <span className="text-muted-foreground text-sm mb-1">registered</span>
          </div>
          <div className="mt-6 h-40 bg-muted/50 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Activity chart placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
