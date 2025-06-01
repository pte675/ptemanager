import React from 'react';
import Section, { SectionHeader } from '@/components/ui/section';
import { Globe, Users, Target, Award } from 'lucide-react';

const MissionSection: React.FC = () => {
  const values = [
    {
      icon: <Globe className="w-12 h-12 text-blue-600" />,
      title: 'Global Accessibility',
      description: 'Making quality language education accessible to students worldwide, regardless of location or background.'
    },
    {
      icon: <Users className="w-12 h-12 text-blue-600" />,
      title: 'Student-Centered Approach',
      description: 'Developing tools and resources with the student experience at the center of every decision.'
    },
    {
      icon: <Target className="w-12 h-12 text-blue-600" />,
      title: 'Continuous Innovation',
      description: 'Constantly improving our methods and technology to provide the most effective learning experience.'
    },
    {
      icon: <Award className="w-12 h-12 text-blue-600" />,
      title: 'Educational Excellence',
      description: 'Maintaining the highest standards of educational quality and academic integrity.'
    }
  ];

  return (
    <Section bgColor="white" spacing="xl">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 mb-6">
            At PTE Go Global, we're committed to breaking down language barriers and opening doors to educational and professional opportunities worldwide.
          </p>
          <p className="text-lg text-gray-700 mb-6">
            Our mission is to provide accessible, high-quality language testing and preparation services that empower individuals to achieve their international education and career goals.
          </p>
          <p className="text-lg text-gray-700">
            Through innovative technology, expert-developed content, and personalized learning approaches, we help students confidently demonstrate their English language proficiency and succeed in their global endeavors.
          </p>
        </div>
        <div className="relative">
          <div className="aspect-video rounded-lg overflow-hidden">
            <img
              src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Team collaboration"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-600 rounded-lg hidden md:block"></div>
        </div>
      </div>

      <div className="mt-24">
        <SectionHeader
          title="Our Core Values"
          subtitle="The principles that guide everything we do at PTE Go Global"
          centered
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default MissionSection;