import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useAuthStore } from '../../store/authStore';
import { Upload, Calendar } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

export default function UploadAssignment() {
  const navigate = useNavigate();
  const { createAssignment } = useAssignmentStore();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(10);
  const [deadline, setDeadline] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!file || !user) return;

    setIsSubmitting(true);
    try {
      // In a real app, upload file to storage and get URL
      const fileUrl = URL.createObjectURL(file);
      
      await createAssignment({
        title,
        description,
        points,
        deadline,
        fileUrl,
        teacherId: user.id
      });

      toast.success('Assignment created successfully!');
      navigate('/assignments');
    } catch (error) {
      toast.error('Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Create New Assignment
          </h3>
          
          <form onSubmit={handleSubmit} className="mt-5 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="points" className="block text-sm font-medium text-gray-700">
                  Points
                </label>
                <input
                  type="number"
                  id="points"
                  min="1"
                  required
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                  Deadline
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="datetime-local"
                    id="deadline"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="block w-full pl-10 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assignment PDF
              </label>
              <div
                {...getRootProps()}
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
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

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/assignments')}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !file}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}