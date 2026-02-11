/**
 * Marketing site content – edit these to match your institute.
 * For phone/WhatsApp/email, you can use env vars in production (e.g. VITE_CONTACT_PHONE).
 */

export const INSTITUTE_NAME = import.meta.env.VITE_INSTITUTE_NAME || "DataUniverse";

export const CONTACT = {
  phone: import.meta.env.VITE_CONTACT_PHONE || "+91 98765 43210",
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || "919876543210", // no + or spaces for wa.me link
  email: import.meta.env.VITE_CONTACT_EMAIL || "admin@datauniverse.in",
  address: "Your Institute Address, City, State – Pin",
  mapEmbedUrl: "", // e.g. Google Maps embed src URL
};

export const HERO = {
  headline: "Data & Analytics Courses for Working Professionals & Freshers",
  subheadline: "Industry-led programs in Data Science, Analytics, and Engineering. Learn from experts and get placement support.",
  ctaBookDemo: true,
  ctaApplyNow: true,
  ctaDownloadBrochure: true,
};

export const STATS = [
  { value: "95%", label: "Placement rate" },
  { value: "45K+", label: "Students trained" },
  { value: "12+", label: "Years of experience" },
  { value: "200+", label: "Hiring partners" },
];

export const COURSES = [
  {
    title: "Data Science & Analytics",
    duration: "6 months",
    fees: "₹ 45,000",
    tools: ["Python", "SQL", "Tableau", "ML"],
    outcomes: "Data Analyst, Business Analyst",
    demoClass: true,
  },
  {
    title: "Data Engineering",
    duration: "4 months",
    fees: "₹ 55,000",
    tools: ["Spark", "AWS", "ETL", "SQL"],
    outcomes: "Data Engineer, DE roles",
    demoClass: true,
  },
  {
    title: "Business Analytics",
    duration: "3 months",
    fees: "₹ 35,000",
    tools: ["Excel", "Power BI", "SQL"],
    outcomes: "Analytics Consultant",
    demoClass: true,
  },
];

export const INSTITUTE_STORY = {
  mission: "To make quality data and analytics education accessible and outcome-focused.",
  vision: "To be the most trusted name in data upskilling and placements.",
  yearsExperience: 12,
  achievements: ["ISO certified", "Industry partnerships", "Placement guarantee program"],
  certifications: ["Recognized by XYZ", "Partner with ABC"],
  affiliations: ["Industry body A", "University tie-up B"],
};

export const FACULTY = [
  { name: "Faculty Name 1", role: "Lead Data Scientist", bio: "Ex-Google, 10+ years in analytics." },
  { name: "Faculty Name 2", role: "Senior Analyst", bio: "Industry expert, placement mentor." },
  { name: "Faculty Name 3", role: "Data Engineering Lead", bio: "AWS certified, real-world projects." },
];

export const PLACEMENTS = {
  companies: ["Company 1", "Company 2", "Company 3", "Company 4", "Company 5", "Company 6"],
  avgPackage: "₹ 8–12 LPA",
  internshipStat: "80% interns converted to FTE",
};

/**
 * Student placement / success story videos.
 * Use embedUrl for YouTube/Vimeo embed (e.g. https://www.youtube.com/embed/VIDEO_ID).
 * Use url as fallback link (e.g. https://www.youtube.com/watch?v=VIDEO_ID).
 */
export const PLACEMENT_VIDEOS: { id: string; title: string; embedUrl?: string; url?: string }[] = [
  { id: "1", title: "Placement story – Data Analyst at Tech Co", embedUrl: "", url: "" },
  { id: "2", title: "How I switched to analytics", embedUrl: "", url: "" },
  { id: "3", title: "From fresher to placed in 6 months", embedUrl: "", url: "" },
];

/**
 * Marketing / institute info videos (about the institute, campus, courses, etc.).
 */
export const MARKETING_VIDEOS: { id: string; title: string; description?: string; embedUrl?: string; url?: string }[] = [
  { id: "1", title: "Welcome to our institute", description: "A quick overview of our campus and programs.", embedUrl: "", url: "" },
  { id: "2", title: "Why choose us", description: "Hear from our faculty and students.", embedUrl: "", url: "" },
  { id: "3", title: "Course preview – Data Science", embedUrl: "", url: "" },
];

export const TESTIMONIALS = [
  { name: "Student Name", role: "Data Analyst at Tech Co", text: "The course structure and placement support helped me switch to analytics.", rating: 5 },
  { name: "Another Student", role: "Business Analyst", text: "Best investment for my career. Faculty and LMS are top-notch.", rating: 5 },
  { name: "Parent Name", role: "Parent", text: "My son got placed within 2 months of completion. Thank you!", rating: 5 },
];

export const GOOGLE_REVIEW_STATS = { rating: 4.8, count: 120 };
