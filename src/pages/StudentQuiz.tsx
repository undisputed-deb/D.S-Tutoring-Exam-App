import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle, AlertCircle, Mail, Trophy, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Quiz {
  id: string;
  studentId: string;
  subject: string;
  timer: number;
  content: string;
  createdAt: string;
  status: 'assigned' | 'completed';
  correctAnswers?: {[key: string]: string};
}

interface StudentQuizProps {
  studentId: string;
  onLogout: () => void;
}

interface QuizResult {
  studentId: string;
  subject: string;
  timeTaken: number;
  completedAt: string;
  autoSubmitted: boolean;
  answers: {[key: string]: string};
  comments: {[key: string]: string};
  score?: number;
  totalQuestions?: number;
  graded?: boolean;
  gradingDetails?: {[key: string]: boolean};
}

const StudentQuiz: React.FC<StudentQuizProps> = ({ studentId, onLogout }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [results, setResults] = useState<QuizResult | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [comments, setComments] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  useEffect(() => {
    loadQuiz();
  }, [studentId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [quizStarted, timeLeft, quizCompleted]);

  const loadQuiz = () => {
    const studentQuizzes = JSON.parse(localStorage.getItem('studentQuizzes') || '{}');
    const assignedQuiz = studentQuizzes[studentId];
    
    if (assignedQuiz) {
      setQuiz(assignedQuiz);
      setTimeLeft(assignedQuiz.timer * 60);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(new Date());
    toast({
      title: "Quiz Started!",
      description: `You have ${quiz?.timer} minutes to complete this quiz.`,
    });
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({...prev, [questionId]: value}));
  };

  const handleCommentChange = (questionId: string, value: string) => {
    setComments(prev => ({...prev, [questionId]: value}));
  };

  const handleSubmitQuiz = (autoSubmit = false) => {
    if (!quiz || !startTime) return;

    console.log('Submitting quiz with answers:', answers);
    console.log('Quiz correct answers:', quiz.correctAnswers);

    // Grade the quiz immediately
    const gradedResults = gradeQuiz(quiz, answers);
    
    // Save results to localStorage
    const quizResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    quizResults.push(gradedResults);
    localStorage.setItem('quizResults', JSON.stringify(quizResults));

    // Update quiz status
    const studentQuizzes = JSON.parse(localStorage.getItem('studentQuizzes') || '{}');
    if (studentQuizzes[studentId]) {
      studentQuizzes[studentId].status = 'completed';
      localStorage.setItem('studentQuizzes', JSON.stringify(studentQuizzes));
    }

    setResults(gradedResults);
    setQuizCompleted(true);
    setShowResults(true);
    
    toast({
      title: autoSubmit ? "Time's Up!" : "Quiz Submitted!",
      description: `Your quiz has been ${autoSubmit ? 'automatically ' : ''}submitted and graded!`,
    });
  };

  const normalizeAnswer = (answer: string): string => {
    return answer.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
  };

  const extractQuestionNumber = (questionId: string): string => {
    // Extract number from question ID (q1, q2, etc.) and return as string
    const match = questionId.match(/\d+/);
    return match ? match[0] : questionId;
  };

  const gradeQuiz = (quizData: Quiz, studentAnswers: {[key: string]: string}): QuizResult => {
    if (!quizData.correctAnswers || Object.keys(quizData.correctAnswers).length === 0) {
      console.log('No correct answers found for grading');
      return {
        studentId,
        subject: quizData.subject,
        timeTaken: Math.round((new Date().getTime() - (startTime?.getTime() || 0)) / 1000 / 60),
        completedAt: new Date().toISOString(),
        autoSubmitted: false,
        answers: studentAnswers,
        comments,
        score: 0,
        totalQuestions: 0,
        graded: false
      };
    }

    let score = 0;
    const totalQuestions = Object.keys(quizData.correctAnswers).length;
    const gradingDetails: {[key: string]: boolean} = {};

    Object.entries(quizData.correctAnswers).forEach(([questionId, correctAnswer]) => {
      const studentAnswer = studentAnswers[questionId] || '';
      const normalizedStudent = normalizeAnswer(studentAnswer);
      const normalizedCorrect = normalizeAnswer(correctAnswer);
      
      console.log(`Grading Q${extractQuestionNumber(questionId)}: Student="${normalizedStudent}" vs Correct="${normalizedCorrect}"`);
      
      const isCorrect = normalizedStudent === normalizedCorrect;
      if (isCorrect) {
        score++;
      }
      gradingDetails[questionId] = isCorrect;
    });

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    
    return {
      studentId,
      subject: quizData.subject,
      timeTaken: Math.round((new Date().getTime() - (startTime?.getTime() || 0)) / 1000 / 60),
      completedAt: new Date().toISOString(),
      autoSubmitted: false,
      answers: studentAnswers,
      comments,
      score,
      totalQuestions,
      graded: true,
      gradingDetails
    };
  };

  const getPerformanceVerdict = (percentage: number): string => {
    if (percentage >= 90) return '🏆 OUTSTANDING PERFORMANCE! Exceptional work!';
    if (percentage >= 80) return '🌟 EXCELLENT WORK! Great job!';
    if (percentage >= 70) return '👍 GOOD PERFORMANCE! Well done!';
    if (percentage >= 60) return '📚 SATISFACTORY. Room for improvement.';
    if (percentage >= 50) return '💪 NEEDS IMPROVEMENT. Keep practicing!';
    return '🔄 REQUIRES SIGNIFICANT ATTENTION. Please review and practice more.';
  };

  const sendResultsToStudent = () => {
    if (!studentEmail.trim() || !results) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to receive results.",
        variant: "destructive"
      });
      return;
    }

    const percentage = results.totalQuestions ? Math.round((results.score! / results.totalQuestions) * 100) : 0;
    const verdict = getPerformanceVerdict(percentage);
    
    const emailSubject = `Your Quiz Results - ${results.subject}`;
    const emailBody = `
Dear Student,

Here are your quiz results:

QUIZ DETAILS:
============
Student ID: ${results.studentId}
Subject: ${results.subject}
Date: ${new Date(results.completedAt).toLocaleDateString()}
Time Taken: ${results.timeTaken} minutes

FINAL SCORE: ${results.score}/${results.totalQuestions} (${percentage}%)
VERDICT: ${verdict}

DETAILED ANSWERS:
================
${Object.entries(results.answers).map(([questionId, answer]) => {
  const correctAnswer = quiz?.correctAnswers?.[questionId];
  const isCorrect = results.gradingDetails?.[questionId];
  const questionNum = extractQuestionNumber(questionId);
  
  return `
