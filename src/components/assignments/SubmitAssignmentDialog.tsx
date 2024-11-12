import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface SubmitAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
}

export default function SubmitAssignmentDialog({ isOpen, onClose, assignmentId }: SubmitAssignmentDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitAssignment } = useAssignmentStore();
  const { user } = useAuthStore();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitAssignment({
        assignmentId,
        studentId: user.id,
        studentName: user.name, // Add student name to submission
        fileUrl: URL.createObjectURL(file),
      });
      toast.success('Assignment submitted successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 w-full text-left sm:mt-0">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Submit Assignment
              </h3>

              <form onSubmit={handleSubmit} className="mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Your Work (PDF)
                  </label>
                  <div
                    {...getRootProps()}
                    className={`mt-1 flex justify-center rounded-md border-2 border-dashed px-6 pt-5 pb-6 ${
                      isDragActive ? 'border-indigo-500' : 'border-gray-300'
                    }`}
                  >
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <input {...getInputProps()} />
                        <p className="pl-1">
                          {file 
                            ? file.name 
                            : isDragActive
                            ? 'Drop the PDF here'
                            : 'Drag and drop your PDF file, or click to select'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting || !file}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:w-auto disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}