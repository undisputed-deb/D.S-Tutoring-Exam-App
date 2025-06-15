import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bold, Italic, List, ListOrdered, Type, Underline } from 'lucide-react';

interface QuizEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ content, onChange }) => {
  const [showFormatting, setShowFormatting] = useState(false);

  const insertFormatting = (format: string) => {
    const textarea = document.getElementById('quiz-editor') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText || 'underlined text'}</u>`;
        break;
      case 'h1':
        formattedText = `# ${selectedText || 'Heading 1'}`;
        break;
      case 'h2':
        formattedText = `## ${selectedText || 'Heading 2'}`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText || 'List item'}\n- Item 2\n- Item 3`;
        break;
      case 'numbered':
        formattedText = `\n1. ${selectedText || 'First item'}\n2. Second item\n3. Third item`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    onChange(newContent);
  };

  const formatTemplate = () => {
    const template = `# Quiz Title

## Instructions
Please read each question carefully and provide your answers in the boxes provided below each question.

**Time Limit:** As specified by your teacher
**Total Points:** Will be calculated based on correct answers

---

### Question 1
What is the capital of France?

a) London
b) Berlin
c) Paris
d) Madrid

**Answer Box:**
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

**Comments Box (Optional):**
┌─────────────────────────────────────────────────────────────┐
│ Any additional notes or working for this question:          │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

---

### Question 2
Solve for x: 2x + 5 = 15

**Answer Box:**
┌─────────────────────────────────────────────────────────────┐
│ x = ____                                                    │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

**Comments Box (Optional):**
┌─────────────────────────────────────────────────────────────┐
│ Show your working steps here:                               │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

---

### Question 3 (Essay)
Explain the process of photosynthesis in plants. Include the following in your answer:
- Raw materials needed
- Products formed
- Location where it occurs

**Answer Box:**
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

**Comments Box (Optional):**
┌─────────────────────────────────────────────────────────────┐
│ Additional thoughts or diagrams:                            │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

---

### Question 4 (Multiple Choice)
Which of the following is NOT a programming language?

a) Python
b) JavaScript
c) HTML
d) Java

**Answer Box:**
┌─────────────────────────────────────────────────────────────┐
│ Selected option: ____                                       │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

**Comments Box (Optional):**
┌─────────────────────────────────────────────────────────────┐
│ Explanation for your choice:                                │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

---

**Note:** Add more questions as needed following the same format with answer and comment boxes.`;
    
    onChange(template);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertFormatting('bold')}
          className="h-8"
        >
          <Bold className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertFormatting('italic')}
          className="h-8"
        >
          <Italic className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertFormatting('underline')}
          className="h-8"
        >
          <Underline className="h-3 w-3" />
        </Button>
        <div className="border-l border-gray-300 mx-2"></div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertFormatting('h1')}
          className="h-8"
        >
          H1
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertFormatting('h2')}
          className="h-8"
        >
          H2
        </Button>
        <div className="border-l border-gray-300 mx-2"></div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertFormatting('list')}
          className="h-8"
        >
          <List className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertFormatting('numbered')}
          className="h-8"
        >
          <ListOrdered className="h-3 w-3" />
        </Button>
        <div className="border-l border-gray-300 mx-2"></div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={formatTemplate}
          className="h-8"
        >
          <Type className="h-3 w-3 mr-1" />
          Use Template
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Textarea
            id="quiz-editor"
            placeholder="Enter your quiz content here... You can paste formatted text, questions, and answers. Use the toolbar above for basic formatting."
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[400px] border-0 resize-none focus:ring-0 focus:border-0 text-sm font-mono"
          />
        </CardContent>
      </Card>
      
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <h4 className="font-semibold mb-2">Formatting Tips:</h4>
        <ul className="space-y-1 text-xs">
          <li>• Use **text** for bold, *text* for italic</li>
          <li>• Start lines with # for large headings, ## for smaller headings</li>
          <li>• Use - or * for bullet points, 1. 2. 3. for numbered lists</li>
          <li>• Press "Use Template" to start with a formatted quiz structure</li>
          <li>• Template includes answer boxes and comment boxes for each question</li>
        </ul>
      </div>
    </div>
  );
};

export default QuizEditor;
