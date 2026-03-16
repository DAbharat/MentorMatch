"use client";

import { Button } from "@/components/retroui/Button";
import Link from "next/link";
import {
  CheckCircle,
  Users,
  Zap,
  Video,
  MessageSquare,
  Star,
  ArrowRight,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const features = [
  {
    icon: Video,
    title: "Live Video Sessions",
    description:
      "Connect face-to-face with mentors in real-time. Share screens and collaborate through high-quality video calls.",
  },
  {
    icon: MessageSquare,
    title: "Integrated Chat",
    description:
      "Message mentors anytime. Ask questions, share resources, and maintain ongoing conversations.",
  },
  {
    icon: Users,
    title: "Skill Marketplace",
    description:
      "Browse mentors by skill and connect with people who share your learning goals.",
  },
  {
    icon: Star,
    title: "Ratings & Feedback",
    description:
      "Rate and review sessions to help others find the best mentors.",
  },
  {
    icon: Zap,
    title: "Smart Scheduling",
    description:
      "Schedule sessions easily with automatic reminders.",
  },
  {
    icon: CheckCircle,
    title: "Session History",
    description:
      "Track completed sessions and skills you've acquired.",
  },
];

const steps = [
  {
    title: "Create Your Profile",
    description:
      "Sign up and showcase your skills, interests, and learning goals.",
    icon: CheckCircle,
  },
  {
    title: "Find or Offer Skills",
    description:
      "Browse mentors or become one and share your expertise.",
    icon: Users,
  },
  {
    title: "Schedule Sessions",
    description:
      "Book time slots that work for both mentor and learner.",
    icon: Zap,
  },
  {
    title: "Learn & Grow",
    description:
      "Join live video calls and track your progress over time.",
    icon: Video,
  },
];

const whyJoin = [
  {
    title: "Learn from Experts",
    description:
      "Get guidance from experienced professionals.",
  },
  {
    title: "Build Connections",
    description:
      "Connect with a supportive learning community.",
  },
  {
    title: "Flexible Learning",
    description:
      "Schedule sessions at your own pace.",
  },
  {
    title: "Track Progress",
    description:
      "Monitor your learning journey with session history.",
  },
];

const testimonials = [
  {
    quote:
      "ProductFeed connected me with an amazing mentor who helped me transition into tech.",
    author: "Sarah Chen",
    role: "Junior Developer",
  },
  {
    quote:
      "As a mentor, I love how easy it is to schedule sessions and help learners.",
    author: "Alex Rodriguez",
    role: "Senior Engineer",
  },
  {
    quote:
      "The community here is incredibly supportive and inspiring.",
    author: "Jordan Smith",
    role: "Product Designer",
  },
];

export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.push("/profile");
    }
  }, [user, isLoaded, router]);

  return (
    <div className="w-full min-h-screen bg-[#0b090a] text-[#d3d3d3]">

      {/* HERO SECTION */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Copy */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-white">
                  Master Skills.
                  <span className="block text-blue-400">Teach What You Know.</span>
                </h1>

                <p className="text-lg text-[#d3d3d3]/70 max-w-xl leading-relaxed">
                  Connect with mentors and learners worldwide. Schedule live sessions, share knowledge, and grow together through real-time video collaboration.
                </p>
              </div>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link href="/sign-up">
                  <Button size="lg" className="rounded-full w-full sm:w-auto">
                    Start Learning
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button variant="outline" size="lg" className="rounded-full w-full sm:w-auto">
                    Become a Mentor
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div>
                  <div className="text-3xl font-bold text-white">5K+</div>
                  <p className="text-xs text-[#d3d3d3]/60 mt-2">Active Learners</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">2K+</div>
                  <p className="text-xs text-[#d3d3d3]/60 mt-2">Expert Mentors</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">10K+</div>
                  <p className="text-xs text-[#d3d3d3]/60 mt-2">Sessions Done</p>
                </div>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="border border-[#1f1f1f] rounded-2xl bg-[#111315] p-12 flex flex-col items-center justify-center gap-6 h-96 hover:border-[#2a2a2a] transition-all duration-300">
                  <div className="grid grid-cols-3 gap-4 absolute top-6 left-6 right-6">
                    <div className="h-2 bg-[#1f1f1f] rounded" />
                    <div className="h-2 bg-[#1f1f1f] rounded" />
                    <div className="h-2 bg-[#1f1f1f] rounded" />
                  </div>
                  <Video className="w-20 h-20 text-blue-400" />
                  <div className="text-center space-y-2">
                    <p className="text-white font-semibold">Live Video Sessions</p>
                    <p className="text-[#d3d3d3]/60 text-sm">Connect face-to-face with mentors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 md:py-32 border-t border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Powerful Features
            </h2>
            <p className="text-[#d3d3d3]/70 text-lg max-w-2xl mx-auto">
              Everything you need to learn, teach, and grow in your professional journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-8 rounded-xl border border-[#1f1f1f] bg-[#111315] hover:border-[#2a2a2a] hover:bg-[#151719] transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-400/10 flex items-center justify-center mb-6 group-hover:bg-blue-400/20 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-[#d3d3d3]/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 md:py-32 border-t border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Get Started in 4 Steps
            </h2>
            <p className="text-[#d3d3d3]/70 text-lg max-w-2xl mx-auto">
              Simple onboarding to start your mentorship journey
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={idx} className="relative">
                  <div className="space-y-4">
                    {/* Step Number */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-full bg-blue-400/10 flex items-center justify-center">
                        <span className="text-blue-400 font-bold">{idx + 1}</span>
                      </div>
                      {idx < steps.length - 1 && (
                        <div className="hidden md:block flex-1 h-0.5 mx-3 bg-linear-to-r from-[#1f1f1f] via-[#1f1f1f] to-transparent" />
                      )}
                    </div>

                    {/* Icon */}
                    <div className="w-16 h-16 rounded-lg bg-[#111315] border border-[#1f1f1f] flex items-center justify-center hover:border-[#2a2a2a] transition-colors duration-300">
                      <StepIcon className="w-8 h-8 text-blue-400" />
                    </div>

                    {/* Text */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-[#d3d3d3]/70 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Connector */}
                  {idx < steps.length - 1 && (
                    <div className="md:hidden h-16 absolute top-12 left-6 w-0.5 bg-linear-to-b from-[#1f1f1f] to-transparent -ml-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY MENTORMATCH SECTION */}
      <section className="py-20 md:py-32 border-t border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Why Choose MentorMatch?
            </h2>
            <p className="text-[#d3d3d3]/70 text-lg max-w-2xl mx-auto">
              Built for modern learners and mentors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyJoin.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-[#1f1f1f] bg-[#111315] hover:border-[#2a2a2a] hover:bg-[#151719] transition-all duration-300 space-y-4"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[#d3d3d3]/70 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-20 md:py-32 border-t border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Loved by Our Community
            </h2>
            <p className="text-[#d3d3d3]/70 text-lg max-w-2xl mx-auto">
              Thousands of successful mentorships and learning journeys
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-8 rounded-xl border border-[#1f1f1f] bg-[#111315] hover:border-[#2a2a2a] hover:bg-[#151719] transition-all duration-300 flex flex-col space-y-4"
              >
                {/* Star Rating */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[#d3d3d3]/80 leading-relaxed grow">
                  "{t.quote}"
                </p>

                {/* Author */}
                <div className="border-t border-[#1f1f1f] pt-6">
                  <p className="text-white font-semibold">{t.author}</p>
                  <p className="text-sm text-[#d3d3d3]/60 mt-1">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 md:py-32 border-t border-[#1f1f1f]">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-[#d3d3d3]/70 text-lg">
              Join thousands of learners and mentors building meaningful connections through skill exchange.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/sign-up">
              <Button size="lg" className="rounded-full w-full sm:w-auto">
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="rounded-full w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1f1f1f] py-16 bg-[#0b090a]/50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Footer Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Product */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wide">
                Product
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#features"
                    className="text-[#d3d3d3]/60 hover:text-[#d3d3d3] transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#d3d3d3]/60 hover:text-[#d3d3d3] transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#d3d3d3]/60 hover:text-[#d3d3d3] transition-colors"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wide">
                Company
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-[#d3d3d3]/60 hover:text-[#d3d3d3] transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#d3d3d3]/60 hover:text-[#d3d3d3] transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#d3d3d3]/60 hover:text-[#d3d3d3] transition-colors"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wide">
                Legal
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-[#d3d3d3]/60 hover:text-[#d3d3d3] transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#d3d3d3]/60 hover:text-[#d3d3d3] transition-colors"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#d3d3d3]/60 hover:text-[#d3d3d3] transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* About ProductFeed */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-sm uppercase tracking-wide">
                ProductFeed
              </h4>
              <p className="text-[#d3d3d3]/60 text-sm leading-relaxed">
                Connect with mentors and learners worldwide. Share knowledge, grow together.
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[#1f1f1f] pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
            <p className="text-[#d3d3d3]/60">
              © 2026 ProductFeed. All rights reserved.
            </p>
            <div className="flex gap-6 text-[#d3d3d3]/60">
              <a href="#" className="hover:text-[#d3d3d3] transition-colors">
                Twitter
              </a>
              <a href="#" className="hover:text-[#d3d3d3] transition-colors">
                LinkedIn
              </a>
              <a href="#" className="hover:text-[#d3d3d3] transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
