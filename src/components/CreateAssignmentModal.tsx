import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useAssignmentStore } from '../store/assignmentStore';
import { X, Upload, Calendar, FileText, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFile } from '../lib/storage';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { createAssignment } = useAssignmentStore();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    points: 100,
    requires_pdf: false,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      let fileUrl = null;

      if (file) {
        fileUrl = await uploadFile(file, 'assignments');
      }

      await createAssignment({
        ...formData,
        teacher_id: user.id,
        file_url: fileUrl,
      });
      toast.success('Assignment created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

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

  // Calculate minimum date (today) and maximum date (1 year from now)
  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + 1);

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative inline-block w-full max-w-2xl bg-white rounded-xl shadow-xl transform transition-all"
          >
            <div className="h-full max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Create New Assignment</h2>
                    <p className="text-sm text-gray-500">Add a new assignment for your students</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter assignment title"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Describe the assignment requirements and objectives"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="datetime-local"
                          id="due_date"
                          value={formData.due_date}
                          min={formatDateForInput(today)}
                          max={formatDateForInput(maxDate)}
                          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                        Points
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          id="points"
                          min="0"
                          max="100"
                          value={formData.points}
                          onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assignment Instructions (PDF)
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

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requires_pdf"
                      checked={formData.requires_pdf}
                      onChange={(e) => setFormData({ ...formData, requires_pdf: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="requires_pdf" className="ml-2 block text-sm text-gray-900">
                      Require PDF submission from students
                    </label>
                  </div>

                  {formData.requires_pdf && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-lg">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-sm">
                        Students will be required to submit their work as a PDF file
                      </p>
                    </div>
                  )}
                </form>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    'Create Assignment'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default CreateAssignmentModal;