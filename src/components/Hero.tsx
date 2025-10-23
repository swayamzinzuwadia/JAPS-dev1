import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onBookNow: () => void;
}

export default function Hero({ onBookNow }: HeroProps) {
  return (
    <section id="hero" className="relative bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            JAPS Swaminarayan Mandir
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold text-orange-500 dark:text-orange-400 mb-8">
            Neelkanth Residency
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
            Dahisar (West), Mumbai
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Experience divine hospitality in our peaceful and comfortable residency.
            With 13 well-appointed rooms and 2 spacious halls, we provide the perfect sanctuary
            for spiritual seekers and devotees visiting our sacred temple.
          </p>
          <button
            onClick={onBookNow}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-orange-500 text-white text-lg font-semibold rounded-lg hover:bg-orange-600 transition-all transform hover:scale-105 shadow-lg"
          >
            <span>Book Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
    </section>
  );
}
