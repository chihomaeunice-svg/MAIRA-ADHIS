import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/firebase';

export function useStorage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(async (
    file: File,
    path: string,
    onProgress?: (pct: number) => void
  ): Promise<string> => {
    setUploading(true);
    setProgress(0);
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(pct);
          onProgress?.(pct);
        },
        (error) => {
          setUploading(false);
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          setProgress(100);
          resolve(url);
        }
      );
    });
  }, []);

  const deleteFile = useCallback(async (path: string) => {
    await deleteObject(ref(storage, path));
  }, []);

  return { uploadFile, deleteFile, uploading, progress };
}
