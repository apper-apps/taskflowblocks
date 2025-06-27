import { motion, AnimatePresence } from 'framer-motion';
import TaskItem from '@/components/molecules/TaskItem';
import EmptyState from '@/components/molecules/EmptyState';

const TaskList = ({ 
  tasks = [], 
  projects = [], 
  onTaskUpdate, 
  onTaskDelete, 
  showProject = true,
  emptyStateProps = {} 
}) => {
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
    <div className="space-y-3">
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
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TaskList;