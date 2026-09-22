import type { AnalyticsMetricItem } from '../types/lms.js';

export const mockCompetencies: AnalyticsMetricItem[] = [
  {
    id: 'spatial',
    title: 'Spatial Aptitude & Projections',
    category: 'Descriptive Geometry',
    progressPercent: 94,
    benchmarkScore: 'Mastered',
    color: '#615a77',
  },
  {
    id: 'ortho',
    title: 'Orthographic & Elevation Drafting',
    category: 'Axonometric Sections',
    progressPercent: 86,
    benchmarkScore: 'Advanced',
    color: '#1c1d22',
  },
  {
    id: 'rhino',
    title: 'Volumetric Massing in Rhino',
    category: 'NURBS Curvature Logic',
    progressPercent: 78,
    benchmarkScore: 'Intermediate',
    color: '#77767b',
  },
  {
    id: 'solar',
    title: 'Solar Shading & Sun Angle',
    category: 'Heliodon Simulation',
    progressPercent: 91,
    benchmarkScore: 'Mastered',
    color: '#997f7b',
  },
];
