'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Users, TrendingUp, CheckCircle, Lightbulb, Target } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import Logo from '@/frontend/components/ui/Logo';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Logo size="lg" href="/" />
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="hover:text-blue-600 transition">Features</a>
            <a href="#programs" className="hover:text-blue-600 transition">Programs</a>
            <a href="#cta" className="hover:text-blue-600 transition">Get Started</a>
            <Link href="/login" className="hover:text-blue-600 transition font-medium">
              Login
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold">
                Sign Up
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        {/* Background */}
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/5 blur-3xl"></div>
          <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-purple-400/15 to-blue-400/5 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-400/10 to-transparent blur-3xl"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(100,116,139,0.10)_1px,transparent_0)] [background-size:32px_32px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span className="text-sm font-medium text-slate-600">Build Your Future Here</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-slate-900">
            Turn Your <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Ideas Into Reality</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Join our incubator or pre-incubator program and accelerate your startup journey with expert mentorship, funding, and resources.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/programs" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-8 py-6 text-lg rounded-lg group shadow-lg shadow-blue-500/20"
              >
                Join Now
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#programs" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full px-8 py-6 text-lg rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
              >
                Learn More
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-slate-200">
            <div>
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-slate-500">Startups Launched</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-600">$50M+</div>
              <div className="text-slate-500">Funding Secured</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">95%</div>
              <div className="text-slate-500">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-400">150+</div>
              <div className="text-slate-500">Expert Mentors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-xl text-slate-600">Comprehensive support at every stage of your startup journey</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Lightbulb,
                title: 'Idea Validation',
                description: 'Get expert feedback on your idea and refine your business model with our mentors.'
              },
              {
                icon: Users,
                title: 'Network Access',
                description: 'Connect with investors, founders, and industry leaders in our thriving community.'
              },
              {
                icon: TrendingUp,
                title: 'Growth Support',
                description: 'Access resources, training, and tools to scale your business rapidly.'
              },
              {
                icon: Target,
                title: 'Funding Ready',
                description: 'Prepare for fundraising with pitch coaching and investor introductions.'
              },
              {
                icon: Zap,
                title: 'Fast Track',
                description: 'Accelerate your growth with intensive mentorship and technical support.'
              },
              {
                icon: CheckCircle,
                title: 'Success Proven',
                description: 'Join hundreds of successful startups that launched through our programs.'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg bg-white border border-slate-300 hover:border-blue-400/50 transition group cursor-pointer"
              >
                <feature.icon className="w-12 h-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Programs</h2>
            <p className="text-xl text-slate-600">Choose the program that fits your stage</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Pre-Incubator */}
            <div className="relative group">
              <div className="relative bg-white p-8 rounded-lg border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition">
                <div className="relative">
                  <div className="text-3xl font-bold text-blue-600 mb-2">Pre-Incubator</div>
                  <div className="text-slate-500 mb-6">For early-stage ideas</div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Idea validation workshops</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Market research support</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>1-year program</span>
                    </li>
                  </ul>
                  <Link href="/programs">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600">
                      Join Pre-Incubator
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Incubator */}
            <div className="relative group">
              <div className="relative bg-white p-8 rounded-lg border border-slate-200 lg:scale-105 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-300 transition">
                <div className="relative">
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    Incubator
                  </div>
                  <div className="text-slate-500 mb-6">For validated startups</div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>All Pre-Incubator benefits</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Seed funding up to $250K</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Investor connections</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>1-year program</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Legal & compliance support</span>
                    </li>
                  </ul>
                  <Link href="/programs">
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                      Join Incubator
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
                  POPULAR
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 px-4 bg-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Success Stories</h2>
            <p className="text-xl text-slate-600">Meet some of our successful founders</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'TechVenture', founder: 'Sarah Chen', growth: '10x Revenue' },
              { name: 'EcoStart', founder: 'Ahmed Hassan', growth: '$5M Funding' },
              { name: 'DataFlow', founder: 'Lisa Rodriguez', growth: '500K Users' }
            ].map((story, idx) => (
              <div key={idx} className="p-6 rounded-lg bg-white border border-slate-300">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mb-4"></div>
                <h3 className="text-lg font-semibold mb-1">{story.name}</h3>
                <p className="text-slate-500 text-sm mb-3">{story.founder}</p>
                <p className="text-blue-600 font-semibold">{story.growth}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-slate-600 mb-8">
            Take the first step towards building your dream startup.
          </p>
          <Link href="/programs">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-8 py-6 text-lg"
            >
              Choose Your Program
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                Incubator
              </div>
              <p className="text-slate-500">Building tomorrow's startups today.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-500">
                <li><a href="#" className="hover:text-blue-600 transition">Home</a></li>
                <li><a href="#features" className="hover:text-blue-600 transition">Features</a></li>
                <li><a href="#programs" className="hover:text-blue-600 transition">Programs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Programs</h4>
              <ul className="space-y-2 text-slate-500">
                <li><a href="/programs" className="hover:text-blue-600 transition">Pre-Incubator</a></li>
                <li><a href="/programs" className="hover:text-blue-600 transition">Incubator</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-500">
                <li>hello@incubator.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-slate-500">
            <p>&copy; 2026 Arba360 Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
