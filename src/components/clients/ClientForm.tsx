import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Client } from '@/types';

const clientSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address is required'),
  idNumber: z.string().optional(),
  clientType: z.enum(['INDIVIDUAL', 'CORPORATE']),
  companyName: z.string().optional(),
  companyReg: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  onSubmit: (data: Partial<Client>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<Client>;
}

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, onCancel, isLoading, initialData }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      idNumber: initialData?.idNumber || '',
      clientType: initialData?.clientType || 'INDIVIDUAL',
      companyName: initialData?.companyName || '',
      companyReg: initialData?.companyReg || '',
    },
  });

  const clientType = watch('clientType');

  const handleFormSubmit = (data: ClientFormData) => {
    onSubmit({ ...data, cases: initialData?.cases || [] });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Select label="Client Type" options={[{ value: 'INDIVIDUAL', label: 'Individual' }, { value: 'CORPORATE', label: 'Corporate' }]} {...register('clientType')} required />
      <Input label="Full Name" error={errors.fullName?.message} {...register('fullName')} placeholder={clientType === 'CORPORATE' ? 'Company Name' : 'Full Name'} required />
      {clientType === 'CORPORATE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Company Name" {...register('companyName')} placeholder="Legal company name" />
          <Input label="Company Reg. Number" {...register('companyReg')} placeholder="REG-XXXX-TZ-XXXX" />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Phone" error={errors.phone?.message} {...register('phone')} placeholder="+255 7XX XXX XXX" required />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} placeholder="client@email.com" required />
      </div>
      <Input label="Address" error={errors.address?.message} {...register('address')} placeholder="Street, Area, City" required />
      {clientType === 'INDIVIDUAL' && (
        <Input label="ID Number (NIDA)" {...register('idNumber')} placeholder="TZ-XXXXXXXX-XXXX-X" />
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>{initialData?.id ? 'Update Client' : 'Add Client'}</Button>
      </div>
    </form>
  );
};

export default ClientForm;
