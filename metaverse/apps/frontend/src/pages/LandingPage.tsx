import  { useState } from 'react';
import metaspace from "../assets/metaspace.mp4"
import { Menu, X, ArrowRight, Users, Video, Gamepad, Zap, Globe, MessageSquare, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate()

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
              <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#about" className="text-sm text-gray-300 hover:text-white transition-colors">About</a>
              <a href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</a>
              <button className="bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full hover:bg-white/20 transition"
                onClick={()=>{
                    navigate("/signin")
                }}
                >
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
            <a href="#features" className="text-lg">Features</a>
            <a href="#about" className="text-lg">About</a>
            <a href="#pricing" className="text-lg">Pricing</a>
            <button onClick={()=>{
                    navigate("/signin")
                }} className="w-full bg-white/10 text-white px-6 py-3 rounded-full">
              Sign In
            </button>
            <button className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-6 py-3 rounded-full">
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 h-screen">
  <div className="absolute inset-0 ">
    <video
      className="w-full h-full object-cover"
      autoPlay
      loop
      muted
      playsInline
    >
      <source src={metaspace} type="video/mp4" />
      {/* Add other video formats for compatibility */}
    </video>
  </div>
  <div className="relative z-10 max-w-7xl mx-auto bg-black/70 backdrop-blur-sm p-10 r rounded-xl mt-10 ">
    <div className="text-center">
      <div className="inline-block animate-float">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm mb-4">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Now in public beta
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
      <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-violet-300 to-fuchsia-400  bg-clip-text text-transparent">
        The Future of
        <br />
        Virtual Spaces
      </h1>
      <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
        Create immersive digital environments where teams connect, collaborate, and innovate together in real-time.
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
        {[{ value: "10K+", label: "Active Users" }, { value: "200+", label: "Companies" }, { value: "99.9%", label: "Uptime" }, { value: "4.9/5", label: "Rating" }].map((stat, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition">
            <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>


      {/* Features Grid */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Features for the Future</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to create engaging virtual experiences.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-6 w-6" />,
                title: "Spatial Audio",
                description: "Natural conversations with proximity-based audio."
              },
              {
                icon: <Video className="h-6 w-6" />,
                title: "HD Video",
                description: "Crystal clear video calls with smart bandwidth adaptation."
              },
              {
                icon: <Gamepad className="h-6 w-6" />,
                title: "Interactive Objects",
                description: "Add games, whiteboards, and collaborative tools."
              },
              {
                icon: <Zap className="h-6 w-6" />,
                title: "Instant Meetings",
                description: "No scheduling needed - just walk up and talk."
              },
              {
                icon: <Globe className="h-6 w-6" />,
                title: "Custom Worlds",
                description: "Design your perfect virtual environment."
              },
              {
                icon: <MessageSquare className="h-6 w-6" />,
                title: "Rich Chat",
                description: "Text, emojis, GIFs, and file sharing."
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-white/5 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/10 transition duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300" />
                <div className="relative">
                  <div className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Ready to Transform Your Workspace?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using MetaSpace to create engaging remote experiences.
          </p>
          <button className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:opacity-90 transition">
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                title: "Product",
                links: ["Features", "Security", "Pricing", "Roadmap"]
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"]
              },
              {
                title: "Resources",
                links: ["Documentation", "Help Center", "Community", "API"]
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms", "License"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-400 hover:text-white transition">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 MetaSpace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;