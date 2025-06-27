import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Checkbox from '@/components/atoms/Checkbox';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import taskService from '@/services/api/taskService';
import projectService from '@/services/api/projectService';

const TaskItem = ({ task, project, onUpdate, onDelete, showProject = true }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleComplete = async () => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    try {
      const updatedTask = await taskService.update(task.Id, {
        completed: !task.completed
      });
      
      // Update project task count
      if (project) {
        const newCount = project.taskCount + (updatedTask.completed ? -1 : 1);
        await projectService.updateTaskCount(project.Id, newCount);
      }
      
      onUpdate(updatedTask);
      
      if (updatedTask.completed) {
        toast.success('Task completed! 🎉', {
          position: 'top-right',
          autoClose: 2000
        });
      }
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    
    try {
      const updatedTask = await taskService.update(task.Id, {
        title: editTitle.trim()
      });
      onUpdate(updatedTask);
      setIsEditing(false);
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    try {
      await taskService.delete(task.Id);
      
      // Update project task count
      if (project && !task.completed) {
        const newCount = Math.max(0, project.taskCount - 1);
        await projectService.updateTaskCount(project.Id, newCount);
      }
      
      onDelete(task.Id);
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'default';
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    
    const date = parseISO(dateString);
    const today = new Date();
    
    if (isToday(date)) {
      return { text: 'Today', isOverdue: false, isToday: true };
    } else if (isPast(date)) {
      return { text: format(date, 'MMM d'), isOverdue: true, isToday: false };
    } else {
      return { text: format(date, 'MMM d'), isOverdue: false, isToday: false };
    }
  };

  const dueDateInfo = formatDueDate(task.dueDate);

  if (task.completed && isCompleting) {
    return (
      <motion.div
        initial={{ opacity: 1, x: 0 }}
        animate={{ opacity: 0, x: 100 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.3 }}
        className="bg-success/10 border border-success/20 rounded-lg p-4 mb-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 gradient-success rounded flex items-center justify-center">
            <ApperIcon name="Check" size={12} className="text-white" />
          </div>
          <span className="text-success font-medium">Task completed!</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.01 }}
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${
        task.completed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Checkbox
            checked={task.completed}
            onChange={handleComplete}
            disabled={isCompleting}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') {
                    setEditTitle(task.title);
                    setIsEditing(false);
                  }
                }}
                className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setEditTitle(task.title);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <h3 
              className={`font-medium mb-2 cursor-pointer hover:text-primary ${
                task.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
              onClick={() => setIsEditing(true)}
            >
              {task.title}
            </h3>
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getPriorityVariant(task.priority)} size="xs">
              {task.priority}
            </Badge>
            
            {dueDateInfo && (
              <Badge 
                variant={dueDateInfo.isOverdue ? 'danger' : dueDateInfo.isToday ? 'warning' : 'default'}
                size="xs"
              >
                <ApperIcon name="Calendar" size={10} className="mr-1" />
                {dueDateInfo.text}
              </Badge>
            )}
            
            {showProject && project && (
              <Badge variant="default" size="xs">
                <div 
                  className="w-2 h-2 rounded-full mr-1" 
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon="Edit2"
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
          <Button
            variant="ghost"
            size="sm"
            icon="Trash2"
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TaskItem;