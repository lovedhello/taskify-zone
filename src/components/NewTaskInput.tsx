
import React, { useState } from 'react';
import { useTaskStore } from '../utils/taskStore';
import { Calendar, PlusCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Priority } from '../types/task';
import { toast } from 'sonner';

const NewTaskInput: React.FC = () => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { addTask, categories, selectedCategory } = useTaskStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const categoryToUse = selectedCategory || (categories.length > 0 ? categories[0].id : 'default');
    
    addTask(title.trim(), priority, categoryToUse, date);
    setTitle('');
    setPriority('medium');
    setDate(undefined);
    toast.success('Task added successfully');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 animate-scale-in">
      <div className="flex flex-col space-y-4">
        <div className="neo-blur rounded-xl overflow-hidden">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task..."
            className="task-input border-0 shadow-none"
            autoFocus
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Priority:</span>
            <div className="flex space-x-1">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`priority-badge ${priority === p ? `priority-${p}` : 'bg-secondary text-secondary-foreground'}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`flex items-center gap-1 text-sm ${
                  date ? 'text-foreground' : 'text-muted-foreground'
                } rounded-lg border px-3 py-1.5 hover:bg-secondary`}
              >
                <Calendar className="h-4 w-4" />
                {date ? format(date, 'MMM d, yyyy') : 'Set due date'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <button
            type="submit"
            className="ml-auto btn-primary flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            Add Task
          </button>
        </div>
      </div>
    </form>
  );
};

export default NewTaskInput;
