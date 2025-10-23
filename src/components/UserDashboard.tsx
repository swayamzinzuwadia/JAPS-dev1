import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Users, IndianRupee, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Booking {
  id: string;
  room_id: string | null;
  hall_id: string | null;
  check_in_date: string;
  check_out_date: string;
  number_of_persons: number;
  extra_beds: number;
  food_breakfast: boolean;
  food_lunch: boolean;
  food_dinner: boolean;
  total_amount: number;
  advance_amount: number;
  balance_amount: number;
  payment_due_date: string;
  status: string;
  special_requests: string | null;
  created_at: string;
  rooms?: { room_number: string };
  halls?: { hall_name: string };
}

interface Payment {
  id: string;
  amount: number;
  payment_mode: string;
  payment_type: string;
  payment_date: string;
}

interface UserDashboardProps {
  onBack: () => void;
}

export default function UserDashboard({ onBack }: UserDashboardProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rooms(room_number),
          halls(hall_name)
        `)
        .eq('guest_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (bookingId: string) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleViewDetails = (bookingId: string) => {
    setSelectedBooking(selectedBooking === bookingId ? null : bookingId);
    if (selectedBooking !== bookingId) {
      fetchPayments(bookingId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const isPaid = (booking: Booking) => {
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    return totalPaid >= booking.total_amount;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View and manage your room and hall reservations
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              You haven't made any bookings yet
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Make Your First Booking
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {booking.rooms?.room_number || booking.halls?.hall_name}
                      </h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                      <p className="text-2xl font-bold text-orange-500">
                        ₹{booking.total_amount}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Check-in</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {new Date(booking.check_in_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Check-out</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {new Date(booking.check_out_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Persons</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {booking.number_of_persons}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Balance Due</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {new Date(booking.payment_due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleViewDetails(booking.id)}
                      className="text-orange-500 hover:text-orange-600 font-medium"
                    >
                      {selectedBooking === booking.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>

                {selectedBooking === booking.id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Booking Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          {booking.extra_beds > 0 && (
                            <p className="text-gray-600 dark:text-gray-300">
                              Extra Beds: {booking.extra_beds}
                            </p>
                          )}
                          {(booking.food_breakfast || booking.food_lunch || booking.food_dinner) && (
                            <div>
                              <p className="text-gray-600 dark:text-gray-300 font-medium">Food:</p>
                              <ul className="ml-4 space-y-1">
                                {booking.food_breakfast && (
                                  <li className="text-gray-600 dark:text-gray-300">Breakfast</li>
                                )}
                                {booking.food_lunch && (
                                  <li className="text-gray-600 dark:text-gray-300">Lunch</li>
                                )}
                                {booking.food_dinner && (
                                  <li className="text-gray-600 dark:text-gray-300">Dinner</li>
                                )}
                              </ul>
                            </div>
                          )}
                          {booking.special_requests && (
                            <div>
                              <p className="text-gray-600 dark:text-gray-300 font-medium">
                                Special Requests:
                              </p>
                              <p className="text-gray-600 dark:text-gray-300 ml-4">
                                {booking.special_requests}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Payment Status
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Total Amount:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ₹{booking.total_amount}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Advance (50%):</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ₹{booking.advance_amount}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Balance Due:</span>
                            <span className="font-semibold text-orange-500">
                              ₹{booking.balance_amount}
                            </span>
                          </div>
                          <div
                            className={`p-3 rounded-lg ${
                              isPaid(booking)
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : 'bg-yellow-50 dark:bg-yellow-900/20'
                            }`}
                          >
                            <p
                              className={`text-sm font-medium ${
                                isPaid(booking)
                                  ? 'text-green-700 dark:text-green-400'
                                  : 'text-yellow-700 dark:text-yellow-400'
                              }`}
                            >
                              {isPaid(booking) ? 'Fully Paid' : 'Payment Pending'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {payments.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Payment History
                        </h4>
                        <div className="space-y-2">
                          {payments.map((payment) => (
                            <div
                              key={payment.id}
                              className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {payment.payment_type.charAt(0).toUpperCase() +
                                    payment.payment_type.slice(1)}{' '}
                                  Payment
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(payment.payment_date).toLocaleString()} •{' '}
                                  {payment.payment_mode}
                                </p>
                              </div>
                              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                ₹{payment.amount}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
