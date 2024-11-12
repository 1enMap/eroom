import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useAuthStore } from '../../store/authStore';

interface CreateAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateAssignmentDialog({ isOpen, onClose }: CreateAssignmentDialogProps) {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(100);
  const [deadline, setDeadline] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createAssignment } = useAssignmentStore();

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
      // In a real app, we would upload the file to a storage service
      const fileUrl = URL.createObjectURL(file);
      
      await createAssignment({
        title,
        description,
        points,
        deadline,
        fileUrl,
        teacherId: user.id,
      });

      toast.success('Assignment created successfully!');
      onClose();
      
      // Reset form
      setTitle('');
      setDescription('');
      setPoints(100);
      setDeadline('');
      setFile(null);
    } catch (error) {
      toast.error('Failed to create assignment');
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
                Create New Assignment
              </h3>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="points" className="block text-sm font-medium text-gray-700">
                    Points
                  </label>
                  <input
                    type="number"
                    id="points"
                    required
                    min="1"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    id="deadline"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Assignment PDF
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
                            : 'Drag and drop a PDF file, or click to select'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:w-auto disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Assignment'}
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