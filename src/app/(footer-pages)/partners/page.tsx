import React from 'react';
import Section, { SectionHeader } from '@/components/ui/section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { partners } from '@/components/footer-pages/mock-data';
import { CheckCircle, ArrowRight, GraduationCap, Building, Globe } from 'lucide-react';

// Custom HandshakeIcon since it doesn't exist in lucide-react
const HandshakeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
    <path d="M12 5.36 8.87 8.5a2.13 2.13 0 0 0 0 3h0a2.13 2.13 0 0 0 3 0l2.26-2.21a2.13 2.13 0 0 1 3 0h0a2.13 2.13 0 0 1 0 3l-4.25 4.21"></path>
  </svg>
);

const PartnersPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Partners & Collaborators</h1>
            <p className="text-xl opacity-90 mb-8">
              Join our global network of educational institutions, technology providers, and organizations committed to advancing language education worldwide.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="default"
                className="bg-white text-blue-800 hover:bg-gray-100"
              >
                Become a Partner
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Partner Benefits
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Current Partners */}
      <Section bgColor="white" spacing="lg">
        <SectionHeader
          title="Our Global Partners"
          subtitle="Working together to transform language education and assessment"
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {partners.map((partner) => (
            <Card key={partner.id} className="text-center">
              <div className="h-48 flex items-center justify-center p-6 border-b border-gray-100">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <CardContent>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
                  {partner.category}
                </span>
                <h3 className="font-bold text-xl text-gray-900 mb-2">{partner.name}</h3>
                <p className="text-gray-600 text-sm">{partner.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline">View All Partners</Button>
        </div>
      </Section>

      {/* Partnership Types */}
      <Section bgColor="light" spacing="lg">
        <SectionHeader
          title="Partnership Opportunities"
          subtitle="Explore how your organization can collaborate with PTE Go Global"
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600 h-full flex flex-col">
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Educational Institutions</h3>
            </div>
            <p className="text-gray-600 mb-6 flex-grow">
              Universities, colleges, and language schools can integrate our assessment tools and access special institutional rates.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700">Discounted bulk testing packages</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700">Integration with student management systems</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700">Teacher training and certification</span>
              </li>
            </ul>
            <Button
              variant="outline"
              className="flex items-center justify-center mt-auto"
            >
              Learn More <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-teal-600 h-full flex flex-col">
            <div className="mb-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <Building className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Corporate Partners</h3>
            </div>
            <p className="text-gray-600 mb-6 flex-grow">
              Organizations seeking language assessment solutions for recruitment, training, or employee development.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700">Custom testing programs for recruitment</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700">Business English assessment tools</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700">Employee language training programs</span>
              </li>
            </ul>
            <Button
              variant="outline"
              className="flex items-center justify-center mt-auto"
            >
              Learn More <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-yellow-500 h-full flex flex-col">
            <div className="mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Globe className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Technology Partners</h3>
            </div>
            <p className="text-gray-600 mb-6 flex-grow">
              EdTech companies and technology providers looking to integrate language assessment capabilities into their platforms.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700">API access for seamless integration</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700">White-label assessment solutions</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700">Joint development opportunities</span>
              </li>
            </ul>
            <Button
              variant="outline"
              className="flex items-center justify-center mt-auto"
            >
              Learn More <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </div>
      </Section>

      {/* Partnership Process */}
      <Section bgColor="white" spacing="lg">
        <SectionHeader
          title="Partnership Process"
          subtitle="How to establish a collaboration with PTE Go Global"
          centered
        />

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Progress line */}
            <div className="hidden md:block absolute top-24 left-0 w-full h-1 bg-gray-200">
              <div className="absolute top-0 left-0 h-full bg-blue-600 w-1/3"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center relative">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Initial Consultation</h3>
                <p className="text-gray-600">
                  Connect with our partnership team to discuss your organization's needs and explore collaboration opportunities.
                </p>
              </div>

              <div className="text-center relative">
                <div className="w-16 h-16 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="text-blue-600 font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Proposal Development</h3>
                <p className="text-gray-600">
                  We'll work together to create a tailored partnership plan that aligns with your strategic objectives.
                </p>
              </div>

              <div className="text-center relative">
                <div className="w-16 h-16 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="text-gray-500 font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Implementation</h3>
                <p className="text-gray-600">
                  Our dedicated partnership management team will guide you through the implementation process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <section className="bg-blue-700 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <HandshakeIcon className="w-16 h-16 text-white opacity-80 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Partner With Us?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join our global network of partners and help shape the future of language education and assessment.
            </p>
            <Button
              variant="default"
              size="lg"
              className="bg-white text-blue-700 hover:bg-gray-100"
            >
              Contact Our Partnership Team
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartnersPage;