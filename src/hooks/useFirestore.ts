import { useState, useCallback } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/firebase';
import toast from 'react-hot-toast';

export function useFirestore<T extends DocumentData>(collectionName: string) {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (constraints: QueryConstraint[] = []) => {
    setIsLoading(true);
    setError(null);
    try {
      const q = query(collection(db, collectionName), ...constraints, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as (T & { id: string })[];
      setData(items);
      return items;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [collectionName]);

  const fetchWhere = useCallback(async (field: string, operator: '==' | '!=' | '<' | '>' | '<=' | '>=', value: unknown) => {
    return fetchAll([where(field, operator, value)]);
  }, [fetchAll]);

  const create = useCallback(async (item: Omit<T, 'id'>) => {
    try {
      const data = { ...item, createdAt: new Date() };
      const docRef = await addDoc(collection(db, collectionName), data);
      const newItem = { id: docRef.id, ...data } as T & { id: string };
      setData(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      toast.error('Failed to create item');
      throw err;
    }
  }, [collectionName]);

  const update = useCallback(async (id: string, updates: Partial<T>) => {
    try {
      await updateDoc(doc(db, collectionName, id), { ...updates, updatedAt: new Date() });
      setData(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    } catch (err) {
      toast.error('Failed to update item');
      throw err;
    }
  }, [collectionName]);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      toast.error('Failed to delete item');
      throw err;
    }
  }, [collectionName]);

  return { data, isLoading, error, fetchAll, fetchWhere, create, update, remove };
}
