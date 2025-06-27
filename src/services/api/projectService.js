import projectsData from '../mockData/projects.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let projects = [...projectsData];

const projectService = {
  async getAll() {
    await delay(250);
    return [...projects].sort((a, b) => a.order - b.order);
  },

  async getById(id) {
    await delay(200);
    const project = projects.find(p => p.Id === parseInt(id, 10));
    if (!project) {
      throw new Error('Project not found');
    }
    return { ...project };
  },

  async create(projectData) {
    await delay(400);
    const maxId = projects.length > 0 ? Math.max(...projects.map(p => p.Id)) : 0;
    const maxOrder = projects.length > 0 ? Math.max(...projects.map(p => p.order)) : 0;
    
    const newProject = {
      Id: maxId + 1,
      name: projectData.name || 'Untitled Project',
      color: projectData.color || '#5B4FDB',
      icon: projectData.icon || 'Folder',
      taskCount: 0,
      order: maxOrder + 1,
      ...projectData
    };
    
    projects.push(newProject);
    return { ...newProject };
  },

  async update(id, updates) {
    await delay(300);
    const index = projects.findIndex(p => p.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Project not found');
    }
    
    const updatedProject = {
      ...projects[index],
      ...updates,
      Id: projects[index].Id // Prevent Id modification
    };
    
    projects[index] = updatedProject;
    return { ...updatedProject };
  },

  async delete(id) {
    await delay(250);
    const index = projects.findIndex(p => p.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Project not found');
    }
    const deletedProject = projects[index];
    projects.splice(index, 1);
    return { ...deletedProject };
  },

  async updateTaskCount(projectId, count) {
    await delay(200);
    const index = projects.findIndex(p => p.Id === parseInt(projectId, 10));
    if (index !== -1) {
      projects[index].taskCount = count;
      return { ...projects[index] };
    }
    throw new Error('Project not found');
  }
};

export default projectService;