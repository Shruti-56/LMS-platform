import React from 'react';
import { platformStats, mockStudents, mockCourses } from '@/data/mockData';
import { 
  Users, 
  BookOpen, 
  ShoppingCart, 
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  // TODO: Fetch real statistics from API when backend is connected

  const stats = [
    {
      label: 'Total Students',
      value: platformStats.totalStudents.toLocaleString(),
      change: '+12%',
      isPositive: true,
      icon: Users,
      color: 'bg-primary/10 text-primary'
    },
    {
      label: 'Total Courses',
      value: platformStats.totalCourses,
      change: '+3',
      isPositive: true,
      icon: BookOpen,
      color: 'bg-success/10 text-success'
    },
    {
      label: 'Total Purchases',
      value: platformStats.totalPurchases.toLocaleString(),
      change: '+8%',
      isPositive: true,
      icon: ShoppingCart,
      color: 'bg-accent/10 text-accent'
    },
    {
      label: 'Avg. Completion',
      value: `${platformStats.averageCompletionRate}%`,
      change: '-2%',
      isPositive: false,
      icon: TrendingUp,
      color: 'bg-warning/10 text-warning'
    }
  ];

  const recentPurchases = mockStudents
    .filter(s => s.purchasedCourses.length > 0)
    .slice(0, 5)
    .map(student => ({
      student,
      course: mockCourses.find(c => c.id === student.purchasedCourses[0])
    }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.isPositive ? 'text-success' : 'text-destructive'}`}>
                {stat.isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Card */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Monthly Revenue</h2>
            <div className="flex items-center gap-2 text-sm text-success">
              <ArrowUp className="w-4 h-4" />
              +23% from last month
            </div>
          </div>
          <div className="flex items-end gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-success" />
              <span className="text-4xl font-bold text-foreground">
                {platformStats.monthlyRevenue.toLocaleString()}
              </span>
            </div>
          </div>
          {/* Chart Placeholder */}
          <div className="mt-6 h-40 bg-muted/50 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              {/* TODO: Add chart library (recharts) for real visualization */}
              Revenue chart placeholder
            </p>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Active Users</h2>
            <div className="flex items-center gap-2 text-sm text-success">
              <Activity className="w-4 h-4" />
              Real-time
            </div>
          </div>
          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold text-foreground">
              {platformStats.activeUsers.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-sm mb-1">online now</span>
          </div>
          {/* Chart Placeholder */}
          <div className="mt-6 h-40 bg-muted/50 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              {/* TODO: Add real-time activity chart */}
              Activity chart placeholder
            </p>
          </div>
        </div>
      </div>

      {/* Recent Purchases */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Recent Purchases</h2>
        </div>
        <div className="divide-y divide-border">
          {recentPurchases.map(({ student, course }, index) => (
            <div key={index} className="px-6 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {student.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{student.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  Purchased {course?.title}
                </p>
              </div>
              <p className="text-sm font-medium text-foreground">
                ${course?.price}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
