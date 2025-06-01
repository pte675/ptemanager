"use client"

import React from 'react';
import Section, { SectionHeader } from '@/components/ui/section';
import { pressReleases } from '@/components/footer-pages/mock-data';
import { ExternalLink, Download, Copy, Mail, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PressPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-900 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Press & Media</h1>
            <p className="text-xl opacity-90 mb-8">
              Find the latest news, press releases, and media resources about PTE Go Global's mission to transform language education worldwide.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="default"
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                Latest News
              </Button>
              <Button
                variant="default"
                className="border-white text-white hover:bg-white/10"
              >
                Media Kit
              </Button>
              <Button
                variant="default"
                className="border-white text-white hover:bg-white/10"
              >
                Contact Press Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <Section bgColor="white" spacing="lg">
        <SectionHeader
          title="Press Releases"
          subtitle="The latest announcements and news from PTE Go Global"
        />

        <div className="space-y-6">
          {pressReleases.map((release) => (
            <div
              key={release.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span>{release.date}</span>
                    <span>•</span>
                    <span>{release.source}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{release.title}</h3>
                  <p className="text-gray-600 mb-4">{release.excerpt}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center"
                  >
                    Read Full Release <ExternalLink className="ml-1 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="default">
            View All Press Releases
          </Button>
        </div>
      </Section>

      {/* Media Kit */}
      <Section bgColor="light" spacing="lg">
        <SectionHeader
          title="Media Resources"
          subtitle="Download logos, executive photos, and brand assets for media use"
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
              <div className="text-white text-5xl font-bold">Logo</div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Company Logos</h3>
              <p className="text-gray-600 text-sm mb-4">
                Download our logo in various formats for print and digital use.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center"
                >
                  <Download className="mr-1 w-4 h-4" /> PNG
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center"
                >
                  <Download className="mr-1 w-4 h-4" /> SVG
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center"
                >
                  <Download className="mr-1 w-4 h-4" /> EPS
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center">
              <div className="text-white text-4xl font-bold">Executive Photos</div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Executive Photos</h3>
              <p className="text-gray-600 text-sm mb-4">
                High-resolution photos of our leadership team for media use.
              </p>
              <Button
                variant="default"
                size="sm"
                className="w-full flex items-center justify-center"
              >
                <Download className="mr-1 w-4 h-4" /> Download All Photos
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-teal-600 to-teal-800 flex items-center justify-center">
              <div className="text-white text-4xl font-bold">Brand Kit</div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Brand Guidelines</h3>
              <p className="text-gray-600 text-sm mb-4">
                Our complete brand guidelines, including color palette and typography.
              </p>
              <Button
                variant="default"
                size="sm"
                className="w-full flex items-center justify-center"
              >
                <Download className="mr-1 w-4 h-4" /> Download Brand Kit
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Company Facts */}
      <Section bgColor="white" spacing="lg">
        <SectionHeader
          title="Company Facts"
          subtitle="Key information about PTE Go Global for journalists and media professionals"
        />

        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">About PTE Go Global</h3>
              <ul className="space-y-4">
                <li className="flex">
                  <div className="flex-shrink-0 w-28 font-medium text-gray-700">Founded:</div>
                  <div className="flex-1 text-gray-600">2019</div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 w-28 font-medium text-gray-700">Headquarters:</div>
                  <div className="flex-1 text-gray-600">Singapore, with offices in London, Sydney, and Toronto</div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 w-28 font-medium text-gray-700">Employees:</div>
                  <div className="flex-1 text-gray-600">350+ worldwide</div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 w-28 font-medium text-gray-700">Funding:</div>
                  <div className="flex-1 text-gray-600">$45M in Series B funding (2024)</div>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 w-28 font-medium text-gray-700">Users:</div>
                  <div className="flex-1 text-gray-600">5+ million registered users across 150+ countries</div>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Key Achievements</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Named "EdTech Company of the Year" by Education Technology Insights (2025)</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Partnerships with over 3,000 educational institutions worldwide</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Recognized for AI innovation in language assessment technology</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">98% student satisfaction rate based on independent surveys</span>
                </li>
              </ul>

              <div className="mt-6">
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center"
                >
                  <Copy className="mr-1 w-4 h-4" /> Copy Company Facts
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Media Contact */}
      <section className="bg-blue-700 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Media Contact</h2>
            <p className="text-xl opacity-90 mb-8">
              For press inquiries, interview requests, or additional information, please contact our media relations team.
            </p>

            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <p className="font-medium mb-1">Media Relations</p>
                  <p className="opacity-90 mb-4">press@ptegoglobal.com</p>
                  <Button
                    variant="default"
                    size="sm"
                    className="border-white text-white hover:bg-white/10 flex items-center"
                  >
                    <Mail className="mr-1 w-4 h-4" /> Email Media Team
                  </Button>
                </div>

                <div>
                  <p className="font-medium mb-1">Press Office Hours</p>
                  <p className="opacity-90">Monday to Friday: 9 AM - 6 PM (SGT)</p>
                  <p className="opacity-90 mb-4">Response within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PressPage;