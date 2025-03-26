
import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";
import { Task } from "@/types/task";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (task: Task) => {
    setTasks([...tasks, { ...task, id: Date.now().toString() }]);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
      <div className="container mx-auto max-w-4xl">
        <header className="my-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">TaskManager</h1>
          <p className="text-muted-foreground">Organize your life, one task at a time</p>
        </header>
        
        <div className="bg-card/80 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Add New Task</h2>
          <TaskForm onAddTask={addTask} />
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Your Tasks</h2>
          <TaskList 
            tasks={tasks} 
            onDeleteTask={deleteTask} 
            onToggleComplete={toggleComplete} 
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
