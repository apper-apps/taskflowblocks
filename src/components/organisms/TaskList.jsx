import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskItem from '@/components/molecules/TaskItem';
import EmptyState from '@/components/molecules/EmptyState';
import BulkActionToolbar from '@/components/molecules/BulkActionToolbar';
import ApperIcon from '@/components/ApperIcon';
import Checkbox from '@/components/atoms/Checkbox';

const TaskList = ({ 
  tasks = [], 
  projects = [], 
  onTaskUpdate, 
  onTaskDelete, 
  showProject = true,
  emptyStateProps = {},
  enableBulkActions = true
}) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Reset selection when tasks change significantly
  useEffect(() => {
    const taskIds = new Set(tasks.map(t => t.Id));
    const currentSelections = new Set([...selectedTaskIds].filter(id => taskIds.has(id)));
    
    if (currentSelections.size !== selectedTaskIds.size) {
      setSelectedTaskIds(currentSelections);
      if (currentSelections.size === 0) {
        setSelectionMode(false);
      }
    }
  }, [tasks, selectedTaskIds]);

  const handleTaskSelection = (taskId, isSelected) => {
    const newSelection = new Set(selectedTaskIds);
    
    if (isSelected) {
      newSelection.add(taskId);
      if (!selectionMode) {
        setSelectionMode(true);
      }
    } else {
      newSelection.delete(taskId);
      if (newSelection.size === 0) {
        setSelectionMode(false);
      }
    }
    
    setSelectedTaskIds(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.size === tasks.length) {
      setSelectedTaskIds(new Set());
      setSelectionMode(false);
    } else {
      setSelectedTaskIds(new Set(tasks.map(t => t.Id)));
      setSelectionMode(true);
    }
  };

  const handleTaskUpdated = (updatedTask, action = 'update') => {
    if (action === 'delete') {
      onTaskDelete?.(updatedTask.Id);
    } else {
      onTaskUpdate?.(updatedTask);
    }
  };

  const handleSelectionCleared = () => {
    setSelectedTaskIds(new Set());
    setSelectionMode(false);
  };

  const selectedTasks = tasks.filter(task => selectedTaskIds.has(task.Id));
  const allSelected = tasks.length > 0 && selectedTaskIds.size === tasks.length;
  const someSelected = selectedTaskIds.size > 0 && selectedTaskIds.size < tasks.length;
  const getProjectForTask = (projectId) => {
    return projects.find(p => p.Id === projectId);
  };

if (tasks.length === 0) {
    return (
      <EmptyState
        icon="CheckSquare"
        title="No tasks found"
        description="Create your first task to get started with TaskFlow"
        actionLabel="Add Task"
        {...emptyStateProps}
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Bulk Selection Header */}
        {enableBulkActions && tasks.length > 1 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={handleSelectAll}
            />
            <span className="text-sm text-gray-600">
              {selectedTaskIds.size > 0 
                ? `${selectedTaskIds.size} of ${tasks.length} tasks selected`
                : 'Select all tasks'
              }
            </span>
            {selectionMode && (
              <button
                onClick={handleSelectionCleared}
                className="ml-auto text-sm text-gray-500 hover:text-gray-700"
              >
                Clear selection
              </button>
            )}
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {tasks.map((task, index) => (
            <motion.div
              key={task.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <TaskItem
                task={task}
                project={getProjectForTask(task.projectId)}
                onUpdate={onTaskUpdate}
                onDelete={onTaskDelete}
                showProject={showProject}
                selectionMode={selectionMode && enableBulkActions}
                isSelected={selectedTaskIds.has(task.Id)}
                onSelectionChange={(isSelected) => handleTaskSelection(task.Id, isSelected)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bulk Action Toolbar */}
      {enableBulkActions && (
        <BulkActionToolbar
          selectedTasks={selectedTasks}
          onTasksUpdated={handleTaskUpdated}
          onSelectionCleared={handleSelectionCleared}
        />
      )}
    </>
  );
};

export default TaskList;