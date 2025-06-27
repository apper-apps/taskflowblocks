import Today from '@/components/pages/Today';
import Upcoming from '@/components/pages/Upcoming';
import Projects from '@/components/pages/Projects';
import Archive from '@/components/pages/Archive';

export const routes = {
  today: {
    id: 'today',
    label: 'Today',
    path: '/',
    icon: 'Calendar',
    component: Today
  },
  upcoming: {
    id: 'upcoming',
    label: 'Upcoming',
    path: '/upcoming',
    icon: 'CalendarDays',
    component: Upcoming
  },
  projects: {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    icon: 'FolderOpen',
    component: Projects
  },
  archive: {
    id: 'archive',
    label: 'Archive',
    path: '/archive',
    icon: 'Archive',
    component: Archive
  }
};

export const routeArray = Object.values(routes);
export default routes;