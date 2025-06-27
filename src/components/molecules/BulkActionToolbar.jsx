import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import taskService from '@/services/api/taskService';

const BulkActionToolbar = ({ selectedTasks, onTasksUpdated, onSelectionCleared }) => {
  const [loading, setLoading] = useState(false);

  const handleMarkComplete = async () => {
    if (selectedTasks.length === 0) return;

    setLoading(true);
    try {
      const taskIds = selectedTasks.map(task => task.Id);
      const result = await taskService.bulkUpdate(taskIds, { completed: true });
      
      result.updated.forEach(task => onTasksUpdated(task));
      
      toast.success(`${result.updated.length} task${result.updated.length !== 1 ? 's' : ''} marked as complete`);
      
      if (result.errors.length > 0) {
        toast.warning(`Some tasks could not be updated: ${result.errors.length} errors`);
      }
      
      onSelectionCleared();
    } catch (error) {
      toast.error('Failed to mark tasks as complete');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkIncomplete = async () => {
    if (selectedTasks.length === 0) return;

    setLoading(true);
    try {
      const taskIds = selectedTasks.map(task => task.Id);
      const result = await taskService.bulkUpdate(taskIds, { completed: false });
      
      result.updated.forEach(task => onTasksUpdated(task));
      
      toast.success(`${result.updated.length} task${result.updated.length !== 1 ? 's' : ''} marked as incomplete`);
      
      if (result.errors.length > 0) {
        toast.warning(`Some tasks could not be updated: ${result.errors.length} errors`);
      }
      
      onSelectionCleared();
    } catch (error) {
      toast.error('Failed to mark tasks as incomplete');
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (priority) => {
    if (selectedTasks.length === 0) return;

    setLoading(true);
    try {
      const taskIds = selectedTasks.map(task => task.Id);
      const result = await taskService.bulkUpdate(taskIds, { priority });
      
      result.updated.forEach(task => onTasksUpdated(task));
      
      toast.success(`${result.updated.length} task${result.updated.length !== 1 ? 's' : ''} updated to ${priority} priority`);
      
      if (result.errors.length > 0) {
        toast.warning(`Some tasks could not be updated: ${result.errors.length} errors`);
      }
      
      onSelectionCleared();
    } catch (error) {
      toast.error('Failed to update task priorities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedTasks.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedTasks.length} task${selectedTasks.length !== 1 ? 's' : ''}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const taskIds = selectedTasks.map(task => task.Id);
      const result = await taskService.bulkDelete(taskIds);
      
      result.deleted.forEach(task => onTasksUpdated(task, 'delete'));
      
      toast.success(`${result.deleted.length} task${result.deleted.length !== 1 ? 's' : ''} deleted`);
      
      if (result.errors.length > 0) {
        toast.warning(`Some tasks could not be deleted: ${result.errors.length} errors`);
      }
      
      onSelectionCleared();
    } catch (error) {
      toast.error('Failed to delete tasks');
    } finally {
      setLoading(false);
    }
  };

  if (selectedTasks.length === 0) return null;

  const hasCompletedTasks = selectedTasks.some(task => task.completed);
  const hasIncompleteTasks = selectedTasks.some(task => !task.completed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="gradient-primary rounded-lg p-4 shadow-lg backdrop-blur-sm border border-white/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <ApperIcon name="CheckSquare" size={20} />
            <span className="font-medium">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="w-px h-6 bg-white/30" />

          <div className="flex items-center gap-2">
            {hasIncompleteTasks && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkComplete}
                disabled={loading}
                className="text-white hover:bg-white/10 border-white/30"
              >
                <ApperIcon name="Check" size={16} />
                Complete
              </Button>
            )}

            {hasCompletedTasks && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkIncomplete}
                disabled={loading}
                className="text-white hover:bg-white/10 border-white/30"
              >
                <ApperIcon name="RotateCcw" size={16} />
                Restore
              </Button>
            )}

            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                disabled={loading}
                className="text-white hover:bg-white/10 border-white/30"
              >
                <ApperIcon name="Flag" size={16} />
                Priority
                <ApperIcon name="ChevronDown" size={14} />
              </Button>
              
              <div className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <button
                  onClick={() => handlePriorityChange('high')}
                  disabled={loading}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-t-lg transition-colors"
                >
                  <ApperIcon name="AlertCircle" size={14} className="inline mr-2" />
                  High
                </button>
                <button
                  onClick={() => handlePriorityChange('medium')}
                  disabled={loading}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
                >
                  <ApperIcon name="Circle" size={14} className="inline mr-2" />
                  Medium
                </button>
                <button
                  onClick={() => handlePriorityChange('low')}
                  disabled={loading}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-b-lg transition-colors"
                >
                  <ApperIcon name="Minus" size={14} className="inline mr-2" />
                  Low
                </button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="text-white hover:bg-red-500/20 border-red-300/30"
            >
              <ApperIcon name="Trash2" size={16} />
              Delete
            </Button>

            <div className="w-px h-6 bg-white/30" />

            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectionCleared}
              disabled={loading}
              className="text-white hover:bg-white/10 border-white/30"
            >
              <ApperIcon name="X" size={16} />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BulkActionToolbar;