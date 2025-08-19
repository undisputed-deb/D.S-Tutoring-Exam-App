import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, User, Lock, Calendar, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface StudentLoginProps {
  onLogin: (studentId: string) => void;
}

// Student Authentication Database
const STUDENT_DATABASE = {
  'ST001': {
    password: 'math123',
    name: 'Alice Johnson',
    subject: 'Mathematics',
    active: true
  },
  'ST002': {
    password: 'sci456',
    name: 'Bob Smith',
    subject: 'Science',
    active: true
  },
  'ST003': {
    password: 'eng789',
    name: 'Carol Davis',
    subject: 'English',
    active: true
  },
  'ST004': {
    password: 'hist321',
    name: 'David Wilson',
    subject: 'History',
    active: true
  },
  'ST005': {
    password: 'chem654',
    name: 'Emma Brown',
    subject: 'Chemistry',
    active: true
  },
  'AZMISH1011': {
    password: 'azmish123',
    name: 'Azmi',
    subject: 'SHSAT',
    active: true
  }
};

const StudentLogin: React.FC<StudentLoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    password: '',
    studySchedule: ''
  });
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const authenticateStudent = (studentId: string, password: string): boolean => {
    const student = STUDENT_DATABASE[studentId as keyof typeof STUDENT_DATABASE];
    
    if (!student) {
      return false;
    }
    
    if (!student.active) {
      toast({
        title: "Account Disabled",
        description: "Your account has been disabled. Please contact your teacher.",
        variant: "destructive"
      });
      return false;
    }
    
    return student.password === password;
  };

  const handleLogin = async () => {
    if (!formData.studentId || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter your Student ID and password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Authenticate student
    const isValidCredentials = authenticateStudent(formData.studentId, formData.password);
    
    if (!isValidCredentials) {
      setIsLoading(false);
      toast({
        title: "Invalid Credentials",
        description: "Incorrect Student ID or password. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Get student info from database
    const studentInfo = STUDENT_DATABASE[formData.studentId as keyof typeof STUDENT_DATABASE];

    // Check if student has an assigned quiz
    const studentQuizzes = JSON.parse(localStorage.getItem('studentQuizzes') || '{}');
    if (!studentQuizzes[formData.studentId]) {
      setIsLoading(false);
      toast({
        title: "No Quiz Assigned",
        description: `Welcome ${studentInfo.name}! No quiz has been assigned to your ID yet. Please check with your teacher.`,
        variant: "destructive"
      });
      return;
    }

    // Save study schedule if it's the first time
    if (isFirstTime && formData.studySchedule) {
      const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
      studentData[formData.studentId] = {
        name: studentInfo.name,
        subject: studentInfo.subject,
        studySchedule: formData.studySchedule,
        loginCount: (studentData[formData.studentId]?.loginCount || 0) + 1,
        lastLogin: new Date().toISOString(),
        firstLoginCompleted: true
      };
      localStorage.setItem('studentData', JSON.stringify(studentData));
    } else {
      // Update login info even if not first time
      const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
      studentData[formData.studentId] = {
        ...studentData[formData.studentId],
        name: studentInfo.name,
        subject: studentInfo.subject,
        loginCount: (studentData[formData.studentId]?.loginCount || 0) + 1,
        lastLogin: new Date().toISOString()
      };
      localStorage.setItem('studentData', JSON.stringify(studentData));
    }

    setIsLoading(false);
    
    toast({
      title: "Login Successful",
      description: `Welcome ${studentInfo.name}! Your ${studentInfo.subject} quiz is ready.`,
    });

    onLogin(formData.studentId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Student Portal</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your credentials to access your assigned quiz
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Student ID
            </Label>
            <Input
              id="studentId"
              placeholder="Enter your unique student ID (e.g., ST001)"
              value={formData.studentId}
              onChange={(e) => setFormData({...formData, studentId: e.target.value.toUpperCase()})}
              onKeyPress={handleKeyPress}
              className="border-gray-300 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                onKeyPress={handleKeyPress}
                className="border-gray-300 focus:border-blue-500 pr-10"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {isFirstTime && (
            <div className="space-y-2">
              <Label htmlFor="studySchedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Study Schedule (First time only)
              </Label>
              <Textarea
                id="studySchedule"
                placeholder="Describe your preferred study schedule..."
                value={formData.studySchedule}
                onChange={(e) => setFormData({...formData, studySchedule: e.target.value})}
                className="border-gray-300 focus:border-blue-500 min-h-[80px]"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="firstTime"
              checked={isFirstTime}
              onChange={(e) => setIsFirstTime(e.target.checked)}
              className="rounded border-gray-300"
              disabled={isLoading}
            />
            <Label htmlFor="firstTime" className="text-sm text-gray-600">
              This is my first time logging in
            </Label>
          </div>

          <Button 
            onClick={handleLogin} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </div>
            ) : (
              'Access Quiz'
            )}
          </Button>

          {/* Test Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">🧪 Test Credentials</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Student ID:</strong> ST001 | <strong>Password:</strong> math123</p>
              <p><strong>Student ID:</strong> ST002 | <strong>Password:</strong> sci456</p>
              <p><strong>Student ID:</strong> ST003 | <strong>Password:</strong> eng789</p>
              <p className="text-blue-600 italic">+2 more accounts available for testing</p>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 pt-4">
            <p>Need help? Contact your teacher for assistance.</p>
            <p className="text-xs text-gray-400 mt-1">
              Secure authentication • Session protected
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentLogin;