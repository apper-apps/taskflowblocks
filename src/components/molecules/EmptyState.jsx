import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const EmptyState = ({ 
  icon = 'CheckSquare',
  title = 'No tasks yet',
  description = 'Create your first task to get started with TaskFlow',
  actionLabel = 'Add Task',
  onAction,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-center py-12 px-6 ${className}`}
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-2xl mb-6"
      >
        <ApperIcon name={icon} size={32} className="text-white" />
      </motion.div>
      
      <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-sm mx-auto">
        {description}
      </p>
      
      {onAction && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button onClick={onAction} size="lg">
            <ApperIcon name="Plus" size={16} />
            {actionLabel}
          </Button>
        </motion.div>
      )}
      
      <div className="mt-8 flex justify-center space-x-8 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <ApperIcon name="Zap" size={16} />
          <span>Quick capture</span>
        </div>
        <div className="flex items-center gap-2">
          <ApperIcon name="Target" size={16} />
          <span>Stay focused</span>
        </div>
        <div className="flex items-center gap-2">
          <ApperIcon name="CheckCircle" size={16} />
          <span>Get things done</span>
        </div>
      </div>
    </motion.div>
  );
};

export default EmptyState;