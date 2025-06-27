import { motion } from 'framer-motion';
import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';

const ProjectCard = ({ project, onEdit, onDelete, onClick }) => {
  const [isHovering, setIsHovering] = useState(false);

  const completionPercentage = project.taskCount > 0 
    ? Math.round(((project.taskCount - (project.activeTasks || project.taskCount)) / project.taskCount) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: isHovering ? 360 : 0 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${project.color}20` }}
          >
            <ApperIcon 
              name={project.icon} 
              size={20} 
              style={{ color: project.color }}
            />
          </motion.div>
          <div>
            <h3 className="font-display font-semibold text-gray-900 group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500">
              {project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            icon="Edit2"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(project);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon="Trash2"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(project);
            }}
            className="text-red-600 hover:text-red-700"
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-2 rounded-full transition-all duration-500"
            style={{ 
              background: `linear-gradient(90deg, ${project.color}CC, ${project.color})` 
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge 
            variant="default" 
            size="xs"
            className="text-xs"
          >
            <ApperIcon name="Clock" size={10} className="mr-1" />
            Active
          </Badge>
          
          {project.taskCount > 5 && (
            <Badge variant="primary" size="xs">
              <ApperIcon name="Star" size={10} className="mr-1" />
              Popular
            </Badge>
          )}
        </div>
        
        <motion.div
          animate={{ x: isHovering ? 5 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ApperIcon 
            name="ArrowRight" 
            size={16} 
            className="text-gray-400 group-hover:text-primary transition-colors" 
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;