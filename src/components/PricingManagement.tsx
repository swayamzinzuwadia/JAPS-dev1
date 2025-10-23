import React, { useState, useEffect } from "react";
import {
  addPricing,
  subscribeToPricing,
  subscribeToBookings,
  Pricing,
  Booking,
} from "../lib/firestoreService";
import { serverTimestamp } from "firebase/firestore";
import { formatDate } from "../utils/dateUtils";
import { Calendar, Users, IndianRupee, Clock } from "lucide-react";

export default function PricingManagement() {
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<
    "today" | "week" | "month" | "year"
  >("today");
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    pricePerRoomPerNight: 1000,
    description: "",
    isActive: true,
  });

  useEffect(() => {
    const unsubscribePricing = subscribeToPricing((pricingData) => {
      setPricing(pricingData);
    });

    const unsubscribeBookings = subscribeToBookings((bookingsData) => {
      setBookings(bookingsData);
    });

    return () => {
      unsubscribePricing();
      unsubscribeBookings();
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("");

    try {
      await addPricing({
        startDate: formData.startDate,
        endDate: formData.endDate,
        pricePerRoomPerNight: formData.pricePerRoomPerNight,
        description: formData.description,
        isActive: formData.isActive,
      });

      setStatus("✅ Pricing added successfully!");
      setShowForm(false);
      setFormData({
        startDate: "",
        endDate: "",
        pricePerRoomPerNight: 1000,
        description: "",
        isActive: true,
      });
    } catch (error: any) {
      setStatus(`❌ Error adding pricing: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    return formatDate(dateStr);
  };

  // Filter bookings based on selected time period
  const getFilteredBookings = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return bookings.filter((booking) => {
      const checkInDate = new Date(booking.checkInDate);
      const isNotCancelled =
        booking.paymentStatus !== "cancelled" && booking.status !== "cancelled";

      if (!isNotCancelled) return false;

      switch (bookingFilter) {
        case "today":
          return checkInDate.toDateString() === today.toDateString();
        case "week":
          const weekStart = new Date(today);
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          return checkInDate >= weekStart && checkInDate <= weekEnd;
        case "month":
          return (
            checkInDate.getMonth() === now.getMonth() &&
            checkInDate.getFullYear() === now.getFullYear()
          );
        case "year":
          return checkInDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  // Calculate days until check-in
  const getDaysUntilCheckIn = (checkInDate: string) => {
    const today = new Date();
    const checkIn = new Date(checkInDate);
    const diffTime = checkIn.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get payment due status
  const getPaymentDueStatus = (booking: Booking) => {
    const daysUntilCheckIn = getDaysUntilCheckIn(booking.checkInDate);
    const totalPaid = booking.advanceAmount || 0;
    const balanceDue = booking.totalAmount - totalPaid;

    if (balanceDue <= 0) return { status: "paid", message: "Fully Paid" };
    if (daysUntilCheckIn <= 1)
      return { status: "urgent", message: "Payment Due Today/Tomorrow" };
    if (daysUntilCheckIn <= 3)
      return {
        status: "warning",
        message: `Payment Due in ${daysUntilCheckIn} days`,
      };
    return {
      status: "pending",
      message: `Payment Due in ${daysUntilCheckIn} days`,
    };
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Upcoming Bookings Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📅 Upcoming Bookings
          </h2>
          <div className="flex space-x-2">
            <select
              value={bookingFilter}
              onChange={(e) =>
                setBookingFilter(
                  e.target.value as "today" | "week" | "month" | "year"
                )
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {getFilteredBookings().map((booking) => {
            const paymentStatus = getPaymentDueStatus(booking);
            const daysUntilCheckIn = getDaysUntilCheckIn(booking.checkInDate);

            return (
              <div
                key={booking.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {booking.guestName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {booking.mobile}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        booking.paymentStatus === "confirmed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : booking.paymentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Check-in
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(booking.checkInDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Check-out
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(booking.checkOutDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Rooms
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {booking.numberOfRooms}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Total
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{booking.totalAmount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {daysUntilCheckIn > 0
                        ? `${daysUntilCheckIn} days until check-in`
                        : daysUntilCheckIn === 0
                        ? "Check-in today"
                        : "Check-in overdue"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        paymentStatus.status === "paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : paymentStatus.status === "urgent"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          : paymentStatus.status === "warning"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      }`}
                    >
                      {paymentStatus.message}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {getFilteredBookings().length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No bookings found for the selected period.
            </div>
          )}
        </div>
      </div>

      {/* Pricing Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            💰 Pricing Management
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            {showForm ? "Cancel" : "Add New Pricing"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add New Pricing Period
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price Per Room Per Night (₹) *
                </label>
                <input
                  type="number"
                  name="pricePerRoomPerNight"
                  value={formData.pricePerRoomPerNight}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Peak season pricing"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {isLoading ? "Adding Pricing..." : "Add Pricing"}
            </button>
          </form>
        )}

        {status && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              status.includes("✅")
                ? "bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400"
            }`}
          >
            {status}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Period</th>
                <th className="px-6 py-3">Price/Night</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {pricing.map((price) => (
                <tr
                  key={price.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <td className="px-6 py-4">
                    {formatDateDisplay(price.startDate)} -{" "}
                    {formatDateDisplay(price.endDate)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-orange-600">
                    ₹{price.pricePerRoomPerNight}
                  </td>
                  <td className="px-6 py-4">
                    {price.description || "No description"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        price.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {price.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pricing.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No pricing periods found. Add your first pricing period above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
