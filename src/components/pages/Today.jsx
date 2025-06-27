import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isPast } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Header from '@/components/organisms/Header';
import TaskList from '@/components/organisms/TaskList';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import taskService from '@/services/api/taskService';
import projectService from '@/services/api/projectService';

const Today = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [todayTasks, projectsData] = await Promise.all([
        taskService.getTodayTasks(),
        projectService.getAll()
      ]);
      setTasks(todayTasks);
      setProjects(projectsData);
    } catch (err) {
      setError(err.message || 'Failed to load today\'s tasks');
      toast.error('Failed to load today\'s tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task.Id === updatedTask.Id ? updatedTask : task
    ));
  };

  const handleTaskDelete = (taskId) => {
    setTasks(prev => prev.filter(task => task.Id !== taskId));
  };

  const handleTaskAdded = (newTask) => {
    // Only add to today's view if it's due today or overdue
    const dueDate = newTask.dueDate;
    const today = new Date().toISOString().split('T')[0];
    
    if (dueDate === today || (dueDate && dueDate < today)) {
      setTasks(prev => [newTask, ...prev]);
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

  // Separate overdue and today's tasks
  const overdueTasks = filteredTasks.filter(task => 
    task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))
  );
  
  const todayTasks = filteredTasks.filter(task => 
    !task.dueDate || isToday(new Date(task.dueDate))
  );

  const completedToday = tasks.filter(task => task.completed).length;
  const totalToday = tasks.length;
  const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <Header onSearch={setSearchQuery} projects={projects} />
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
        <Header onSearch={setSearchQuery} projects={projects} />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <ErrorState
              message="Failed to load today's tasks"
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
      <Header 
        onSearch={setSearchQuery} 
        onTaskAdded={handleTaskAdded}
        projects={projects}
      />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-display font-bold text-gray-900">
                  Today
                </h1>
                <p className="text-gray-600 mt-1">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              
              {totalToday > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-6"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {completedToday}
                    </div>
                    <div className="text-sm text-gray-500">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {completionRate}%
                    </div>
                    <div className="text-sm text-gray-500">Progress</div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Progress Bar */}
            {totalToday > 0 && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Daily Progress
                  </span>
                  <span className="text-sm text-gray-500">
                    {completedToday} of {totalToday} tasks
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-3 gradient-primary rounded-full"
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <ApperIcon name="AlertTriangle" size={20} className="text-red-600" />
                <h2 className="text-xl font-display font-semibold text-gray-900">
                  Overdue ({overdueTasks.length})
                </h2>
              </div>
<TaskList
                tasks={overdueTasks}
                projects={projects}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                enableBulkActions={true}
              />
            </motion.div>
          )}

          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: overdueTasks.length > 0 ? 0.2 : 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <ApperIcon name="Calendar" size={20} className="text-primary" />
              <h2 className="text-xl font-display font-semibold text-gray-900">
                Today ({todayTasks.length})
              </h2>
            </div>
            
            {todayTasks.length === 0 && overdueTasks.length === 0 ? (
              <EmptyState
                icon="Sun"
                title="All caught up!"
                description="No tasks due today. Great job staying on top of things!"
                actionLabel="Add Task"
                onAction={() => {}} // This will be handled by the header
              />
            ) : (
<TaskList
                tasks={todayTasks}
                projects={projects}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                enableBulkActions={true}
                emptyStateProps={{
                  icon: "Calendar",
                  title: "No tasks for today",
                  description: "Add some tasks to make today productive!"
                }}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Today;