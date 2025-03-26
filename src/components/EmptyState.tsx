
import React from 'react';
import { ClipboardList } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
        <ClipboardList className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">No tasks yet</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Add your first task above to get started. You can organize tasks with categories and due dates.
      </p>
    </div>
  );
};

export default EmptyState;
