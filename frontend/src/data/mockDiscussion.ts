export interface DiscussionMessage {
  id: number;
  author: string;
  role: string;
  avatar: string;
  time: string;
  content: string;
  badge?: string;
  likes?: number;
  tags?: string[];
}

export const mockDiscussionMessages: DiscussionMessage[] = [
  {
    id: 1,
    author: 'Prof. Elena Rostova',
    role: 'Lead Critic • Studio 4B',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAmM-uqoAgnTYUiyZT79czNTVB2q-oMBHDfBaoxwYGoAS2cXERyf2y4N4NOsZwE6evT7MZaUtweCdAjLjPUzQC9gO8EDAJNUsvR-obnG6PJRtJz6GDR5Mdt99JHhDb4Ce61PWdiaHoJN3_110INnmx8kh-FW2zp4mn9-VB5KOFSRIfDGDui_M2iXBUMfuuCQUuTcPZGp8xD0wam5gNhyrw-0FoPBy_CjqFl49APTEcy2KBQz8K5rmpS',
    time: '14:12 PM',
    badge: 'Faculty',
    content:
      'Notice how the left vanishing ray (Pin 1) angles slightly too steep relative to your horizon eye-level. Pull the left station point out by roughly 2.5 meters to stabilize the perspective volume.',
    likes: 8,
  },
  {
    id: 2,
    author: 'Anna',
    role: 'Student',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuABy3ovZuk2NppxT2DK22M7tlvfTD6E-HfBzNcm0JselOKHF-RyCwuTeStMqTHRM6ijkmHntDrOBiyQx6ebCP8r-B-C2NK2bYO0EdgBuKuX4mmMRy-3-wShoo_E-ZfPZsymNZ1iA-rlYVIimRwc5K6K9XP6vwci8RJ1kYQwhZ72EfE5nXXlhSZCjSx4bgmZrTPqn0qOy7yQqbW5mhjxTC_wBF3nb9QTc4r2y_3BaXHji0jR7NvFz3DpwsNxYp4WGA05g',
    time: '14:18 PM',
    content:
      'Understood! I was using a 35mm lens equivalent camera focal length in Rhino. I will switch to 50mm and recalculate the ground plane pitch.',
    likes: 3,
  },
  {
    id: 3,
    author: 'Marcus Vance',
    role: 'Teaching Assistant',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBIwffRVbL2NxFuQk9u8igd1aM8G01tzIgOIue_k2OF1IT1s39k6axWCGPuG9-83_y_3i5kSXU_ysjh-aDzOBRm76-KUeNpQon0XzcNLW4A_cXxQD0oXndqpVHVmVsv9_QgmpUCAhfiVRuwy_gkUPJzSbSvXOsfmcfcqYjcRsG8ylPGrIE-wLU-qRvx8xjYiJ3AeejMVh-ERfuat336k5hHSsi5J6fQy8HbZUvwdRtUqngMrrdIBlpb4wqSnf2Zn0z4fw',
    time: '14:21 PM',
    badge: 'TA',
    content:
      'Great adjustment Anna. Remember that in two-point perspective, all vertical lines MUST remain strictly perpendicular (90°) to the horizon line unless you intentionally introduce a third zenith vanishing point.',
    likes: 5,
  },
];
