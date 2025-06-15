
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, User, Mail, Trophy, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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

interface Quiz {
  studentId: string;
  correctAnswers?: {[key: string]: string};
  subject: string;
}

const QuizResults: React.FC = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [quizzes, setQuizzes] = useState<{[key: string]: Quiz}>({});
  const { toast } = useToast();

  useEffect(() => {
    loadResults();
    loadQuizzes();
  }, []);

  const loadResults = () => {
    const savedResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    console.log('Loaded results:', savedResults);
    setResults(savedResults);
  };

  const loadQuizzes = () => {
    const savedQuizzes = JSON.parse(localStorage.getItem('studentQuizzes') || '{}');
    console.log('Loaded quizzes:', savedQuizzes);
    setQuizzes(savedQuizzes);
  };

  const normalizeAnswer = (answer: string): string => {
    return answer.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
  };

  const extractQuestionNumber = (questionId: string): string => {
    const match = questionId.match(/\d+/);
    return match ? match[0] : questionId;
  };

  const gradeQuiz = (result: QuizResult) => {
    const quiz = quizzes[result.studentId];
    if (!quiz?.correctAnswers) {
      toast({
        title: "No Correct Answers",
        description: "No correct answers were set for this quiz.",
        variant: "destructive"
      });
      return;
    }

    let score = 0;
    const totalQuestions = Object.keys(quiz.correctAnswers).length;
    const gradingDetails: {[key: string]: boolean} = {};

    console.log('Grading quiz for student:', result.studentId);
    console.log('Correct answers:', quiz.correctAnswers);
    console.log('Student answers:', result.answers);

    Object.entries(quiz.correctAnswers).forEach(([questionId, correctAnswer]) => {
      const studentAnswer = result.answers[questionId] || '';
      const normalizedStudent = normalizeAnswer(studentAnswer);
      const normalizedCorrect = normalizeAnswer(correctAnswer);
      
      console.log(`Question ${extractQuestionNumber(questionId)}: "${normalizedStudent}" vs "${normalizedCorrect}"`);
      
      const isCorrect = normalizedStudent === normalizedCorrect;
      if (isCorrect) {
        score++;
      }
      gradingDetails[questionId] = isCorrect;
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    const updatedResult = {
      ...result,
      score,
      totalQuestions,
      graded: true,
      gradingDetails
    };

    const updatedResults = results.map(r => 
      r.studentId === result.studentId && r.completedAt === result.completedAt 
        ? updatedResult 
        : r
    );

    setResults(updatedResults);
    localStorage.setItem('quizResults', JSON.stringify(updatedResults));

    // Auto-send email with results
    sendResultsEmail(updatedResult, quiz);

    toast({
      title: "Quiz Graded Successfully",
      description: `Score: ${score}/${totalQuestions} (${percentage}%). Results emailed automatically.`,
    });
  };

  const sendResultsEmail = (result: QuizResult, quiz: Quiz) => {
    const percentage = Math.round(((result.score || 0) / (result.totalQuestions || 1)) * 100);
    const verdict = getPerformanceVerdict(percentage);
    
    const emailSubject = `Quiz Results - ${result.subject} - Student ${result.studentId}`;
    const emailBody = `
Quiz Results Summary
===================

Student ID: ${result.studentId}
Subject: ${result.subject}
Date: ${new Date(result.completedAt).toLocaleDateString()}
Time Taken: ${result.timeTaken} minutes
Submission Type: ${result.autoSubmitted ? 'Auto-submitted (Time Up)' : 'Manual Submission'}

SCORE: ${result.score}/${result.totalQuestions} (${percentage}%)
VERDICT: ${verdict}

Detailed Answers:
${Object.entries(result.answers).map(([questionId, answer]) => {
  const correctAnswer = quiz.correctAnswers?.[questionId];
  const isCorrect = result.gradingDetails?.[questionId];
  const questionNum = extractQuestionNumber(questionId);
  
  return `
Question ${questionNum}:
Student Answer: ${answer}
Correct Answer: ${correctAnswer}
Result: ${isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
${result.comments[questionId] ? `Comments: ${result.comments[questionId]}` : ''}
`;
}).join('\n')}

---
From: Teacher Dashboard
Email: debashrestha222@gmail.com
    `.trim();

    const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink);
  };

  const getPerformanceVerdict = (percentage: number): string => {
    if (percentage >= 90) return '🏆 OUTSTANDING PERFORMANCE! Exceptional work!';
    if (percentage >= 80) return '🌟 EXCELLENT WORK! Great job!';
    if (percentage >= 70) return '👍 GOOD PERFORMANCE! Well done!';
    if (percentage >= 60) return '📚 SATISFACTORY. Room for improvement.';
    if (percentage >= 50) return '💪 NEEDS IMPROVEMENT. Keep practicing!';
    return '🔄 REQUIRES SIGNIFICANT ATTENTION. Please review and practice more.';
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quiz Results</h2>
        <Button onClick={loadResults} variant="outline" size="sm">
          Refresh Results
        </Button>
      </div>

      {results.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No quiz results available yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {results.map((result, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Student ID: {result.studentId}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Subject: {result.subject}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {result.graded && result.score !== undefined && result.totalQuestions && (
                      <div className="text-right">
                        <Badge className={getScoreColor(result.score, result.totalQuestions)}>
                          <Trophy className="h-3 w-3 mr-1" />
                          {result.score}/{result.totalQuestions} ({Math.round((result.score / result.totalQuestions) * 100)}%)
                        </Badge>
                        <p className="text-xs mt-1 font-medium max-w-xs">
                          {getPerformanceVerdict(Math.round((result.score / result.totalQuestions) * 100))}
                        </p>
                      </div>
                    )}
                    <Badge variant={result.autoSubmitted ? "destructive" : "default"}>
                      {result.autoSubmitted ? "Auto-submitted" : "Manual submission"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Time taken: {result.timeTaken} minutes
                  </span>
                  <span>
                    Completed: {new Date(result.completedAt).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Detailed Answers:</h4>
                  {Object.entries(result.answers).map(([questionId, answer]) => {
                    const quiz = quizzes[result.studentId];
                    const correctAnswer = quiz?.correctAnswers?.[questionId];
                    const isCorrect = result.gradingDetails?.[questionId];
                    const questionNum = extractQuestionNumber(questionId);
                    
                    return (
                      <div key={questionId} className={`bg-gray-50 p-4 rounded-lg border-l-4 ${
                        result.graded ? (isCorrect ? 'border-l-green-500' : 'border-l-red-500') : 'border-l-gray-300'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-sm">Question {questionNum}:</span>
                          {correctAnswer && result.graded && (
                            <div className="flex items-center gap-1">
                              {isCorrect ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-xs font-medium">CORRECT</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-red-600">
                                  <XCircle className="h-4 w-4" />
                                  <span className="text-xs font-medium">INCORRECT</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Student Answer:</strong> 
                            <span className={result.graded ? (isCorrect ? 'text-green-700' : 'text-red-700') : ''}> {answer}</span>
                          </p>
                          {correctAnswer && result.graded && (
                            <p className="text-sm">
                              <strong>Correct Answer:</strong> 
                              <span className="text-green-700"> {correctAnswer}</span>
                            </p>
                          )}
                          {result.comments[questionId] && (
                            <p className="text-sm text-gray-600">
                              <strong>Student Comments:</strong> {result.comments[questionId]}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  {!result.graded && quizzes[result.studentId]?.correctAnswers && (
                    <Button 
                      onClick={() => gradeQuiz(result)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Grade Quiz & Email Results
                    </Button>
                  )}
                  {result.graded && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => sendResultsEmail(result, quizzes[result.studentId])}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Send Results Email Again
                    </Button>
                  )}
                  {!quizzes[result.studentId]?.correctAnswers && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">No correct answers set for this quiz</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizResults;
