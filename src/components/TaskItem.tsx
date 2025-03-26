
import React from 'react';
import { format } from 'date-fns';
import { Task } from '../types/task';
import { useTaskStore } from '../utils/taskStore';
import { Check, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTask, deleteTask, categories } = useTaskStore();
  
  const category = categories.find(c => c.id === task.category);
  
  const handleDelete = () => {
    deleteTask(task.id);
    toast.success('Task deleted');
  };

  return (
    <div 
      className={`task-item group animate-slide-in ${
        task.completed ? 'opacity-60' : ''
      }`}
      style={{animationDelay: `${parseInt(task.id, 36) % 10 * 50}ms`}}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => toggleTask(task.id)}
          className={`checkbox-container mt-0.5 ${task.completed ? 'checked' : ''}`}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <Check className="checkmark" size={12} />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 
              className={`text-lg font-medium truncate ${
                task.completed ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {task.title}
            </h3>
            <button
              onClick={handleDelete}
              className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete task"
            >
              <Trash2 size={16} className="text-muted-foreground" />
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-y-2 mt-2">
            {category && (
              <span className="category-badge">{category.name}</span>
            )}
            
            <span className={`priority-badge priority-${task.priority}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            
            {task.dueDate && (
              <div className="flex items-center ml-2">
                <Calendar size={12} className="text-muted-foreground mr-1" />
                <span className="due-date">
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
