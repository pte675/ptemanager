export interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  image: string;
  readTime: string;
}

export interface PressRelease {
  id: number;
  title: string;
  date: string;
  source: string;
  excerpt: string;
  link: string;
}

export interface Partner {
  id: number;
  name: string;
  logo: string;
  description: string;
  category: string;
}

export interface LanguageGuide {
  id: number;
  language: string;
  level: string;
  title: string;
  image: string;
  description: string;
}

export interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  postedDate: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  type: 'webinar' | 'workshop' | 'conference';
  registrationLink: string;
}

export interface Tutorial {
  id: number;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  category: string;
  description: string;
  image: string;
  link: string;
}

export interface HelpCategory {
  id: number;
  title: string;
  icon: string;
  description: string;
  articles: number;
}

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Chief Executive Officer',
    image: 'https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?auto=compress&cs=tinysrgb&w=800',
    bio: 'Sarah has over 15 years of experience in educational technology and language learning. She founded PTE Go Global with a vision to make quality language education accessible worldwide.'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Chief Technology Officer',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800',
    bio: 'Michael leads our technology and product development teams, bringing over a decade of expertise in educational software development and AI-driven learning systems.'
  },
  {
    id: 3,
    name: 'Aisha Patel',
    role: 'Director of Education',
    image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg?auto=compress&cs=tinysrgb&w=800',
    bio: 'With a PhD in Language Acquisition and 12 years as a language instructor, Aisha ensures our educational content maintains the highest standards of quality and effectiveness.'
  },
  {
    id: 4,
    name: 'James Wilson',
    role: 'Global Partnerships Director',
    image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=800',
    bio: 'James manages our worldwide partnership network, leveraging his extensive international business experience to expand our global reach and impact.'
  }
];

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'How to Improve Your PTE Speaking Score in 30 Days',
    excerpt: 'Practical strategies and daily exercises to boost your speaking performance in the PTE Academic exam.',
    date: 'May 15, 2025',
    author: 'Dr. Emma Rodriguez',
    category: 'Exam Preparation',
    image: 'https://images.pexels.com/photos/7516363/pexels-photo-7516363.jpeg?auto=compress&cs=tinysrgb&w=800',
    readTime: '8 min read'
  },
  {
    id: 2,
    title: 'The Future of Language Assessment: AI and Beyond',
    excerpt: 'Exploring how artificial intelligence is revolutionizing language testing and what it means for test-takers.',
    date: 'May 8, 2025',
    author: 'Prof. Thomas Yang',
    category: 'Industry Insights',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    readTime: '12 min read'
  },
  {
    id: 3,
    title: 'PTE vs IELTS: Which Exam is Right for You?',
    excerpt: 'A comprehensive comparison of the two most popular English proficiency tests to help you make an informed decision.',
    date: 'April 30, 2025',
    author: 'Lisa Thompson',
    category: 'Exam Comparison',
    image: 'https://images.pexels.com/photos/6147369/pexels-photo-6147369.jpeg?auto=compress&cs=tinysrgb&w=800',
    readTime: '10 min read'
  },
  {
    id: 4,
    title: 'Study Abroad: Top English-Speaking Destinations for 2025',
    excerpt: 'Discover the best countries for international students looking to study in English-speaking environments.',
    date: 'April 22, 2025',
    author: 'Marco Gonzalez',
    category: 'Study Abroad',
    image: 'https://images.pexels.com/photos/4046718/pexels-photo-4046718.jpeg?auto=compress&cs=tinysrgb&w=800',
    readTime: '7 min read'
  }
];

export const pressReleases: PressRelease[] = [
  {
    id: 1,
    title: 'PTE Go Global Launches Revolutionary AI-Powered Speaking Assistant',
    date: 'June 1, 2025',
    source: 'Business Wire',
    excerpt: 'The new technology uses advanced speech recognition to provide instant feedback on pronunciation and fluency.',
    link: '#'
  },
  {
    id: 2,
    title: 'PTE Go Global Reaches 5 Million User Milestone',
    date: 'May 12, 2025',
    source: 'Reuters',
    excerpt: 'The company celebrates helping 5 million students worldwide achieve their language certification goals.',
    link: '#'
  },
  {
    id: 3,
    title: 'PTE Go Global Partners with 50 New Universities Globally',
    date: 'April 15, 2025',
    source: 'PR Newswire',
    excerpt: 'The expansion brings the total number of educational institutions recognizing PTE Go Global certification to over 3,000.',
    link: '#'
  },
  {
    id: 4,
    title: 'PTE Go Global Receives EdTech Innovation of the Year Award',
    date: 'March 30, 2025',
    source: 'Education Technology Insights',
    excerpt: 'The prestigious award recognizes the company\'s contributions to accessible language testing.',
    link: '#'
  }
];

