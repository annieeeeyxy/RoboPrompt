'use client';

import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export default function Landing() {
  const router = useRouter();

  const cardConfig = [
    {
      id: 'student',
      icon: '🎓',
      title: 'I am a Student',
      description: 'Learn robotics fundamentals, programming, and competition strategies with AI guidance',
      button: 'Start Learning',
      bgGlow: 'from-blue-600/20 to-cyan-600/20',
      borderHover: 'group-hover:border-blue-500/50',
      shadowHover: 'hover:shadow-blue-500/20',
      route: '/student',
    },
    {
      id: 'coach',
      icon: '👨‍🏫',
      title: 'I am a Coach',
      description: 'Manage teams, review robot design and code, and generate competition strategies',
      button: 'Enter Coaching Dashboard',
      bgGlow: 'from-purple-600/20 to-pink-600/20',
      borderHover: 'group-hover:border-purple-500/50',
      shadowHover: 'hover:shadow-purple-500/20',
      route: '/coach',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            AI Robotics Trainer
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
            Learn robotics faster with AI coaching, simulation tools, and real-time feedback.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl mb-12 sm:mb-16">
          {cardConfig.map((card) => (
            <button
              key={card.id}
              onClick={() => router.push(card.route)}
              className="group relative h-full"
            >
              <div className={clsx(
                'absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100',
                'transition-opacity duration-500',
                `bg-gradient-to-r ${card.bgGlow}`
              )}></div>
              
              <div className={clsx(
                'relative bg-gradient-to-br from-gray-800 to-gray-900',
                'border border-gray-700 rounded-2xl p-8 sm:p-10 h-full',
                'flex flex-col transition-all duration-300',
                card.borderHover,
                card.shadowHover,
                'hover:shadow-2xl'
              )}>
                
                {/* Icon */}
                <div className="text-5xl sm:text-6xl mb-6">{card.icon}</div>
                
                {/* Title */}
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-left">
                  {card.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-300 text-base sm:text-lg mb-8 text-left flex-grow">
                  {card.description}
                </p>
                
                {/* Button */}
                <div className={clsx(
                  card.id === 'student' 
                    ? 'bg-blue-600 group-hover:bg-blue-500' 
                    : 'bg-purple-600 group-hover:bg-purple-500',
                  'text-white font-semibold py-3 px-6 rounded-lg',
                  'transition-all duration-300 text-center'
                )}>
                  {card.button}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => router.push('/')}
          className="text-gray-400 hover:text-gray-300 text-sm font-medium transition-colors"
        >
          ← Sign out
        </button>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 px-4">
        <p className="text-center text-gray-500 text-sm">
          Powered by AI robotics coaching system
        </p>
      </footer>
    </div>
  );
}
