'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Zap, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Program = 'pre-incubator' | 'incubator' | null;

export default function ProgramsPage() {
  const [selectedProgram, setSelectedProgram] = useState<Program>(null);
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const programs = {
    'pre-incubator': {
      title: 'Pre-Incubator',
      subtitle: 'Perfect for early-stage ideas - Founder & Business Validation',
      color: 'from-blue-400 to-cyan-400',
      description: 'Validate your idea and prepare for the next stage with our structured prerequisite questionnaire and personalized assessment',
      duration: '3 months',
      investment: 'Free',
      features: [
        'Comprehensive founder readiness assessment',
        'Business model validation workshops',
        'Weekly mentorship sessions',
        'Market research & customer discovery training',
        'Problem-solution fit validation',
        'Business model canvas framework',
        'Pitch deck preparation',
        'Community access & networking',
        'Co-working space',
        'Founder mindset coaching',
        'Reality check sessions',
        'Personalized feedback reports'
      ],
      ideal: [
        'First-time founders with ideas',
        'Pre-MVP stage businesses',
        'Need comprehensive idea validation',
        'Want to build founding team',
        'Testing business assumptions'
      ]
    },
    'incubator': {
      title: 'Incubator',
      subtitle: 'For validated startups ready to scale',
      color: 'from-cyan-400 to-purple-400',
      description: 'Accelerate your growth with funding, investor connections, and intensive support for pre-incubator graduates',
      duration: '6 months',
      investment: '$0 for 2% equity',
      features: [
        'All Pre-Incubator benefits',
        'Seed funding up to $250K',
        'Direct investor connections',
        'Bi-weekly growth strategy sessions',
        'Technical co-founder matching',
        'Legal & compliance support',
        'Product development coaching',
        'Go-to-market strategy',
        'Sales & customer acquisition training',
        'Financial planning & forecasting',
        'HR & team building support',
        'Series A preparation'
      ],
      ideal: [
        'Pre-incubator graduates ready to scale',
        'MVP with initial traction',
        'Validated customer demand',
        'Ready for institutional funding',
        'Team of 2-5+ people'
      ]
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <p className="mt-4 text-slate-400">Loading programs...</p>
        </div>
      </div>
    );
  }

  const selected = selectedProgram ? programs[selectedProgram] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Incubator
            </span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {!selectedProgram ? (
            <>
              {/* Header */}
              <div className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  Choose Your <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Program</span>
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                  Select the program that best fits your startup's current stage and goals.
                </p>
              </div>

              {/* Program Cards */}
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
                {/* Pre-Incubator Card */}
                <div
                  onClick={() => setSelectedProgram('pre-incubator')}
                  className="group cursor-pointer"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                    <div className="relative bg-slate-800 p-8 rounded-xl border border-slate-700 group-hover:border-blue-400/50 transition h-full flex flex-col">
                      <div className="mb-6">
                        <div className={`inline-block p-3 rounded-lg bg-gradient-to-r ${programs['pre-incubator'].color} bg-clip-text`}>
                          <Zap className="w-8 h-8 text-blue-400" />
                        </div>
                      </div>

                      <h2 className="text-3xl font-bold mb-2">{programs['pre-incubator'].title}</h2>
                      <p className="text-slate-400 mb-4">{programs['pre-incubator'].subtitle}</p>
                      <p className="text-slate-300 mb-6 flex-grow">{programs['pre-incubator'].description}</p>

                      <div className="space-y-4 mb-6 pb-6 border-b border-slate-700">
                        <div>
                          <p className="text-sm text-slate-400">Duration</p>
                          <p className="text-lg font-semibold">{programs['pre-incubator'].duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Cost</p>
                          <p className="text-lg font-semibold text-green-400">{programs['pre-incubator'].investment}</p>
                        </div>
                      </div>

                      <Link href="/programs/preincubator" className="block">
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 group-hover:scale-105 transition-transform">
                          Start Application →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Incubator Card */}
                <div
                  onClick={() => setSelectedProgram('incubator')}
                  className="group cursor-pointer"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                    <div className="relative bg-slate-800 p-8 rounded-xl border border-slate-700 group-hover:border-cyan-400/50 transition h-full flex flex-col">
                      <div className="absolute -top-4 left-4">
                        <span className="bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-900 px-4 py-1 rounded-full text-xs font-bold">
                          MOST POPULAR
                        </span>
                      </div>

                      <div className="mb-6 mt-4">
                        <div className={`inline-block p-3 rounded-lg bg-gradient-to-r ${programs['incubator'].color} bg-clip-text`}>
                          <TrendingUp className="w-8 h-8 text-cyan-400" />
                        </div>
                      </div>

                      <h2 className="text-3xl font-bold mb-2">{programs['incubator'].title}</h2>
                      <p className="text-slate-400 mb-4">{programs['incubator'].subtitle}</p>
                      <p className="text-slate-300 mb-6 flex-grow">{programs['incubator'].description}</p>

                      <div className="space-y-4 mb-6 pb-6 border-b border-slate-700">
                        <div>
                          <p className="text-sm text-slate-400">Duration</p>
                          <p className="text-lg font-semibold">{programs['incubator'].duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Investment</p>
                          <p className="text-lg font-semibold text-green-400">{programs['incubator'].investment}</p>
                        </div>
                      </div>

                      <Link href="/programs/incubator" className="block">
                        <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 group-hover:scale-105 transition-transform">
                          Start Application →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison Section */}
              <div className="mt-20 pt-12 border-t border-slate-700">
                <h2 className="text-3xl font-bold text-center mb-12">Program Comparison</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-4 px-4 font-semibold">Feature</th>
                        <th className="text-center py-4 px-4 font-semibold">Pre-Incubator</th>
                        <th className="text-center py-4 px-4 font-semibold">Incubator</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Duration', '3 months', '6 months'],
                        ['Cost', 'Free', '$0 for 2% equity'],
                        ['Founder Assessment', 'Comprehensive questionnaire', 'Continuous evaluation'],
                        ['Business Validation', 'Core focus', 'Execution focus'],
                        ['Mentorship', 'Weekly 1:1 sessions', 'Bi-weekly + intensive'],
                        ['Cohort Size', '15-20 startups', '15-20 startups'],
                        ['Funding Available', 'No', 'Up to $250K seed'],
                        ['Investor Connections', 'Community network', 'Direct investor intros'],
                        ['Legal & Compliance', 'Guidance only', 'Full legal support'],
                        ['Technical Support', 'Workshops', 'Co-founder matching'],
                        ['Market Research', 'Training provided', 'Market entry strategy'],
                        ['Co-working Space', 'Yes', 'Premium access'],
                        ['Team Building', 'Co-founder support', 'Hiring & scaling'],
                        ['Product Development', 'MVP guidance', 'Full GTM support'],
                        ['Sales & Marketing', 'Framework training', 'Hands-on execution'],
                        ['Financial Planning', 'Basics', 'Detailed forecasting'],
                        ['Series A Prep', 'Not included', 'Full preparation'],
                        ['Success Metric Focus', 'Problem-solution fit', 'Revenue & growth']
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/50 transition">
                          <td className="py-4 px-4 font-medium">{row[0]}</td>
                          <td className="py-4 px-4 text-center">
                            {row[1] === 'Yes' || row[1] === 'No' ? (
                              row[1] === 'Yes' ? (
                                <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                              ) : (
                                <div className="w-5 h-5 border-2 border-slate-500 rounded-full mx-auto"></div>
                              )
                            ) : (
                              row[1]
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {row[2] === 'Yes' || row[2] === 'No' ? (
                              row[2] === 'Yes' ? (
                                <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                              ) : (
                                <div className="w-5 h-5 border-2 border-slate-500 rounded-full mx-auto"></div>
                              )
                            ) : (
                              row[2]
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Selected Program Detail */}
              <div className="max-w-3xl mx-auto">
                <button
                  onClick={() => {
                    setSelectedProgram(null);
                    setShowForm(false);
                  }}
                  className="mb-8 flex items-center gap-2 text-slate-400 hover:text-blue-400 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Programs
                </button>

                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${selected!.color} p-8 text-slate-900`}>
                    <h1 className="text-4xl font-bold mb-2">{selected!.title}</h1>
                    <p className="text-lg opacity-90">{selected!.subtitle}</p>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <p className="text-lg text-slate-300 mb-8">{selected!.description}</p>

                    {/* Key Info */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12 pb-12 border-b border-slate-700">
                      <div>
                        <p className="text-sm text-slate-400 mb-2">Duration</p>
                        <p className="text-2xl font-bold">{selected!.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-2">Investment</p>
                        <p className="text-2xl font-bold text-green-400">{selected!.investment}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-2">Cohort Size</p>
                        <p className="text-2xl font-bold">15-20 startups</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-12 pb-12 border-b border-slate-700">
                      <h2 className="text-2xl font-bold mb-6">What's Included</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {selected!.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ideal For */}
                    <div className="mb-12">
                      <h2 className="text-2xl font-bold mb-6">Ideal For</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {selected!.ideal.map((item, idx) => (
                          <div key={idx} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    {!showForm ? (
                      <Button
                        onClick={() => setShowForm(true)}
                        className={`w-full py-6 text-lg font-semibold ${
                          selectedProgram === 'pre-incubator'
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'
                        }`}
                      >
                        Apply Now
                      </Button>
                    ) : (
                      <ApplicationForm program={selectedProgram!} />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-12 px-4 bg-slate-900 mt-20">
        <div className="max-w-6xl mx-auto text-center text-slate-400">
          <p>&copy; 2026 Incubator Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function ApplicationForm({ program }: { program: 'pre-incubator' | 'incubator' }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    idea: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', company: '', idea: '' });
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="mt-8 p-8 bg-green-500/10 border border-green-400/50 rounded-lg text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-400 mb-2">Application Submitted!</h3>
        <p className="text-slate-300">
          Thank you for applying to our {program === 'pre-incubator' ? 'Pre-Incubator' : 'Incubator'} program. We'll review your application and get back to you within 5 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:border-blue-400 focus:outline-none text-white placeholder-slate-500"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:border-blue-400 focus:outline-none text-white placeholder-slate-500"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Company/Startup Name *</label>
        <input
          type="text"
          required
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:border-blue-400 focus:outline-none text-white placeholder-slate-500"
          placeholder="Your Company Name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Describe Your Idea/Business *</label>
        <textarea
          required
          rows={4}
          value={formData.idea}
          onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:border-blue-400 focus:outline-none text-white placeholder-slate-500 resize-none"
          placeholder="Tell us about your startup idea or business..."
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-6 text-lg font-semibold"
      >
        Submit Application
      </Button>
    </form>
  );
}