Question ${questionNum}:
Your Answer: ${answer}
Correct Answer: ${correctAnswer}
Result: ${isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
${results.comments[questionId] ? `Your Comments: ${results.comments[questionId]}` : ''}
`;
}).join('\n')}

Keep up the good work and continue learning!

Best regards,
Teacher
Email: debashrestha222@gmail.com
    `.trim();

    const mailtoLink = `mailto:${studentEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink);

    toast({
      title: "Email Sent!",
      description: "Your results have been emailed to you.",
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const parseContentWithAnswerBoxes = (text: string) => {
    if (!text) return '';
    
    const lines = text.split('\n');
    let html = '';
    let questionCount = 0;
    let questionStarted = false;
    let currentQuestionLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line starts a new question
      const isQuestionStart = /^(\d+\.|\d+\)|Question\s+\d+)/i.test(line) || 
                             /^[A-Z].*\?$/.test(line);
      
      // Check if this line is an option
      const isOption = /^[a-zA-Z]\)\s/.test(line) || /^\([a-zA-Z]\)\s/.test(line);
      
      // Apply markdown formatting to the current line
      let formattedLine = lines[i]
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-800">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-900">$2</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
        .replace(/<u>(.*?)<\/u>/gim, '<span class="underline">$1</span>')
        .replace(/^\s*\- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
        .replace(/^\s*\d+\. (.*$)/gim, '<li class="ml-4 mb-1 list-decimal">$1</li>')
        .replace(/^---$/gim, '<hr class="my-6 border-gray-300">');

      if (isQuestionStart) {
        // If we had a previous question, add its answer box first
        if (questionStarted && currentQuestionLines.length > 0) {
          questionCount++;
          const questionId = `q${questionCount}`;
          
          html += `
            <div class="my-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 mb-2">Your Answer:</label>
                <div id="answer-${questionId}" class="answer-box"></div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Comments/Working (Optional):</label>
                <div id="comment-${questionId}" class="comment-box"></div>
              </div>
            </div>
          `;
        }
        
        // Start new question
        questionStarted = true;
        currentQuestionLines = [formattedLine];
        html += formattedLine + '<br>';
      } else if (questionStarted) {
        // We're in a question, add the line
        currentQuestionLines.push(formattedLine);
        html += formattedLine + '<br>';
        
        // If this is not an option and the next line is not an option either,
        // or if this is the last line, end the question
        const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
        const nextIsOption = /^[a-zA-Z]\)\s/.test(nextLine) || /^\([a-zA-Z]\)\s/.test(nextLine);
        const nextIsQuestion = /^(\d+\.|\d+\)|Question\s+\d+)/i.test(nextLine) || 
                              /^[A-Z].*\?$/.test(nextLine);
        
        if (!isOption && !nextIsOption && (i === lines.length - 1 || nextIsQuestion || nextLine === '')) {
          // End of current question
          questionCount++;
          const questionId = `q${questionCount}`;
          
          html += `
            <div class="my-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 mb-2">Your Answer:</label>
                <div id="answer-${questionId}" class="answer-box"></div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Comments/Working (Optional):</label>
                <div id="comment-${questionId}" class="comment-box"></div>
              </div>
            </div>
          `;
          
          questionStarted = false;
          currentQuestionLines = [];
        }
      } else {
        // Not in a question, just add the line
        html += formattedLine + '<br>';
      }
    }
    
    return html;
  };

  const renderAnswerBoxes = () => {
    const answerBoxes = document.querySelectorAll('.answer-box');
    const commentBoxes = document.querySelectorAll('.comment-box');
    
    answerBoxes.forEach((box, index) => {
      const questionId = `q${index + 1}`;
      if (box && !box.hasChildNodes()) {
        const textarea = document.createElement('textarea');
        textarea.className = "w-full min-h-[100px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
        textarea.placeholder = "Enter your answer here...";
        textarea.value = answers[questionId] || '';
        textarea.addEventListener('input', (e) => {
          handleAnswerChange(questionId, (e.target as HTMLTextAreaElement).value);
        });
        box.appendChild(textarea);
      }
    });

    commentBoxes.forEach((box, index) => {
      const questionId = `q${index + 1}`;
      if (box && !box.hasChildNodes()) {
        const textarea = document.createElement('textarea');
        textarea.className = "w-full min-h-[80px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
        textarea.placeholder = "Show your working or add comments...";
        textarea.value = comments[questionId] || '';
        textarea.addEventListener('input', (e) => {
          handleCommentChange(questionId, (e.target as HTMLTextAreaElement).value);
        });
        box.appendChild(textarea);
      }
    });
  };

  useEffect(() => {
    if (quizStarted && quiz) {
      const timer = setTimeout(() => {
        renderAnswerBoxes();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [quizStarted, quiz, answers, comments]);

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Quiz Found</h2>
            <p className="text-gray-600 mb-4">No quiz has been assigned to your ID.</p>
            <Button onClick={onLogout} variant="outline">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizCompleted && showResults && results) {
    const percentage = results.totalQuestions ? Math.round((results.score! / results.totalQuestions) * 100) : 0;
    const verdict = getPerformanceVerdict(percentage);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Quiz Results</h2>
              <div className="text-6xl font-bold mb-4">
                <span className={percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                  {results.score}/{results.totalQuestions}
                </span>
              </div>
              <div className="text-2xl font-semibold mb-2">
                {percentage}% Score
              </div>
              <div className={`text-lg font-medium p-4 rounded-lg ${percentage >= 70 ? 'bg-green-100 text-green-800' : percentage >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                {verdict}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detailed Answer Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(results.answers).map(([questionId, answer]) => {
                const correctAnswer = quiz.correctAnswers?.[questionId];
                const isCorrect = results.gradingDetails?.[questionId];
                const questionNum = extractQuestionNumber(questionId);
                
                return (
                  <div key={questionId} className={`p-4 rounded-lg border-l-4 ${isCorrect ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-semibold">Question {questionNum}</span>
                      <span className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? 'CORRECT' : 'INCORRECT'}
                      </span>
                    </div>
                    <p className="text-sm mb-2">
                      <strong>Your Answer:</strong> <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>{answer}</span>
                    </p>
                    {correctAnswer && (
                      <p className="text-sm mb-2">
                        <strong>Correct Answer:</strong> <span className="text-green-700">{correctAnswer}</span>
                      </p>
                    )}
                    {results.comments[questionId] && (
                      <p className="text-sm text-gray-600">
                        <strong>Your Comments:</strong> {results.comments[questionId]}
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Email Results */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Get Results via Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Your Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email to receive detailed results"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                />
              </div>
              <Button onClick={sendResultsToStudent} className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Email My Results
              </Button>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={onLogout} variant="outline" size="lg">
              Exit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted && !showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
            <p className="text-gray-600 mb-4">
              Your answers have been submitted and graded automatically.
            </p>
            <Button onClick={() => setShowResults(true)} className="bg-blue-600 hover:bg-blue-700 mb-2 w-full">
              <Trophy className="h-4 w-4 mr-2" />
              View Results
            </Button>
            <Button onClick={onLogout} variant="outline" className="w-full">
              Exit Without Viewing Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{quiz.subject} Quiz</h1>
              <p className="text-gray-600">Student ID: {studentId}</p>
            </div>
            <Button onClick={onLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
          
          {quizStarted && (
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Remaining: {formatTime(timeLeft)}
                </span>
                <span className={`text-sm ${timeLeft < 300 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                  {timeLeft < 300 && '⚠️ Less than 5 minutes left!'}
                </span>
              </div>
              <Progress 
                value={(timeLeft / (quiz.timer * 60)) * 100} 
                className="h-2"
              />
            </div>
          )}
        </div>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Quiz Instructions</CardTitle>
            <CardDescription>
              Please read all questions carefully before answering. You have {quiz.timer} minutes to complete this quiz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!quizStarted ? (
              <div className="text-center py-8">
                <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ready to Start?</h3>
                <p className="text-gray-600 mb-6">
                  Once you click "Start Quiz", the timer will begin. Make sure you're ready!
                </p>
                <Button onClick={startQuiz} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Start Quiz
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div 
                  className="prose prose-sm max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: parseContentWithAnswerBoxes(quiz.content) }}
                />
                
                <div className="border-t pt-6">
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => handleSubmitQuiz(false)}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 px-8"
                    >
                      Submit Quiz
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentQuiz;
