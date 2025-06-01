import React from 'react';
import Section, { SectionHeader } from '@/components/ui/section';
import { Globe, Clock, Briefcase, GraduationCap, Heart, Coffee } from 'lucide-react';

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: <Globe className="w-8 h-8 text-blue-600" />,
      title: 'International Environment',
      description: 'Work with colleagues and partners from around the world in a truly global company.'
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: 'Flexible Working',
      description: 'Enjoy flexible hours and remote work options to maintain your ideal work-life balance.'
    },
    {
      icon: <Briefcase className="w-8 h-8 text-blue-600" />,
      title: 'Competitive Compensation',
      description: 'Receive salary and benefits packages that recognize and reward your contributions.'
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-blue-600" />,
      title: 'Learning & Development',
      description: 'Access continuous professional development opportunities and education allowances.'
    },
    {
      icon: <Heart className="w-8 h-8 text-blue-600" />,
      title: 'Health & Wellbeing',
      description: 'Comprehensive health insurance and wellness programs to support your physical and mental health.'
    },
    {
      icon: <Coffee className="w-8 h-8 text-blue-600" />,
      title: 'Vibrant Culture',
      description: 'Join a supportive, innovative culture with regular team events and activities.'
    }
  ];

  return (
    <Section bgColor="light" spacing="lg">
      <SectionHeader
        title="Why Join Our Team"
        subtitle="At PTE Go Global, we believe in creating an environment where talented people can thrive"
        centered
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg"
          >
            <div className="rounded-full bg-blue-100 w-16 h-16 flex items-center justify-center mb-4">
              {benefit.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
            <p className="text-gray-600">{benefit.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center">
          <div className="md:w-2/3 mb-8 md:mb-0 md:pr-8">
            <h3 className="text-2xl font-bold text-white mb-4">Don't see a position that fits?</h3>
            <p className="text-blue-100 mb-6">
              We're always looking for talented individuals to join our team. Send us your resume and tell us how you can contribute to our mission.
            </p>
            <button className="bg-white text-blue-700 font-medium py-2 px-6 rounded-md hover:bg-blue-50 transition-colors">
              Submit Your Resume
            </button>
          </div>
          <div className="md:w-1/3">
            <img
              src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Team collaboration"
              className="rounded-lg w-full h-auto shadow-lg"
            />
          </div>
        </div>
      </div>
    </Section>
  );
};

export default BenefitsSection;