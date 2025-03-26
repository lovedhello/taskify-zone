
import React, { useState } from 'react';
import { useTaskStore } from '../utils/taskStore';
import TaskItem from './TaskItem';
import EmptyState from './EmptyState';
import { Task } from '../types/task';

const TaskList: React.FC = () => {
  const { tasks, selectedCategory } = useTaskStore();
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Filter tasks based on selected category
  const filteredTasks = tasks.filter(task => 
    (selectedCategory === null || task.category === selectedCategory) &&
    (showCompleted || !task.completed)
  );
  
  // Sort tasks: incomplete first, then by priority (high to low), then by date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // Then by due date (if available)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    // Then by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const completedCount = tasks.filter(task => 
    (selectedCategory === null || task.category === selectedCategory) && 
    task.completed
  ).length;
  
  const totalCount = tasks.filter(task => 
    (selectedCategory === null || task.category === selectedCategory)
  ).length;

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  if (filteredTasks.length === 0 && !showCompleted) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <p className="text-muted-foreground mb-4">No active tasks in this category</p>
        {completedCount > 0 && (
          <button
            onClick={() => setShowCompleted(true)}
            className="btn-secondary"
          >
            Show completed tasks
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {selectedCategory === null ? 'All Tasks' : 'Tasks'}
        </h2>
        
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground mr-4">
            {completedCount} of {totalCount} completed
          </span>
          
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-sm btn-secondary"
          >
            {showCompleted ? 'Hide completed' : 'Show completed'}
          </button>
        </div>
      </div>
      
      <div className="space-y-1">
        {sortedTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default TaskList;
