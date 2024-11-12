import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAssignmentStore } from '../../store/assignmentStore';
import { Award, BookOpen, CheckCircle, TrendingUp } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { getStudentStats } = useAssignmentStore();

  if (!user) return null;

  const stats = getStudentStats(user.id);

  const statCards = [
    {
      title: 'Total Assignments',
      value: stats.totalAssignments,
      icon: BookOpen,
      color: 'text-blue-500',
    },
    {
      title: 'Completed',
      value: stats.completedAssignments,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Total Points',
      value: stats.totalPoints,
      icon: Award,
      color: 'text-yellow-500',
    },
    {
      title: 'Submission Streak',
      value: stats.submissionStreak,
      icon: TrendingUp,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Welcome back, {user.name}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-lg shadow p-6 flex items-center space-x-4"
          >
            <div className={`p-3 rounded-full bg-opacity-10 ${stat.color.replace('text', 'bg')}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {stats.completedAssignments > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Average Grade</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.averageGrade.toFixed(1)}%
              </p>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {((stats.completedAssignments / stats.totalAssignments) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}