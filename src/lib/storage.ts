import { supabase } from './supabase';

export async function uploadFile(file: File, bucket: 'assignments' | 'submissions'): Promise<string> {
  // Get the current user first
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  // Add user ID as folder prefix for submissions
  const filePath = bucket === 'submissions' 
    ? `${user.id}/${fileName}`
    : fileName;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteFile(path: string, bucket: 'assignments' | 'submissions'): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw error;
  }
}