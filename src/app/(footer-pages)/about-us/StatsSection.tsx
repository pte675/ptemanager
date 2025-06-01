import React from 'react';
import { Users, GraduationCap, Globe, Building } from 'lucide-react';

const StatsSection: React.FC = () => {
  const stats = [
    { 
      icon: <Users className="w-10 h-10 text-white" />,
      value: '5M+', 
      label: 'Students Helped',
      description: 'Learners who have used our platform to achieve their goals' 
    },
    { 
      icon: <GraduationCap className="w-10 h-10 text-white" />,
      value: '3,000+', 
      label: 'Partner Institutions',
      description: 'Universities and colleges accepting our certification' 
    },
    { 
      icon: <Globe className="w-10 h-10 text-white" />,
      value: '150+', 
      label: 'Countries',
      description: 'Global reach across continents and cultures' 
    },
    { 
      icon: <Building className="w-10 h-10 text-white" />,
      value: '98%', 
      label: 'Satisfaction Rate',
      description: 'Students who would recommend our services' 
    }
  ];
  
  return (
    <section className="bg-blue-600 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Our Global Impact</h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            PTE Go Global is transforming language education around the world
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-blue-700 rounded-lg p-6 transform transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="bg-blue-800 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                {stat.icon}
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">{stat.value}</h3>
              <p className="text-xl font-medium text-blue-100 mb-2">{stat.label}</p>
              <p className="text-blue-200">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;