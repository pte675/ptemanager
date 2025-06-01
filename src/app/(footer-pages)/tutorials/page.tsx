'use client'

import React, { useState } from 'react';
import Section, { SectionHeader } from '@/components/ui/section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { tutorials } from '@/components/footer-pages/mock-data';
import { Clock, BookOpen, Search } from 'lucide-react';

const TutorialsPage: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = Array.from(new Set(tutorials.map(t => t.category)));
  const levels = ['beginner', 'intermediate', 'advanced'];

  const filteredTutorials = tutorials.filter(t => {
    const matchesLevel = selectedLevel === null || t.level === selectedLevel;
    const matchesCategory = selectedCategory === null || t.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesCategory && matchesSearch;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-600';
      case 'intermediate': return 'bg-blue-600';
      case 'advanced': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-800 to-indigo-900 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">PTE Academic Tutorials</h1>
            <p className="text-xl opacity-90 mb-8">
              Step-by-step guides to help you master every section of the PTE Academic test
            </p>
            <div className="max-w-md mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 rounded-md bg-white/10 text-white placeholder-white/60 backdrop-blur-sm focus:ring-2 focus:ring-white focus:outline-none"
                placeholder="Search tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tutorial List */}
      <Section bgColor="light" spacing="lg">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <SectionHeader
            title="Browse All Tutorials"
            subtitle="Step-by-step guides for PTE Academic success"
            className="mb-0"
          />
          <div className="mt-4 md:mt-0 flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium ${selectedLevel === null ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  onClick={() => setSelectedLevel(null)}
                >
                  All
                </button>
                {levels.map((level, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${selectedLevel === level ? `${getLevelColor(level)} text-white` : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    onClick={() => setSelectedLevel(level)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {(selectedLevel || selectedCategory) && (
              <div className="self-end">
                <Button variant="outline" size="sm" onClick={() => {
                  setSelectedLevel(null);
                  setSelectedCategory(null);
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTutorials.map((tutorial) => (
            <Card key={tutorial.id} className="transition-transform duration-300 hover:-translate-y-1 shadow-md">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={tutorial.image}
                  alt={tutorial.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-0 right-0 mt-3 mr-3 flex gap-2">
                  <span className={`${getLevelColor(tutorial.level)} text-white text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                    {tutorial.level.charAt(0).toUpperCase() + tutorial.level.slice(1)}
                  </span>
                </div>
              </div>
              <CardContent>
                <div className="mt-5 flex items-center mb-3">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {tutorial.category}
                  </span>
                  <span className="mx-2 text-gray-300">•</span>
                  <div className="flex items-center text-gray-500 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {tutorial.duration}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">{tutorial.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{tutorial.description}</p>
                <Button variant="default" className="w-full">Watch Tutorial</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTutorials.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No tutorials found</h3>
            <p className="text-gray-500 mb-6">
              We couldn't find any tutorials matching your search criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel(null);
                setSelectedCategory(null);
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </Section>
    </div>
  );
};

export default TutorialsPage;