export const partners: Partner[] = [
  {
    id: 1,
    name: 'Oxford University Press',
    logo: 'https://images.pexels.com/photos/6146961/pexels-photo-6146961.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Collaborating on advanced learning materials and research-based language assessment methodologies.',
    category: 'Educational'
  },
  {
    id: 2,
    name: 'Global Education Alliance',
    logo: 'https://images.pexels.com/photos/5428012/pexels-photo-5428012.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Working together to establish international standards for language proficiency certification.',
    category: 'Non-profit'
  },
  {
    id: 3,
    name: 'TechLearn Solutions',
    logo: 'https://images.pexels.com/photos/6476260/pexels-photo-6476260.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Integrating cutting-edge technology into our platform to enhance the learning experience.',
    category: 'Technology'
  },
  {
    id: 4,
    name: 'International Student Exchange Program',
    logo: 'https://images.pexels.com/photos/6694543/pexels-photo-6694543.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Supporting international students with language requirements for study abroad programs.',
    category: 'Educational'
  }
];

export const languageGuides: LanguageGuide[] = [
  {
    id: 1,
    language: 'English',
    level: 'Advanced',
    title: 'Mastering Academic English Writing',
    image: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Comprehensive guide for achieving excellence in academic writing for university and professional contexts.'
  },
  {
    id: 2,
    language: 'English',
    level: 'Intermediate',
    title: 'Business English Communication',
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Essential skills for effective business communication in English, including presentations and negotiations.'
  },
  {
    id: 3,
    language: 'English',
    level: 'Beginner',
    title: 'English for Everyday Conversations',
    image: 'https://images.pexels.com/photos/7516490/pexels-photo-7516490.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Practical guide for building confidence in daily English conversations and social interactions.'
  },
  {
    id: 4,
    language: 'English',
    level: 'All Levels',
    title: 'PTE Academic Exam Preparation',
    image: 'https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Strategies and practice materials specifically designed for success in the PTE Academic examination.'
  }
];

export const jobs: Job[] = [
  {
    id: 1,
    title: 'Senior Educational Content Developer',
    department: 'Education',
    location: 'Remote',
    type: 'Full-time',
    description: 'Create high-quality, engaging language learning materials for our global audience.',
    requirements: [
      'Master\'s degree in TESOL, Applied Linguistics, or related field',
      '5+ years of experience developing educational content',
      'Expertise in language assessment methodologies',
      'Experience with digital learning platforms'
    ],
    postedDate: 'May 25, 2025'
  },
  {
    id: 2,
    title: 'AI Language Model Researcher',
    department: 'Technology',
    location: 'Singapore',
    type: 'Full-time',
    description: 'Research and develop AI models for speech recognition and automated language assessment.',
    requirements: [
      'PhD in Computer Science, Computational Linguistics, or related field',
      'Experience with machine learning and natural language processing',
      'Strong programming skills in Python and TensorFlow',
      'Knowledge of language assessment principles'
    ],
    postedDate: 'May 18, 2025'
  },
  {
    id: 3,
    title: 'Global Partnerships Manager',
    department: 'Business Development',
    location: 'London',
    type: 'Full-time',
    description: 'Expand our network of institutional partners and manage key relationships worldwide.',
    requirements: [
      'Bachelor\'s degree in Business, International Relations, or related field',
      '3+ years of experience in partnership development',
      'Strong negotiation and relationship management skills',
      'Willingness to travel internationally (30%)'
    ],
    postedDate: 'May 10, 2025'
  },
  {
    id: 4,
    title: 'UX/UI Designer for Educational Products',
    department: 'Product',
    location: 'Hybrid (Sydney)',
    type: 'Full-time',
    description: 'Design intuitive, engaging user experiences for our educational technology platforms.',
    requirements: [
      'Bachelor\'s degree in Design, HCI, or related field',
      '3+ years of experience in UX/UI design for digital products',
      'Strong portfolio demonstrating user-centered design approach',
      'Experience with educational or language learning products preferred'
    ],
    postedDate: 'May 5, 2025'
  }
];

