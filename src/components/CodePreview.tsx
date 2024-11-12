import React from 'react';

export default function CodePreview() {
  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-400">
            Interactive Learning
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Write, Run, Learn
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Our interactive code editor supports multiple programming languages with
            real-time execution and feedback.
          </p>
        </div>
        
        <div className="mt-16 flow-root">
          <div className="relative rounded-xl bg-gray-800/50 p-4 ring-1 ring-white/10">
            <pre className="text-sm leading-6 text-gray-300">
              <code>{`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Test the function
console.log(fibonacci(10)); // Output: 55`}</code>
            </pre>
            
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-end gap-x-4">
              <button className="rounded bg-indigo-500 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400">
                Run Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}