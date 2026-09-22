/**
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * PLACEHOLDER SAMPLE DATA — these six entries are the generic examples that shipped with the
 * original template (stock photos, '#' links). They are NOT real projects.
 *
 * The Projects section stays hidden until `SITE.features.projects` is set to `true` in
 * app/config/site.config.ts. Replace the entries below with real work before enabling it.
 * Optional fields (`role`, `features`, `impact`) are rendered only when provided.
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 */
export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  category: string;
  role?: string;
  features?: string[];
  impact?: string;
  demoUrl?: string;
  githubUrl?: string;
}

export const PROJECT_CATEGORIES = ['All', 'Web App', 'Mobile', 'E-commerce', 'UI/UX'];

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    description:
      'A modern e-commerce platform with cart functionality, payment integration, and admin dashboard.',
    image: 'https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    technologies: ['Angular', 'Node.js', 'MongoDB', 'Stripe'],
    category: 'E-commerce',
    demoUrl: '#',
    githubUrl: '#',
  },
  {
    id: 2,
    title: 'Task Management App',
    description:
      'A collaborative task management application with real-time updates and team collaboration features.',
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    technologies: ['React', 'Firebase', 'Material-UI'],
    category: 'Web App',
    demoUrl: '#',
    githubUrl: '#',
  },
  {
    id: 3,
    title: 'Weather Mobile App',
    description: 'A beautiful weather app with location-based forecasts and interactive weather maps.',
    image: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    technologies: ['React Native', 'TypeScript', 'Weather API'],
    category: 'Mobile',
    demoUrl: '#',
    githubUrl: '#',
  },
  {
    id: 4,
    title: 'Portfolio Website',
    description: 'A responsive portfolio website with smooth animations and modern design principles.',
    image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'GSAP'],
    category: 'UI/UX',
    demoUrl: '#',
    githubUrl: '#',
  },
  {
    id: 5,
    title: 'Social Media Dashboard',
    description:
      'Analytics dashboard for social media management with data visualization and reporting.',
    image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    technologies: ['Vue.js', 'D3.js', 'Express', 'PostgreSQL'],
    category: 'Web App',
    demoUrl: '#',
    githubUrl: '#',
  },
  {
    id: 6,
    title: 'Food Delivery App',
    description:
      'Complete food delivery solution with restaurant management and real-time order tracking.',
    image: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop',
    technologies: ['Flutter', 'Firebase', 'Google Maps'],
    category: 'Mobile',
    demoUrl: '#',
    githubUrl: '#',
  },
];