export const events: Event[] = [
  {
    id: 1,
    title: 'PTE Academic Masterclass: Speaking and Writing',
    date: 'June 15, 2025',
    time: '10:00 AM - 12:00 PM (GMT)',
    location: 'Online',
    description: 'Join our expert instructors for an intensive masterclass focusing on the speaking and writing sections of the PTE Academic exam.',
    image: 'https://images.pexels.com/photos/8199562/pexels-photo-8199562.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'webinar',
    registrationLink: '#'
  },
  {
    id: 2,
    title: 'Global Education Summit 2025',
    date: 'July 10-12, 2025',
    time: 'All Day',
    location: 'Singapore Expo Center',
    description: 'A three-day conference bringing together educators, policymakers, and technology innovators to discuss the future of global education.',
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'conference',
    registrationLink: '#'
  },
  {
    id: 3,
    title: 'AI in Language Assessment Workshop',
    date: 'June 28, 2025',
    time: '2:00 PM - 5:00 PM (EST)',
    location: 'New York & Online',
    description: 'A hands-on workshop exploring how artificial intelligence is transforming language testing and assessment methodologies.',
    image: 'https://images.pexels.com/photos/8294606/pexels-photo-8294606.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'workshop',
    registrationLink: '#'
  },
  {
    id: 4,
    title: 'Study Abroad Information Session',
    date: 'June 5, 2025',
    time: '6:00 PM - 8:00 PM (IST)',
    location: 'Online',
    description: 'Essential information for students planning to study abroad, including language requirements, application processes, and scholarship opportunities.',
    image: 'https://images.pexels.com/photos/7096596/pexels-photo-7096596.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'webinar',
    registrationLink: '#'
  }
];

export const tutorials: Tutorial[] = [
  {
    id: 1,
    title: 'PTE Academic Reading: Multiple-choice Strategies',
    level: 'intermediate',
    duration: '25 minutes',
    category: 'Reading',
    description: 'Learn effective strategies for tackling multiple-choice questions in the PTE Academic Reading section.',
    image: 'https://images.pexels.com/photos/4144101/pexels-photo-4144101.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '#'
  },
  {
    id: 2,
    title: 'Mastering PTE Describe Image Task',
    level: 'advanced',
    duration: '35 minutes',
    category: 'Speaking',
    description: 'Detailed tutorial on how to analyze and describe images effectively in the PTE Speaking section.',
    image: 'https://images.pexels.com/photos/7516339/pexels-photo-7516339.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '#'
  },
  {
    id: 3,
    title: 'Introduction to PTE Academic Format',
    level: 'beginner',
    duration: '20 minutes',
    category: 'General',
    description: 'A comprehensive overview of the PTE Academic test format, sections, and scoring system.',
    image: 'https://images.pexels.com/photos/5952651/pexels-photo-5952651.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '#'
  },
  {
    id: 4,
    title: 'PTE Writing: Summarize Written Text',
    level: 'intermediate',
    duration: '30 minutes',
    category: 'Writing',
    description: 'Step-by-step guide to writing effective summaries for the Summarize Written Text task.',
    image: 'https://images.pexels.com/photos/4050312/pexels-photo-4050312.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '#'
  }
];

export const helpCategories: HelpCategory[] = [
  {
    id: 1,
    title: 'Account & Registration',
    icon: 'user',
    description: 'Help with account creation, login issues, and profile management.',
    articles: 15
  },
  {
    id: 2,
    title: 'Payment & Billing',
    icon: 'credit-card',
    description: 'Information about payment methods, refunds, and subscription management.',
    articles: 12
  },
  {
    id: 3,
    title: 'Test Booking',
    icon: 'calendar',
    description: 'Guidance on scheduling, rescheduling, and canceling test appointments.',
    articles: 18
  },
  {
    id: 4,
    title: 'Technical Support',
    icon: 'laptop',
    description: 'Solutions for technical issues with the platform, practice tests, and online materials.',
    articles: 25
  },
  {
    id: 5,
    title: 'Test Day Information',
    icon: 'clipboard',
    description: 'What to expect on test day, ID requirements, and test center protocols.',
    articles: 14
  },
  {
    id: 6,
    title: 'Results & Scoring',
    icon: 'bar-chart',
    description: 'Understanding your score report, score validity, and score sending options.',
    articles: 16
  }
];