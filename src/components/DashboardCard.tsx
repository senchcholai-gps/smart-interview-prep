import React, { useEffect, useState } from 'react';

const DashboardCard: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger animation slightly after mount for smooth effect
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      id: 'func',
      percent: 90,
      emoji: '⭐',
      label: 'Functionality Tested',
      colorClass: 'bg-blue-500',
      bgClass: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      id: 'feat',
      percent: 87,
      emoji: '✔️',
      label: 'Features Verified',
      colorClass: 'bg-emerald-500',
      bgClass: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      id: 'perf',
      percent: 82,
      emoji: '✅',
      label: 'Platform Performance',
      colorClass: 'bg-amber-500',
      bgClass: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
  ];

  return (
    <div className="flex justify-center items-center p-4 w-full h-full font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 md:p-8 overflow-hidden border border-gray-100">

        {/* Header Section */}
        <div className="text-center md:text-left mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Smart Interview
          </h1>
          <h2 className="text-xl md:text-2xl font-medium text-gray-500 mt-1">
            Preparation System
          </h2>
          <p className="text-gray-400 italic mt-3 text-sm md:text-base leading-relaxed">
            Practice and test your interview skills in a realistic, monitored environment.
          </p>
        </div>

        {/* Stats Section */}
        <div className="flex flex-col gap-5">
          {stats.map((stat) => (
            <div key={stat.id} className="relative rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">

              {/* Progress Background representing the bar behind the text */}
              <div
                className={`absolute top-0 left-0 h-full ${stat.bgClass} opacity-60 transition-all duration-1000 ease-out`}
                style={{ width: mounted ? `${stat.percent}%` : '0%' }}
              />

              {/* Content layered on top */}
              <div className="relative z-10 flex flex-col p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl md:text-4xl font-black text-gray-800 tracking-tighter">
                      {stat.percent}%
                    </span>
                    <span className="text-2xl" role="img" aria-label="emoji">
                      {stat.emoji}
                    </span>
                  </div>
                </div>

                <span className="text-sm md:text-base font-semibold text-gray-600 block mb-3">
                  {stat.label}
                </span>

                {/* Thin standard progress bar below for SaaS feel */}
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stat.colorClass} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: mounted ? `${stat.percent}%` : '0%' }}
                  />
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DashboardCard;
