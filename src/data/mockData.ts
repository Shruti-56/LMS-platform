// Mock data for the e-learning platform
// TODO: Replace with real API calls when backend is connected

export interface Video {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

export interface Module {
  id: string;
  title: string;
  videos: Video[];
}

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  originalPrice?: number;
  image: string;
  modules: Module[];
  rating: number;
  studentsEnrolled: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedDate: string;
  purchasedCourses: string[];
  progress: Record<string, { completedVideos: string[]; lastWatched?: string }>;
  isBlocked: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  avatar: string;
}

// Mock Courses Data
export const mockCourses: Course[] = [
  {
    id: 'data-analytics',
    title: 'Complete Data Analytics Bootcamp',
    category: 'Data Analytics',
    description: 'Master data analytics with Python, SQL, Power BI, and Excel. Learn to transform raw data into actionable insights and build stunning dashboards.',
    instructor: 'Dr. Sarah Johnson',
    duration: '42 hours',
    level: 'Beginner',
    price: 89.99,
    originalPrice: 199.99,
    image: '/placeholder.svg',
    rating: 4.8,
    studentsEnrolled: 12450,
    modules: [
      {
        id: 'python-analytics',
        title: 'Python for Data Analytics',
        videos: [
          { id: 'py-1', title: 'Introduction to Python', duration: '15:30', completed: false },
          { id: 'py-2', title: 'Python Data Types & Variables', duration: '22:45', completed: false },
          { id: 'py-3', title: 'Working with Pandas', duration: '35:20', completed: false },
          { id: 'py-4', title: 'Data Cleaning Techniques', duration: '28:15', completed: false },
          { id: 'py-5', title: 'Data Visualization with Matplotlib', duration: '42:00', completed: false },
        ],
      },
      {
        id: 'sql-analytics',
        title: 'SQL for Data Analysis',
        videos: [
          { id: 'sql-1', title: 'SQL Fundamentals', duration: '18:20', completed: false },
          { id: 'sql-2', title: 'Advanced Queries & Joins', duration: '32:15', completed: false },
          { id: 'sql-3', title: 'Aggregations & Window Functions', duration: '28:40', completed: false },
          { id: 'sql-4', title: 'Subqueries & CTEs', duration: '25:30', completed: false },
        ],
      },
      {
        id: 'powerbi',
        title: 'Power BI Mastery',
        videos: [
          { id: 'pbi-1', title: 'Power BI Interface Overview', duration: '12:45', completed: false },
          { id: 'pbi-2', title: 'Connecting Data Sources', duration: '20:30', completed: false },
          { id: 'pbi-3', title: 'Creating Visualizations', duration: '38:20', completed: false },
          { id: 'pbi-4', title: 'DAX Formulas', duration: '45:15', completed: false },
          { id: 'pbi-5', title: 'Building Interactive Dashboards', duration: '52:00', completed: false },
        ],
      },
      {
        id: 'excel-analytics',
        title: 'Advanced Excel',
        videos: [
          { id: 'ex-1', title: 'Pivot Tables Deep Dive', duration: '28:30', completed: false },
          { id: 'ex-2', title: 'Advanced Formulas', duration: '35:45', completed: false },
          { id: 'ex-3', title: 'Data Analysis Tools', duration: '22:15', completed: false },
          { id: 'ex-4', title: 'Excel Dashboards', duration: '40:00', completed: false },
        ],
      },
    ],
  },
  {
    id: 'data-engineering',
    title: 'Data Engineering Professional Path',
    category: 'Data Engineering',
    description: 'Build robust data pipelines and infrastructure. Master Python, SQL, Apache Spark, and Airflow to become a data engineering expert.',
    instructor: 'Michael Chen',
    duration: '56 hours',
    level: 'Intermediate',
    price: 129.99,
    originalPrice: 299.99,
    image: '/placeholder.svg',
    rating: 4.9,
    studentsEnrolled: 8320,
    modules: [
      {
        id: 'python-eng',
        title: 'Python for Data Engineering',
        videos: [
          { id: 'pye-1', title: 'Python Best Practices', duration: '25:30', completed: false },
          { id: 'pye-2', title: 'Object-Oriented Programming', duration: '38:45', completed: false },
          { id: 'pye-3', title: 'Working with APIs', duration: '32:20', completed: false },
          { id: 'pye-4', title: 'File Handling & ETL', duration: '42:15', completed: false },
        ],
      },
      {
        id: 'sql-eng',
        title: 'SQL for Data Engineers',
        videos: [
          { id: 'sqle-1', title: 'Database Design Principles', duration: '35:20', completed: false },
          { id: 'sqle-2', title: 'Performance Optimization', duration: '45:15', completed: false },
          { id: 'sqle-3', title: 'Stored Procedures & Functions', duration: '28:40', completed: false },
          { id: 'sqle-4', title: 'Data Warehousing Concepts', duration: '52:30', completed: false },
        ],
      },
      {
        id: 'spark',
        title: 'Apache Spark',
        videos: [
          { id: 'sp-1', title: 'Introduction to Spark', duration: '22:45', completed: false },
          { id: 'sp-2', title: 'Spark DataFrames', duration: '48:30', completed: false },
          { id: 'sp-3', title: 'Spark SQL', duration: '35:20', completed: false },
          { id: 'sp-4', title: 'Spark Streaming', duration: '55:00', completed: false },
          { id: 'sp-5', title: 'Performance Tuning', duration: '42:15', completed: false },
        ],
      },
      {
        id: 'airflow',
        title: 'Apache Airflow',
        videos: [
          { id: 'af-1', title: 'Airflow Architecture', duration: '28:30', completed: false },
          { id: 'af-2', title: 'Building DAGs', duration: '45:45', completed: false },
          { id: 'af-3', title: 'Operators & Sensors', duration: '38:15', completed: false },
          { id: 'af-4', title: 'Production Best Practices', duration: '52:00', completed: false },
        ],
      },
    ],
  },
  {
    id: 'data-science',
    title: 'Data Science & Machine Learning',
    category: 'Data Science',
    description: 'From statistics to deep learning. Complete data science journey covering Python, Statistics, Machine Learning, and Neural Networks.',
    instructor: 'Dr. Emily Watson',
    duration: '68 hours',
    level: 'Advanced',
    price: 149.99,
    originalPrice: 349.99,
    image: '/placeholder.svg',
    rating: 4.7,
    studentsEnrolled: 15890,
    modules: [
      {
        id: 'python-ds',
        title: 'Python for Data Science',
        videos: [
          { id: 'pyds-1', title: 'NumPy Essentials', duration: '28:30', completed: false },
          { id: 'pyds-2', title: 'Advanced Pandas', duration: '42:45', completed: false },
          { id: 'pyds-3', title: 'Scikit-learn Introduction', duration: '35:20', completed: false },
          { id: 'pyds-4', title: 'Feature Engineering', duration: '48:15', completed: false },
        ],
      },
      {
        id: 'statistics',
        title: 'Statistics & Probability',
        videos: [
          { id: 'st-1', title: 'Descriptive Statistics', duration: '32:20', completed: false },
          { id: 'st-2', title: 'Probability Theory', duration: '45:15', completed: false },
          { id: 'st-3', title: 'Hypothesis Testing', duration: '38:40', completed: false },
          { id: 'st-4', title: 'Statistical Inference', duration: '42:30', completed: false },
        ],
      },
      {
        id: 'ml',
        title: 'Machine Learning',
        videos: [
          { id: 'ml-1', title: 'Supervised Learning', duration: '52:45', completed: false },
          { id: 'ml-2', title: 'Unsupervised Learning', duration: '48:30', completed: false },
          { id: 'ml-3', title: 'Model Evaluation', duration: '35:20', completed: false },
          { id: 'ml-4', title: 'Ensemble Methods', duration: '45:00', completed: false },
          { id: 'ml-5', title: 'Model Deployment', duration: '38:15', completed: false },
        ],
      },
      {
        id: 'dl',
        title: 'Deep Learning',
        videos: [
          { id: 'dl-1', title: 'Neural Network Fundamentals', duration: '45:30', completed: false },
          { id: 'dl-2', title: 'TensorFlow & Keras', duration: '58:45', completed: false },
          { id: 'dl-3', title: 'Convolutional Neural Networks', duration: '52:20', completed: false },
          { id: 'dl-4', title: 'Recurrent Neural Networks', duration: '48:15', completed: false },
          { id: 'dl-5', title: 'Transfer Learning', duration: '42:00', completed: false },
        ],
      },
    ],
  },
];

