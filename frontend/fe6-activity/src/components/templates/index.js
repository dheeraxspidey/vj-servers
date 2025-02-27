import ModernTemplate from './ModernTemplate';
import ClassicTemplate from './ClassicTemplate';
import ATSTemplate from './ATSTemplate';
import ProfessionalTemplate from './ProfessionalTemplate';
import SidebarTemplate from './SidebarTemplate';

export const templates = [
  {
    id: 1,
    name: 'Modern',
    description: 'A clean and modern design with a focus on readability',
    component: ModernTemplate
  },
  {
    id: 2,
    name: 'Professional',
    description: 'A professional design with profile image support',
    component: ProfessionalTemplate
  },
  {
    id: 3,
    name: 'Classic',
    description: 'A traditional resume format that employers are familiar with',
    component: ClassicTemplate
  },
  {
    id: 4,
    name: 'ATS-Friendly',
    description: 'Optimized for Applicant Tracking Systems',
    component: ATSTemplate
  },
  {
    id: 5,
    name: 'Sidebar',
    description: 'Modern split-layout design with a colored sidebar',
    component: SidebarTemplate
  }
];

export const getTemplateById = (id) => {
  // Convert id to number if it's a string
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  const template = templates.find(t => t.id === numericId);
  return template ? template.component : null;
}; 