import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAssignmentStore } from '../store/assignmentStore';
import { Calendar, Clock, FileText, Plus, Trash2, Archive, RefreshCw, AlertTriangle } from 'lucide-react';
import CreateAssignmentModal from '../components/CreateAssignmentModal';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';

const AssignmentCard = ({ 
  id,
  title, 
  description, 
  due_date, 
  points,
  requires_pdf,
  onDelete,
  isTeacher 
}: {
  id: string;
  title: string;
  description: string;
  due_date: string;
  points: number;
  requires_pdf: boolean;
  onDelete?: () => void;
  isTeacher: boolean;
}) => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <div 
      className={`${
        isDark ? 'bg-gray-800 hover:bg-gray-700/80' : 'bg-white hover:bg-gray-50'
      } rounded-xl shadow-sm p-6 transition-all cursor-pointer relative border ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}
      onClick={() => navigate(`/assignments/${id}`)}
    >
      {isTeacher && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`absolute top-4 right-4 p-2 ${
            isDark 
              ? 'text-gray-400 hover:text-red-400' 
              : 'text-gray-400 hover:text-red-500'
          } transition-colors`}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
      <h3 className={`text-lg font-semibold ${
        isDark ? 'text-white' : 'text-gray-900'
      } mb-2 pr-12`}>{title}</h3>
      <p className={`${
        isDark ? 'text-gray-300' : 'text-gray-600'
      } mb-4`}>{description}</p>
      <div className="flex items-center gap-6">
        <div className={`flex items-center gap-2 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Clock className="w-4 h-4" />
          <span className="text-sm">Due: {new Date(due_date).toLocaleDateString()}</span>
        </div>
        <div className={`flex items-center gap-2 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <FileText className="w-4 h-4" />
          <span className="text-sm">{points} points</span>
        </div>
        {requires_pdf && (
          <div className={`text-sm font-medium ${
            isDark ? 'text-indigo-400' : 'text-indigo-600'
          }`}>
            PDF Required
          </div>
        )}
      </div>
    </div>
  );
};

const TeacherAssignments = () => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const { 
    assignments, 
    archivedAssignments,
    loading, 
    fetchAssignments, 
    fetchArchivedAssignments,
    deleteAssignment,
    deleteArchivedAssignment,
    deleteAllArchivedAssignments,
    restoreAssignment 
  } = useAssignmentStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchArchivedAssignments();
  }, [fetchAssignments, fetchArchivedAssignments]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this assignment?')) {
      return;
    }

    try {
      await deleteAssignment(id);
      toast.success('Assignment archived successfully');
    } catch (error) {
      toast.error('Failed to archive assignment');
    }
  };

  const handleDeleteArchived = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteArchivedAssignment(id);
      toast.success('Assignment deleted permanently');
    } catch (error) {
      toast.error('Failed to delete assignment');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllArchivedAssignments();
      setShowDeleteConfirm(false);
      toast.success('All archived assignments deleted permanently');
    } catch (error) {
      toast.error('Failed to delete assignments');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreAssignment(id);
      toast.success('Assignment restored successfully');
    } catch (error) {
      toast.error('Failed to restore assignment');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {showArchived ? 'Archived Assignments' : 'Assignments'}
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            {showArchived 
              ? 'View and restore archived assignments'
              : 'Manage and track your class assignments'
            }
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              isDark 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
          >
            {showArchived ? (
              <>
                <RefreshCw className="w-5 h-5" />
                View Active
              </>
            ) : (
              <>
                <Archive className="w-5 h-5" />
                View Archived
              </>
            )}
          </button>
          {!showArchived ? (
            <button 
              onClick={() => setIsModalOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 ${
                isDark 
                  ? 'bg-indigo-500 hover:bg-indigo-600' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white rounded-lg transition-colors`}
            >
              <Plus className="w-5 h-5" />
              Create Assignment
            </button>
          ) : archivedAssignments.length > 0 && (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Delete All
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
            isDark ? 'border-indigo-400' : 'border-indigo-600'
          }`}></div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={showArchived ? 'archived' : 'active'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {showArchived ? (
              archivedAssignments.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {archivedAssignments.map((assignment) => (
                    <div key={assignment.id} className="relative">
                      <AssignmentCard {...assignment} isTeacher={true} />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => handleRestore(assignment.id)}
                          className={`p-2 ${
                            isDark 
                              ? 'text-indigo-400 hover:text-indigo-300' 
                              : 'text-indigo-600 hover:text-indigo-700'
                          } transition-colors`}
                          title="Restore assignment"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteArchived(assignment.id)}
                          className={`p-2 ${
                            isDark 
                              ? 'text-red-400 hover:text-red-300' 
                              : 'text-red-600 hover:text-red-700'
                          } transition-colors`}
                          title="Delete permanently"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-12 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <div className={`w-16 h-16 ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  } rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Archive className={`w-8 h-8 ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <h3 className={`text-lg font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } mb-2`}>No archived assignments</h3>
                  <p>Archived assignments will appear here</p>
                </div>
              )
            ) : assignments.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {assignments.map((assignment) => (
                  <AssignmentCard 
                    key={assignment.id} 
                    {...assignment} 
                    isTeacher={true}
                    onDelete={() => handleDelete(assignment.id)}
                  />
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <div className={`w-16 h-16 ${
                  isDark ? 'bg-gray-800' : 'bg-gray-100'
                } rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <FileText className={`w-8 h-8 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className={`text-lg font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                } mb-2`}>No assignments yet</h3>
                <p>Create your first assignment to get started</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${
            isDark ? 'bg-gray-800' : 'bg-white'
          } rounded-xl shadow-xl p-6 max-w-md mx-4 ${
            isDark ? 'border border-gray-700' : ''
          }`}>
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h2 className={`text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Delete All Archived Assignments</h2>
            </div>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Are you sure you want to permanently delete all archived assignments? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 ${
                  isDark 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateAssignmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

const StudentAssignments = () => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const { assignments, loading, fetchAssignments } = useAssignmentStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const upcomingAssignments = assignments
    .filter((assignment) => new Date(assignment.due_date) > new Date())
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  return (
    <div>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Assignments</h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          View and submit your assignments
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
            isDark ? 'border-indigo-400' : 'border-indigo-600'
          }`}></div>
        </div>
      ) : assignments.length > 0 ? (
        <div className="space-y-8">
          {upcomingAssignments.length > 0 && (
            <div className={`${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
            } rounded-xl shadow-sm p-6 border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              } mb-4 flex items-center gap-2`}>
                <Clock className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                Upcoming Deadlines
              </h2>
              <div className="space-y-4">
                {upcomingAssignments.map((assignment) => (
                  <div 
                    key={assignment.id}
                    onClick={() => navigate(`/assignments/${assignment.id}`)}
                    className={`flex items-center justify-between py-3 px-4 rounded-lg ${
                      isDark 
                        ? 'hover:bg-gray-700/50' 
                        : 'hover:bg-gray-50'
                    } cursor-pointer transition-colors`}
                  >
                    <div>
                      <h3 className={`font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{assignment.title}</h3>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${
                      isDark ? 'text-indigo-400' : 'text-indigo-600'
                    }`}>
                      {assignment.points} points
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {assignments.map((assignment) => (
              <AssignmentCard 
                key={assignment.id} 
                {...assignment} 
                isTeacher={false}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className={`text-center py-12 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <div className={`w-16 h-16 ${
            isDark ? 'bg-gray-800' : 'bg-gray-100'
          } rounded-full flex items-center justify-center mx-auto mb-4`}>
            <FileText className={`w-8 h-8 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
          </div>
          <h3 className={`text-lg font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          } mb-2`}>No assignments available</h3>
          <p>Check back later for new assignments</p>
        </div>
      )}
    </div>
  );
};

const Assignments = () => {
  const { user } = useAuthStore();
  return user?.role === 'teacher' ? <TeacherAssignments /> : <StudentAssignments />;
};

export default Assignments;