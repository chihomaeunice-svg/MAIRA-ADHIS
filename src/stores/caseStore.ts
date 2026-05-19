import { create } from 'zustand';
import { Case, CaseStatus } from '@/types';

interface CaseState {
  cases: Case[];
  selectedCase: Case | null;
  isLoading: boolean;
  filter: CaseStatus | 'ALL';
  searchQuery: string;
  setCases: (cases: Case[]) => void;
  setSelectedCase: (c: Case | null) => void;
  setLoading: (loading: boolean) => void;
  setFilter: (filter: CaseStatus | 'ALL') => void;
  setSearchQuery: (q: string) => void;
  addCase: (c: Case) => void;
  updateCase: (id: string, updates: Partial<Case>) => void;
  removeCase: (id: string) => void;
  filteredCases: () => Case[];
}

export const useCaseStore = create<CaseState>((set, get) => ({
  cases: [],
  selectedCase: null,
  isLoading: false,
  filter: 'ALL',
  searchQuery: '',

  setCases: (cases) => set({ cases }),
  setSelectedCase: (selectedCase) => set({ selectedCase }),
  setLoading: (isLoading) => set({ isLoading }),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  addCase: (c) => set((state) => ({ cases: [c, ...state.cases] })),

  updateCase: (id, updates) =>
    set((state) => ({
      cases: state.cases.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  removeCase: (id) =>
    set((state) => ({ cases: state.cases.filter((c) => c.id !== id) })),

  filteredCases: () => {
    const { cases, filter, searchQuery } = get();
    let result = cases;
    if (filter !== 'ALL') {
      result = result.filter((c) => c.status === filter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.caseNumber.toLowerCase().includes(q) ||
          c.clientName.toLowerCase().includes(q) ||
          c.advocateName.toLowerCase().includes(q)
      );
    }
    return result;
  },
}));
