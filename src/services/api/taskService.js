import tasksData from '../mockData/tasks.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let tasks = [...tasksData];

const taskService = {
  async getAll() {
    await delay(300);
    return [...tasks];
  },

  async getById(id) {
    await delay(200);
    const task = tasks.find(t => t.Id === parseInt(id, 10));
    if (!task) {
      throw new Error('Task not found');
    }
    return { ...task };
  },

  async create(taskData) {
    await delay(400);
    const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.Id)) : 0;
    const newTask = {
      Id: maxId + 1,
      title: taskData.title || '',
      completed: false,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || null,
      projectId: taskData.projectId || null,
      createdAt: new Date().toISOString(),
      completedAt: null,
      ...taskData
    };
    tasks.push(newTask);
    return { ...newTask };
  },

  async update(id, updates) {
    await delay(300);
    const index = tasks.findIndex(t => t.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    const updatedTask = {
      ...tasks[index],
      ...updates,
      Id: tasks[index].Id // Prevent Id modification
    };
    
    // Handle completion status
    if (updates.completed !== undefined) {
      updatedTask.completedAt = updates.completed ? new Date().toISOString() : null;
    }
    
    tasks[index] = updatedTask;
    return { ...updatedTask };
  },

  async delete(id) {
    await delay(250);
    const index = tasks.findIndex(t => t.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Task not found');
    }
    const deletedTask = tasks[index];
    tasks.splice(index, 1);
    return { ...deletedTask };
  },

  async getByProject(projectId) {
    await delay(300);
    return tasks.filter(t => t.projectId === parseInt(projectId, 10)).map(t => ({ ...t }));
  },

  async getTodayTasks() {
    await delay(250);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return tasks.filter(t => 
      !t.completed && (
        t.dueDate === today || 
        (t.dueDate && t.dueDate < today)
      )
    ).map(t => ({ ...t }));
  },

  async getUpcomingTasks() {
    await delay(250);
    const today = new Date().toISOString().split('T')[0];
    
    return tasks.filter(t => 
      !t.completed && t.dueDate && t.dueDate > today
    ).map(t => ({ ...t }));
  },

async getCompletedTasks() {
    await delay(300);
    return tasks.filter(t => t.completed).map(t => ({ ...t }));
  },

  async bulkUpdate(ids, updates) {
    await delay(400);
    const validIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    
    if (validIds.length === 0) {
      throw new Error('No valid task IDs provided');
    }

    const updatedTasks = [];
    const errors = [];

    for (const id of validIds) {
      const index = tasks.findIndex(t => t.Id === id);
      if (index === -1) {
        errors.push(`Task with ID ${id} not found`);
        continue;
      }

      const updatedTask = {
        ...tasks[index],
        ...updates,
        Id: tasks[index].Id // Prevent Id modification
      };

      // Handle completion status
      if (updates.completed !== undefined) {
        updatedTask.completedAt = updates.completed ? new Date().toISOString() : null;
      }

      tasks[index] = updatedTask;
      updatedTasks.push({ ...updatedTask });
    }

    if (errors.length > 0 && updatedTasks.length === 0) {
      throw new Error(errors.join(', '));
    }

    return {
      updated: updatedTasks,
      errors: errors
    };
  },

  async bulkDelete(ids) {
    await delay(350);
    const validIds = ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    
    if (validIds.length === 0) {
      throw new Error('No valid task IDs provided');
    }

    const deletedTasks = [];
    const errors = [];

    // Sort IDs in descending order to avoid index shifting issues
    const sortedIds = validIds.sort((a, b) => {
      const indexA = tasks.findIndex(t => t.Id === a);
      const indexB = tasks.findIndex(t => t.Id === b);
      return indexB - indexA;
    });

    for (const id of sortedIds) {
      const index = tasks.findIndex(t => t.Id === id);
      if (index === -1) {
        errors.push(`Task with ID ${id} not found`);
        continue;
      }

      const deletedTask = tasks[index];
      tasks.splice(index, 1);
      deletedTasks.push({ ...deletedTask });
    }

    if (errors.length > 0 && deletedTasks.length === 0) {
      throw new Error(errors.join(', '));
    }

    return {
      deleted: deletedTasks,
      errors: errors
    };
  }
};

export default taskService;