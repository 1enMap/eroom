import React from 'react';
import { Code, Brain, Trophy, Users } from 'lucide-react';

const features = [
  {
    name: 'Interactive Learning',
    description: 'Real-time code execution and instant feedback to accelerate your learning journey.',
    icon: Code,
  },
  {
    name: 'AI-Powered Guidance',
    description: 'Personalized learning paths and smart suggestions to help you improve.',
    icon: Brain,
  },
  {
    name: 'Gamified Experience',
    description: 'Earn points, unlock achievements, and compete with peers while learning.',
    icon: Trophy,
  },
  {
    name: 'Community Driven',
    description: 'Learn together with peer reviews, discussions, and collaborative projects.',
    icon: Users,
  },
];

export default function Features() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            Learn Faster
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to master coding
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our platform combines cutting-edge technology with proven learning methodologies
            to provide you with the best coding education experience.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}