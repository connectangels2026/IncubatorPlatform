'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Zap, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';

type Program = 'pre-incubator' | 'incubator' | null;

export default function ProgramsPage() {
  const [selectedProgram, setSelectedProgram] = useState<Program>(null);
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
      duration: '1 year',
      investment: '₹6,500',
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
      duration: '1 year',
      investment: '₹60,000 - ₹1,20,000',
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
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 text-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <p className="mt-4 text-slate-500">Loading programs...</p>
        </div>
      </div>
    );
  }

  const selected = selectedProgram ? programs[selectedProgram] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Arba Incubator
            </span>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold">
              Dashboard
            </Button>
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
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
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
                    <div className="relative bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition h-full flex flex-col">
                      <div className="relative flex flex-col flex-grow">
                      <div className="mb-6">
                        <div className={`inline-block p-3 rounded-lg bg-gradient-to-r ${programs['pre-incubator'].color} bg-clip-text`}>
                          <Zap className="w-8 h-8 text-blue-600" />
                        </div>
                      </div>

                      <h2 className="text-3xl font-bold mb-2">{programs['pre-incubator'].title}</h2>
                      <p className="text-slate-500 mb-4">{programs['pre-incubator'].subtitle}</p>
                      <p className="text-slate-600 mb-6 flex-grow">{programs['pre-incubator'].description}</p>

                      <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                        <div>
                          <p className="text-sm text-slate-500">Duration</p>
                          <p className="text-lg font-semibold">{programs['pre-incubator'].duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Cost</p>
                          <p className="text-lg font-semibold text-green-600">{programs['pre-incubator'].investment}</p>
                        </div>
                      </div>

                      <Button
                        onClick={() => setSelectedProgram('pre-incubator')}
                        className="w-full bg-blue-500 hover:bg-blue-600 group-hover:scale-105 transition-transform"
                      >
                        Start Application →
                      </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Incubator Card */}
                <div
                  onClick={() => setSelectedProgram('incubator')}
                  className="group cursor-pointer"
                >
                  <div className="relative">
                    <div className="relative bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 transition h-full flex flex-col">
                      <div className="relative flex flex-col flex-grow">
                      <div className="mb-6 mt-4">
                        <div className={`inline-block p-3 rounded-lg bg-gradient-to-r ${programs['incubator'].color} bg-clip-text`}>
                          <TrendingUp className="w-8 h-8 text-cyan-600" />
                        </div>
                      </div>

                      <h2 className="text-3xl font-bold mb-2">{programs['incubator'].title}</h2>
                      <p className="text-slate-500 mb-4">{programs['incubator'].subtitle}</p>
                      <p className="text-slate-600 mb-6 flex-grow">{programs['incubator'].description}</p>

                      <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                        <div>
                          <p className="text-sm text-slate-500">Duration</p>
                          <p className="text-lg font-semibold">{programs['incubator'].duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Investment</p>
                          <p className="text-lg font-semibold text-green-600">{programs['incubator'].investment}</p>
                        </div>
                      </div>

                      <Button
                        onClick={() => setSelectedProgram('incubator')}
                        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 group-hover:scale-105 transition-transform"
                      >
                        Start Application →
                      </Button>
                      </div>
                    </div>
                    <div className="absolute -top-4 left-4">
                      <span className="bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-900 px-4 py-1 rounded-full text-xs font-bold">
                        MOST POPULAR
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison Section */}
              <div className="mt-20 pt-12 border-t border-slate-200">
                <h2 className="text-3xl font-bold text-center mb-12">Program Comparison</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-4 px-4 font-semibold">Feature</th>
                        <th className="text-center py-4 px-4 font-semibold">Pre-Incubator</th>
                        <th className="text-center py-4 px-4 font-semibold">Incubator</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Duration', '1 year', '1 year'],
                        ['Cost', '₹6,500', '₹60,000 - ₹1,20,000'],
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
                        <tr key={idx} className="border-b border-slate-200 hover:bg-slate-100 transition">
                          <td className="py-4 px-4 font-medium">{row[0]}</td>
                          <td className="py-4 px-4 text-center">
                            {row[1] === 'Yes' || row[1] === 'No' ? (
                              row[1] === 'Yes' ? (
                                <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
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
                                <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
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
                  onClick={() => setSelectedProgram(null)}
                  className="mb-8 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Programs
                </button>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${selected!.color} p-8 text-slate-900`}>
                    <h1 className="text-4xl font-bold mb-2">{selected!.title}</h1>
                    <p className="text-lg opacity-90">{selected!.subtitle}</p>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <p className="text-lg text-slate-600 mb-8">{selected!.description}</p>

                    {/* Key Info */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12 pb-12 border-b border-slate-200">
                      <div>
                        <p className="text-sm text-slate-500 mb-2">Duration</p>
                        <p className="text-2xl font-bold">{selected!.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-2">Investment</p>
                        <p className="text-2xl font-bold text-green-600">{selected!.investment}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-2">Cohort Size</p>
                        <p className="text-2xl font-bold">15-20 startups</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-12 pb-12 border-b border-slate-200">
                      <h2 className="text-2xl font-bold mb-6">What's Included</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {selected!.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
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
                          <div key={idx} className="p-4 bg-white rounded-lg border border-slate-300">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <Link href={selectedProgram === 'pre-incubator' ? '/programs/preincubator' : '/programs/incubator'} className="block">
                      <Button
                        className={`w-full py-6 text-lg font-semibold ${
                          selectedProgram === 'pre-incubator'
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'
                        }`}
                      >
                        Apply Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-4 bg-white mt-20">
        <div className="max-w-6xl mx-auto text-center text-slate-500">
          <p>&copy; 2026 Incubator Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

