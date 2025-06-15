
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { validatePDFFile } from '../utils/security';

interface PDFUploadProps {
  onPDFSelect: (file: File | null) => void;
  selectedFile: File | null;
}

const PDFUpload: React.FC<PDFUploadProps> = ({ onPDFSelect, selectedFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleFileValidation = async (file: File) => {
    setIsValidating(true);
    
    try {
      // Enhanced file validation
      const validation = validatePDFFile(file);
      
      if (!validation.valid) {
        toast({
          title: "File Validation Failed",
          description: validation.error,
          variant: "destructive"
        });
        return;
      }

      // Additional security checks
      const fileName = file.name.toLowerCase();
      const suspiciousPatterns = ['.exe', '.bat', '.cmd', '.scr', '.js', '.html'];
      const hasSuspiciousContent = suspiciousPatterns.some(pattern => fileName.includes(pattern));
      
      if (hasSuspiciousContent) {
        toast({
          title: "Security Warning",
          description: "File contains suspicious patterns and cannot be uploaded.",
          variant: "destructive"
        });
        return;
      }

      // Check file signature (magic bytes) for PDF
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer.slice(0, 4));
      const signature = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      
      // PDF files should start with %PDF (25504446)
      if (!signature.startsWith('25504446')) {
        toast({
          title: "Invalid File Format",
          description: "File does not appear to be a valid PDF document.",
          variant: "destructive"
        });
        return;
      }

      onPDFSelect(file);
      toast({
        title: "File Validated Successfully",
        description: `${file.name} has been securely validated and is ready for assignment.`,
      });
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "An error occurred while validating the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 1) {
      toast({
        title: "Multiple Files Not Allowed",
        description: "Please select only one PDF file at a time.",
        variant: "destructive"
      });
      return;
    }
    
    if (files.length > 0) {
      handleFileValidation(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileValidation(files[0]);
    }
    // Clear input to allow re-selection of same file
    e.target.value = '';
  };

  const removeFile = () => {
    onPDFSelect(null);
    toast({
      title: "File Removed",
      description: "PDF file has been removed from the assignment.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Secure PDF Exam Upload
          <Shield className="h-4 w-4 text-green-600" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedFile ? (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                <FileText className="h-8 w-8 text-green-600" />
                <Shield className="h-3 w-3 text-green-700 absolute -top-1 -right-1" />
              </div>
              <div>
                <p className="font-medium text-green-800">{selectedFile.name}</p>
                <p className="text-sm text-green-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Validated
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
          >
            {isValidating ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">
                  Validating File...
                </h3>
                <p className="text-sm text-gray-600">
                  Performing security checks
                </p>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload PDF Exam
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop your PDF file here, or click to browse
                </p>
                <Label htmlFor="pdf-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Choose PDF File
                  </Button>
                </Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-xs text-yellow-800">
                      <p className="font-medium">Security Features:</p>
                      <ul className="mt-1 space-y-1">
                        <li>• File signature validation</li>
                        <li>• Maximum size: 10MB</li>
                        <li>• PDF format verification</li>
                        <li>• Malicious content detection</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFUpload;
