import { useState } from "react";
import {
  Menu,
  X,
  ArrowRight,
  Users,
  Video,
  Gamepad,
  Zap,
  Globe,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-cyan-500/20 opacity-50" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/30 via-black/50 to-black pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-lg" />
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                MetaSpace
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#about"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                About
              </a>
              <a
                href="#pricing"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </a>
              <button className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full hover:bg-white/20 transition">
                Sign In
              </button>
              <button className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-6 py-2 rounded-full hover:opacity-90 transition">
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-20">
          <div className="flex flex-col items-center gap-8 p-8">
            <a href="#features" className="text-lg">
              Features
            </a>
            <a href="#about" className="text-lg">
              About
            </a>
            <a href="#pricing" className="text-lg">
              Pricing
            </a>
            <button className="w-full bg-white/10 text-white px-6 py-3 rounded-full">
              Sign In
            </button>
            <button className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-6 py-3 rounded-full">
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <video
          className="absolute inset-0 w-full h-full object-cover -z-10"
          autoPlay
          muted
          loop
          src="/your-video.mp4"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-block animate-float">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Now in public beta
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
            The Future of
            <br />
            Virtual Spaces
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Create immersive digital environments where teams connect,
            collaborate, and innovate together in real-time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button className="group bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:opacity-90 transition flex items-center justify-center">
              Start for Free
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/20 transition flex items-center justify-center">
              Schedule Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "200+", label: "Companies" },
              { value: "99.9%", label: "Uptime" },
              { value: "4.9/5", label: "Rating" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
