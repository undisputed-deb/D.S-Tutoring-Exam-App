
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, User, CheckCircle, Search } from 'lucide-react';

interface QuizHistoryEntry {
  id: string;
  studentId: string;
  subject: string;
  content: string;
  correctAnswers: {[key: string]: string};
  createdAt: string;
  teacherEmail: string;
}

const QuizHistory: React.FC = () => {
  const [quizHistory, setQuizHistory] = useState<QuizHistoryEntry[]>([]);
  const [searchStudentId, setSearchStudentId] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<QuizHistoryEntry[]>([]);

  useEffect(() => {
    loadQuizHistory();
  }, []);

  useEffect(() => {
    if (searchStudentId.trim()) {
      setFilteredHistory(
        quizHistory.filter(quiz => 
          quiz.studentId.toLowerCase().includes(searchStudentId.toLowerCase())
        )
      );
    } else {
      setFilteredHistory(quizHistory);
    }
  }, [searchStudentId, quizHistory]);

  const loadQuizHistory = () => {
    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    setQuizHistory(history);
  };

  const getUniqueStudentIds = () => {
    return [...new Set(quizHistory.map(quiz => quiz.studentId))];
  };

  const getQuizzesForStudent = (studentId: string) => {
    return quizHistory.filter(quiz => quiz.studentId === studentId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quiz History</h2>
        <Button onClick={loadQuizHistory} variant="outline" size="sm">
          Refresh History
        </Button>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Quiz History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search">Search by Student ID</Label>
              <Input
                id="search"
                placeholder="Enter student ID to filter quizzes"
                value={searchStudentId}
                onChange={(e) => setSearchStudentId(e.target.value)}
              />
            </div>
          </div>
          
          {/* Quick Access to Students */}
          {getUniqueStudentIds().length > 0 && (
            <div className="space-y-2">
              <Label>Quick Access to Students:</Label>
              <div className="flex flex-wrap gap-2">
                {getUniqueStudentIds().map(studentId => (
                  <Button
                    key={studentId}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchStudentId(studentId)}
                  >
                    {studentId} ({getQuizzesForStudent(studentId).length} quizzes)
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiz History List */}
      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">
              {searchStudentId ? 'No quizzes found for this student ID.' : 'No quiz history available yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredHistory.map((quiz) => (
            <Card key={quiz.id} className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Student ID: {quiz.studentId}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Subject: {quiz.subject}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quiz Content Preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Quiz Content:
                  </h4>
                  <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                    {quiz.content.split('\n').slice(0, 5).map((line, index) => (
                      <p key={index} className="mb-1">{line}</p>
                    ))}
                    {quiz.content.split('\n').length > 5 && (
                      <p className="text-gray-500 italic">... and more</p>
                    )}
                  </div>
                </div>

                {/* Correct Answers */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Correct Answers Set:
                  </h4>
                  {Object.keys(quiz.correctAnswers).length === 0 ? (
                    <p className="text-sm text-gray-500">No correct answers were set for this quiz.</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(quiz.correctAnswers).map(([questionId, answer]) => (
                        <div key={questionId} className="flex items-center gap-3 text-sm">
                          <span className="font-medium text-green-700 min-w-[60px]">
                            Q{questionId.replace('q', '')}:
                          </span>
                          <span className="bg-white px-3 py-1 rounded border border-green-300">
                            {answer}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600 pt-2 border-t">
                  <span>Quiz ID: {quiz.id}</span>
                  <span>Teacher: {quiz.teacherEmail}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizHistory;
