
import DOMPurify from 'dompurify';

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3'],
    ALLOWED_ATTR: []
  });
};

// Secure credential validation (simulated backend validation)
export const validateCredentials = async (teacherId: string, password: string): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Hash comparison simulation (in real app, this would be done on backend)
  const validTeacherId = '220193';
  const validPasswordHash = await hashPassword('H@numan2'); // This would be pre-stored hash
  const inputPasswordHash = await hashPassword(password);
  
  return teacherId === validTeacherId && inputPasswordHash === validPasswordHash;
};

// Simple password hashing (for demo - use bcrypt in production)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt_key_here');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Session management
export const createSecureSession = (userId: string): string => {
  const sessionData = {
    userId,
    timestamp: Date.now(),
    role: 'teacher'
  };
  return btoa(JSON.stringify(sessionData));
};

export const validateSession = (session: string): boolean => {
  try {
    const data = JSON.parse(atob(session));
    const now = Date.now();
    const sessionAge = now - data.timestamp;
    const maxAge = 8 * 60 * 60 * 1000; // 8 hours
    
    return sessionAge < maxAge && data.role === 'teacher';
  } catch {
    return false;
  }
};

// File validation
export const validatePDFFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf'];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only PDF files are allowed' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension !== 'pdf') {
    return { valid: false, error: 'File must have .pdf extension' };
  }
  
  return { valid: true };
};

// Rate limiting helper
export const checkRateLimit = (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rateLimit_${key}`) || '[]');
  
  // Remove old attempts outside the window
  const validAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
  
  if (validAttempts.length >= maxAttempts) {
    return false; // Rate limit exceeded
  }
  
  // Add current attempt
  validAttempts.push(now);
  localStorage.setItem(`rateLimit_${key}`, JSON.stringify(validAttempts));
  
  return true;
};
