import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAssignmentStore } from '../../store/assignmentStore';
import type { Assignment } from '../../types';

interface AssignmentListProps {
  assignments: Assignment[];
  showSubmitButton?: boolean;
}

export default function AssignmentList({ assignments, showSubmitButton = false }: AssignmentListProps) {
  const { user } = useAuthStore();
  const { getAssignmentStatus, getSubmissionByAssignment } = useAssignmentStore();

  const getStatusBadge = (assignment: Assignment) => {
    if (!user) return null;
    
    const status = getAssignmentStatus(assignment.id, user.id);
    const submission = getSubmissionByAssignment(assignment.id, user.id);
    const deadline = new Date(assignment.deadline);
    const isLate = deadline < new Date();

    switch (status) {
      case 'graded':
        return (
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              Grade: {submission?.grade}/{assignment.points}
            </span>
          </div>
        );
      case 'submitted':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Submitted
          </span>
        );
      case 'late':
        return (
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
              Past Due
            </span>
          </div>
        );
      default:
        return isLate ? (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Past Due
          </span>
        ) : (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const deadline = new Date(assignment.deadline);
        const isLate = deadline < new Date();
        const status = user ? getAssignmentStatus(assignment.id, user.id) : 'pending';
        const canSubmit = showSubmitButton && !isLate && status === 'pending';

        return (
          <div key={assignment.id} className="border rounded-lg p-4 hover:border-indigo-500 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-lg font-medium text-gray-900">{assignment.title}</h4>
              {getStatusBadge(assignment)}
            </div>
            <p className="text-sm text-gray-600 mb-4">{assignment.description}</p>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  Due {deadline.toLocaleDateString()}
                </span>
                <span className="font-medium text-indigo-600">{assignment.points} points</span>
              </div>
              {canSubmit && (
                <Link
                  to={`/assignments/${assignment.id}`}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Submit Assignment
                </Link>
              )}
            </div>
          </div>
        );
      })}
      {assignments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No assignments available.
        </div>
      )}
    </div>
  );
}