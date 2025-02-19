import ModernTemplate from './ModernTemplate';
import ClassicTemplate from './ClassicTemplate';

export const templates = [
  {
    id: 1,
    name: 'Modern Professional',
    description: 'Clean and modern design with emphasis on skills and experience',
    component: ModernTemplate
  },
  {
    id: 2,
    name: 'Classic',
    description: 'Traditional resume format suitable for all industries',
    component: ClassicTemplate
  }
];

export const getTemplateById = (id) => {
  return templates.find(template => template.id === id)?.component;
}; 