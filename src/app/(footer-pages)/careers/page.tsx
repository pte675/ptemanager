"use client"

import React from 'react';
import JobListingSection from './JobListingSection';
import BenefitsSection from './BenefitsSection';
import { Button } from '@/components/ui/button';

const CareersPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-700 to-teal-600 py-24">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Join Our Mission to Transform Global Education
            </h1>
            <p className="text-xl text-white mb-8 opacity-90">
              Be part of a team that's making quality language education accessible to students worldwide.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="default"
                size="lg"
              >
                View Open Positions
              </Button>
              <Button
                variant="default"
                size="lg"
              >
                Our Company Culture
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Culture & Values</h2>
              <p className="text-lg text-gray-700 mb-6">
                At PTE Go Global, we believe that great products come from great teams. We foster a culture of innovation, collaboration, and continuous learning.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Our diverse team brings together experts in education, technology, and business from around the world, united by our mission to make quality language education accessible to all.
              </p>
              <p className="text-lg text-gray-700">
                We value transparency, integrity, and a healthy work-life balance. Our employees are empowered to take ownership of their work and make meaningful contributions to our global impact.
              </p>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-lg">
                <img
                  src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Team meeting"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="overflow-hidden rounded-lg">
                <img
                  src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Team collaboration"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="overflow-hidden rounded-lg">
                <img
                  src="https://images.pexels.com/photos/3182777/pexels-photo-3182777.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Office environment"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="overflow-hidden rounded-lg">
                <img
                  src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Team discussion"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <BenefitsSection />
      <JobListingSection />

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Team Says</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img
                    src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Employee"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">David Kim</h4>
                  <p className="text-gray-600 text-sm">Senior Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Working at PTE Go Global has been the highlight of my career. The challenging problems we solve and the global impact of our work makes every day meaningful."
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img
                    src="https://images.pexels.com/photos/5490276/pexels-photo-5490276.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Employee"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Maria Santos</h4>
                  <p className="text-gray-600 text-sm">Content Development Manager</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "I love being part of a company that values educational excellence and innovation. The supportive team environment and opportunities for growth are unmatched."
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img
                    src="https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Employee"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Alex Johnson</h4>
                  <p className="text-gray-600 text-sm">Marketing Director</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The diverse, international environment at PTE Go Global creates a rich cultural experience. I've grown both professionally and personally working with talented colleagues from around the world."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CareersPage;