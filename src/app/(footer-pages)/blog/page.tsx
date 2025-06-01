"use client"

import React, { useState } from 'react';
import { blogPosts } from '@/components/footer-pages/mock-data';
import { Search, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const BlogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories
  const categories = Array.from(new Set(blogPosts.map(post => post.category)));

  // Filter posts based on search and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredPost = blogPosts[0]; // Assuming the first post is featured

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">PTE Go Global Blog</h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Expert insights, tips, and resources for PTE Academic preparation and international education
              </p>
            </div>
            <div className="mt-6 md:mt-0 w-full md:w-auto">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Article</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2">
                <div className="h-64 md:h-full">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="md:w-1/2 p-6 md:p-8">
                <div className="flex items-center mb-3">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {featuredPost.category}
                  </span>
                  <span className="mx-2 text-gray-300">•</span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-3 h-3 mr-1" />
                    {featuredPost.date}
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  {featuredPost.title}
                </h3>
                <p className="text-gray-600 mb-4">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <p className="text-sm text-gray-500">{featuredPost.readTime}</p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center"
                  >
                    Read Article <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row">
            {/* Main Column */}
            <div className="lg:w-3/4 lg:pr-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Articles</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPosts.map((post) => (
                    <Card key={post.id}>
                      <div className="h-48 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                      <CardContent>
                        <div className="flex items-center mb-3 mt-5">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {post.category}
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Calendar className="w-3 h-3 mr-1" />
                            {post.date}
                          </div>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">{post.excerpt}</p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center">
                            <p className="text-xs text-gray-500">{post.readTime}</p>
                          </div>
                          <Button
                            variant="default"
                            size="sm">
                            Read More <ChevronRight className="ml-1 w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredPosts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No articles found matching your criteria.</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory(null);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-center mt-8">
                <Button variant="outline">Load More Articles</Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/4 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                <ul>
                  <li className="mb-2">
                    <button
                      className={`text-left w-full py-1.5 px-2 rounded-md transition-colors ${selectedCategory === null ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => setSelectedCategory(null)}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map((category, index) => (
                    <li key={index} className="mb-2">
                      <button
                        className={`text-left w-full py-1.5 px-2 rounded-md transition-colors ${selectedCategory === category ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Subscribe to Updates</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Get the latest articles, tips, and resources delivered directly to your inbox.
                </p>
                <div className="mb-4">
                  <input
                    type="email"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Your email address"
                  />
                </div>
                <Button variant="default">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;