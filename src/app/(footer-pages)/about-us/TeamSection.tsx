import React from 'react';
import Section, { SectionHeader } from '@/components/ui/section';
import { Card, CardContent } from '@/components/ui/card';
import { teamMembers } from '@/components/footer-pages/mock-data';

const TeamSection: React.FC = () => {
  return (
    <Section bgColor="light" spacing="lg">
      <SectionHeader
        title="Our Leadership Team"
        subtitle="Meet the experienced professionals guiding PTE Go Global's mission and vision"
        centered
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {teamMembers.map((member) => (
          <Card key={member.id} className="h-full">
            <div className="aspect-square overflow-hidden">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <CardContent>
              <h3 className="font-bold text-xl text-gray-900">{member.name}</h3>
              <p className="text-blue-600 mb-3">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.bio}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 bg-white rounded-lg shadow-md p-8 border border-gray-100">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/3 mb-6 md:mb-0">
            <div className="rounded-full w-32 h-32 overflow-hidden mx-auto border-4 border-blue-100">
              <img
                src="https://images.pexels.com/photos/3772616/pexels-photo-3772616.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Company founder"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="md:w-2/3 md:pl-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
            <p className="text-gray-700 mb-4">
              Founded in 2019 by Sarah Johnson, PTE Go Global began with a simple mission: to make quality language education and testing accessible to everyone. After experiencing firsthand the challenges international students face with language requirements, Sarah assembled a team of education and technology experts to create a better solution.
            </p>
            <p className="text-gray-700">
              Today, PTE Go Global has grown from a small startup to a recognized leader in language testing preparation, serving students in over 150 countries and partnering with educational institutions worldwide.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default TeamSection;