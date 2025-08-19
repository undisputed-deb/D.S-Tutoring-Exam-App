import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Clock, FileText, User, BookOpen, Save, LogOut, CheckCircle, HelpCircle, Plus, Minus, Image, X, Upload } from 'lucide-react';
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
  explanations?: {[key: string]: string}; // New field for explanations
  explanationImages?: {[key: string]: string[]}; // New field for explanation images (base64)
}

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [quizContent, setQuizContent] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState<{[key: string]: string}>({});
  const [explanations, setExplanations] = useState<{[key: string]: string}>({});
  const [explanationImages, setExplanationImages] = useState<{[key: string]: string[]}>({});
  const [selectedPDF, setSelectedPDF] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    timer: 30
  });
  const [activeTab, setActiveTab] = useState('text-quiz');
  const [activeMainTab, setActiveMainTab] = useState('create-quiz');
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});
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

    // Sanitize explanations
    const sanitizedExplanations: {[key: string]: string} = {};
    Object.entries(explanations).forEach(([key, value]) => {
      sanitizedExplanations[key] = sanitizeHTML(value);
    });

    const quizData: QuizData = {
      studentId: sanitizedStudentId,
      subject: sanitizedSubject,
      timer: formData.timer,
      content: sanitizedContent,
      type: activeTab === 'text-quiz' ? 'text' : 'pdf',
      pdfFile: activeTab === 'pdf-quiz' ? selectedPDF : undefined,
      createdAt: new Date().toISOString(),
      correctAnswers: Object.keys(correctAnswers).length > 0 ? correctAnswers : undefined,
      explanations: Object.keys(sanitizedExplanations).length > 0 ? sanitizedExplanations : undefined,
      explanationImages: Object.keys(explanationImages).length > 0 ? explanationImages : undefined
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
      explanations: sanitizedExplanations,
      explanationImages: explanationImages,
      createdAt: new Date().toISOString(),
      teacherEmail: 'debashrestha222@gmail.com'
    };
    quizHistory.push(historyEntry);
    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));

    toast({
      title: "Quiz Saved Successfully",
      description: `${activeTab === 'text-quiz' ? 'Text quiz' : 'PDF exam'} with detailed explanations assigned to student ${sanitizedStudentId}`,
    });

    // Reset form
    setFormData({ studentId: '', subject: '', timer: 30 });
    setQuizContent('');
    setCorrectAnswers({});
    setExplanations({});
    setExplanationImages({});
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

  const handleExplanationChange = (questionId: string, explanation: string) => {
    setExplanations(prev => ({
      ...prev,
      [questionId]: explanation
    }));
  };

  // Handle image paste functionality
  const handleImagePaste = (questionId: string, event: React.ClipboardEvent) => {
    const items = Array.from(event.clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    
    if (imageItem) {
      event.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64String = e.target?.result as string;
          setExplanationImages(prev => ({
            ...prev,
            [questionId]: [...(prev[questionId] || []), base64String]
          }));
          toast({
            title: "Image Added!",
            description: "Screenshot pasted successfully to explanation",
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle file upload for images
  const handleImageUpload = (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setExplanationImages(prev => ({
          ...prev,
          [questionId]: [...(prev[questionId] || []), base64String]
        }));
        toast({
          title: "Image Uploaded!",
          description: "Image added to explanation successfully",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image from explanation
  const removeExplanationImage = (questionId: string, imageIndex: number) => {
    setExplanationImages(prev => ({
      ...prev,
      [questionId]: prev[questionId]?.filter((_, index) => index !== imageIndex) || []
    }));
  };

  const addQuestionFields = () => {
    const questionCount = Math.max(
      Object.keys(correctAnswers).length,
      Object.keys(explanations).length
    ) + 1;
    const questionId = `q${questionCount}`;
    
    setCorrectAnswers(prev => ({
      ...prev,
      [questionId]: ''
    }));
    
    setExplanations(prev => ({
      ...prev,
      [questionId]: ''
    }));
    
    setExplanationImages(prev => ({
      ...prev,
      [questionId]: []
    }));
  };

  const removeQuestionFields = (questionId: string) => {
    setCorrectAnswers(prev => {
      const newAnswers = {...prev};
      delete newAnswers[questionId];
      return newAnswers;
    });
    
    setExplanations(prev => {
      const newExplanations = {...prev};
      delete newExplanations[questionId];
      return newExplanations;
    });
    
    setExplanationImages(prev => {
      const newImages = {...prev};
      delete newImages[questionId];
      return newImages;
    });
  };

  // Get all question IDs (union of answers, explanations, and images)
  const allQuestionIds = Array.from(new Set([
    ...Object.keys(correctAnswers),
    ...Object.keys(explanations),
    ...Object.keys(explanationImages)
  ])).sort((a, b) => {
    const numA = parseInt(a.replace('q', ''));
    const numB = parseInt(b.replace('q', ''));
    return numA - numB;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div className="text-center flex-1">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
            <p className="text-gray-600">Create quizzes with detailed explanations for each question</p>
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
                      Assign quiz with detailed explanations to a specific student
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

                    {/* Answer Keys & Explanations Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Answer Keys & Detailed Explanations
                        </CardTitle>
                        <CardDescription>
                          Provide correct answers and detailed explanations for each question. Students will see these after submitting their quiz.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
                          <div className="space-y-6">
                            {allQuestionIds.map((questionId) => (
                              <div key={questionId} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                  <Label className="text-lg font-semibold text-gray-700">
                                    Question {questionId.replace('q', '')}
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeQuestionFields(questionId)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Minus className="h-4 w-4" />
                                    Remove
                                  </Button>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm font-medium">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      Correct Answer
                                    </Label>
                                    <Input
                                      placeholder="Enter the correct answer"
                                      value={correctAnswers[questionId] || ''}
                                      onChange={(e) => handleCorrectAnswerChange(questionId, e.target.value)}
                                      className="border-green-200 focus:border-green-500"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm font-medium">
                                      <HelpCircle className="h-4 w-4 text-blue-600" />
                                      Detailed Explanation
                                    </Label>
                                    <Textarea
                                      placeholder="Explain why this is the correct answer, show working steps, provide additional context... 

📸 Tip: Press Ctrl+V to paste screenshots directly!"
                                      value={explanations[questionId] || ''}
                                      onChange={(e) => handleExplanationChange(questionId, e.target.value)}
                                      onPaste={(e) => handleImagePaste(questionId, e)}
                                      className="min-h-[100px] border-blue-200 focus:border-blue-500 resize-none"
                                      rows={4}
                                    />
                                    
                                    {/* Image upload section */}
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleImageUpload(questionId, e)}
                                          ref={(el) => fileInputRefs.current[questionId] = el}
                                          className="hidden"
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => fileInputRefs.current[questionId]?.click()}
                                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                        >
                                          <Upload className="h-4 w-4 mr-2" />
                                          Upload Image
                                        </Button>
                                        <span className="text-xs text-gray-500">or paste with Ctrl+V</span>
                                      </div>
                                      
                                      {/* Display uploaded images */}
                                      {explanationImages[questionId] && explanationImages[questionId].length > 0 && (
                                        <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                          {explanationImages[questionId].map((image, index) => (
                                            <div key={index} className="relative group">
                                              <img
                                                src={image}
                                                alt={`Explanation image ${index + 1}`}
                                                className="w-full h-24 object-cover rounded border"
                                              />
                                              <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeExplanationImage(questionId, index)}
                                                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                              >
                                                <X className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addQuestionFields}
                              className="w-full border-dashed border-2 h-12 text-gray-600 hover:text-gray-800"
                            >
                              <Plus className="h-5 w-5 mr-2" />
                              Add Question Answer & Explanation
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <div className="flex items-start gap-3">
                            <HelpCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-yellow-800 mb-2">💡 Tips for Great Explanations:</h4>
                              <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• Show step-by-step working for math problems</li>
                                <li>• Explain the reasoning behind the correct answer</li>
                                <li>• Point out common mistakes students might make</li>
                                <li>• Include relevant formulas or concepts</li>
                                <li>• Use examples to clarify difficult concepts</li>
                                <li>• 📸 <strong>Paste screenshots with Ctrl+V</strong> for diagrams and visual explanations</li>
                                <li>• Upload images for step-by-step solutions or drawings</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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