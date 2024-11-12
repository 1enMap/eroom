import { openDB, DBSchema } from 'idb';
import type { Assignment, Submission } from '../types';

interface AssignmentDB extends DBSchema {
  assignments: {
    key: string;
    value: Assignment;
    indexes: { 'by-teacher': string };
  };
  submissions: {
    key: string;
    value: Submission;
    indexes: {
      'by-student': string;
      'by-assignment': string;
      'by-status': string;
    };
  };
}

const DB_NAME = 'assignment-system-db';
const DB_VERSION = 1;

export async function initDB() {
  const db = await openDB<AssignmentDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Assignments store
      const assignmentStore = db.createObjectStore('assignments', { keyPath: 'id' });
      assignmentStore.createIndex('by-teacher', 'teacherId');

      // Submissions store
      const submissionStore = db.createObjectStore('submissions', { keyPath: 'id' });
      submissionStore.createIndex('by-student', 'studentId');
      submissionStore.createIndex('by-assignment', 'assignmentId');
      submissionStore.createIndex('by-status', 'status');
    },
  });

  return db;
}

export async function getDB() {
  return await openDB<AssignmentDB>(DB_NAME, DB_VERSION);
}

// Assignment Operations
export async function createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt'>) {
  const db = await getDB();
  const id = Math.random().toString(36).substr(2, 9);
  const newAssignment: Assignment = {
    ...assignment,
    id,
    createdAt: new Date().toISOString(),
  };
  await db.add('assignments', newAssignment);
  return newAssignment;
}

export async function getAllAssignments(): Promise<Assignment[]> {
  const db = await getDB();
  return await db.getAll('assignments');
}

export async function getAssignmentsByTeacher(teacherId: string): Promise<Assignment[]> {
  const db = await getDB();
  return await db.getAllFromIndex('assignments', 'by-teacher', teacherId);
}

// Submission Operations
export async function createSubmission(submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>) {
  const db = await getDB();
  const id = Math.random().toString(36).substr(2, 9);
  const newSubmission: Submission = {
    ...submission,
    id,
    submittedAt: new Date().toISOString(),
    status: 'submitted',
  };
  await db.add('submissions', newSubmission);
  return newSubmission;
}

export async function updateSubmission(id: string, updates: Partial<Submission>) {
  const db = await getDB();
  const submission = await db.get('submissions', id);
  if (!submission) throw new Error('Submission not found');
  
  const updatedSubmission = {
    ...submission,
    ...updates,
  };
  await db.put('submissions', updatedSubmission);
  return updatedSubmission;
}

export async function getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
  const db = await getDB();
  return await db.getAllFromIndex('submissions', 'by-student', studentId);
}

export async function getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
  const db = await getDB();
  return await db.getAllFromIndex('submissions', 'by-assignment', assignmentId);
}

export async function getSubmissionByAssignmentAndStudent(
  assignmentId: string,
  studentId: string
): Promise<Submission | undefined> {
  const db = await getDB();
  const submissions = await db.getAllFromIndex('submissions', 'by-assignment', assignmentId);
  return submissions.find(s => s.studentId === studentId);
}

export async function getAllSubmissions(): Promise<Submission[]> {
  const db = await getDB();
  return await db.getAll('submissions');
}

// Initialize the database when the application starts
initDB().catch(console.error);