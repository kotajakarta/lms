import type { CourseModule, PlaylistItem, ChatMessageItem } from '../types/lms.js';

export const mockModules: CourseModule[] = [
  {
    id: 1,
    title: 'Engineering Graphics',
    description: 'Application of spatial reasoning to visualize mec...',
    emoji: '✏️',
    bgColor: '#fadad1',
    duration: '45m',
    active: false,
  },
  {
    id: 2,
    title: '3D Modeling & CAD',
    description: 'Computer-Aided Design software develops the...',
    emoji: '🖥️',
    bgColor: '#cbe9e3',
    duration: '1h 20m',
    active: false,
  },
  {
    id: 3,
    title: 'Design Theory',
    description: 'Application of spatial reasoning to visualize mec...',
    emoji: '🖌️',
    bgColor: '#dad3eb',
    duration: '50m',
    active: false,
  },
  {
    id: 4,
    title: 'Design Ethics Discussion',
    description: 'The moral dimension of architectural decisions',
    emoji: '💬',
    bgColor: '#f7d6cd',
    duration: '30m',
    active: false,
  },
  {
    id: 5,
    title: 'Principles of Design',
    description: 'Core rules behind balance, contrast & symmetry',
    emoji: '📐',
    bgColor: '#d5e4f7',
    duration: '1h 05m',
    active: false,
  },
];

export const mockPlaylist: PlaylistItem[] = [
  {
    id: 1,
    title: 'Mental Exercises',
    description: 'Train your ability to imagine folded a...',
    duration: '15:48',
    type: 'video',
    isPlaying: false,
  },
  {
    id: 2,
    title: 'Perspective Basics',
    description: 'How depth and distance are repres...',
    duration: '23:28',
    type: 'video',
    isPlaying: true,
  },
  {
    id: 3,
    title: 'Spatial Logic in Design',
    description: 'Connecting geometry, structure, and f...',
    duration: '12:16',
    type: 'video',
    isPlaying: false,
  },
  {
    id: 4,
    title: 'Design Theory Principles',
    description: 'Connecting geometry, structure, and f...',
    duration: '15:12',
    type: 'video',
    isPlaying: false,
  },
];

export const mockChatMessages: ChatMessageItem[] = [
  {
    id: 1,
    sender: 'Instructor Mark',
    senderRole: 'instructor',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBIwffRVbL2NxFuQk9u8igd1aM8G01tzIgOIue_k2OF1IT1s39k6axWCGPuG9-83_y_3i5kSXU_ysjh-aDzOBRm76-KUeNpQon0XzcNLW4A_cXxQD0oXndqpVHVmVsv9_QgmpUCAhfiVRuwy_gkUPJzSbSvXOsfmcfcqYjcRsG8ylPGrIE-wLU-qRvx8xjYiJ3AeejMVh-ERfuat336k5hHSsi5J6fQy8HbZUvwdRtUqngMrrdIBlpb4wqSnf2Zn0z4fw',
    message: "That's a common question. Let's start simple — are you using a one-point or a two-point perspective?",
    time: '07:30 AM',
  },
  {
    id: 2,
    sender: 'Anna',
    senderRole: 'student',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuABy3ovZuk2NppxT2DK22M7tlvfTD6E-HfBzNcm0JselOKHF-RyCwuTeStMqTHRM6ijkmHntDrOBiyQx6ebCP8r-B-C2NK2bYO0EdgBuKuX4mmMRy-3-wShoo_E-ZfPZsymNZ1iA-rlYVIimRwc5K6K9XP6vwci8RJ1kYQwhZ72EfE5nXXlhSZCjSx4bgmZrTPqn0qOy7yQqbW5mhjxTC_wBF3nb9QTc4r2y_3BaXHji0jR7NvFz3DpwsNxYp4WGA05g',
    message: 'I tried one-point. I placed the vanishing point in the center, but the walls still look flat.',
    time: '07:34 AM',
    reactions: [
      {
        emoji: '👍',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBxbH4gWxHCcXmHGIXcgx_PvnMr-MtamKpSwj8jq6O2lH6jwYM3n_GZxgQefyowBI_vdUGsz9SRBAe_O0RVomwaFxU1Il-8JiRa8E6BKoFxI5djT9Dhz2PomJbUNImU4EX9sI5zijfHDcXo8-mBJyhZO_ioqWzWxvFQawEpimVn6A1msvRsNV5FL6Oi7GPycQww5AyvdDlqV-nxFhjnZD30FKnw2mqiqA25IYGMpiLWzALEl0Jj-AzcMuTJDcnRS44LhQ',
      },
    ],
    viewsCount: 12,
    isDelivered: true,
  },
];
