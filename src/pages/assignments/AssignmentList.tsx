import React from 'react';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import { Clock, FileText } from 'lucide-react';

export default function AssignmentList() {
  const { getAllAssignments } = useAssignmentStore();
  const { user } = useAuthStore();
  const assignments = getAllAssignments();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Assignments</h1>
        {user?.role === 'teacher' && (
          <Link
            to="/assignments/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Assignment
          </Link>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {assignments.map((assignment) => (
            <li key={assignment.id}>
              <Link
                to={`/assignments/${assignment.id}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {assignment.title}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {assignment.points} points
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        Due {new Date(assignment.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {assignments.length === 0 && (
            <li className="px-4 py-5 text-center text-sm text-gray-500">
              No assignments available yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}