import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Case } from '@/types';
import { mockEmployees, mockClients } from '@/data/mockData';

const caseSchema = z.object({
  caseNumber: z.string().min(1, 'Case number is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  courtName: z.string().min(3, 'Court name is required'),
  plaintiff: z.string().min(1, 'Plaintiff is required'),
  defendant: z.string().min(1, 'Defendant is required'),
  advocateId: z.string().min(1, 'Advocate is required'),
  clientId: z.string().min(1, 'Client is required'),
  filingDate: z.string().min(1, 'Filing date is required'),
  status: z.enum(['NEW', 'ONGOING', 'COMPLETED', 'ARCHIVED']),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

type CaseFormData = z.infer<typeof caseSchema>;

interface CaseFormProps {
  onSubmit: (data: Partial<Case>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<Case>;
}

const advocateOptions = mockEmployees
  .filter(e => e.department === 'Legal')
  .map(e => ({ value: e.id, label: e.fullName }));

const clientOptions = mockClients.map(c => ({ value: c.id, label: c.fullName }));

const categoryOptions = [
  { value: 'Commercial & Corporate', label: 'Commercial & Corporate' },
  { value: 'Family Matters', label: 'Family Matters' },
  { value: 'Conveyances & Property', label: 'Conveyances & Property' },
  { value: 'Labour Law', label: 'Labour Law' },
  { value: 'Criminal Defense', label: 'Criminal Defense' },
  { value: 'Notary Public', label: 'Notary Public' },
];

const CaseForm: React.FC<CaseFormProps> = ({ onSubmit, onCancel, isLoading, initialData }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      caseNumber: initialData?.caseNumber || '',
      title: initialData?.title || '',
      courtName: initialData?.courtName || '',
      plaintiff: initialData?.partiesNames?.plaintiff || '',
      defendant: initialData?.partiesNames?.defendant || '',
      advocateId: initialData?.advocateId || '',
      clientId: initialData?.clientId || '',
      filingDate: initialData?.filingDate ? new Date(initialData.filingDate).toISOString().split('T')[0] : '',
      status: (initialData?.status as 'NEW' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED') || 'NEW',
      category: initialData?.category || '',
      description: initialData?.description || '',
    },
  });

  const handleFormSubmit = (data: CaseFormData) => {
    const advocate = mockEmployees.find(e => e.id === data.advocateId);
    const client = mockClients.find(c => c.id === data.clientId);
    onSubmit({
      caseNumber: data.caseNumber,
      title: data.title,
      courtName: data.courtName,
      partiesNames: { plaintiff: data.plaintiff, defendant: data.defendant },
      advocateId: data.advocateId,
      advocateName: advocate?.fullName || '',
      clientId: data.clientId,
      clientName: client?.fullName || '',
      filingDate: new Date(data.filingDate),
      status: data.status,
      category: data.category,
      description: data.description,
      hearingDates: initialData?.hearingDates || [],
      notes: initialData?.notes || [],
      documents: initialData?.documents || [],
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Case Number" error={errors.caseNumber?.message} {...register('caseNumber')} placeholder="HC/CIV/001/2024" required />
        <Input label="Filing Date" type="date" error={errors.filingDate?.message} {...register('filingDate')} required />
      </div>
      <Input label="Case Title" error={errors.title?.message} {...register('title')} placeholder="Plaintiff v. Defendant - Nature of Case" required />
      <Input label="Court Name" error={errors.courtName?.message} {...register('courtName')} placeholder="High Court of Tanzania" required />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Plaintiff" error={errors.plaintiff?.message} {...register('plaintiff')} required />
        <Input label="Defendant" error={errors.defendant?.message} {...register('defendant')} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Assigned Advocate" options={advocateOptions} error={errors.advocateId?.message} {...register('advocateId')} placeholder="Select advocate" required />
        <Select label="Client" options={clientOptions} error={errors.clientId?.message} {...register('clientId')} placeholder="Select client" required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Category" options={categoryOptions} error={errors.category?.message} {...register('category')} placeholder="Select category" required />
        <Select label="Status" options={[
          { value: 'NEW', label: 'New' },
          { value: 'ONGOING', label: 'Ongoing' },
          { value: 'COMPLETED', label: 'Completed' },
          { value: 'ARCHIVED', label: 'Archived' },
        ]} error={errors.status?.message} {...register('status')} required />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Describe the nature of the case..."
        />
        {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>{initialData?.id ? 'Update Case' : 'Create Case'}</Button>
      </div>
    </form>
  );
};

export default CaseForm;
