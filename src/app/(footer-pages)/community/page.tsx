import React from 'react';
import Section, { SectionHeader } from '@/components/ui/section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Calendar, Star, Award, Globe, BookOpen, Heart } from 'lucide-react';

const CommunityPage: React.FC = () => {
  const communityFeatures = [
    {
      icon: <MessageSquare className="w-8 h-8 text-blue-600" />,
      title: 'Discussion Forums',
      description: 'Connect with peers, ask questions, and share your language learning experiences in our active forums.'
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: 'Study Groups',
      description: 'Join or create study groups to prepare for exams together and practice with fellow test-takers.'
    },
    {
      icon: <Calendar className="w-8 h-8 text-blue-600" />,
      title: 'Virtual Events',
      description: 'Participate in webinars, workshops, and Q&A sessions with language experts and successful test-takers.'
    },
    {
      icon: <Star className="w-8 h-8 text-blue-600" />,
      title: 'Success Stories',
      description: 'Read inspiring stories from community members who achieved their language and education goals.'
    }
  ];

  const testimonials = [
    {
      quote: "The PTE Go Global community helped me improve my speaking score from 65 to 82 in just one month. The practice partners and expert advice made all the difference!",
      author: "Mei Lin",
      location: "Singapore",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      quote: "I found my study group through the community forums, and we practiced together online for six weeks. We all achieved the scores we needed for our university applications!",
      author: "Ahmed Khalid",
      location: "United Arab Emirates",
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      quote: "The weekly writing feedback sessions with community experts helped me identify my weaknesses and improve my writing skills dramatically.",
      author: "Sofia Martinez",
      location: "Colombia",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 py-24 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <svg className="absolute left-0 top-0 h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
            <g transform="translate(300,300)">
              <path d="M140.5,-191.2C186.5,-176.2,230.9,-138.8,249.8,-90.1C268.7,-41.5,262.2,18.4,243.3,72.5C224.4,126.5,193.2,174.6,149.8,200.5C106.5,226.4,51,230.2,-1.2,231.8C-53.5,233.4,-102.7,232.7,-145.8,212.2C-188.9,191.7,-225.8,151.3,-245.6,103.5C-265.4,55.7,-268.1,0.5,-254.3,-47.7C-240.6,-95.9,-210.4,-137.1,-169.8,-157.9C-129.2,-178.7,-78.3,-179.1,-31.8,-183.5C14.8,-187.9,45.9,-195.2,94.5,-206.2C143.1,-217.2,187.3,-231.9,212.6,-214.6C237.9,-197.3,237.3,-148,216.1,-114.8C194.9,-81.7,154,-64.7,117.3,-48.5C80.6,-32.3,48.2,-16.9,11.6,7.5C-24.9,31.9,-66.5,65.3,-83.7,101.6C-100.9,138,-93.8,177.3,-115.4,180.8C-137,184.2,-187.3,152,-209.7,115.7C-232.1,79.5,-226.5,39.3,-219.1,2.1C-211.7,-35.1,-202.5,-69.7,-184,-99.1C-165.5,-128.4,-137.8,-152.5,-106,-172.1C-74.2,-191.6,-38.5,-206.7,1.8,-209C42,-211.3,90.5,-200.8,140.5,-191.2Z" fill="#ffffff" />
            </g>
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Global Learning Community</h1>
            <p className="text-xl opacity-90 mb-8">
              Connect with fellow language learners, share resources, and get support from experts as you work toward your goals.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="default"
                size="lg"
              >
                Join Community
              </Button>
              <Button
                variant="default"
                size="lg"
              >
                Explore Forums
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Features */}
      <Section bgColor="white" spacing="lg">
        <SectionHeader
          title="Community Features"
          subtitle="Resources and connections to support your language learning journey"
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {communityFeatures.map((feature, index) => (
            <Card key={index} className="text-center h-full">
              <CardContent>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Stats Section */}
      <section className="bg-gray-900 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">500K+</div>
              <p className="text-lg opacity-80">Community Members</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">180+</div>
              <p className="text-lg opacity-80">Countries Represented</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">25K+</div>
              <p className="text-lg opacity-80">Active Discussions</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <p className="text-lg opacity-80">Study Groups</p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Leaders */}
      <Section bgColor="light" spacing="lg">
        <SectionHeader
          title="Community Leaders"
          subtitle="Meet the experts and moderators who guide our community"
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <div className="pt-8">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-100">
                <img
                  src="https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Community Leader"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-6 pb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Dr. Robert Chen</h3>
                <p className="text-blue-600 mb-3">Speaking Skills Expert</p>
                <p className="text-gray-600 text-sm mb-4">
                  Former PTE examiner with 15+ years of experience helping students improve their speaking skills.
                </p>
                <div className="flex justify-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Speaking
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Pronunciation
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="text-center">
            <div className="pt-8">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-100">
                <img
                  src="https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Community Leader"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-6 pb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Maria Gonzalez</h3>
                <p className="text-blue-600 mb-3">Writing Coach</p>
                <p className="text-gray-600 text-sm mb-4">
                  Academic writing specialist who has helped thousands of students master essay writing and summarizing skills.
                </p>
                <div className="flex justify-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Writing
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Grammar
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="text-center">
            <div className="pt-8">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-100">
                <img
                  src="https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Community Leader"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-6 pb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Amir Patel</h3>
                <p className="text-blue-600 mb-3">Reading & Listening Expert</p>
                <p className="text-gray-600 text-sm mb-4">
                  Specializes in strategies for the reading and listening sections, with a focus on time management techniques.
                </p>
                <div className="flex justify-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Reading
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Listening
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline">Meet All Community Leaders</Button>
        </div>
      </Section>

      {/* Testimonials */}
      <Section bgColor="white" spacing="lg">
        <SectionHeader
          title="Community Success Stories"
          subtitle="Hear from members who achieved their goals with help from our community"
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.location}</p>
                </div>
              </div>
              <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
              <div className="flex text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Community Programs */}
      <Section bgColor="light" spacing="lg">
        <SectionHeader
          title="Community Programs"
          subtitle="Special initiatives to enhance your learning experience"
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
              <Award className="w-16 h-16 text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mentorship Program</h3>
              <p className="text-gray-600 mb-4">
                Get paired with a successful test-taker who will guide you through your preparation journey with personalized advice.
              </p>
              <Button variant="default" className="w-full">Apply Now</Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-teal-600 to-teal-800 flex items-center justify-center">
              <Globe className="w-16 h-16 text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Language Exchange</h3>
              <p className="text-gray-600 mb-4">
                Practice your speaking skills with native speakers and help others learn your native language in return.
              </p>
              <Button variant="default" className="w-full bg-teal-600 hover:bg-teal-700">Find Partners</Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-purple-600 to-purple-800 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Weekly Workshops</h3>
              <p className="text-gray-600 mb-4">
                Join free weekly online workshops covering different aspects of language skills and test preparation.
              </p>
              <Button variant="default" className="w-full bg-purple-600 hover:bg-purple-700">View Schedule</Button>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <section className="bg-blue-700 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="w-16 h-16 text-white opacity-80 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Join Our Community?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Connect with fellow learners, access expert guidance, and accelerate your language learning journey.
            </p>
            <Button
              variant="default"
              size="lg"
              className="bg-white text-blue-700 hover:bg-gray-100"
            >
              Create Free Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CommunityPage;