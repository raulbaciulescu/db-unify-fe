import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`rounded-lg p-5 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow transition-transform duration-200 hover:scale-105`}>
      <div className="flex justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-opacity-20 bg-blue-100 dark:bg-opacity-20 dark:bg-blue-900">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;