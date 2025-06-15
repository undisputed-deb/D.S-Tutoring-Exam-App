import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, User, Lock, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { validateCredentials, sanitizeInput } from '../utils/security';
import { useAuth } from '../contexts/AuthContext';

interface TeacherLoginProps {
  onLogin: () => void;
}

const TeacherLogin: React.FC<TeacherLoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    teacherId: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async () => {
    // Input validation
    if (!formData.teacherId || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter your Teacher ID and password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Sanitize inputs
      const sanitizedTeacherId = sanitizeInput(formData.teacherId);
      const sanitizedPassword = sanitizeInput(formData.password);

      // Validate credentials securely
      const isValid = await validateCredentials(sanitizedTeacherId, sanitizedPassword);

      if (isValid) {
        login('teacher', sanitizedTeacherId);
        toast({
          title: "Login Successful",
          description: "Welcome to the Teacher Portal!",
        });
        onLogin();
      } else {
        toast({
          title: "Authentication Failed",
          description: "Invalid credentials. Access denied.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An error occurred during authentication. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: 'teacherId' | 'password', value: string) => {
    // Basic input sanitization on change
    const sanitizedValue = sanitizeInput(value);
    setFormData({...formData, [field]: sanitizedValue});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Shield className="h-5 w-5" />
            Secure Teacher Portal
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teacherId" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Teacher ID
            </Label>
            <Input
              id="teacherId"
              placeholder="Enter your teacher ID"
              value={formData.teacherId}
              onChange={(e) => handleInputChange('teacherId', e.target.value)}
              className="border-gray-300 focus:border-blue-500"
              disabled={isLoading}
              maxLength={20}
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
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="border-gray-300 focus:border-blue-500"
              disabled={isLoading}
              maxLength={50}
            />
          </div>

          <Button 
            onClick={handleLogin} 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Secure Login"}
          </Button>

          <div className="text-center text-xs text-gray-500 pt-4">
            <p className="flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" />
              Secure authentication enabled
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherLogin;
