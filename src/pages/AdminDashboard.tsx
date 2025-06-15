import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Clock, FileText, User, BookOpen, Save, LogOut, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import QuizEditor from '../components/QuizEditor';
import QuizPreview from '../components/QuizPreview';
import PDFUpload from '../components/PDFUpload';
import { sanitizeInput, sanitizeHTML } from '../utils/security';
import QuizResults from '../components/QuizResults';
import StudentAnalytics from '../components/StudentAnalytics';
import QuizHistory from '../components/QuizHistory';

interface QuizData {
  studentId: string;
  subject: string;
  timer: number;
  content: string;
  type: 'text' | 'pdf';
  pdfFile?: File;
  createdAt: string;
  correctAnswers?: {[key: string]: string};
}

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [quizContent, setQuizContent] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState<{[key: string]: string}>({});
  const [selectedPDF, setSelectedPDF] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    timer: 30
  });
  const [activeTab, setActiveTab] = useState('text-quiz');
  const [activeMainTab, setActiveMainTab] = useState('create-quiz');
  const { toast } = useToast();

  const handleSaveQuiz = () => {
    // Sanitize inputs
    const sanitizedStudentId = sanitizeInput(formData.studentId);
    const sanitizedSubject = sanitizeInput(formData.subject);
    const sanitizedContent = sanitizeHTML(quizContent);

    if (!sanitizedStudentId || !sanitizedSubject) {
      toast({
        title: "Missing Information",
        description: "Please fill in Student ID and Subject fields",
        variant: "destructive"
      });
      return;
    }

    if (activeTab === 'text-quiz' && !sanitizedContent.trim()) {
      toast({
        title: "Empty Quiz",
        description: "Please enter quiz content or switch to PDF upload",
        variant: "destructive"
      });
      return;
    }

    if (activeTab === 'pdf-quiz' && !selectedPDF) {
      toast({
        title: "No PDF Selected",
        description: "Please select a PDF file for the exam",
        variant: "destructive"
      });
      return;
    }

    const quizData: QuizData = {
      studentId: sanitizedStudentId,
      subject: sanitizedSubject,
      timer: formData.timer,
      content: sanitizedContent,
      type: activeTab === 'text-quiz' ? 'text' : 'pdf',
      pdfFile: activeTab === 'pdf-quiz' ? selectedPDF : undefined,
      createdAt: new Date().toISOString(),
      correctAnswers: Object.keys(correctAnswers).length > 0 ? correctAnswers : undefined
    };

    // Save to localStorage (simulating backend storage)
    const existingQuizzes = JSON.parse(localStorage.getItem('studentQuizzes') || '{}');
    existingQuizzes[sanitizedStudentId] = quizData;
    localStorage.setItem('studentQuizzes', JSON.stringify(existingQuizzes));

    // Save quiz history for teacher tracking
    const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    const historyEntry = {
      id: Date.now().toString(),
      studentId: sanitizedStudentId,
      subject: sanitizedSubject,
      content: sanitizedContent,
      correctAnswers: correctAnswers,
      createdAt: new Date().toISOString(),
      teacherEmail: 'debashrestha222@gmail.com'
    };
    quizHistory.push(historyEntry);
    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));

    toast({
      title: "Quiz Saved Successfully",
      description: `${activeTab === 'text-quiz' ? 'Text quiz' : 'PDF exam'} assigned to student ${sanitizedStudentId}`,
    });

    // Reset form
    setFormData({ studentId: '', subject: '', timer: 30 });
    setQuizContent('');
    setCorrectAnswers({});
    setSelectedPDF(null);
  };

  const handleInputChange = (field: 'studentId' | 'subject', value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData({...formData, [field]: sanitizedValue});
  };

  const handleCorrectAnswerChange = (questionId: string, answer: string) => {
    setCorrectAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const addCorrectAnswerField = () => {
    const questionCount = Object.keys(correctAnswers).length + 1;
    const questionId = `q${questionCount}`;
    setCorrectAnswers(prev => ({
      ...prev,
      [questionId]: ''
    }));
  };

  const removeCorrectAnswerField = (questionId: string) => {
    setCorrectAnswers(prev => {
      const newAnswers = {...prev};
      delete newAnswers[questionId];
      return newAnswers;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div className="text-center flex-1">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
            <p className="text-gray-600">Create and assign quizzes and PDF exams to students</p>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create-quiz">Create Quiz</TabsTrigger>
            <TabsTrigger value="quiz-history">Quiz History</TabsTrigger>
            <TabsTrigger value="results">View Results</TabsTrigger>
            <TabsTrigger value="analytics">Student Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create-quiz">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Quiz Creation Form */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Quiz Assignment
                    </CardTitle>
                    <CardDescription>
                      Assign quiz or PDF exam to a specific student
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
                        placeholder="Enter student unique ID"
                        value={formData.studentId}
                        onChange={(e) => handleInputChange('studentId', e.target.value)}
                        maxLength={20}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Mathematics, Science"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        maxLength={50}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timer" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Timer (minutes)
                      </Label>
                      <Select value={formData.timer.toString()} onValueChange={(value) => setFormData({...formData, timer: parseInt(value)})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Correct Answers Section */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Correct Answers
                      </Label>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="space-y-3">
                          {Object.entries(correctAnswers).map(([questionId, answer]) => (
                            <div key={questionId} className="flex gap-2 items-center">
                              <Label className="text-sm font-medium min-w-[60px]">
                                Q{questionId.replace('q', '')}:
                              </Label>
                              <Input
                                placeholder="Enter correct answer"
                                value={answer}
                                onChange={(e) => handleCorrectAnswerChange(questionId, e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeCorrectAnswerField(questionId)}
                                className="px-2"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addCorrectAnswerField}
                            className="w-full"
                          >
                            + Add Question Answer
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleSaveQuiz} className="w-full" size="lg">
                      <Save className="h-4 w-4 mr-2" />
                      Save & Assign Quiz
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Quiz Content */}
              <div className="lg:col-span-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text-quiz" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Text Quiz
                    </TabsTrigger>
                    <TabsTrigger value="pdf-quiz" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      PDF Exam
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text-quiz" className="space-y-4">
                    <div className="grid lg:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Quiz Editor</CardTitle>
                          <CardDescription>
                            Create your quiz content with rich text formatting
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <QuizEditor content={quizContent} onChange={setQuizContent} />
                        </CardContent>
                      </Card>
                      
                      <QuizPreview content={quizContent} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pdf-quiz">
                    <PDFUpload 
                      onPDFSelect={setSelectedPDF} 
                      selectedFile={selectedPDF}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="quiz-history">
            <QuizHistory />
          </TabsContent>
          
          <TabsContent value="results">
            <QuizResults />
          </TabsContent>
          
          <TabsContent value="analytics">
            <StudentAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
