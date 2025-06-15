
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, User, Lock, Calendar } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface StudentLoginProps {
  onLogin: (studentId: string) => void;
}

const StudentLogin: React.FC<StudentLoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    password: '',
    studySchedule: ''
  });
  const [isFirstTime, setIsFirstTime] = useState(false);
  const { toast } = useToast();

  const handleLogin = () => {
    if (!formData.studentId || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter your Student ID and password",
        variant: "destructive"
      });
      return;
    }

    // Check if student has an assigned quiz
    const studentQuizzes = JSON.parse(localStorage.getItem('studentQuizzes') || '{}');
    if (!studentQuizzes[formData.studentId]) {
      toast({
        title: "No Quiz Found",
        description: "No quiz has been assigned to your ID yet. Please check with your teacher.",
        variant: "destructive"
      });
      return;
    }

    // Save study schedule if it's the first time
    if (isFirstTime && formData.studySchedule) {
      const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');
      studentData[formData.studentId] = {
        studySchedule: formData.studySchedule,
        loginCount: 1,
        lastLogin: new Date().toISOString()
      };
      localStorage.setItem('studentData', JSON.stringify(studentData));
    }

    toast({
      title: "Login Successful",
      description: "Welcome! Your quiz is ready.",
    });

    onLogin(formData.studentId);
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
              placeholder="Enter your unique student ID"
              value={formData.studentId}
              onChange={(e) => setFormData({...formData, studentId: e.target.value})}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="border-gray-300 focus:border-blue-500"
            />
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
            />
            <Label htmlFor="firstTime" className="text-sm text-gray-600">
              This is my first time logging in
            </Label>
          </div>

          <Button 
            onClick={handleLogin} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            size="lg"
          >
            Access Quiz
          </Button>

          <div className="text-center text-sm text-gray-500 pt-4">
            <p>Need help? Contact your teacher for assistance.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentLogin;
