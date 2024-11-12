import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAssignmentStore } from '../../store/assignmentStore';
import { Plus } from 'lucide-react';
import CreateAssignmentDialog from '../../components/assignments/CreateAssignmentDialog';

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const { getAllAssignments, getAllSubmissions } = useAssignmentStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const assignments = getAllAssignments();
  const submissions = getAllSubmissions();

  const stats = {
    totalAssignments: assignments.length,
    pendingGrading: submissions.filter(s => s.grade === undefined).length,
    activeStudents: new Set(submissions.map(s => s.studentId)).size
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Assignments
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {stats.totalAssignments}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pending Grading
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {stats.pendingGrading}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Students
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {stats.activeStudents}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateAssignmentDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </div>
  );
}