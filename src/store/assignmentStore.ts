import { create } from 'zustand';
import * as db from '../lib/db';
import type { Assignment, Submission } from '../types';

interface AssignmentState {
  assignments: Assignment[];
  submissions: Submission[];
  initialized: boolean;
  createAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'points'> & { points?: number }) => Promise<void>;
  submitAssignment: (submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => Promise<void>;
  gradeSubmission: (submissionId: string, grade: number, feedback: string) => Promise<void>;
  getAssignmentStatus: (assignmentId: string, studentId: string) => 'pending' | 'submitted' | 'graded' | 'late';
  getSubmissionByAssignment: (assignmentId: string, studentId: string) => Submission | undefined;
  getAllAssignments: () => Assignment[];
  getStudentSubmissions: (studentId: string) => Submission[];
  getAllSubmissions: () => Submission[];
  hasSubmitted: (assignmentId: string, studentId: string) => boolean;
  initializeStore: () => Promise<void>;
  getStudentStats: (studentId: string) => {
    totalAssignments: number;
    completedAssignments: number;
    totalPoints: number;
    averageGrade: number;
    submissionStreak: number;
  };
}

export const useAssignmentStore = create<AssignmentState>()((set, get) => ({
  assignments: [],
  submissions: [],
  initialized: false,

  initializeStore: async () => {
    if (get().initialized) return;

    const [assignments, submissions] = await Promise.all([
      db.getAllAssignments(),
      db.getAllSubmissions(),
    ]);

    set({ assignments, submissions, initialized: true });
  },

  createAssignment: async (assignment) => {
    const newAssignment = await db.createAssignment({
      ...assignment,
      points: assignment.points || 100,
    });

    set(state => ({
      assignments: [...state.assignments, newAssignment],
    }));
  },

  submitAssignment: async (submission) => {
    const exists = await db.getSubmissionByAssignmentAndStudent(
      submission.assignmentId,
      submission.studentId
    );

    if (exists) return;

    const newSubmission = await db.createSubmission(submission);
    set(state => ({
      submissions: [...state.submissions, newSubmission],
    }));
  },

  hasSubmitted: (assignmentId: string, studentId: string) => {
    return get().submissions.some(
      s => s.assignmentId === assignmentId && s.studentId === studentId
    );
  },

  gradeSubmission: async (submissionId: string, grade: number, feedback: string) => {
    const updatedSubmission = await db.updateSubmission(submissionId, {
      grade,
      feedback,
      status: 'graded',
    });

    set(state => ({
      submissions: state.submissions.map(s =>
        s.id === submissionId ? updatedSubmission : s
      ),
    }));
  },

  getAllAssignments: () => {
    return [...get().assignments].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getStudentSubmissions: (studentId: string) => {
    return get().submissions.filter(s => s.studentId === studentId);
  },

  getAllSubmissions: () => {
    return get().submissions;
  },

  getAssignmentStatus: (assignmentId: string, studentId: string) => {
    const submission = get().submissions.find(
      s => s.assignmentId === assignmentId && s.studentId === studentId
    );
    const assignment = get().assignments.find(a => a.id === assignmentId);

    if (!assignment) return 'pending';
    
    const deadline = new Date(assignment.deadline);
    const now = new Date();

    if (!submission && deadline < now) return 'late';
    if (!submission) return 'pending';
    return submission.status;
  },

  getSubmissionByAssignment: (assignmentId: string, studentId: string) => {
    return get().submissions.find(
      s => s.assignmentId === assignmentId && s.studentId === studentId
    );
  },

  getStudentStats: (studentId: string) => {
    const studentSubmissions = get().submissions.filter(s => s.studentId === studentId);
    const gradedSubmissions = studentSubmissions.filter(s => s.status === 'graded');

    const totalPoints = gradedSubmissions.reduce(
      (sum, s) => sum + (s.grade || 0),
      0
    );

    const sortedSubmissions = [...studentSubmissions].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    let streak = 0;
    if (sortedSubmissions.length > 0) {
      streak = 1;
      for (let i = 1; i < sortedSubmissions.length; i++) {
        const curr = new Date(sortedSubmissions[i].submittedAt);
        const prev = new Date(sortedSubmissions[i - 1].submittedAt);
        const diffDays = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) streak++;
        else break;
      }
    }

    return {
      totalAssignments: get().assignments.length,
      completedAssignments: studentSubmissions.length,
      totalPoints,
      averageGrade: gradedSubmissions.length > 0 
        ? totalPoints / gradedSubmissions.length 
        : 0,
      submissionStreak: streak,
    };
  },
}));