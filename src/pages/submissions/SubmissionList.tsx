import React from 'react';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import { Clock, FileText, CheckCircle, XCircle } from 'lucide-react';

export default function SubmissionList() {
  const { getAllSubmissions, getStudentSubmissions, getAllAssignments } = useAssignmentStore();
  const { user } = useAuthStore();

  const assignments = getAllAssignments();
  const submissions = user?.role === 'teacher' 
    ? getAllSubmissions()
    : user 
    ? getStudentSubmissions(user.id)
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        {user?.role === 'teacher' ? 'Student Submissions' : 'Your Submissions'}
      </h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {submissions.map((submission) => {
            const assignment = assignments.find(a => a.id === submission.assignmentId);
            return (
              <li key={submission.id}>
                <Link
                  to={`/submissions/${submission.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {assignment?.title || `Assignment #${submission.assignmentId}`}
                          </p>
                        </div>
                        {user?.role === 'teacher' && (
                          <p className="mt-1 text-sm text-gray-500">
                            Submitted by: {submission.studentName}
                          </p>
                        )}
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        {submission.grade !== undefined ? (
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Grade: {submission.grade}/{assignment?.points || 100}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <XCircle className="h-5 w-5 text-yellow-500 mr-2" />
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending Review
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
          {submissions.length === 0 && (
            <li className="px-4 py-5 text-center text-sm text-gray-500">
              No submissions found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}