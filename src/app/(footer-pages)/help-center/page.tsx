"use client"

import React, { useState } from 'react';
import Section, { SectionHeader } from '@/components/ui/section';
import { helpCategories } from '@/components/footer-pages/mock-data';
import { Search, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  User,
  CreditCard,
  Calendar,
  Laptop,
  Clipboard,
  BarChart
} from "lucide-react";

import type { LucideIcon } from "lucide-react"; // ✅ FIX HERE

const icons: Record<string, LucideIcon> = {
  user: User,
  "credit-card": CreditCard,
  calendar: Calendar,
  laptop: Laptop,
  clipboard: Clipboard,
  "bar-chart": BarChart
};

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const Icon = icons[name] || User;
  return <Icon className={className} />;
};

const popularArticles = [
  "How to reset your password",
  "Understanding your PTE score report",
  "Rescheduling your test appointment",
  "Technical requirements for taking the test",
  "Payment methods and refund policy"
];

const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-16 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">How can we help you?</h1>
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-md"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <Section bgColor="light" spacing="lg">
        <SectionHeader
          title="Browse Help Categories"
          subtitle="Find answers organized by topic"
          centered
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {helpCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md hover:border-blue-200"
            >
              <div className="flex items-start">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <DynamicIcon name={category.icon} className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{category.articles} articles</span>
                    <Button
                      variant="default"
                      size="sm"
                    >
                      View Articles <ArrowRight className="ml-1 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Popular Articles */}
      <Section bgColor="white" spacing="md">
        <SectionHeader
          title="Popular Articles"
          subtitle="Quick answers to our most common questions"
          centered
        />

        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-50 rounded-lg border border-gray-200">
            <ul className="divide-y divide-gray-200">
              {popularArticles.map((article, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="flex items-center p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="mr-4 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-gray-700 hover:text-blue-600 transition-colors">{article}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline">View All Articles</Button>
          </div>
        </div>
      </Section>

      {/* Support Options */}
      <Section bgColor="light" spacing="lg">
        <SectionHeader
          title="Additional Support Options"
          subtitle="Can't find what you're looking for? Get in touch with our support team"
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-200">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">
              Send us a message and we'll respond within 24 hours.
            </p>
            <Button variant="outline" className="w-full">
              support@ptegoglobal.com
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-200">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">
              Chat with our support team in real-time during business hours.
            </p>
            <Button variant="default">
              Start Chat
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-200">
            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-4">
              Call us directly during our support hours: 9 AM - 6 PM (SGT).
            </p>
            <Button variant="outline" className="w-full">
              +65 6123 4567
            </Button>
          </div>
        </div>
      </Section>

      {/* FAQs */}
      <Section bgColor="white" spacing="lg">
        <SectionHeader
          title="Frequently Asked Questions"
          subtitle="Quick answers to common questions"
        />

        <div className="max-w-3xl">
          <div className="space-y-4">
            {[
              {
                question: "How do I reschedule my test?",
                answer: "You can reschedule your test through your account dashboard. Go to 'My Tests', select the test you wish to reschedule, and click on the 'Reschedule' button. Please note that rescheduling fees may apply if done less than 14 days before your test date."
              },
              {
                question: "When will I receive my test results?",
                answer: "PTE Academic test results are typically available within 48 hours after completing your test. You will receive an email notification when your results are ready to view in your account dashboard."
              },
              {
                question: "How long are my test scores valid?",
                answer: "PTE Academic scores are valid for two years from the date of the test. After two years, the scores are no longer available in your account and cannot be reported to institutions."
              },
              {
                question: "Can I cancel my test and get a refund?",
                answer: "Yes, you can cancel your test through your account dashboard. Full refunds are available if cancellation is made at least 14 days before your scheduled test. Partial refunds may be available for cancellations made 7-14 days before the test. No refunds are given for cancellations less than 7 days before the test."
              }
            ].map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-4">
                    <span className="text-gray-800 font-semibold">{faq.question}</span>
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                  </summary>
                  <div className="text-gray-600 p-4 pt-0">
                    {faq.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Button
              variant="outline"
              className="flex items-center"
            >
              View All FAQs <ExternalLink className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </div>
      </Section>

      {/* Feedback Section */}
      <section className="bg-blue-50 py-12 border-t border-blue-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Was this helpful?</h2>
            <p className="text-gray-600 mb-6">
              We're constantly improving our help center. Let us know how we can make it better.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline">Yes, it was helpful</Button>
              <Button variant="outline">No, I need more help</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenterPage;