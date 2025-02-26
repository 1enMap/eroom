import React, { useEffect } from 'react';
import { useAssignmentStore } from '../store/assignmentStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { FileText, Clock, User, Download } from 'lucide-react';
import { toast } from 'sonner';

const Submissions = () => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const { submissions, loading, fetchSubmissions } = useAssignmentStore();

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const downloadFile = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to download file');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = url.split('/').pop() || 'download.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
          isDark ? 'border-indigo-400' : 'border-indigo-600'
        }`}></div>
      </div>
    );
  }

  if (!submissions.length) {
    return (
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
        } mb-2`}>No submissions yet</h3>
        <p>
          {user?.role === 'teacher' 
            ? "Students haven't submitted any assignments yet"
            : "You haven't submitted any assignments yet"
          }
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className={`text-2xl font-bold ${
        isDark ? 'text-white' : 'text-gray-900'
      } mb-6`}>Submissions</h1>
      
      <div className="space-y-6">
        {submissions.map((submission) => (
          <div key={submission.id} className={`${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'
          } rounded-xl shadow-sm p-6 border ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {submission.assignment.title}
                </h3>
                {user?.role === 'teacher' && (
                  <div className={`flex items-center gap-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  } mt-1`}>
                    <User className="w-4 h-4" />
                    <span>{submission.student.full_name}</span>
                  </div>
                )}
              </div>
              <div className={`flex items-center gap-2 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(submission.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            
            <p className={`${
              isDark ? 'text-gray-300' : 'text-gray-600'
            } mb-4 whitespace-pre-wrap`}>{submission.content}</p>
            
            {submission.file_url && (
              <button
                onClick={() => downloadFile(submission.file_url)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors`}
              >
                <Download className="w-4 h-4" />
                Download Submission
              </button>
            )}

            {submission.grade !== null && (
              <div className={`mt-4 pt-4 border-t ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Grade:</span>
                  <span className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {submission.grade}/{submission.assignment.points}
                  </span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    ({((submission.grade / submission.assignment.points) * 100).toFixed(1)}%)
                  </span>
                </div>
                {submission.feedback && (
                  <div className={`mt-2 ${
                    isDark ? 'bg-indigo-900/20' : 'bg-blue-50'
                  } rounded-lg p-4`}>
                    <h4 className={`text-sm font-medium ${
                      isDark ? 'text-indigo-300' : 'text-blue-900'
                    } mb-1`}>Feedback</h4>
                    <p className={isDark ? 'text-indigo-200' : 'text-blue-800'}>
                      {submission.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Submissions;