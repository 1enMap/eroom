export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  teacherId: string;
  deadline: string;
  points: number;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  fileUrl: string;
  submittedAt: string;
  status: 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
}