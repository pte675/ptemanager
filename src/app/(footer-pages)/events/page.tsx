"use client"
import React, { useState } from 'react';
import Section, { SectionHeader } from '@/components/ui/section';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { events } from '@/components/footer-pages/mock-data';
import { Calendar, MapPin, Clock, ExternalLink, Filter } from 'lucide-react';

const EventsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Extract unique event types
  const eventTypes = Array.from(new Set(events.map(event => event.type)));

  // Filter events
  const filteredEvents = events.filter(event => {
    return selectedType === null || event.type === selectedType;
  });

  // Get event type badge color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'webinar': return 'bg-blue-100 text-blue-800';
      case 'workshop': return 'bg-green-100 text-green-800';
      case 'conference': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-700 to-purple-700 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Upcoming Events & Webinars</h1>
            <p className="text-xl opacity-90 mb-8">
              Join our live events to learn from experts, practice your skills, and connect with fellow test-takers
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="default"
                size="lg"
              >
                Register for Events
              </Button>
              <Button
                variant="default"
                size="lg"
              >
                View Calendar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Event */}
      <div className="container mx-auto px-4 -mt-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100">
            <div className="md:flex">
              <div className="md:w-2/5">
                <div className="h-64 md:h-full">
                  <img
                    src={events[1].image}
                    alt={events[1].title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="md:w-3/5 p-6 md:p-8">
                <div className="flex items-center mb-4">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                    FEATURED EVENT
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {events[1].type.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{events[1].title}</h2>
                <div className="flex flex-col space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{events[1].date}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{events[1].time}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{events[1].location}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{events[1].description}</p>
                <Button>Register Now</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <Section bgColor="light" spacing="lg">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <SectionHeader
            title="Upcoming Events"
            subtitle="Attend our educational events and advance your learning"
            className="mb-0"
          />

          <div className="mt-4 md:mt-0 flex items-center">
            <Filter className="w-5 h-5 text-gray-500 mr-2" />
            <span className="text-gray-700 mr-3">Filter by type:</span>

            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${selectedType === null ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setSelectedType(null)}
              >
                All
              </button>

              {eventTypes.map((type, index) => (
                <button
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${selectedType === type ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  onClick={() => setSelectedType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <Card key={event.id}>
              <div className="h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <CardContent>
                <div className="flex items-center mb-3">
                  <span className={`${getEventTypeColor(event.type)} mt-5 text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                    {event.type.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">{event.title}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{event.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="default" className="w-full">Register</Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No events found</h3>
            <p className="text-gray-500 mb-6">
              We couldn't find any events matching your filter criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => setSelectedType(null)}
            >
              View All Events
            </Button>
          </div>
        )}
      </Section>

      {/* Past Events */}
      <Section bgColor="white" spacing="lg">
        <SectionHeader
          title="Past Events"
          subtitle="Access recordings and materials from our previous events"
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center mb-3">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                WEBINAR
              </span>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-3">PTE Speaking Strategies: Describe Image Task</h3>
            <div className="flex items-center text-gray-600 text-sm mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              <span>April 15, 2025</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center"
            >
              Watch Recording <ExternalLink className="ml-1 w-4 h-4" />
            </Button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center mb-3">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                WORKSHOP
              </span>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-3">Writing for PTE: Essay Structure Workshop</h3>
            <div className="flex items-center text-gray-600 text-sm mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              <span>March 28, 2025</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center"
            >
              Access Materials <ExternalLink className="ml-1 w-4 h-4" />
            </Button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center mb-3">
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                CONFERENCE
              </span>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-3">Global English Assessment Summit 2025</h3>
            <div className="flex items-center text-gray-600 text-sm mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              <span>February 10-12, 2025</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center"
            >
              View Presentations <ExternalLink className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline">View All Past Events</Button>
        </div>
      </Section>

      {/* Host Your Own Event */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-6">Want to Host Your Own Event?</h2>
            <p className="text-xl opacity-90 mb-8">
              If you're an educator, institution, or organization interested in hosting a PTE-related event, we'd love to collaborate.
            </p>
            <Button
              variant="default"
              size="lg"
              className="bg-white text-indigo-700 hover:bg-gray-100"
            >
              Partner With Us
            </Button>
          </div>
        </div>
      </section>

      {/* Event Calendar */}
      <Section bgColor="light" spacing="lg">
        <SectionHeader
          title="Event Calendar"
          subtitle="Plan ahead with our upcoming events schedule"
        />

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center border-b border-gray-200 pb-4">
              <div className="md:w-1/6 mb-2 md:mb-0">
                <div className="bg-indigo-100 text-indigo-800 font-bold rounded-lg p-2 text-center">
                  JUN 5
                </div>
              </div>
              <div className="md:w-3/6 mb-2 md:mb-0">
                <h3 className="font-bold text-gray-900">Study Abroad Information Session</h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>6:00 PM - 8:00 PM (IST)</span>
                </div>
              </div>
              <div className="md:w-1/6 mb-2 md:mb-0">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  WEBINAR
                </span>
              </div>
              <div className="md:w-1/6 text-right">
                <Button variant="outline" size="sm">Register</Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center border-b border-gray-200 pb-4">
              <div className="md:w-1/6 mb-2 md:mb-0">
                <div className="bg-indigo-100 text-indigo-800 font-bold rounded-lg p-2 text-center">
                  JUN 15
                </div>
              </div>
              <div className="md:w-3/6 mb-2 md:mb-0">
                <h3 className="font-bold text-gray-900">PTE Academic Masterclass: Speaking and Writing</h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>10:00 AM - 12:00 PM (GMT)</span>
                </div>
              </div>
              <div className="md:w-1/6 mb-2 md:mb-0">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  WEBINAR
                </span>
              </div>
              <div className="md:w-1/6 text-right">
                <Button variant="outline" size="sm">Register</Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center border-b border-gray-200 pb-4">
              <div className="md:w-1/6 mb-2 md:mb-0">
                <div className="bg-indigo-100 text-indigo-800 font-bold rounded-lg p-2 text-center">
                  JUN 28
                </div>
              </div>
              <div className="md:w-3/6 mb-2 md:mb-0">
                <h3 className="font-bold text-gray-900">AI in Language Assessment Workshop</h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>2:00 PM - 5:00 PM (EST)</span>
                </div>
              </div>
              <div className="md:w-1/6 mb-2 md:mb-0">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  WORKSHOP
                </span>
              </div>
              <div className="md:w-1/6 text-right">
                <Button variant="outline" size="sm">Register</Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center">
              <div className="md:w-1/6 mb-2 md:mb-0">
                <div className="bg-indigo-100 text-indigo-800 font-bold rounded-lg p-2 text-center">
                  JUL 10-12
                </div>
              </div>
              <div className="md:w-3/6 mb-2 md:mb-0">
                <h3 className="font-bold text-gray-900">Global Education Summit 2025</h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>Singapore Expo Center</span>
                </div>
              </div>
              <div className="md:w-1/6 mb-2 md:mb-0">
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  CONFERENCE
                </span>
              </div>
              <div className="md:w-1/6 text-right">
                <Button variant="outline" size="sm">Register</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="default"
            className="flex items-center mx-auto"
          >
            <Calendar className="mr-2 w-5 h-5" /> Subscribe to Calendar
          </Button>
        </div>
      </Section>

      {/* CTA Section */}
      <section className="bg-indigo-50 py-16 border-t border-indigo-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Never Miss an Event</h2>
            <p className="text-xl text-gray-600 mb-8">
              Subscribe to our event notifications and stay updated on upcoming webinars, workshops, and conferences.
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex">
                <input
                  type="email"
                  className="flex-grow px-4 py-3 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Your email address"
                />
                <Button
                  variant="default"
                  className="rounded-l-none"
                >
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

export default EventsPage;