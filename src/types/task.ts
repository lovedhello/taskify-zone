
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate?: Date;
  createdAt: Date;
}

export type Category = {
  id: string;
  name: string;
}
