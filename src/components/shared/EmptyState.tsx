import React from 'react';
import { clsx } from 'clsx';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className }) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && <div className="mb-4 text-gray-300">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-md mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
