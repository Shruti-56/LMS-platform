import { PrismaClient, CourseCategory, CourseLevel, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@learnhub.com' },
    update: {},
    create: {
      email: 'admin@learnhub.com',
      passwordHash: adminPassword,
      roles: [UserRole.ADMIN],
      profile: {
        create: {
          fullName: 'Admin User',
        },
      },
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create student user
  const studentPassword = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@learnhub.com' },
    update: {},
    create: {
      email: 'student@learnhub.com',
      passwordHash: studentPassword,
      roles: [UserRole.STUDENT],
      profile: {
        create: {
          fullName: 'John Doe',
        },
      },
    },
  });
  console.log('✅ Student user created:', student.email);

  // Create courses with modules and videos
  const coursesData = [
    {
      title: 'Data Analytics Fundamentals',
      description: 'Master the essentials of data analytics with Python, SQL, Power BI, and Excel.',
      category: CourseCategory.DATA_ANALYTICS,
      level: CourseLevel.BEGINNER,
      price: 49.99,
      durationHours: 40,
      modules: [
        {
          title: 'Python for Analytics',
          videos: [
            { title: 'Introduction to Python', duration: 15 },
            { title: 'Variables and Data Types', duration: 20 },
            { title: 'Control Flow', duration: 25 },
            { title: 'Functions and Modules', duration: 30 },
          ],
        },
        {
          title: 'SQL Essentials',
          videos: [
            { title: 'Database Fundamentals', duration: 15 },
            { title: 'SELECT Queries', duration: 20 },
            { title: 'JOINs and Relationships', duration: 25 },
            { title: 'Aggregations', duration: 20 },
          ],
        },
        {
          title: 'Power BI',
          videos: [
            { title: 'Getting Started with Power BI', duration: 20 },
            { title: 'Data Modeling', duration: 25 },
            { title: 'Creating Visualizations', duration: 30 },
            { title: 'Publishing Dashboards', duration: 15 },
          ],
        },
        {
          title: 'Excel Advanced',
          videos: [
            { title: 'Advanced Formulas', duration: 25 },
            { title: 'Pivot Tables', duration: 20 },
            { title: 'Data Analysis Tools', duration: 25 },
            { title: 'Macros Introduction', duration: 20 },
          ],
        },
      ],
    },
    {
      title: 'Data Engineering Bootcamp',
      description: 'Build robust data pipelines with Python, SQL, Spark, and Airflow.',
      category: CourseCategory.DATA_ENGINEERING,
      level: CourseLevel.INTERMEDIATE,
      price: 79.99,
      durationHours: 60,
      modules: [
        {
          title: 'Python for Data Engineering',
          videos: [
            { title: 'Advanced Python Concepts', duration: 30 },
            { title: 'Working with APIs', duration: 25 },
            { title: 'File Processing', duration: 20 },
            { title: 'Error Handling', duration: 15 },
          ],
        },
        {
          title: 'SQL for Data Engineers',
          videos: [
            { title: 'Database Design', duration: 25 },
            { title: 'Query Optimization', duration: 30 },
            { title: 'Stored Procedures', duration: 25 },
            { title: 'ETL with SQL', duration: 20 },
          ],
        },
        {
          title: 'Apache Spark',
          videos: [
            { title: 'Spark Architecture', duration: 25 },
            { title: 'RDDs and DataFrames', duration: 30 },
            { title: 'Spark SQL', duration: 25 },
            { title: 'Performance Tuning', duration: 35 },
          ],
        },
        {
          title: 'Apache Airflow',
          videos: [
            { title: 'Airflow Concepts', duration: 20 },
            { title: 'Building DAGs', duration: 30 },
            { title: 'Operators and Hooks', duration: 25 },
            { title: 'Monitoring Pipelines', duration: 20 },
          ],
        },
      ],
    },
    {
      title: 'Data Science Masterclass',
      description: 'From statistics to deep learning - become a complete data scientist.',
      category: CourseCategory.DATA_SCIENCE,
      level: CourseLevel.ADVANCED,
      price: 99.99,
      durationHours: 80,
      modules: [
        {
          title: 'Python for Data Science',
          videos: [
            { title: 'NumPy Deep Dive', duration: 30 },
            { title: 'Pandas Mastery', duration: 35 },
            { title: 'Data Visualization', duration: 25 },
            { title: 'Feature Engineering', duration: 30 },
          ],
        },
        {
          title: 'Statistics',
          videos: [
            { title: 'Descriptive Statistics', duration: 25 },
            { title: 'Probability Theory', duration: 30 },
            { title: 'Hypothesis Testing', duration: 35 },
            { title: 'Regression Analysis', duration: 30 },
          ],
        },
        {
          title: 'Machine Learning',
          videos: [
            { title: 'Supervised Learning', duration: 40 },
            { title: 'Unsupervised Learning', duration: 35 },
            { title: 'Model Evaluation', duration: 25 },
            { title: 'Ensemble Methods', duration: 30 },
          ],
        },
        {
          title: 'Deep Learning',
          videos: [
            { title: 'Neural Networks Basics', duration: 35 },
            { title: 'CNNs for Computer Vision', duration: 40 },
            { title: 'RNNs for NLP', duration: 35 },
            { title: 'Transfer Learning', duration: 30 },
          ],
        },
      ],
    },
  ];

  for (const courseData of coursesData) {
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        price: courseData.price,
        durationHours: courseData.durationHours,
        createdById: admin.id,
        modules: {
          create: courseData.modules.map((module, moduleIndex) => ({
            title: module.title,
            sortOrder: moduleIndex,
            videos: {
              create: module.videos.map((video, videoIndex) => ({
                title: video.title,
                durationMinutes: video.duration,
                sortOrder: videoIndex,
              })),
            },
          })),
        },
      },
    });
    console.log(`✅ Course created: ${course.title}`);
  }

  console.log('');
  console.log('🎉 Seed completed!');
  console.log('');
  console.log('📧 Test accounts:');
  console.log('   Admin: admin@learnhub.com / admin123');
  console.log('   Student: student@learnhub.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
