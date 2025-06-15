
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, BookOpen, Clock, Trophy, TrendingUp, Calendar } from 'lucide-react';

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
}

interface Quiz {
  studentId: string;
  subject: string;
  content: string;
  correctAnswers?: {[key: string]: string};
  createdAt: string;
}

const StudentAnalytics: React.FC = () => {
  const [searchStudentId, setSearchStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [quizzes, setQuizzes] = useState<{[key: string]: Quiz}>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    const savedQuizzes = JSON.parse(localStorage.getItem('studentQuizzes') || '{}');
    setResults(savedResults);
    setQuizzes(savedQuizzes);
  };

  const searchStudent = () => {
    if (searchStudentId.trim()) {
      setSelectedStudent(searchStudentId.trim());
    }
  };

  const getStudentResults = (studentId: string) => {
    return results.filter(result => result.studentId === studentId);
  };

  const getStudentQuizzes = (studentId: string) => {
    return Object.values(quizzes).filter(quiz => quiz.studentId === studentId);
  };

  const calculateOverallPerformance = (studentResults: QuizResult[]) => {
    const gradedResults = studentResults.filter(r => r.graded && r.score !== undefined);
    if (gradedResults.length === 0) return null;

    const totalScore = gradedResults.reduce((sum, r) => sum + (r.score || 0), 0);
    const totalPossible = gradedResults.reduce((sum, r) => sum + (r.totalQuestions || 0), 0);
    const averagePercentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

    return {
      totalQuizzes: gradedResults.length,
      totalScore,
      totalPossible,
      averagePercentage: Math.round(averagePercentage),
      subjects: [...new Set(gradedResults.map(r => r.subject))]
    };
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPerformanceVerdict = (percentage: number) => {
    if (percentage >= 90) return 'Outstanding Performance! 🏆';
    if (percentage >= 80) return 'Excellent Work! 🌟';
    if (percentage >= 70) return 'Good Performance! 👍';
    if (percentage >= 60) return 'Satisfactory. Room for improvement. 📚';
    if (percentage >= 50) return 'Needs Improvement. Keep practicing! 💪';
    return 'Requires significant attention and practice. 🔄';
  };

  const studentResults = selectedStudent ? getStudentResults(selectedStudent) : [];
  const studentQuizzes = selectedStudent ? getStudentQuizzes(selectedStudent) : [];
  const performance = selectedStudent ? calculateOverallPerformance(studentResults) : null;

  // Get all unique student IDs for quick access
  const allStudentIds = [...new Set([
    ...results.map(r => r.studentId),
    ...Object.keys(quizzes)
  ])];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Student Analytics</h2>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Search Student
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search">Student ID</Label>
              <Input
                id="search"
                placeholder="Enter student ID to view analytics"
                value={searchStudentId}
                onChange={(e) => setSearchStudentId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchStudent()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchStudent}>Search</Button>
            </div>
          </div>
          
          {/* Quick Access Buttons */}
          {allStudentIds.length > 0 && (
            <div className="space-y-2">
              <Label>Quick Access:</Label>
              <div className="flex flex-wrap gap-2">
                {allStudentIds.slice(0, 10).map(studentId => (
                  <Button
                    key={studentId}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchStudentId(studentId);
                      setSelectedStudent(studentId);
                    }}
                  >
                    {studentId}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Analytics */}
      {selectedStudent && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <User className="h-6 w-6" />
            <h3 className="text-xl font-bold">Analytics for Student: {selectedStudent}</h3>
          </div>

          {/* Overall Performance Card */}
          {performance && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Overall Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{performance.totalQuizzes}</div>
                    <div className="text-sm text-gray-600">Quizzes Taken</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {performance.totalScore}/{performance.totalPossible}
                    </div>
                    <div className="text-sm text-gray-600">Total Score</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${performance.averagePercentage >= 70 ? 'text-green-600' : performance.averagePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {performance.averagePercentage}%
                    </div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{performance.subjects.length}</div>
                    <div className="text-sm text-gray-600">Subjects</div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${getPerformanceColor(performance.averagePercentage)}`}>
                  <div className="font-semibold text-center">
                    {getPerformanceVerdict(performance.averagePercentage)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Subjects Covered:</Label>
                  <div className="flex flex-wrap gap-2">
                    {performance.subjects.map(subject => (
                      <Badge key={subject} variant="secondary">{subject}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quiz History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Quiz History ({studentResults.length} completed)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studentResults.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No quiz results found for this student.</p>
              ) : (
                <div className="space-y-4">
                  {studentResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{result.subject}</h4>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(result.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {result.graded && result.score !== undefined && (
                            <Badge className={getPerformanceColor((result.score / (result.totalQuestions || 1)) * 100)}>
                              {result.score}/{result.totalQuestions} ({Math.round((result.score / (result.totalQuestions || 1)) * 100)}%)
                            </Badge>
                          )}
                          <Badge variant={result.autoSubmitted ? "destructive" : "default"}>
                            {result.autoSubmitted ? "Auto-submitted" : "Manual"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {result.timeTaken} minutes
                        </span>
                        <span>
                          {Object.keys(result.answers).length} questions answered
                        </span>
                      </div>

                      {/* Show individual answers */}
                      <div className="mt-3 space-y-2">
                        <h5 className="font-medium text-sm">Answers:</h5>
                        <div className="grid gap-2 text-sm">
                          {Object.entries(result.answers).map(([questionId, answer]) => {
                            const quiz = quizzes[result.studentId];
                            const correctAnswer = quiz?.correctAnswers?.[questionId];
                            const isCorrect = correctAnswer && answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
                            
                            return (
                              <div key={questionId} className="flex items-center gap-2 text-xs">
                                <span className="font-medium">Q{questionId.replace('q', '')}:</span>
                                <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                  {answer}
                                </span>
                                {correctAnswer && result.graded && !isCorrect && (
                                  <span className="text-green-600">
                                    (Correct: {correctAnswer})
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Quizzes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Assigned Quizzes ({studentQuizzes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studentQuizzes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No quizzes assigned to this student.</p>
              ) : (
                <div className="space-y-3">
                  {studentQuizzes.map((quiz, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-blue-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{quiz.subject}</h4>
                          <p className="text-sm text-gray-600">
                            Assigned: {new Date(quiz.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            {quiz.correctAnswers ? Object.keys(quiz.correctAnswers).length : 0} questions
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentAnalytics;
