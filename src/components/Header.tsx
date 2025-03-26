
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="flex items-center justify-between pb-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <CheckCircle className="h-5 w-5 text-primary" />
        </div>
        <h1 className="heading-xl">{title}</h1>
      </div>
    </header>
  );
};

export default Header;
