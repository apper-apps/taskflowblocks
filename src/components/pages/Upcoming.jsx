import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Header from '@/components/organisms/Header';
import TaskList from '@/components/organisms/TaskList';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import Badge from '@/components/atoms/Badge';
import taskService from '@/services/api/taskService';
import projectService from '@/services/api/projectService';

const Upcoming = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'list'

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [upcomingTasks, projectsData] = await Promise.all([
        taskService.getUpcomingTasks(),
        projectService.getAll()
      ]);
      setTasks(upcomingTasks);
      setProjects(projectsData);
    } catch (err) {
      setError(err.message || 'Failed to load upcoming tasks');
      toast.error('Failed to load upcoming tasks');
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
    // Only add to upcoming view if it has a future due date
    const today = new Date().toISOString().split('T')[0];
    if (newTask.dueDate && newTask.dueDate > today) {
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

  // Group tasks by week for calendar view
  const getWeekDays = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const getTasksForDate = (date) => {
    return filteredTasks.filter(task => 
      task.dueDate && isSameDay(parseISO(task.dueDate), date)
    );
  };

  const weekDays = getWeekDays();

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <Header onSearch={setSearchQuery} projects={projects} />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
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
          <div className="max-w-6xl mx-auto">
            <ErrorState
              message="Failed to load upcoming tasks"
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
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-display font-bold text-gray-900">
                  Upcoming
                </h1>
                <p className="text-gray-600 mt-1">
                  {filteredTasks.length} tasks scheduled ahead
                </p>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'week'
                      ? 'gradient-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ApperIcon name="Calendar" size={16} className="mr-2" />
                  Week
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'gradient-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ApperIcon name="List" size={16} className="mr-2" />
                  List
                </button>
              </div>
            </div>
          </motion.div>

          {filteredTasks.length === 0 ? (
            <EmptyState
              icon="CalendarDays"
              title="No upcoming tasks"
              description="All your future tasks will appear here. Stay ahead of your schedule!"
              actionLabel="Add Task"
              onAction={() => {}} // Handled by header
            />
          ) : (
            <>
              {viewMode === 'week' ? (
                /* Week Calendar View */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4"
                >
                  {weekDays.map((day, index) => {
                    const dayTasks = getTasksForDate(day);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <motion.div
                        key={day.toISOString()}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-white rounded-lg p-4 border-2 transition-all duration-200 ${
                          isToday 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="mb-3">
                          <div className={`text-sm font-medium ${
                            isToday ? 'text-primary' : 'text-gray-600'
                          }`}>
                            {format(day, 'EEE')}
                          </div>
                          <div className={`text-lg font-bold ${
                            isToday ? 'text-primary' : 'text-gray-900'
                          }`}>
                            {format(day, 'd')}
                          </div>
                          {dayTasks.length > 0 && (
                            <Badge variant="primary" size="xs" className="mt-1">
                              {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {dayTasks.slice(0, 3).map(task => {
                            const project = projects.find(p => p.Id === task.projectId);
                            return (
                              <div
                                key={task.Id}
                                className="p-2 bg-gray-50 rounded text-xs hover:bg-gray-100 transition-colors cursor-pointer"
                              >
                                <div className="font-medium text-gray-900 truncate mb-1">
                                  {task.title}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Badge variant={
                                    task.priority === 'high' ? 'high' : 
                                    task.priority === 'medium' ? 'medium' : 'low'
                                  } size="xs">
                                    {task.priority}
                                  </Badge>
                                  {project && (
                                    <div 
                                      className="w-2 h-2 rounded-full" 
                                      style={{ backgroundColor: project.color }}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          
                          {dayTasks.length > 3 && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              +{dayTasks.length - 3} more
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                /* List View */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <TaskList
                    tasks={filteredTasks}
                    projects={projects}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskDelete={handleTaskDelete}
                  />
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upcoming;