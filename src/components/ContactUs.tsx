import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

export default function ContactUs() {
  return (
    <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Contact Us
          </h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Get in Touch
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Address
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    JAPS Swaminarayan Mandir<br />
                    Neelkanth Residency<br />
                    Dahisar (West)<br />
                    Mumbai, Maharashtra
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Phone Numbers
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    <a href="tel:+919820075561" className="hover:text-orange-500 transition-colors">
                      +91 98200 75561
                    </a>
                    <br />
                    <a href="tel:+919619104956" className="hover:text-orange-500 transition-colors">
                      +91 96191 04956
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Email
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    <a href="mailto:info@japsmandir.org" className="hover:text-orange-500 transition-colors">
                      info@japsmandir.org
                    </a>
                  </p>
                </div>
              </div>

              <a
                href="https://www.google.com/maps/search/JAPS+Swaminarayan+Mandir+Dahisar+West+Mumbai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <span>View on Google Maps</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Operating Hours
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Reception</span>
                <span className="text-gray-600 dark:text-gray-400">24/7</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Check-in</span>
                <span className="text-gray-600 dark:text-gray-400">8:00 AM</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Check-out</span>
                <span className="text-gray-600 dark:text-gray-400">7:30 AM</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Breakfast</span>
                <span className="text-gray-600 dark:text-gray-400">7:00 AM - 9:00 AM</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Lunch</span>
                <span className="text-gray-600 dark:text-gray-400">12:00 PM - 2:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Dinner</span>
                <span className="text-gray-600 dark:text-gray-400">7:00 PM - 9:00 PM</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-orange-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                For booking inquiries and special requests, please call us during reception hours
                or use our online booking system above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
