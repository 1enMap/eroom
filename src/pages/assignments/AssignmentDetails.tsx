import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useAuthStore } from '../../store/authStore';
import { Clock, FileText, Upload, Eye } from 'lucide-react';
import SubmitAssignmentDialog from '../../components/assignments/SubmitAssignmentDialog';

export default function AssignmentDetails() {
  const { id } = useParams<{ id: string }>();
  const { getAllAssignments, getAssignmentStatus, getSubmissionByAssignment, getAllSubmissions, hasSubmitted } = useAssignmentStore();
  const { user } = useAuthStore();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  
  const assignments = getAllAssignments();
  const assignment = assignments.find(a => a.id === id);
  const submission = user && assignment ? getSubmissionByAssignment(assignment.id, user.id) : undefined;
  const isTeacher = user?.role === 'teacher';

  const allSubmissions = isTeacher 
    ? getAllSubmissions().filter(s => s.assignmentId === id)
    : [];

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Assignment not found
        </h2>
      </div>
    );
  }

  const deadline = new Date(assignment.deadline);
  const isLate = deadline < new Date();
  const status = user ? getAssignmentStatus(assignment.id, user.id) : 'pending';
  const canSubmit = user?.role === 'student' && !isLate && !hasSubmitted(assignment.id, user.id);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {assignment.title}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Assignment details and submission
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {assignment.description}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Due Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {deadline.toLocaleDateString()}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Points</dt>
              <dd className="mt-1 text-sm text-gray-900">{assignment.points}</dd>
            </div>
            {!isTeacher && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  {status === 'graded' && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Grade: {submission?.grade}/{assignment.points}
                    </span>
                  )}
                  {status === 'submitted' && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      Submitted - Pending Review
                    </span>
                  )}
                  {status === 'late' && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      Past Due
                    </span>
                  )}
                  {status === 'pending' && !isLate && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Not Submitted
                    </span>
                  )}
                </dd>
              </div>
            )}
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Assignment File</dt>
              <dd className="mt-1">
                <a
                  href={assignment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Assignment PDF
                </a>
              </dd>
            </div>
            {submission && !isTeacher && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Your Submission</dt>
                <dd className="mt-1">
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Your Submission
                  </a>
                </dd>
                {submission.feedback && (
                  <dd className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500">Feedback</h4>
                    <p className="mt-1 text-sm text-gray-900">{submission.feedback}</p>
                  </dd>
                )}
              </div>
            )}
          </dl>
        </div>
        {canSubmit && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setIsSubmitDialogOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Upload className="h-4 w-4 mr-2" />
                Submit Assignment
              </button>
            </div>
          </div>
        )}

        {isTeacher && (
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Student Submissions</h4>
              <div className="space-y-4">
                {allSubmissions.map((sub) => (
                  <div key={sub.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{sub.studentName}</p>
                        <p className="text-sm text-gray-500">
                          Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View Submission
                        </a>
                      </div>
                    </div>
                    {sub.status === 'graded' && (
                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="font-medium">Grade:</span> {sub.grade}/{assignment.points}
                        </p>
                        {sub.feedback && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">Feedback:</span> {sub.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {allSubmissions.length === 0 && (
                  <p className="text-center text-gray-500">No submissions yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {id && (
        <SubmitAssignmentDialog
          isOpen={isSubmitDialogOpen}
          onClose={() => setIsSubmitDialogOpen(false)}
          assignmentId={id}
        />
      )}
    </div>
  );
}