import React, { useState } from 'react';
import Section, { SectionHeader } from '@/components/ui/section';
import { Card, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { jobs } from '@/components/footer-pages/mock-data';
import { MapPin, Briefcase, Calendar } from 'lucide-react';

const JobListingSection: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Extract unique departments and locations for filters
  const departments = Array.from(new Set(jobs.map(job => job.department)));
  const locations = Array.from(new Set(jobs.map(job => job.location)));

  const filteredJobs = jobs.filter(job => {
    if (selectedDepartment && job.department !== selectedDepartment) return false;
    if (selectedLocation && job.location !== selectedLocation) return false;
    return true;
  });

  return (
    <Section bgColor="white" spacing="lg">
      <SectionHeader
        title="Current Openings"
        subtitle="Join our team and help shape the future of global language education"
      />

      <div className="mb-8 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSelectedDepartment(e.target.value || null)}
            value={selectedDepartment || ''}
          >
            <option value="">All Departments</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSelectedLocation(e.target.value || null)}
            value={selectedLocation || ''}
          >
            <option value="">All Locations</option>
            {locations.map((loc, index) => (
              <option key={index} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {(selectedDepartment || selectedLocation) && (
          <div className="self-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedDepartment(null);
                setSelectedLocation(null);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
                      {job.department}
                    </span>
                    <CardTitle>{job.title}</CardTitle>
                  </div>
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {job.type}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Posted: {job.postedDate}</span>
                  </div>
                </div>

                <CardDescription className="mt-4">{job.description}</CardDescription>

                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end">
                <Button>Apply Now</Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-2 py-16 text-center">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No positions found</h3>
            <p className="text-gray-600 mb-4">
              There are currently no open positions matching your filters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedDepartment(null);
                setSelectedLocation(null);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Section>
  );
};

export default JobListingSection;