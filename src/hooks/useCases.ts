import { useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { useCaseStore } from '@/stores/caseStore';
import { Case } from '@/types';
import { mockCases } from '@/data/mockData';
import toast from 'react-hot-toast';

export const useCases = () => {
  const { cases, selectedCase, isLoading, filter, searchQuery, setCases, setLoading, addCase, updateCase, filteredCases } = useCaseStore();

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'cases'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        // Use mock data if no Firebase data
        setCases(mockCases);
      } else {
        const fetchedCases = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate() || new Date(),
          updatedAt: d.data().updatedAt?.toDate() || new Date(),
          filingDate: d.data().filingDate?.toDate() || new Date(),
        })) as Case[];
        setCases(fetchedCases);
      }
    } catch (error) {
      console.warn('Firebase unavailable, using mock data:', error);
      setCases(mockCases);
    } finally {
      setLoading(false);
    }
  }, [setCases, setLoading]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const createCase = async (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCase = {
        ...caseData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        const docRef = await addDoc(collection(db, 'cases'), newCase);
        addCase({ id: docRef.id, ...newCase });
      } catch {
        const id = `local-${Date.now()}`;
        addCase({ id, ...newCase });
      }
      toast.success('Case created successfully');
    } catch (error) {
      toast.error('Failed to create case');
      throw error;
    }
  };

  const editCase = async (id: string, updates: Partial<Case>) => {
    try {
      try {
        await updateDoc(doc(db, 'cases', id), { ...updates, updatedAt: new Date() });
      } catch {
        // Local update only
      }
      updateCase(id, { ...updates, updatedAt: new Date() });
      toast.success('Case updated successfully');
    } catch (error) {
      toast.error('Failed to update case');
      throw error;
    }
  };

  return {
    cases,
    selectedCase,
    isLoading,
    filter,
    searchQuery,
    filteredCases: filteredCases(),
    fetchCases,
    createCase,
    editCase,
  };
};
