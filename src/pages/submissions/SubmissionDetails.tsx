import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useAuthStore } from '../../store/authStore';
import { Clock, FileText, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubmissionDetails() {
  const { id } = useParams<{ id: string }>();
  const { getAllSubmissions, getAllAssignments, gradeSubmission } = useAssignmentStore();
  const { user } = useAuthStore();
  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const submissions = getAllSubmissions();
  const submission = submissions.find(s => s.id === id);
  const assignments = getAllAssignments();
  const assignment = submission 
    ? assignments.find(a => a.id === submission.assignmentId)
    : null;

  if (!submission || !assignment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Submission not found
        </h2>
      </div>
    );
  }

  const handleGradeSubmit = async () => {
    if (!user || user.role !== 'teacher') return;
    
    setIsSubmitting(true);
    try {
      await gradeSubmission(submission.id, grade, feedback);
      toast.success('Submission graded successfully!');
    } catch (error) {
      toast.error('Failed to grade submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Submission Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            For assignment: {assignment.title}
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Student Name</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {submission.studentName}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Submission Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(submission.submittedAt).toLocaleDateString()}
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {submission.grade !== undefined ? 'Graded' : 'Pending Review'}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Submitted File</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  View Submission
                </a>
              </dd>
            </div>

            {submission.grade !== undefined && (
              <>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Grade</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {submission.grade} / {assignment.points}
                  </dd>
                </div>
                
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Feedback</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {submission.feedback || 'No feedback provided'}
                  </dd>
                </div>
              </>
            )}

            {user?.role === 'teacher' && submission.grade === undefined && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Grade Submission</dt>
                <dd className="mt-1 space-y-4">
                  <div>
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                      Grade (out of {assignment.points})
                    </label>
                    <input
                      type="number"
                      id="grade"
                      min="0"
                      max={assignment.points}
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                      Feedback
                    </label>
                    <textarea
                      id="feedback"
                      rows={3}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleGradeSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save Grade'}
                  </button>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}