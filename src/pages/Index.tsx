
import React from 'react';
import Header from '../components/Header';
import NewTaskInput from '../components/NewTaskInput';
import TaskList from '../components/TaskList';
import CategorySelector from '../components/CategorySelector';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/30">
      <div className="container max-w-3xl py-12 px-4 sm:px-6">
        <Header title="Task Manager" />
        <NewTaskInput />
        <CategorySelector />
        <TaskList />
      </div>
    </div>
  );
};

export default Index;
