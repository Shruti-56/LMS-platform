import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  BookOpen,
  GraduationCap,
  Award,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Download,
  Calendar,
  Users,
  Briefcase,
  Star,
  Quote,
  Play,
  Building2,
  Target,
  Eye,
  Menu,
  UserCircle,
} from "lucide-react";
import {
  INSTITUTE_NAME,
  CONTACT,
  HERO,
  STATS,
  COURSES,
  INSTITUTE_STORY,
  FACULTY,
  PLACEMENTS,
  PLACEMENT_VIDEOS,
  MARKETING_VIDEOS,
  TESTIMONIALS,
  GOOGLE_REVIEW_STATS,
} from "@/config/marketing";
import { toast } from "@/hooks/use-toast";

const whatsappUrl = `https://wa.me/${CONTACT.whatsapp}`;
const logoUrl = import.meta.env.VITE_INSTITUTE_LOGO_URL || "/institute-logo.png";

function Logo({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <img
      src={logoUrl}
      alt={INSTITUTE_NAME}
      className={className}
      width={size}
      height={size}
    />
  );
}

/** Renders a video card: iframe if embedUrl, else a link card. */
function VideoCard({
  title,
  description,
  embedUrl,
  url,
  className = "",
}: {
  title: string;
  description?: string;
  embedUrl?: string;
  url?: string;
  className?: string;
}) {
  const hasLink = !!(url || embedUrl);
  if (embedUrl) {
    return (
      <div className={`rounded-2xl border-2 border-border/60 bg-muted/30 overflow-hidden shadow-md ${className}`}>
        <div className="aspect-video w-full bg-black/5">
          <iframe
            src={embedUrl}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="p-4">
          <p className="font-semibold text-foreground">{title}</p>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
    );
  }
  const content = (
    <>
      <div className="aspect-video w-full bg-muted/50 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Play className="h-7 w-7 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">{hasLink ? "Watch video" : "Add video URL in config"}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="font-semibold text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
    </>
  );
  if (hasLink && url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`block rounded-2xl border-2 border-border/60 bg-muted/30 overflow-hidden shadow-md hover:shadow-lg hover:border-primary/30 transition-all ${className}`}
      >
        {content}
      </a>
    );
  }
  return (
    <div className={`rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 overflow-hidden ${className}`}>
      {content}
    </div>
  );
}

