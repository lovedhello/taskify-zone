
import { create } from 'zustand';
import { Task, Priority, Category } from '../types/task';
import { persist } from 'zustand/middleware';

interface TaskState {
  tasks: Task[];
  categories: Category[];
  selectedCategory: string | null;
  addTask: (title: string, priority: Priority, category: string, dueDate?: Date) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addCategory: (name: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
}

const defaultCategories: Category[] = [
  { id: 'work', name: 'Work' },
  { id: 'personal', name: 'Personal' },
  { id: 'errands', name: 'Errands' },
];

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      categories: defaultCategories,
      selectedCategory: null,
      
      addTask: (title, priority, category, dueDate) => 
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: Math.random().toString(36).substr(2, 9),
              title,
              completed: false,
              priority,
              category,
              dueDate,
              createdAt: new Date(),
            },
          ],
        })),
      
      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        })),
      
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      
      addCategory: (name) =>
        set((state) => ({
          categories: [
            ...state.categories,
            {
              id: Math.random().toString(36).substr(2, 9),
              name,
            },
          ],
        })),
      
      setSelectedCategory: (categoryId) =>
        set({ selectedCategory: categoryId }),
    }),
    {
      name: 'task-storage',
    }
  )
);
