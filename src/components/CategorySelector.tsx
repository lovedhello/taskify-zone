
import React from 'react';
import { useTaskStore } from '../utils/taskStore';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

const CategorySelector: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, addCategory } = useTaskStore();
  
  const handleAddCategory = () => {
    const name = prompt('Enter category name');
    if (name && name.trim().length > 0) {
      addCategory(name.trim());
      toast.success(`Added category "${name.trim()}"`);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-1 mb-6 animate-slide-up delay-100">
      <button
        onClick={() => setSelectedCategory(null)}
        className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
      >
        All
      </button>
      
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelectedCategory(category.id)}
          className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
        >
          {category.name}
        </button>
      ))}
      
      <button 
        onClick={handleAddCategory}
        className="p-2 rounded-full bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-colors duration-200"
      >
        <PlusCircle className="h-5 w-5" />
      </button>
    </div>
  );
};

export default CategorySelector;
