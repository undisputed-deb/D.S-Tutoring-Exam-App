import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface QuizPreviewProps {
  content: string;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ content }) => {
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [comments, setComments] = useState<{[key: string]: string}>({});

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({...prev, [questionId]: value}));
  };

  const handleCommentChange = (questionId: string, value: string) => {
    setComments(prev => ({...prev, [questionId]: value}));
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
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-900">$1</h2>')
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
            <div class="my-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 mb-2">Answer Box:</label>
                <div id="answer-${questionId}" class="answer-box"></div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Comments (Optional):</label>
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
            <div class="my-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 mb-2">Answer Box:</label>
                <div id="answer-${questionId}" class="answer-box"></div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Comments (Optional):</label>
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
        const input = document.createElement('textarea');
        input.className = "w-full min-h-[80px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
        input.placeholder = "Enter your answer here...";
        input.value = answers[questionId] || '';
        input.addEventListener('change', (e) => {
          handleAnswerChange(questionId, (e.target as HTMLTextAreaElement).value);
        });
        box.appendChild(input);
      }
    });

    commentBoxes.forEach((box, index) => {
      const questionId = `q${index + 1}`;
      if (box && !box.hasChildNodes()) {
        const input = document.createElement('textarea');
        input.className = "w-full min-h-[60px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
        input.placeholder = "Any additional comments or working...";
        input.value = comments[questionId] || '';
        input.addEventListener('change', (e) => {
          handleCommentChange(questionId, (e.target as HTMLTextAreaElement).value);
        });
        box.appendChild(input);
      }
    });
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      renderAnswerBoxes();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [content, answers, comments]);

  return (
    <Card className="min-h-[400px] bg-white">
      <CardHeader className="border-b bg-gray-50">
        <CardTitle className="text-lg text-gray-700">Quiz Preview</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {content ? (
          <div 
            className="prose prose-sm max-w-none leading-relaxed text-gray-800"
            dangerouslySetInnerHTML={{ __html: parseContentWithAnswerBoxes(content) }}
          />
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Start typing in the editor to see your quiz preview here...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizPreview;
