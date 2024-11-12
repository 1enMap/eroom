import React from 'react';
import { Code2, Rocket, Users, Brain } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-indigo-900 to-indigo-800">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6bTAgMmMtMi4yMSAwLTQgMS43OS00IDRzMS43OSA0IDQgNCA0LTEuNzkgNC00LTEuNzktNC00LTR6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
      </div>
      
      <div className="relative px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Master Coding Through
            <span className="block text-indigo-300">Interactive Learning</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Join thousands of students mastering programming through hands-on practice,
            real-time feedback, and AI-powered guidance.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a href="#" className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400">
              Get started
            </a>
            <a href="#" className="text-sm font-semibold leading-6 text-white">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
      
      <div className="relative bg-white/5 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 text-center lg:grid-cols-4">
              {[
                { icon: Code2, label: 'Interactive Coding', value: '50+' },
                { icon: Users, label: 'Active Learners', value: '10,000+' },
                { icon: Brain, label: 'Practice Problems', value: '1,000+' },
                { icon: Rocket, label: 'Success Rate', value: '94%' },
              ].map((stat, index) => (
                <div key={index} className="flex flex-col items-center">
                  <stat.icon className="h-8 w-8 text-indigo-300 mb-4" />
                  <div className="text-2xl font-bold tracking-tight text-white">
                    {stat.value}
                  </div>
                  <div className="text-base leading-7 text-gray-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}