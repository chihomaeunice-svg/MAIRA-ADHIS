export type UserRole = 'ADMIN' | 'MANAGING_PARTNER' | 'ADVOCATE' | 'SECRETARY' | 'ACCOUNTANT' | 'PROCUREMENT_OFFICER' | 'EMPLOYEE';

export interface FirestoreUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export type CaseStatus = 'NEW' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: Date;
}

export interface HearingDate {
  id: string;
  date: Date;
  venue: string;
  purpose: string;
  outcome?: string;
}

export interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
}

export interface DocumentRef {
  id: string;
  name: string;
  url: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  courtName: string;
  partiesNames: { plaintiff: string; defendant: string };
  advocateId: string;
  advocateName: string;
  clientId: string;
  clientName: string;
  filingDate: Date;
  hearingDates: HearingDate[];
  status: CaseStatus;
  category: string;
  description: string;
  notes: Note[];
  documents: DocumentRef[];
  judgment?: string;
  opposingCounsel?: string;
  judgeName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  idNumber?: string;
  clientType: 'INDIVIDUAL' | 'CORPORATE';
  companyName?: string;
  companyReg?: string;
  cases: string[];
  createdAt: Date;
}

export type DocumentCategory = 'CERTIFICATE' | 'TAX' | 'BRELA' | 'CONTRACT' | 'POLICY' | 'COURT' | 'LAND_TRIBUNAL' | 'MUNICIPAL' | 'OTHER';

export interface Document {
  id: string;
  name: string;
  category: DocumentCategory;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  relatedCaseId?: string;
  relatedClientId?: string;
  expiryDate?: Date;
  createdAt: Date;
}

export interface Employee {
  id: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  salary: number;
  contractStartDate: Date;
  contractEndDate?: Date;
  status: 'ACTIVE' | 'INACTIVE';
  leaveBalance: number;
  createdAt: Date;
}

export type ExpenseCategory = 'RENT' | 'UTILITIES' | 'STATIONERY' | 'TRANSPORT' | 'SALARY' | 'MISCELLANEOUS';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: Date;
  approvedBy?: string;
  receiptUrl?: string;
}

export type ProcurementStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED';

export interface Procurement {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplier: string;
  status: ProcurementStatus;
  requestedBy: string;
  approvedBy?: string;
  date: Date;
}

export type CorrespondenceType = 'LETTER' | 'EMAIL' | 'COURT_NOTICE' | 'DEMAND_NOTICE' | 'LEGAL_NOTICE';

export interface Correspondence {
  id: string;
  type: CorrespondenceType;
  reference: string;
  subject: string;
  fromParty: string;
  toParty: string;
  date: Date;
  direction: 'SENT' | 'RECEIVED';
  relatedCaseId?: string;
  documentUrl?: string;
}

export type CalendarEventType = 'HEARING' | 'MEETING' | 'DEADLINE' | 'REMINDER';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  type: CalendarEventType;
  relatedCaseId?: string;
  participants?: string[];
  location?: string;
  notes?: string;
}

export interface DashboardStats {
  activeCases: number;
  newThisMonth: number;
  upcomingHearings: number;
  totalClients: number;
  pendingTasks: number;
  monthlyExpenses: number;
}
