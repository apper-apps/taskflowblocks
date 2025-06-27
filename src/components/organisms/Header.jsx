import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import QuickAddForm from '@/components/molecules/QuickAddForm';

const Header = ({ onMenuToggle, onSearch, onTaskAdded, projects = [] }) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  return (
    <>
      <header className="flex-shrink-0 h-16 bg-white border-b border-gray-200 z-40">
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="Menu" size={20} className="text-gray-600" />
            </button>
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center"
              >
                <ApperIcon name="CheckSquare" size={16} className="text-white" />
              </motion.div>
              <h1 className="text-xl font-display font-bold text-gray-900 hidden sm:block">
                TaskFlow
              </h1>
            </div>
          </div>

          {/* Center Section - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar 
              onSearch={onSearch}
              placeholder="Search tasks, projects..."
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Mobile Search Button */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ApperIcon name="Search" size={18} className="text-gray-600" />
            </button>

            {/* Quick Add Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowQuickAdd(true)}
                size="md"
                icon="Plus"
                className="shadow-lg"
              >
                <span className="hidden sm:inline">Add Task</span>
              </Button>
            </motion.div>

            {/* Notifications */}
            <button className="hidden sm:flex p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <ApperIcon name="Bell" size={18} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></span>
            </button>

            {/* Profile */}
            <button className="hidden sm:flex p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ApperIcon name="User" size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {showQuickAdd && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowQuickAdd(false)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <QuickAddForm
                  onTaskAdded={(task) => {
                    onTaskAdded?.(task);
                    setShowQuickAdd(false);
                  }}
                  onClose={() => setShowQuickAdd(false)}
                  projects={projects}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;