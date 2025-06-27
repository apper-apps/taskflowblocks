import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Header from '@/components/organisms/Header';
import TaskList from '@/components/organisms/TaskList';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import Button from '@/components/atoms/Button';
import taskService from '@/services/api/taskService';
import projectService from '@/services/api/projectService';

const Archive = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [completedTasks, projectsData] = await Promise.all([
        taskService.getCompletedTasks(),
        projectService.getAll()
      ]);
      setTasks(completedTasks);
      setProjects(projectsData);
    } catch (err) {
      setError(err.message || 'Failed to load archived tasks');
      toast.error('Failed to load archived tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTaskUpdate = (updatedTask) => {
    if (!updatedTask.completed) {
      // Task was restored, remove from archive
      setTasks(prev => prev.filter(task => task.Id !== updatedTask.Id));
      toast.success('Task restored successfully!');
    } else {
      setTasks(prev => prev.map(task => 
        task.Id === updatedTask.Id ? updatedTask : task
      ));
    }
  };

  const handleTaskDelete = (taskId) => {
    setTasks(prev => prev.filter(task => task.Id !== taskId));
  };

  const handleRestoreAll = async () => {
    try {
      await Promise.all(
        tasks.map(task => taskService.update(task.Id, { completed: false }))
      );
      setTasks([]);
      toast.success(`${tasks.length} tasks restored successfully!`);
    } catch (error) {
      toast.error('Failed to restore tasks');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all archived tasks? This action cannot be undone.')) {
      return;
    }

    try {
      await Promise.all(
        tasks.map(task => taskService.delete(task.Id))
      );
      setTasks([]);
      toast.success('All archived tasks cleared');
    } catch (error) {
      toast.error('Failed to clear archived tasks');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const project = projects.find(p => p.Id === task.projectId);
    
    return (
      task.title.toLowerCase().includes(query) ||
      task.priority.toLowerCase().includes(query) ||
      (project && project.name.toLowerCase().includes(query))
    );
  });

  // Group tasks by completion date
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    if (!task.completedAt) return groups;
    
    const completedDate = format(parseISO(task.completedAt), 'yyyy-MM-dd');
    const dateLabel = format(parseISO(task.completedAt), 'MMMM d, yyyy');
    
    if (!groups[completedDate]) {
      groups[completedDate] = {
        label: dateLabel,
        tasks: []
      };
    }
    
    groups[completedDate].tasks.push(task);
    return groups;
  }, {});

  const sortedGroupKeys = Object.keys(groupedTasks).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <Header onSearch={setSearchQuery} />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
            <SkeletonLoader count={5} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <Header onSearch={setSearchQuery} />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <ErrorState
              message="Failed to load archived tasks"
              description={error}
              onRetry={loadData}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header onSearch={setSearchQuery} />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-display font-bold text-gray-900">
                  Archive
                </h1>
                <p className="text-gray-600 mt-1">
                  {filteredTasks.length} completed tasks
                </p>
              </div>
              
              {tasks.length > 0 && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleRestoreAll}
                    icon="RotateCcw"
                  >
                    Restore All
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleClearAll}
                    icon="Trash2"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            {/* Stats */}
            {tasks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-success rounded-lg flex items-center justify-center">
                      <ApperIcon name="CheckCircle" size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {tasks.length}
                      </div>
                      <div className="text-sm text-gray-500">Tasks Completed</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Trophy" size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {tasks.filter(t => t.priority === 'high').length}
                      </div>
                      <div className="text-sm text-gray-500">High Priority Done</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                      <ApperIcon name="Calendar" size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {sortedGroupKeys.length}
                      </div>
                      <div className="text-sm text-gray-500">Productive Days</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Archived Tasks */}
          {filteredTasks.length === 0 ? (
            <EmptyState
              icon="Archive"
              title={tasks.length === 0 ? "No completed tasks yet" : "No tasks match your search"}
              description={tasks.length === 0 
                ? "Complete some tasks and they'll appear here for future reference"
                : "Try adjusting your search terms to find archived tasks"
              }
              actionLabel={tasks.length === 0 ? "Go to Today" : "Clear Search"}
              onAction={() => {
                if (tasks.length === 0) {
                  // Navigate to today view
                  window.location.href = '/';
                } else {
                  setSearchQuery('');
                }
              }}
            />
          ) : (
            <div className="space-y-8">
              {sortedGroupKeys.map((dateKey, groupIndex) => {
                const group = groupedTasks[dateKey];
                return (
                  <motion.div
                    key={dateKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <ApperIcon name="Calendar" size={20} className="text-gray-400" />
                      <h2 className="text-lg font-display font-semibold text-gray-900">
                        {group.label}
                      </h2>
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <span className="text-sm text-gray-500">
                        {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <TaskList
                      tasks={group.tasks}
                      projects={projects}
                      onTaskUpdate={handleTaskUpdate}
                      onTaskDelete={handleTaskDelete}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Archive;