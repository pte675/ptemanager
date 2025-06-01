"use client"

import React, { useState } from 'react';
import Section, { SectionHeader } from '@/components/ui/section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { languageGuides } from '@/components/footer-pages/mock-data';
import { BookOpen, Search, Filter } from 'lucide-react';

const LanguageGuidesPage: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const levels = Array.from(new Set(languageGuides.map(guide => guide.level)));

  // Filter guides based on level and search
  const filteredGuides = languageGuides.filter(guide => {
    const matchesLevel = selectedLevel === null || guide.level === selectedLevel;
    const matchesSearch = searchQuery === '' ||
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLevel && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Language Learning Guides</h1>
            <p className="text-xl opacity-90 mb-8">
              Comprehensive resources to help you master English for academic, professional, and everyday communication.
            </p>

            <div className="max-w-md mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-md leading-5 bg-white/10 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent backdrop-blur-sm text-white"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-12">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-6">
                <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Featured Guide</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={languageGuides[3].image}
                      alt={languageGuides[3].title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
                <div className="md:w-2/3">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                      {languageGuides[3].language}
                    </span>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {languageGuides[3].level}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{languageGuides[3].title}</h3>
                  <p className="text-gray-600 mb-6">{languageGuides[3].description}</p>
                  <Button>Access Guide</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guides Section */}
      <Section bgColor="light" spacing="lg">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <SectionHeader
            title="Browse All Guides"
            subtitle="Resources tailored to your language learning goals"
            className="mb-0"
          />

          <div className="flex items-center mt-4 md:mt-0">
            <Filter className="w-5 h-5 text-gray-500 mr-2" />
            <span className="text-gray-700 mr-3">Filter by level:</span>

            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${selectedLevel === null ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setSelectedLevel(null)}
              >
                All
              </button>

              {levels.map((level, index) => (
                <button
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${selectedLevel === level ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  onClick={() => setSelectedLevel(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGuides.map((guide) => (
            <Card key={guide.id}>
              <div className="relative h-48 overflow-hidden">
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-0 right-0 mt-3 mr-3 flex gap-2">
                  <span className="bg-blue-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {guide.language}
                  </span>
                  <span className="bg-purple-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {guide.level}
                  </span>
                </div>
              </div>
              <CardContent>
                <h3 className="font-bold text-xl text-gray-900 mb-3">{guide.title}</h3>
                <p className="text-gray-600 mb-4">{guide.description}</p>
                <Button variant="outline" className="w-full">View Guide</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGuides.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No guides found</h3>
            <p className="text-gray-500 mb-6">
              We couldn't find any guides matching your search criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel(null);
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </Section>

      {/* Learning Pathways */}
      <Section bgColor="white" spacing="lg">
        <SectionHeader
          title="Learning Pathways"
          subtitle="Structured programs to guide your language learning journey"
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-700 font-bold text-2xl">1</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Beginner Pathway</h3>
            <p className="text-gray-700 mb-4">
              Start your English learning journey with fundamental skills for everyday communication.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-blue-700 font-medium text-xs">1</span>
                </div>
                <span className="text-gray-600">Essential Vocabulary</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-blue-700 font-medium text-xs">2</span>
                </div>
                <span className="text-gray-600">Basic Grammar Structures</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-blue-700 font-medium text-xs">3</span>
                </div>
                <span className="text-gray-600">Simple Conversations</span>
              </li>
            </ul>
            <Button variant="default" className="w-full">Explore Path</Button>
          </div>

          <div className="bg-teal-50 rounded-lg p-6 border border-teal-100">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-teal-700 font-bold text-2xl">2</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Intermediate Pathway</h3>
            <p className="text-gray-700 mb-4">
              Enhance your skills with more complex language for academic and professional settings.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-teal-700 font-medium text-xs">1</span>
                </div>
                <span className="text-gray-600">Advanced Grammar</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-teal-700 font-medium text-xs">2</span>
                </div>
                <span className="text-gray-600">Academic Writing</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-teal-700 font-medium text-xs">3</span>
                </div>
                <span className="text-gray-600">Professional Communication</span>
              </li>
            </ul>
            <Button variant="default" className="w-full bg-teal-600 hover:bg-teal-700">Explore Path</Button>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-purple-700 font-bold text-2xl">3</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Advanced Pathway</h3>
            <p className="text-gray-700 mb-4">
              Master sophisticated language skills required for academic excellence and professional success.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-purple-700 font-medium text-xs">1</span>
                </div>
                <span className="text-gray-600">Critical Analysis</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-purple-700 font-medium text-xs">2</span>
                </div>
                <span className="text-gray-600">Research Writing</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-purple-700 font-medium text-xs">3</span>
                </div>
                <span className="text-gray-600">Advanced Speaking</span>
              </li>
            </ul>
            <Button variant="default" className="w-full bg-purple-600 hover:bg-purple-700">Explore Path</Button>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Start Your Language Learning Journey Today</h2>
            <p className="text-xl opacity-90 mb-8">
              Access our comprehensive guides and expert resources to achieve your language goals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="default"
                size="lg"
              >
                Create Free Account
              </Button>
              <Button
                variant="default"
                size="lg"
              >
                Explore Premium Guides
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LanguageGuidesPage;