const navLinks = [
  { label: "Courses", href: "#courses" },
  { label: "About", href: "#about" },
  { label: "Videos", href: "#videos" },
  { label: "Placements", href: "#placements" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

export default function MarketingLanding() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    bookDemo: false,
    downloadBrochure: false,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    // Simulate submit – wire to your backend or form service later
    await new Promise((r) => setTimeout(r, 800));
    setFormSubmitting(false);
    setFormData({ name: "", email: "", phone: "", message: "", bookDemo: false, downloadBrochure: false });
    toast({
      title: "Enquiry received",
      description: "We'll get back to you within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background antialiased">
      {/* ----- Header ----- */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/98 backdrop-blur-md shadow-sm">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-lg text-foreground">
            <Logo size={36} className="h-9 w-9 object-contain" />
            {INSTITUTE_NAME}
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => (
              <button
                key={href}
                onClick={() => scrollTo(href.slice(1))}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all"
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                  <Logo size={32} className="h-8 w-8 object-contain" />
                  <span className="font-display font-semibold text-foreground">{INSTITUTE_NAME}</span>
                </div>
                <nav className="flex flex-col gap-2 pt-6">
                  {navLinks.map(({ label, href }) => (
                    <button
                      key={href}
                      onClick={() => { scrollTo(href.slice(1)); setMobileMenuOpen(false); }}
                      className="text-left px-3 py-2 text-sm font-medium text-foreground rounded-md hover:bg-muted"
                    >
                      {label}
                    </button>
                  ))}
                  <div className="border-t pt-4 mt-4 flex flex-col gap-2">
                    <Button size="sm" onClick={() => { scrollTo("contact"); setMobileMenuOpen(false); }}>Book Demo</Button>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}><Button size="sm" className="w-full">Apply Now</Button></Link>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}><Button size="sm" variant="outline" className="w-full">Login</Button></Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </a>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Login
              </Button>
            </Link>
            <Button size="sm" onClick={() => scrollTo("contact")} className="gap-1.5">
              Book Demo
            </Button>
            <Link to="/register">
              <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90">
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ----- Hero ----- */}
        <section className="relative overflow-hidden min-h-[90vh] flex items-center">
          <div className="marketing-hero-bg absolute inset-0" />
          <div className="marketing-hero-pattern absolute inset-0" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 marketing-blob bg-primary/30" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 marketing-blob bg-accent/20" />
          <div className="container relative py-20 md:py-28 lg:py-32">
            <div className="mx-auto max-w-4xl text-center space-y-10">
              <Logo size={56} className="mx-auto h-14 w-14 object-contain drop-shadow-sm" />
              <span className="marketing-badge-pill inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-foreground">
                <Award className="h-4 w-4 text-amber-500" />
                Trusted by 45K+ learners
              </span>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] drop-shadow-sm">
                {HERO.headline}
              </h1>
              <p className="text-lg text-white/85 md:text-xl max-w-2xl mx-auto">
                {HERO.subheadline}
              </p>
              {/* Stats - glass cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 py-8">
                {STATS.map(({ value, label }) => (
                  <div key={label} className="marketing-glass rounded-2xl px-5 py-4 sm:px-6 sm:py-5 text-center">
                    <div className="font-display text-2xl md:text-3xl font-bold text-white">{value}</div>
                    <div className="text-xs sm:text-sm text-white/70 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" onClick={() => scrollTo("contact")} className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg">
                  <Calendar className="h-5 w-5" />
                  Book Demo
                </Button>
                <Link to="/register">
                  <Button size="lg" className="gap-2 bg-white text-primary hover:bg-white/95 shadow-lg">
                    Apply Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                {HERO.ctaDownloadBrochure && (
                  <Button size="lg" variant="outline" className="gap-2 border-white/40 text-white hover:bg-white/10 hover:text-white" onClick={() => toast({ title: "Brochure", description: "We'll email you the brochure." })}>
                    <Download className="h-5 w-5" />
                    Download Brochure
                  </Button>
                )}
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="gap-2 border-green-400/50 text-green-300 hover:bg-green-500/20">
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ----- Courses ----- */}
        <section id="courses" className="scroll-mt-20 py-20 md:py-28 marketing-section-accent">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl marketing-title-underline">Courses We Offer</h2>
              <p className="mt-6 text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">Duration, fees, syllabus overview, tools, and career outcomes.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {COURSES.map((course, i) => (
                <Card key={course.title} className={`marketing-course-card marketing-card-hover overflow-hidden border-2 border-border/60 bg-card shadow-lg hover:border-primary/20 ${i === 1 ? "lg:-mt-4" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <CardDescription className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center gap-1"><BookOpen className="h-4 w-4" /> {course.duration}</span>
                      <span className="font-semibold text-foreground">{course.fees}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p><span className="font-medium text-foreground">Tools:</span> {course.tools.join(", ")}</p>
                    <p><span className="font-medium text-foreground">Career outcomes:</span> {course.outcomes}</p>
                    {course.demoClass && (
                      <p className="text-primary font-semibold flex items-center gap-1">Free demo class available</p>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2 flex-wrap pt-2">
                    <Button size="sm" variant="outline" onClick={() => scrollTo("contact")}>Book demo class</Button>
                    <Link to="/register"><Button size="sm" className="bg-primary">Apply now</Button></Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ----- Institute Story ----- */}
        <section id="about" className="scroll-mt-20 py-20 md:py-28 border-t border-border/60 bg-gradient-to-b from-background to-muted/40">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl marketing-title-underline">Our Story</h2>
                  <p className="mt-6 text-muted-foreground">Mission, vision, and experience.</p>
                </div>
                <div className="space-y-6">
                  <div className="flex gap-4 p-4 rounded-2xl bg-card border border-border/60 shadow-sm">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Mission</h3>
                      <p className="text-sm text-muted-foreground mt-1">{INSTITUTE_STORY.mission}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-2xl bg-card border border-border/60 shadow-sm">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Vision</h3>
                      <p className="text-sm text-muted-foreground mt-1">{INSTITUTE_STORY.vision}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 items-start">
                  <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 px-6 py-4 text-primary-foreground shadow-lg">
                    <span className="font-display text-3xl font-bold">{INSTITUTE_STORY.yearsExperience}+</span>
                    <span className="ml-1 opacity-90">years</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Achievements</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-0.5">{INSTITUTE_STORY.achievements.map((a) => <li key={a}>{a}</li>)}</ul>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-2 p-4 rounded-xl bg-muted/50 border border-border/60">
                  <p><span className="font-semibold text-foreground">Certifications:</span> {INSTITUTE_STORY.certifications.join("; ")}</p>
                  <p><span className="font-semibold text-foreground">Affiliations:</span> {INSTITUTE_STORY.affiliations.join("; ")}</p>
                </div>
              </div>
              <div className="rounded-2xl border-2 border-border/60 bg-muted/30 aspect-[4/3] flex items-center justify-center overflow-hidden shadow-xl">
                <div className="text-center p-8 text-muted-foreground">
                  <Building2 className="h-20 w-20 mx-auto mb-4 opacity-40" />
                  <p className="text-sm font-medium">Campus / classroom photos</p>
                  <p className="text-xs mt-1">Add your images here</p>
                </div>
              </div>
            </div>
            {/* Faculty highlights */}
            <div className="mt-20 pt-20 border-t-2 border-border/60">
              <h3 className="font-display text-2xl font-bold text-foreground mb-8 text-center marketing-title-underline">Faculty Highlights</h3>
              <div className="grid sm:grid-cols-3 gap-8">
                {FACULTY.map((f) => (
                  <Card key={f.name} className="marketing-card-hover border-2 border-border/60 text-center overflow-hidden shadow-md hover:shadow-xl">
                    <CardContent className="pt-8 pb-6">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 ring-2 ring-primary/20">
                        <UserCircle className="h-9 w-9 text-primary" />
                      </div>
                      <p className="font-bold text-foreground text-lg">{f.name}</p>
                      <p className="text-sm font-medium text-primary">{f.role}</p>
                      <p className="text-sm text-muted-foreground mt-2">{f.bio}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ----- Placements ----- */}
        <section id="placements" className="scroll-mt-20 py-20 md:py-28 marketing-section-accent border-t border-border/60">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl marketing-title-underline">Student Placements</h2>
              <p className="mt-6 text-muted-foreground text-base md:text-lg">Companies, packages, and outcomes.</p>
            </div>
            <div className="rounded-3xl border-2 border-border/60 bg-card p-8 md:p-14 shadow-xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="inline-block rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/20 px-6 py-4">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Average package</p>
                    <p className="font-display text-4xl font-bold marketing-gradient-text">{PLACEMENTS.avgPackage}</p>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    {PLACEMENTS.internshipStat}
                  </p>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3">Our hiring partners</p>
                    <div className="flex flex-wrap gap-2">
                      {PLACEMENTS.companies.map((c) => (
                        <span key={c} className="rounded-lg bg-primary/10 text-primary font-medium px-4 py-2 text-sm border border-primary/20">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                    <p className="text-sm font-semibold text-foreground">Placement & success story videos</p>
                    <div className={`grid gap-4 ${PLACEMENT_VIDEOS.length >= 3 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                      {PLACEMENT_VIDEOS.map((v) => (
                        <VideoCard key={v.id} title={v.title} embedUrl={v.embedUrl} url={v.url} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </section>

        {/* ----- Institute videos (marketing / institute info) ----- */}
        {MARKETING_VIDEOS.length > 0 && (
          <section id="videos" className="scroll-mt-20 py-20 md:py-28 border-t border-border/60 bg-gradient-to-b from-background to-muted/30">
            <div className="container">
              <div className="text-center mb-16">
                <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl marketing-title-underline">Institute in action</h2>
                <p className="mt-6 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">Watch our campus, programs, and what makes us different.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {MARKETING_VIDEOS.map((v) => (
                  <VideoCard key={v.id} title={v.title} description={v.description} embedUrl={v.embedUrl} url={v.url} className="marketing-card-hover" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ----- Testimonials ----- */}
        <section id="testimonials" className="scroll-mt-20 py-20 md:py-28 border-t border-border/60 bg-gradient-to-b from-background to-muted/30">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl marketing-title-underline">Testimonials & Reviews</h2>
                <p className="mt-6 text-muted-foreground text-base">What students and parents say.</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-amber-200/60 bg-amber-50/80 dark:bg-amber-950/20 px-5 py-4 w-fit shadow-sm">
                <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                <span className="font-display text-2xl font-bold text-foreground">{GOOGLE_REVIEW_STATS.rating}</span>
                <span className="text-muted-foreground text-sm">Google · {GOOGLE_REVIEW_STATS.count}+ reviews</span>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t) => (
                <Card key={t.name} className="marketing-card-hover marketing-quote-border border-2 border-border/60 bg-card shadow-md pl-6">
                  <CardContent className="pt-6 pb-6">
                    <Quote className="h-10 w-10 text-primary/20 mb-3" />
                    <p className="text-muted-foreground mb-5 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="font-semibold text-foreground">{t.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{t.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {PLACEMENT_VIDEOS.length > 0 && (
              <div className="mt-14">
                <h3 className="font-display text-xl font-semibold text-foreground mb-6 text-center">Video testimonials</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {PLACEMENT_VIDEOS.map((v) => (
                    <VideoCard key={v.id} title={v.title} embedUrl={v.embedUrl} url={v.url} className="marketing-card-hover" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ----- Contact / Enquiry ----- */}
        <section id="contact" className="scroll-mt-20 py-20 md:py-28 marketing-section-accent border-t border-border/60">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl marketing-title-underline">Contact & Enquiry</h2>
              <p className="mt-6 text-muted-foreground text-base md:text-lg">Reach out or book a demo. We respond quickly.</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-0 overflow-hidden rounded-3xl border-2 border-border/60 shadow-2xl">
              <div className="marketing-contact-panel p-8 md:p-12 flex flex-col justify-center space-y-8">
                <div>
                  <div className="mb-3 inline-flex rounded-xl bg-white/20 p-2">
                    <Logo size={40} className="h-10 w-10 object-contain" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white mb-2">Get in touch</h3>
                  <p className="text-white/80">Phone, WhatsApp, email, or visit us.</p>
                </div>
                <div className="space-y-6">
                  <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="flex items-center gap-4 text-white hover:text-white/90 transition-colors">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"><Phone className="h-7 w-7" /></div>
                    <div>
                      <p className="text-xs text-white/70 uppercase tracking-wide">Phone</p>
                      <p className="font-semibold text-lg">{CONTACT.phone}</p>
                    </div>
                  </a>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-white hover:text-white/90 transition-colors">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/30"><MessageCircle className="h-7 w-7" /></div>
                    <div>
                      <p className="text-xs text-white/70 uppercase tracking-wide">WhatsApp</p>
                      <p className="font-semibold text-lg">Chat with us</p>
                    </div>
                  </a>
                  <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-4 text-white hover:text-white/90 transition-colors">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"><Mail className="h-7 w-7" /></div>
                    <div>
                      <p className="text-xs text-white/70 uppercase tracking-wide">Email</p>
                      <p className="font-semibold text-lg break-all">{CONTACT.email}</p>
                    </div>
                  </a>
                </div>
                <div className="flex items-start gap-3 text-white/90">
                  <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-sm">{CONTACT.address}</p>
                </div>
                {CONTACT.mapEmbedUrl ? (
                  <div className="rounded-xl overflow-hidden border border-white/20 aspect-video">
                    <iframe src={CONTACT.mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Map" />
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/20 bg-white/5 aspect-video flex items-center justify-center text-white/60 text-sm">
                    Add map embed URL in config
                  </div>
                )}
              </div>
              <Card className="rounded-none border-0 border-l-2 border-border/60 shadow-xl bg-card">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl">Enquiry / Book Demo</CardTitle>
                  <CardDescription className="text-base">Fill the form and we’ll get back within 24 hours. Tick to book a free demo or request brochure.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Your name" value={formData.name} onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData((d) => ({ ...d, phone: e.target.value }))} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Your message or query" rows={4} value={formData.message} onChange={(e) => setFormData((d) => ({ ...d, message: e.target.value }))} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={formData.bookDemo} onCheckedChange={(c) => setFormData((d) => ({ ...d, bookDemo: !!c }))} />
                        <span className="text-sm">Book a free demo class</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={formData.downloadBrochure} onCheckedChange={(c) => setFormData((d) => ({ ...d, downloadBrochure: !!c }))} />
                        <span className="text-sm">Send me the brochure (PDF)</span>
                      </label>
                    </div>
                    <Button type="submit" className="w-full" disabled={formSubmitting}>
                      {formSubmitting ? "Sending..." : "Submit Enquiry"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            {/* Lead capture CTAs */}
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto py-5 flex flex-col items-center gap-2 rounded-xl border-2 hover:border-primary/40 hover:bg-primary/5 transition-colors" onClick={() => scrollTo("contact")}>
                <Calendar className="h-7 w-7 text-primary" />
                <span className="font-medium">Free demo class</span>
              </Button>
              <Button variant="outline" className="h-auto py-5 flex flex-col items-center gap-2 rounded-xl border-2 hover:border-primary/40 hover:bg-primary/5 transition-colors" onClick={() => toast({ title: "Workshop", description: "We'll share registration link." })}>
                <Users className="h-7 w-7 text-primary" />
                <span className="font-medium">Free workshop</span>
              </Button>
              <Button variant="outline" className="h-auto py-5 flex flex-col items-center gap-2 rounded-xl border-2 hover:border-primary/40 hover:bg-primary/5 transition-colors" onClick={() => toast({ title: "PDF notes", description: "We'll email you the notes." })}>
                <Download className="h-7 w-7 text-primary" />
                <span className="font-medium">Free PDF notes</span>
              </Button>
              </div>
          </div>
        </section>

        {/* ----- Footer ----- */}
        <footer className="border-t-2 border-border bg-gradient-to-b from-card to-muted/30 py-14">
          <div className="container">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-2.5 font-display font-bold text-foreground mb-4">
                  <Logo size={36} className="h-9 w-9 object-contain" />
                  {INSTITUTE_NAME}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">Quality data & analytics education with placement support.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-4">Trust builders</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2"><Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" /> {GOOGLE_REVIEW_STATS.rating} Google rating</li>
                  <li className="flex items-center gap-2"><Briefcase className="h-4 w-4 shrink-0 text-primary" /> {STATS[0].value} placement rate</li>
                  <li className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0 text-primary" /> {STATS[1].value} students</li>
                  <li className="flex items-center gap-2"><Award className="h-4 w-4 shrink-0 text-primary" /> {INSTITUTE_STORY.yearsExperience}+ years</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-3">Quick links</p>
                <ul className="text-sm space-y-2">
                  <li><button onClick={() => scrollTo("courses")} className="text-muted-foreground hover:text-foreground">Courses</button></li>
                  <li><button onClick={() => scrollTo("about")} className="text-muted-foreground hover:text-foreground">About</button></li>
                  <li><button onClick={() => scrollTo("placements")} className="text-muted-foreground hover:text-foreground">Placements</button></li>
                  <li><Link to="/login" className="text-muted-foreground hover:text-foreground">Login to LMS</Link></li>
                  <li><Link to="/register" className="text-muted-foreground hover:text-foreground">Apply now</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-3">Contact</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li><a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="hover:text-foreground">{CONTACT.phone}</a></li>
                  <li><a href={`mailto:${CONTACT.email}`} className="hover:text-foreground">{CONTACT.email}</a></li>
                  <li><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">WhatsApp</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} {INSTITUTE_NAME}. All rights reserved.</span>
              <div className="flex items-center gap-6">
                <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
                <Link to="/register" className="hover:text-foreground transition-colors">Register</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Sticky WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="marketing-sticky-btn fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>

      {/* Sticky Call */}
      <a
        href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
        className="marketing-sticky-btn fixed bottom-6 right-24 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground"
        aria-label="Call now"
      >
        <Phone className="h-6 w-6" />
      </a>
    </div>
  );
}