// Mock Students Data
export const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: 'Alex Thompson',
    email: 'alex.t@email.com',
    avatar: '/placeholder.svg',
    joinedDate: '2024-01-15',
    purchasedCourses: ['data-analytics'],
    progress: {
      'data-analytics': {
        completedVideos: ['py-1', 'py-2', 'py-3'],
        lastWatched: 'py-3',
      },
    },
    isBlocked: false,
  },
  {
    id: 'student-2',
    name: 'Jordan Lee',
    email: 'jordan.lee@email.com',
    avatar: '/placeholder.svg',
    joinedDate: '2024-02-20',
    purchasedCourses: ['data-engineering', 'data-science'],
    progress: {
      'data-engineering': {
        completedVideos: ['pye-1', 'pye-2', 'pye-3', 'pye-4', 'sqle-1'],
        lastWatched: 'sqle-1',
      },
      'data-science': {
        completedVideos: ['pyds-1'],
        lastWatched: 'pyds-1',
      },
    },
    isBlocked: false,
  },
  {
    id: 'student-3',
    name: 'Sam Rivera',
    email: 'sam.r@email.com',
    avatar: '/placeholder.svg',
    joinedDate: '2024-03-10',
    purchasedCourses: ['data-analytics', 'data-science'],
    progress: {
      'data-analytics': {
        completedVideos: ['py-1', 'py-2', 'py-3', 'py-4', 'py-5', 'sql-1', 'sql-2', 'sql-3', 'sql-4', 'pbi-1', 'pbi-2'],
        lastWatched: 'pbi-2',
      },
      'data-science': {
        completedVideos: [],
        lastWatched: undefined,
      },
    },
    isBlocked: false,
  },
  {
    id: 'student-4',
    name: 'Casey Morgan',
    email: 'casey.m@email.com',
    avatar: '/placeholder.svg',
    joinedDate: '2024-04-05',
    purchasedCourses: [],
    progress: {},
    isBlocked: true,
  },
  {
    id: 'student-5',
    name: 'Taylor Kim',
    email: 'taylor.k@email.com',
    avatar: '/placeholder.svg',
    joinedDate: '2024-05-12',
    purchasedCourses: ['data-engineering'],
    progress: {
      'data-engineering': {
        completedVideos: ['pye-1', 'pye-2'],
        lastWatched: 'pye-2',
      },
    },
    isBlocked: false,
  },
];

// Mock Admin Data
export const mockAdmin: AdminUser = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@learnhub.com',
  role: 'admin',
  avatar: '/placeholder.svg',
};

// Platform Statistics
export const platformStats = {
  totalStudents: 45892,
  totalCourses: 3,
  totalPurchases: 127543,
  averageCompletionRate: 67,
  monthlyRevenue: 89420,
  activeUsers: 12340,
};

// Helper function to calculate course progress
export const calculateCourseProgress = (
  course: Course,
  completedVideos: string[]
): number => {
  const totalVideos = course.modules.reduce(
    (acc, module) => acc + module.videos.length,
    0
  );
  if (totalVideos === 0) return 0;
  return Math.round((completedVideos.length / totalVideos) * 100);
};

// Helper function to calculate module progress
export const calculateModuleProgress = (
  module: Module,
  completedVideos: string[]
): number => {
  if (module.videos.length === 0) return 0;
  const completedInModule = module.videos.filter((v) =>
    completedVideos.includes(v.id)
  ).length;
  return Math.round((completedInModule / module.videos.length) * 100);
};
