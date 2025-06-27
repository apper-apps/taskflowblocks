import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import taskService from '@/services/api/taskService';
import projectService from '@/services/api/projectService';

const QuickAddForm = ({ onTaskAdded, onClose, projects = [] }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title: title.trim(),
        priority,
        dueDate: dueDate || null,
        projectId: projectId ? parseInt(projectId, 10) : null
      };

      const newTask = await taskService.create(taskData);
      
      // Update project task count
      if (projectId) {
        const project = projects.find(p => p.Id === parseInt(projectId, 10));
        if (project) {
          await projectService.updateTaskCount(project.Id, project.taskCount + 1);
        }
      }
      
      onTaskAdded(newTask);
      onClose();
      toast.success('Task created successfully!');
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const parseNaturalLanguage = (text) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let parsedTitle = text;
    let parsedDate = '';
    let parsedPriority = 'medium';
    
    // Check for date keywords
    if (text.toLowerCase().includes('today')) {
      parsedDate = today.toISOString().split('T')[0];
      parsedTitle = text.replace(/\btoday\b/gi, '').trim();
    } else if (text.toLowerCase().includes('tomorrow')) {
      parsedDate = tomorrow.toISOString().split('T')[0];
      parsedTitle = text.replace(/\btomorrow\b/gi, '').trim();
    }
    
    // Check for priority keywords
    if (text.toLowerCase().includes('urgent') || text.toLowerCase().includes('important')) {
      parsedPriority = 'high';
      parsedTitle = parsedTitle.replace(/\b(urgent|important)\b/gi, '').trim();
    }
    
    return { title: parsedTitle, date: parsedDate, priority: parsedPriority };
  };

  const handleTitleChange = (e) => {
    const text = e.target.value;
    setTitle(text);
    
    // Natural language parsing
    if (text.length > 3) {
      const parsed = parseNaturalLanguage(text);
      if (parsed.date && !dueDate) {
        setDueDate(parsed.date);
      }
      if (parsed.priority !== 'medium' && priority === 'medium') {
        setPriority(parsed.priority);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-full max-w-md"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-gray-900">
          Quick Add Task
        </h3>
        <Button variant="ghost" size="sm" icon="X" onClick={onClose} />
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          value={title}
          onChange={handleTitleChange}
          placeholder="e.g., Review report today, Urgent: Call client"
          autoFocus
        />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>
        
        {projects.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="">No Project</option>
              {projects.map(project => (
                <option key={project.Id} value={project.Id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            loading={loading}
            disabled={!title.trim()}
            className="flex-1"
          >
            Add Task
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Quick tip:</strong> Try typing "Review report today" or "Urgent: Call client" 
          for smart date and priority detection!
        </p>
      </div>
    </motion.div>
  );
};

export default QuickAddForm;