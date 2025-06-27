import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Header from '@/components/organisms/Header';
import ProjectCard from '@/components/organisms/ProjectCard';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import projectService from '@/services/api/projectService';
import taskService from '@/services/api/taskService';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    color: '#5B4FDB',
    icon: 'Folder'
  });

  const projectColors = [
    '#5B4FDB', '#4ECDC4', '#FF6B6B', '#FFE66D', 
    '#95E1D3', '#A8E6CF', '#FFAAA5', '#FFD93D'
  ];

  const projectIcons = [
    'Folder', 'Monitor', 'Users', 'Megaphone', 'BarChart3',
    'Target', 'Zap', 'Heart', 'Star', 'Briefcase'
  ];

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const projectsData = await projectService.getAll();
      
      // Get task counts for each project
      const projectsWithCounts = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const projectTasks = await taskService.getByProject(project.Id);
            const activeTasks = projectTasks.filter(task => !task.completed).length;
            return {
              ...project,
              taskCount: projectTasks.length,
              activeTasks
            };
          } catch {
            return { ...project, taskCount: 0, activeTasks: 0 };
          }
        })
      );
      
      setProjects(projectsWithCounts);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!newProject.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      const createdProject = await projectService.create({
        ...newProject,
        name: newProject.name.trim()
      });
      
      setProjects(prev => [{ ...createdProject, taskCount: 0, activeTasks: 0 }, ...prev]);
      setNewProject({ name: '', color: '#5B4FDB', icon: 'Folder' });
      setShowCreateForm(false);
      toast.success('Project created successfully!');
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleDeleteProject = async (project) => {
    if (project.taskCount > 0) {
      toast.error('Cannot delete project with tasks. Archive tasks first.');
      return;
    }

    try {
      await projectService.delete(project.Id);
      setProjects(prev => prev.filter(p => p.Id !== project.Id));
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    return project.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <Header onSearch={setSearchQuery} />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonLoader count={6} type="project" />
            </div>
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
          <div className="max-w-6xl mx-auto">
            <ErrorState
              message="Failed to load projects"
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
                  Projects
                </h1>
                <p className="text-gray-600 mt-1">
                  Organize your tasks into focused workspaces
                </p>
              </div>
              
              <Button
                onClick={() => setShowCreateForm(true)}
                icon="Plus"
                size="lg"
              >
                New Project
              </Button>
            </div>

            {/* Stats */}
            {projects.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                      <ApperIcon name="FolderOpen" size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {projects.length}
                      </div>
                      <div className="text-sm text-gray-500">Total Projects</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-success rounded-lg flex items-center justify-center">
                      <ApperIcon name="CheckCircle" size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {projects.reduce((sum, p) => sum + (p.taskCount - p.activeTasks), 0)}
                      </div>
                      <div className="text-sm text-gray-500">Tasks Completed</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-accent rounded-lg flex items-center justify-center">
                      <ApperIcon name="Clock" size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {projects.reduce((sum, p) => sum + p.activeTasks, 0)}
                      </div>
                      <div className="text-sm text-gray-500">Active Tasks</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Create Project Form */}
          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-6 mb-6 overflow-hidden"
              >
                <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
                  Create New Project
                </h3>
                
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <Input
                    label="Project Name"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Website Redesign, Mobile App, etc."
                    autoFocus
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Color
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {projectColors.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewProject(prev => ({ ...prev, color }))}
                            className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
                              newProject.color === color 
                                ? 'border-gray-900 scale-110' 
                                : 'border-transparent hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Icon
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {projectIcons.map(icon => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setNewProject(prev => ({ ...prev, icon }))}
                            className={`p-2 rounded-lg border transition-all duration-200 ${
                              newProject.icon === icon
                                ? 'border-primary bg-primary/10'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <ApperIcon name={icon} size={16} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={!newProject.name.trim()}>
                      Create Project
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewProject({ name: '', color: '#5B4FDB', icon: 'Folder' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <EmptyState
              icon="FolderOpen"
              title={projects.length === 0 ? "No projects yet" : "No projects match your search"}
              description={projects.length === 0 
                ? "Create your first project to organize your tasks and boost productivity"
                : "Try adjusting your search terms"
              }
              actionLabel="Create Project"
              onAction={() => setShowCreateForm(true)}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProjectCard
                    project={project}
                    onClick={() => {
                      // Navigate to project detail view
                      toast.info(`Viewing ${project.name} project`);
                    }}
                    onEdit={(project) => {
                      toast.info(`Edit ${project.name} (feature coming soon)`);
                    }}
                    onDelete={handleDeleteProject}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;