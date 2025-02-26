import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Upload, Download, Clock, FileText, CheckCircle, AlertCircle, Star, User } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFile } from '../lib/storage';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  points: number;
  file_url: string | null;
  teacher_id: string;
  requires_pdf: boolean;
}

interface Submission {
  id: string;
  content: string;
  file_url: string | null;
  grade: number | null;
  feedback: string | null;
  created_at: string;
  student: {
    id: string;
    full_name: string;
  };
}

const AssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [grading, setGrading] = useState({
    grade: 0,
    feedback: '',
  });
  const [isGrading, setIsGrading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) return;
      
      try {
        const { data: assignment, error: assignmentError } = await supabase
          .from('assignments')
          .select('*')
          .eq('id', id)
          .single();

        if (assignmentError) throw assignmentError;
        setAssignment(assignment);

        if (user) {
          if (user.role === 'teacher') {
            // Fetch all submissions for teachers
            const { data: submissions, error: submissionsError } = await supabase
              .from('submissions')
              .select(`
                *,
                student:profiles(id, full_name)
              `)
              .eq('assignment_id', id)
              .order('created_at', { ascending: false });

            if (submissionsError) throw submissionsError;
            setSubmissions(submissions || []);
          } else {
            // Fetch student's own submission
            const { data: submission, error: submissionError } = await supabase
              .from('submissions')
              .select(`
                *,
                student:profiles(id, full_name)
              `)
              .eq('assignment_id', id)
              .eq('student_id', user.id)
              .maybeSingle();

            if (submissionError) throw submissionError;
            if (submission) {
              setSubmission(submission);
              setContent(submission.content);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching assignment:', error);
        toast.error('Failed to load assignment');
        navigate('/assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id, user, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        if (selectedFile.size <= 10 * 1024 * 1024) { // 10MB limit
          setFile(selectedFile);
        } else {
          toast.error('PDF file must be smaller than 10MB');
          e.target.value = '';
        }
      } else {
        toast.error('Please select a PDF file');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !assignment) return;

    try {
      setSubmitting(true);
      let fileUrl = null;

      if (file) {
        fileUrl = await uploadFile(file, 'submissions');
      }

      const { data, error } = await supabase
        .rpc('submit_assignment', {
          p_assignment_id: assignment.id,
          p_content: content,
          p_file_url: fileUrl
        });

      if (error) throw error;

      toast.success('Assignment submitted successfully');
      
      const { data: newSubmission, error: submissionError } = await supabase
        .from('submissions')
        .select(`
          *,
          student:profiles(id, full_name)
        `)
        .eq('id', data)
        .single();

      if (submissionError) throw submissionError;
      
      setSubmission(newSubmission);
    } catch (error: any) {
      console.error('Error submitting assignment:', error);
      toast.error(error.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrade = async (submissionId: string) => {
    if (!assignment) return;

    try {
      setIsGrading(true);

      // Validate grade
      if (grading.grade < 0 || grading.grade > assignment.points) {
        toast.error(`Grade must be between 0 and ${assignment.points} points`);
        return;
      }

      const { error } = await supabase
        .from('submissions')
        .update({
          grade: grading.grade,
          feedback: grading.feedback.trim() || null
        })
        .eq('id', submissionId);

      if (error) throw error;
      
      toast.success('Submission graded successfully');
      
      // Refresh submissions list
      const { data: updatedSubmissions } = await supabase
        .from('submissions')
        .select(`
          *,
          student:profiles(id, full_name)
        `)
        .eq('assignment_id', id)
        .order('created_at', { ascending: false });
        
      setSubmissions(updatedSubmissions || []);
      setSelectedSubmission(null);
      setGrading({ grade: 0, feedback: '' });
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error('Failed to grade submission');
    } finally {
      setIsGrading(false);
    }
  };

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Assignment not found</p>
      </div>
    );
  }

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const isPastDue = new Date(assignment.due_date) < new Date();
  const timeRemaining = new Date(assignment.due_date).getTime() - new Date().getTime();
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Assignment Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
            <div className="flex items-center gap-4 text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Due: {new Date(assignment.due_date).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{assignment.points} points</span>
              </div>
              {isTeacher && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{submissions.length} submissions</span>
                </div>
              )}
            </div>
          </div>
          {isStudent && (
            <div className={`px-4 py-2 rounded-lg ${
              isPastDue
                ? 'bg-red-100 text-red-700'
                : submission
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {isPastDue ? (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Past Due</span>
                </div>
              ) : submission ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Submitted</span>
                </div>
              ) : (
                <span>{daysRemaining} days remaining</span>
              )}
            </div>
          )}
        </div>

        <div className="prose max-w-none mb-6">
          <p className="text-gray-600">{assignment.description}</p>
        </div>

        {assignment.file_url && (
          <button
            onClick={() => downloadFile(assignment.file_url!)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Assignment Instructions
          </button>
        )}

        {assignment.requires_pdf && (
          <div className="mt-4 flex items-center gap-2 text-indigo-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">This assignment requires a PDF submission</span>
          </div>
        )}
      </div>

      {/* Teacher's View - Submissions List */}
      {isTeacher && (
        <div className="space-y-6">
          {submissions.length > 0 ? (
            submissions.map((sub) => (
              <div key={sub.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {sub.student.full_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Submitted on {new Date(sub.created_at).toLocaleString()}
                    </p>
                  </div>
                  {sub.grade !== null ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">
                        {sub.grade}/{assignment.points} points
                      </span>
                    </div>
                  ) : (
                    <div className="text-amber-600">
                      Needs Grading
                    </div>
                  )}
                </div>

                {selectedSubmission === sub.id ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Student's Answer</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{sub.content}</p>
                    </div>

                    {sub.file_url && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Attached PDF</h4>
                        <button
                          onClick={() => downloadFile(sub.file_url!)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download Submission
                        </button>
                      </div>
                    )}

                    {sub.grade === null && (
                      <div className="border-t border-gray-200 pt-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Grade (out of {assignment.points} points)
                          </label>
                          <div className="flex items-center gap-4">
                            <input
                              type="number"
                              min="0"
                              max={assignment.points}
                              value={grading.grade}
                              onChange={(e) => setGrading({ ...grading, grade: parseInt(e.target.value) || 0 })}
                              className="w-24 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <div className="flex items-center gap-2 text-gray-500">
                              <Star className="w-4 h-4" />
                              <span>{((grading.grade / assignment.points) * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Feedback
                          </label>
                          <textarea
                            value={grading.feedback}
                            onChange={(e) => setGrading({ ...grading, feedback: e.target.value })}
                            rows={4}
                            placeholder="Provide constructive feedback..."
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>

                        <div className="flex justify-end gap-4">
                          <button
                            onClick={() => {
                              setSelectedSubmission(null);
                              setGrading({ grade: 0, feedback: '' });
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleGrade(sub.id)}
                            disabled={isGrading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                          >
                            {isGrading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                <span>Submit Grade</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {sub.grade !== null && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">Grade:</span>
                            <span className="text-lg font-semibold text-gray-900">
                              {sub.grade}/{assignment.points}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Star className="w-4 h-4" />
                            <span>{((sub.grade / assignment.points) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                        {sub.feedback && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Your Feedback</h4>
                            <p className="text-blue-800">{sub.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedSubmission(sub.id);
                      if (sub.grade !== null) {
                        setGrading({
                          grade: sub.grade,
                          feedback: sub.feedback || ''
                        });
                      }
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View Details
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No submissions yet</h3>
              <p className="text-gray-500">
                Students haven't submitted any work for this assignment
              </p>
            </div>
          )}
        </div>
      )}

      {/* Student Submission Form */}
      {isStudent && !submission && !isPastDue && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Your Work</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Answer
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Write your answer here..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {assignment.requires_pdf ? 'Upload PDF (Required)' : 'Upload PDF (Optional)'}
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".pdf,application/pdf"
                        className="sr-only"
                        onChange={handleFileChange}
                        required={assignment.requires_pdf}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  {file && (
                    <p className="text-sm text-indigo-600">{file.name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Make sure to review your work before submitting
              </div>
              <button
                type="submit"
                disabled={submitting || (assignment.requires_pdf && !file)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student Submission View */}
      {isStudent && submission && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Submission</h2>
            <div className="text-sm text-gray-500">
              Submitted on {new Date(submission.created_at).toLocaleString()}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Your Answer</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{submission.content}</p>
            </div>
            
            {submission.file_url && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Attached PDF</h3>
                <button
                  onClick={() => downloadFile(submission.file_url!)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Your Submission
                </button>
              </div>
            )}

            {submission.grade !== null && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Grade:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {submission.grade}/{assignment.points}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({((submission.grade / assignment.points) * 100).toFixed(1)}%)
                  </span>
                </div>
                {submission.feedback && (
                  <div className="bg-blue-50 rounded-lg p-4 mt-2">
                    <h3 className="text-sm font-medium text-blue-900 mb-1">Teacher Feedback</h3>
                    <p className="text-blue-800">{submission.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetails;