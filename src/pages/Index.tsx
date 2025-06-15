
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, User, Users, Shield, Brain, PenTool, Clock, BarChart3, FileText, CheckCircle, Award, Mail, Phone, MapPin, Star, Zap, Target, Trophy, Lightbulb, Globe } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import TeacherLogin from './TeacherLogin';
import StudentLogin from './StudentLogin';
import StudentQuiz from './StudentQuiz';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

type UserRole = 'none' | 'teacher-login' | 'admin' | 'student';
type StudentState = 'login' | 'quiz';

const AppContent = () => {
  const [userRole, setUserRole] = useState<UserRole>('none');
  const [studentState, setStudentState] = useState<StudentState>('login');
  const [currentStudentId, setCurrentStudentId] = useState<string>('');
  const [scrollY, setScrollY] = useState(0);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTeacherLogin = () => {
    setUserRole('admin');
  };

  const handleStudentLogin = (studentId: string) => {
    setCurrentStudentId(studentId);
    setStudentState('quiz');
  };

  const handleStudentLogout = () => {
    setCurrentStudentId('');
    setStudentState('login');
    setUserRole('none');
  };

  const handleLogout = () => {
    logout();
    setUserRole('none');
  };

  if (userRole === 'teacher-login') {
    return <TeacherLogin onLogin={handleTeacherLogin} />;
  }

  if (userRole === 'admin' && isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (userRole === 'student') {
    if (studentState === 'login') {
      return <StudentLogin onLogin={handleStudentLogin} />;
    } else {
      return <StudentQuiz studentId={currentStudentId} onLogout={handleStudentLogout} />;
    }
  }

  // Dynamic background based on scroll position
  const getBackgroundStyle = () => {
    const progress = Math.min(scrollY / 2000, 1);
    const hue1 = 220 + progress * 40; // Blue to purple
    const hue2 = 260 + progress * 60; // Purple to pink
    const hue3 = 180 + progress * 80; // Cyan to orange
    
    return {
      background: `linear-gradient(135deg, 
        hsl(${hue1}, 70%, 95%) 0%, 
        hsl(${hue2}, 60%, 92%) 50%, 
        hsl(${hue3}, 50%, 96%) 100%)`,
      transition: 'background 0.3s ease-out'
    };
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={getBackgroundStyle()}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-10 bg-gradient-to-r from-blue-400 to-purple-600"
          style={{
            top: '10%',
            left: '10%',
            transform: `translate(${scrollY * 0.1}px, ${scrollY * 0.05}px) rotate(${scrollY * 0.1}deg)`,
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full opacity-10 bg-gradient-to-r from-green-400 to-cyan-600"
          style={{
            top: '60%',
            right: '10%',
            transform: `translate(${-scrollY * 0.08}px, ${scrollY * 0.06}px) rotate(${-scrollY * 0.1}deg)`,
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
        <div 
          className="absolute w-48 h-48 rounded-full opacity-10 bg-gradient-to-r from-orange-400 to-pink-600"
          style={{
            bottom: '20%',
            left: '20%',
            transform: `translate(${scrollY * 0.12}px, ${-scrollY * 0.04}px) rotate(${scrollY * 0.15}deg)`,
            animation: 'float 10s ease-in-out infinite'
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="flex items-center justify-center p-4 pt-12 relative z-10">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-16 animate-fade-in">
            <div 
              className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-8 shadow-2xl transform transition-all duration-500 hover:scale-110 hover:rotate-12"
              style={{
                transform: `translateY(${scrollY * 0.1}px) scale(${1 + scrollY * 0.0001})`,
                animation: 'pulse 3s ease-in-out infinite, rotate 20s linear infinite'
              }}
            >
              <Brain className="h-12 w-12 text-white drop-shadow-lg" />
            </div>
            <h1 
              className="text-5xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-3 transform transition-all duration-700"
              style={{
                transform: `translateY(${scrollY * 0.05}px)`,
                textShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            >
              D.S Tutoring Center
              <PenTool className="h-10 w-10 text-blue-600 animate-bounce" />
            </h1>
            <p 
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed transform transition-all duration-700"
              style={{ transform: `translateY(${scrollY * 0.03}px)` }}
            >
              Revolutionizing education with our comprehensive exam management platform. Create, manage, and track assessments with advanced analytics and security features.
            </p>
          </div>

          {/* Main Action Cards with Enhanced Animations */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            <Card 
              className="cursor-pointer transition-all duration-500 transform hover:-translate-y-4 hover:shadow-2xl hover:scale-105 border-0 bg-white/90 backdrop-blur-sm group relative overflow-hidden"
              onClick={() => setUserRole('teacher-login')}
              style={{
                animationDelay: '0.2s',
                transform: `translateY(${Math.sin(scrollY * 0.001) * 10}px)`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <CardHeader className="text-center pb-4 relative z-10">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 relative shadow-lg transform group-hover:rotate-12 transition-all duration-300">
                  <Users className="h-10 w-10 text-white transition-transform duration-300 group-hover:scale-110" />
                  <Shield className="h-5 w-5 text-green-400 absolute -top-1 -right-1 animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 group-hover:opacity-100" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">Tutor Dashboard</CardTitle>
                <CardDescription className="text-gray-600 text-lg group-hover:text-gray-700 transition-colors duration-300">
                  Advanced assessment creation and management portal
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-3 text-sm text-gray-600 mb-8">
                  <li className="flex items-center gap-3 transform transition-all duration-300 hover:translate-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 animate-pulse" />
                    Secure authentication system
                  </li>
                  <li className="flex items-center gap-3 transform transition-all duration-300 hover:translate-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    Interactive quiz builder
                  </li>
                  <li className="flex items-center gap-3 transform transition-all duration-300 hover:translate-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                    Real-time progress tracking
                  </li>
                  <li className="flex items-center gap-3 transform transition-all duration-300 hover:translate-x-2">
                    <CheckCircle className="w-5 w-5 text-green-500 animate-pulse" style={{ animationDelay: '0.6s' }} />
                    Advanced analytics dashboard
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-lg py-3 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  <Zap className="w-5 h-5 mr-2" />
                  Access Tutor Portal
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all duration-500 transform hover:-translate-y-4 hover:shadow-2xl hover:scale-105 border-0 bg-white/90 backdrop-blur-sm group relative overflow-hidden"
              onClick={() => setUserRole('student')}
              style={{
                animationDelay: '0.4s',
                transform: `translateY(${Math.cos(scrollY * 0.001) * 10}px)`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-600/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right" />
              <CardHeader className="text-center pb-4 relative z-10">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg transform group-hover:rotate-12 transition-all duration-300">
                  <User className="h-10 w-10 text-white transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 group-hover:opacity-100" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">Student Portal</CardTitle>
                <CardDescription className="text-gray-600 text-lg group-hover:text-gray-700 transition-colors duration-300">
                  Interactive learning and assessment platform
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-3 text-sm text-gray-600 mb-8">
                  <li className="flex items-center gap-3 transform transition-all duration-300 hover:translate-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 animate-pulse" />
                    Personalized login system
                  </li>
                  <li className="flex items-center gap-3 transform transition-all duration-300 hover:translate-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    Interactive exam interface
                  </li>
                  <li className="flex items-center gap-3 transform transition-all duration-300 hover:translate-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                    Instant results & feedback
                  </li>
                  <li className="flex items-center gap-3 transform transition-all duration-300 hover:translate-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 animate-pulse" style={{ animationDelay: '0.6s' }} />
                    Performance analytics
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-lg py-3 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  <Target className="w-5 h-5 mr-2" />
                  Enter as Student
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Section with Staggered Animations */}
          <div className="mb-16">
            <h2 
              className="text-4xl font-bold text-center text-gray-900 mb-12 transform transition-all duration-700"
              style={{
                transform: `translateY(${scrollY * 0.02}px)`,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Why Choose D.S Tutoring Center?
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { icon: Clock, title: "Real-Time Assessment", desc: "Instant feedback and scoring with comprehensive time management features", color: "from-purple-500 to-pink-500", delay: "0s" },
                { icon: BarChart3, title: "Advanced Analytics", desc: "Detailed performance metrics and progress tracking for better learning outcomes", color: "from-orange-500 to-red-500", delay: "0.1s" },
                { icon: FileText, title: "Flexible Content", desc: "Support for multiple question types and customizable exam formats", color: "from-teal-500 to-cyan-500", delay: "0.2s" },
                { icon: Shield, title: "Secure Platform", desc: "Bank-level security with encrypted data and secure authentication", color: "from-indigo-500 to-purple-500", delay: "0.3s" },
                { icon: Award, title: "Certified Results", desc: "Official certificates and detailed performance reports for students", color: "from-green-500 to-lime-500", delay: "0.4s" },
                { icon: BookOpen, title: "Learning Resources", desc: "Comprehensive study materials and practice tests for exam preparation", color: "from-rose-500 to-pink-500", delay: "0.5s" },
                { icon: Star, title: "Premium Support", desc: "24/7 technical support and dedicated customer service", color: "from-yellow-500 to-orange-500", delay: "0.6s" },
                { icon: Globe, title: "Multi-Language", desc: "Support for multiple languages and international standards", color: "from-blue-500 to-indigo-500", delay: "0.7s" },
                { icon: Lightbulb, title: "Smart AI", desc: "AI-powered question generation and adaptive learning paths", color: "from-violet-500 to-purple-500", delay: "0.8s" }
              ].map((feature, index) => (
                <Card 
                  key={index}
                  className="text-center p-6 bg-white/80 backdrop-blur-sm transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-xl group cursor-pointer"
                  style={{
                    animationDelay: feature.delay,
                    transform: `translateY(${Math.sin((scrollY + index * 100) * 0.002) * 5}px)`,
                  }}
                >
                  <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center mb-4 transform group-hover:rotate-12 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                    <feature.icon className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 group-hover:opacity-100" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-700 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Enhanced Contact Section */}
          <div 
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl mx-auto mb-8 transform transition-all duration-700 hover:shadow-2xl"
            style={{
              transform: `translateY(${scrollY * 0.01}px)`,
              boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5)`
            }}
          >
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
              Get In Touch With Us
            </h2>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-semibold animate-pulse">
                <Trophy className="w-5 h-5" />
                Ready to Transform Your Learning Experience?
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { icon: Mail, title: "Email", value: "debashrestha222@gmail.com", href: "mailto:debashrestha222@gmail.com", color: "from-blue-500 to-indigo-600", hoverColor: "hover:text-blue-800" },
                { icon: Phone, title: "Phone", value: "+91 9173126589", href: "tel:+919173126589", color: "from-green-500 to-emerald-600", hoverColor: "hover:text-green-800" },
                { icon: User, title: "Director", value: "Debashrestha Nandi", href: "#", color: "from-purple-500 to-pink-600", hoverColor: "hover:text-purple-800" }
              ].map((contact, index) => (
                <div key={index} className="flex flex-col items-center group">
                  <div className={`w-16 h-16 bg-gradient-to-br ${contact.color} rounded-full flex items-center justify-center mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                    <contact.icon className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 group-hover:opacity-100" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-700 transition-colors duration-300">{contact.title}</h3>
                  {contact.href.startsWith('#') ? (
                    <p className="text-gray-700 font-medium group-hover:text-purple-700 transition-colors duration-300">{contact.value}</p>
                  ) : (
                    <a 
                      href={contact.href} 
                      className={`${contact.hoverColor.replace('hover:', '')} transition-all duration-300 transform hover:scale-105 font-medium underline decoration-2 underline-offset-4`}
                    >
                      {contact.value}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Footer */}
          <div 
            className="text-center text-gray-500 pb-8 transform transition-all duration-700"
            style={{ transform: `translateY(${scrollY * 0.005}px)` }}
          >
            <p className="text-sm flex items-center justify-center gap-2 mb-2">
              <Shield className="h-4 w-4 animate-pulse" />
              Powered by advanced educational technology and secure assessment tools
            </p>
            <p className="text-xs">© 2024 D.S Tutoring Center. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
