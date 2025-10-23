import { Clock, Shield, Utensils, BedDouble } from 'lucide-react';

export default function AboutUs() {
  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About Neelkanth Residency
          </h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Welcome to Our Divine Abode
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              Neelkanth Residency at JAPS Swaminarayan Mandir offers a serene and comfortable
              accommodation experience for devotees and spiritual seekers. Located in the peaceful
              neighborhood of Dahisar (West), Mumbai, our residency provides modern amenities
              while maintaining the sanctity and spiritual atmosphere of temple life.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Our facility features 13 well-maintained rooms, each accommodating up to 5 guests,
              and 2 spacious halls perfect for group gatherings, spiritual discourses, or family
              functions. We take pride in offering clean, comfortable accommodations at affordable
              rates for all devotees.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Facilities & Amenities
            </h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>13 rooms with 5 beds each</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>2 spacious halls for events and gatherings</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>Extra bed arrangements available on request</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>Satvik half-Jain food options (breakfast, lunch, dinner)</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>Clean and hygienic environment</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>Proximity to temple for daily darshan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-orange-50 dark:bg-gray-800 p-6 rounded-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Check-In / Check-Out
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Check-in: 8:00 AM<br />
              Check-out: 7:30 AM
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-gray-800 p-6 rounded-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
              <Utensils className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Satvik Food
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Half-Jain vegetarian meals prepared with devotion
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-gray-800 p-6 rounded-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
              <BedDouble className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Comfortable Rooms
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Clean rooms with 5 beds each, extra beds available
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-gray-800 p-6 rounded-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Temple Rules
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Maintain sanctity, dress modestly, no smoking or alcohol
            </p>
          </div>
        </div>

        <div className="mt-12 bg-orange-100 dark:bg-gray-800 border-l-4 border-orange-500 p-6 rounded-r-lg">
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Important Guidelines
          </h4>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">1.</span>
              <span>Please maintain the sanctity of the premises at all times</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">2.</span>
              <span>Dress modestly and respectfully while on temple grounds</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">3.</span>
              <span>Smoking and consumption of alcohol are strictly prohibited</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">4.</span>
              <span>Keep the rooms and common areas clean and tidy</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">5.</span>
              <span>Maintain silence during prayer times and after 10:00 PM</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">6.</span>
              <span>Balance payment must be made one day before check-in</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
