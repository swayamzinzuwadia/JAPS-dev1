import { useEffect, useState } from "react";
import {
  ArrowLeft,
  IndianRupee,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Clock,
} from "lucide-react";
import {
  subscribeToBookings,
  subscribeToPayments,
  updateBooking,
  deleteBooking,
  addPayment,
  createBookingWithAvailability,
  recalculateAvailability,
  getAvailabilityForDate,
  Booking,
  Payment,
  getBookingsByDateRange,
} from "../lib/firestoreService";
import { formatDate, formatDateTime } from "../utils/dateUtils";

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  pendingPayments: number;
  upcomingCheckIns: number;
  cashCollected: number;
  gpayCollected: number;
  onlineCollected: number;
}

interface AdminDashboardProps {
  onBack: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    upcomingCheckIns: 0,
    cashCollected: 0,
    gpayCollected: 0,
    onlineCollected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<"Cash" | "GPay" | "Online">(
    "Cash"
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "pricing">(
    "dashboard"
  );
  const [bookingFilter, setBookingFilter] = useState<
    "today" | "week" | "month" | "year"
  >("today");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [availabilityError, setAvailabilityError] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    guestName: "",
    mobile: "",
    numberOfRooms: 1,
    numberOfGuests: 1,
    pricePerRoom: 0,
    hall1: false,
    hall2: false,
    hall1Price: 0,
    hall2Price: 0,
    extraBeds: 0,
    extraBedPrice: 0,
    breakfast: false,
    lunch: false,
    dinner: false,
    breakfastPrice: 0,
    lunchPrice: 0,
    dinnerPrice: 0,
    totalAmount: 0,
    advanceAmount: 0,
    balanceAmount: 0,
    paymentMode: "cash",
    paymentStatus: "pending",
    status: "pending" as "pending" | "confirmed" | "cancelled",
    checkInDate: "",
    checkOutDate: "",
  });

  useEffect(() => {
    // Subscribe to Firebase bookings
    const unsubscribeBookings = subscribeToBookings((bookingsData) => {
      setBookings(bookingsData);
      calculateStats(bookingsData, payments);
    });

    // Subscribe to Firebase payments
    const unsubscribePayments = subscribeToPayments((paymentsData) => {
      setPayments(paymentsData);
      calculateStats(bookings, paymentsData);
    });

    setLoading(false);

    return () => {
      unsubscribeBookings();
      unsubscribePayments();
    };
  }, []);

  // Check availability when dates or room count changes
  useEffect(() => {
    if (
      bookingForm.checkInDate &&
      bookingForm.checkOutDate &&
      bookingForm.numberOfRooms > 0
    ) {
      checkRoomAvailability();
    }
  }, [
    bookingForm.checkInDate,
    bookingForm.checkOutDate,
    bookingForm.numberOfRooms,
  ]);

  // Calculate total amount when relevant fields change
  useEffect(() => {
    calculateTotalAmount();
  }, [
    bookingForm.checkInDate,
    bookingForm.checkOutDate,
    bookingForm.numberOfRooms,
    bookingForm.extraBeds,
    bookingForm.hall1,
    bookingForm.hall2,
    bookingForm.breakfast,
    bookingForm.lunch,
    bookingForm.dinner,
    bookingForm.pricePerRoom,
    bookingForm.extraBedPrice,
    bookingForm.hall1Price,
    bookingForm.hall2Price,
    bookingForm.breakfastPrice,
    bookingForm.lunchPrice,
    bookingForm.dinnerPrice,
  ]);

  const calculateStats = (bookingsData: Booking[], paymentsData: Payment[]) => {
    // Filter out cancelled bookings for most calculations
    const activeBookings = bookingsData.filter(
      (b) => b.paymentStatus !== "cancelled" && b.status !== "cancelled"
    );

    const totalBookings = activeBookings.length;
    const totalRevenue = paymentsData.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    const pendingPayments = activeBookings.reduce((sum, b) => {
      const paid = paymentsData
        .filter((p) => p.bookingId === b.id)
        .reduce((s, p) => s + Number(p.amount), 0);
      return sum + Math.max(0, b.totalAmount - paid);
    }, 0);

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingCheckIns = activeBookings.filter((b) => {
      const checkIn = new Date(b.checkInDate);
      return checkIn >= today && checkIn <= nextWeek;
    }).length;

    const cashCollected = paymentsData
      .filter((p) => p.paymentMode === "Cash")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const gpayCollected = paymentsData
      .filter((p) => p.paymentMode === "GPay")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const onlineCollected = paymentsData
      .filter((p) => p.paymentMode === "Online")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    setStats({
      totalBookings,
      totalRevenue,
      pendingPayments,
      upcomingCheckIns,
      cashCollected,
      gpayCollected,
      onlineCollected,
    });
  };

  const getBookingPayments = (bookingId: string) => {
    return payments.filter((p) => p.bookingId === bookingId);
  };

  const getTotalPaid = (bookingId: string) => {
    return getBookingPayments(bookingId).reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
  };

  const getBalanceDue = (booking: Booking) => {
    const paid = getTotalPaid(booking.id);
    return Math.max(0, booking.totalAmount - paid);
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
    const balanceDue = getBalanceDue(booking);

    if (balanceDue <= 0)
      return { status: "paid", message: "Fully Paid", color: "text-green-600" };
    if (daysUntilCheckIn <= 1)
      return {
        status: "urgent",
        message: "Payment Due Today/Tomorrow",
        color: "text-red-600",
      };
    if (daysUntilCheckIn <= 3)
      return {
        status: "warning",
        message: `Payment Due in ${daysUntilCheckIn} days`,
        color: "text-yellow-600",
      };
    return {
      status: "pending",
      message: `Payment Due in ${daysUntilCheckIn} days`,
      color: "text-blue-600",
    };
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

  const handleRecordPayment = async (bookingId: string) => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    setProcessingPayment(true);

    try {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) return;

      const balanceDue = getBalanceDue(booking);
      const amount = Number(paymentAmount);

      if (amount > balanceDue) {
        alert(`Payment amount cannot exceed balance due of ₹${balanceDue}`);
        setProcessingPayment(false);
        return;
      }

      const totalPaid = getTotalPaid(bookingId);
      const paymentType =
        totalPaid === 0
          ? "advance"
          : totalPaid + amount >= booking.totalAmount
          ? "balance"
          : "advance";

      await addPayment({
        bookingId: bookingId,
        amount: amount,
        paymentMode: paymentMode,
        paymentType: paymentType,
        paymentDate: new Date().toISOString(),
      });

      if (totalPaid + amount >= booking.totalAmount) {
        await updateBooking(bookingId, { paymentStatus: "confirmed" });
      }
      setPaymentAmount("");
      alert("Payment recorded successfully!");
    } catch (error: any) {
      console.error("Error recording payment:", error);
      alert("Failed to record payment: " + error.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      await updateBooking(bookingId, { paymentStatus: newStatus });
      alert("Booking status updated successfully!");
    } catch (error: any) {
      console.error("Error updating status:", error);
      alert("Failed to update status: " + error.message);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      try {
        await deleteBooking(bookingId);
        alert("Booking deleted successfully!");
      } catch (error: any) {
        console.error("Error deleting booking:", error);
        alert("Failed to delete booking: " + error.message);
      }
    }
  };

  const handleRecalculateAvailability = async () => {
    if (
      confirm(
        "This will recalculate availability for all dates based on current bookings. Continue?"
      )
    ) {
      try {
        await recalculateAvailability();
        alert("Availability recalculated successfully!");
      } catch (error: any) {
        console.error("Error recalculating availability:", error);
        alert("Failed to recalculate availability: " + error.message);
      }
    }
  };

  const handleCheckAvailability = async () => {
    const date = prompt("Enter date to check availability (YYYY-MM-DD):");
    if (date) {
      try {
        const availability = await getAvailabilityForDate(date);
        if (availability) {
          alert(
            `Availability for ${date}:\nRooms: ${availability.availableRooms}/${availability.totalRooms}\nHalls: ${availability.availableHalls}/${availability.totalHalls}`
          );
        } else {
          alert(`No availability data found for ${date}`);
        }
      } catch (error: any) {
        console.error("Error checking availability:", error);
        alert("Failed to check availability: " + error.message);
      }
    }
  };

  const handleBookingFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check availability before submitting
    if (availabilityError) {
      alert("Cannot create booking: " + availabilityError);
      return;
    }

    if (checkingAvailability) {
      alert("Please wait while we check room availability...");
      return;
    }

    try {
      if (editingBooking) {
        // For updates, we need to handle availability changes carefully
        await updateBooking(editingBooking.id, bookingForm);
        alert("Booking updated successfully!");
      } else {
        // For new bookings, use the availability-aware function
        await createBookingWithAvailability({
          ...bookingForm,
          address: "", // Add empty address for backward compatibility
          noOfPersons: bookingForm.numberOfGuests, // Map numberOfGuests to noOfPersons
        });
        alert("Booking created successfully!");
      }
      setShowBookingForm(false);
      setEditingBooking(null);
      resetBookingForm();
    } catch (error: any) {
      console.error("Error saving booking:", error);
      alert("Failed to save booking: " + error.message);
    }
  };

  const resetBookingForm = () => {
    setBookingForm({
      guestName: "",
      mobile: "",
      numberOfRooms: 1,
      numberOfGuests: 1,
      pricePerRoom: 0,
      hall1: false,
      hall2: false,
      extraBeds: 0,
      extraBedPrice: 0,
      breakfast: false,
      lunch: false,
      dinner: false,
      breakfastPrice: 0,
      lunchPrice: 0,
      dinnerPrice: 0,
      hall1Price: 0,
      hall2Price: 0,
      totalAmount: 0,
      advanceAmount: 0,
      balanceAmount: 0,
      paymentMode: "cash",
      paymentStatus: "pending",
      status: "pending",
      checkInDate: "",
      checkOutDate: "",
    });
    setAvailabilityError("");
  };

  const checkRoomAvailability = async () => {
    if (
      !bookingForm.checkInDate ||
      !bookingForm.checkOutDate ||
      !bookingForm.numberOfRooms
    ) {
      return;
    }

    setCheckingAvailability(true);
    setAvailabilityError("");

    try {
      console.log("Checking availability for:", {
        checkIn: bookingForm.checkInDate,
        checkOut: bookingForm.checkOutDate,
        rooms: bookingForm.numberOfRooms,
      });

      // Get existing bookings for the date range
      const existingBookings = await getBookingsByDateRange(
        bookingForm.checkInDate,
        bookingForm.checkOutDate
      );

      console.log("Found existing bookings:", existingBookings.length);

      // Calculate total rooms booked for each date in the range
      const startDate = new Date(bookingForm.checkInDate);
      const endDate = new Date(bookingForm.checkOutDate);
      const totalRooms = 13; // Total available rooms

      // Create a map to track rooms booked for each date
      const roomsBookedByDate = new Map<string, number>();

      // Initialize all dates in the range with 0 rooms booked
      for (
        let date = new Date(startDate);
        date < endDate;
        date.setDate(date.getDate() + 1)
      ) {
        const dateString = date.toISOString().split("T")[0];
        roomsBookedByDate.set(dateString, 0);
      }

      // Add rooms from existing bookings
      existingBookings.forEach((booking) => {
        const bookingStart = new Date(booking.checkInDate);
        const bookingEnd = new Date(booking.checkOutDate);
        const roomsToAdd = booking.numberOfRooms || 0;

        for (
          let date = new Date(bookingStart);
          date < bookingEnd;
          date.setDate(date.getDate() + 1)
        ) {
          const dateString = date.toISOString().split("T")[0];
          if (roomsBookedByDate.has(dateString)) {
            roomsBookedByDate.set(
              dateString,
              roomsBookedByDate.get(dateString)! + roomsToAdd
            );
          }
        }
      });

      // Check availability for each date
      for (
        let date = new Date(startDate);
        date < endDate;
        date.setDate(date.getDate() + 1)
      ) {
        const dateString = date.toISOString().split("T")[0];
        const roomsBookedForDate = roomsBookedByDate.get(dateString) || 0;
        const availableRooms = totalRooms - roomsBookedForDate;

        console.log(
          `Date ${dateString}: ${roomsBookedForDate} booked, ${availableRooms} available, requested: ${bookingForm.numberOfRooms}`
        );

        if (availableRooms < bookingForm.numberOfRooms) {
          setAvailabilityError(
            `Only ${availableRooms} rooms available on ${dateString}. Requested: ${bookingForm.numberOfRooms}`
          );
          setCheckingAvailability(false);
          return;
        }
      }

      setAvailabilityError("");
      console.log("Availability check passed");
    } catch (error) {
      console.error("Error checking availability:", error);
      setAvailabilityError(
        `Error checking room availability: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setCheckingAvailability(false);
    }
  };

  const calculateTotalAmount = () => {
    if (!bookingForm.checkInDate || !bookingForm.checkOutDate) {
      return;
    }

    const startDate = new Date(bookingForm.checkInDate);
    const endDate = new Date(bookingForm.checkOutDate);
    const nights = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate room cost
    const roomCost =
      bookingForm.pricePerRoom * bookingForm.numberOfRooms * nights;

    // Calculate extra bed cost
    const extraBedCost =
      bookingForm.extraBeds * bookingForm.extraBedPrice * nights;

    // Calculate hall costs
    const hall1Cost = bookingForm.hall1 ? bookingForm.hall1Price * nights : 0;
    const hall2Cost = bookingForm.hall2 ? bookingForm.hall2Price * nights : 0;

    // Calculate meal costs
    const breakfastCost = bookingForm.breakfast
      ? bookingForm.breakfastPrice * bookingForm.numberOfGuests * nights
      : 0;
    const lunchCost = bookingForm.lunch
      ? bookingForm.lunchPrice * bookingForm.numberOfGuests * nights
      : 0;
    const dinnerCost = bookingForm.dinner
      ? bookingForm.dinnerPrice * bookingForm.numberOfGuests * nights
      : 0;

    const totalAmount =
      roomCost +
      extraBedCost +
      hall1Cost +
      hall2Cost +
      breakfastCost +
      lunchCost +
      dinnerCost;
    const advanceAmount = Math.round(totalAmount * 0.5); // 50% advance

    setBookingForm((prev) => ({
      ...prev,
      totalAmount,
      advanceAmount,
      balanceAmount: totalAmount - advanceAmount,
    }));
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setBookingForm({
      guestName: booking.guestName,
      mobile: booking.mobile,
      numberOfRooms: booking.numberOfRooms || 1,
      numberOfGuests: booking.noOfPersons || 1,
      pricePerRoom: booking.pricePerRoom || 0,
      hall1: booking.hall1 || false,
      hall2: booking.hall2 || false,
      extraBeds: booking.extraBeds || 0,
      extraBedPrice: booking.extraBedPrice || 0,
      breakfast: booking.breakfast || false,
      lunch: booking.lunch || false,
      dinner: booking.dinner || false,
      breakfastPrice: booking.breakfastPrice || 0,
      lunchPrice: booking.lunchPrice || 0,
      dinnerPrice: booking.dinnerPrice || 0,
      hall1Price: booking.hall1Price || 0,
      hall2Price: booking.hall2Price || 0,
      totalAmount: booking.totalAmount,
      advanceAmount: booking.advanceAmount,
      balanceAmount: booking.balanceAmount,
      paymentMode: booking.paymentMode,
      paymentStatus: booking.paymentStatus,
      status: booking.status || "pending",
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
    });
    setAvailabilityError("");
    setShowBookingForm(true);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus =
      statusFilter === "all" || booking.paymentStatus === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.mobile.includes(searchTerm);

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
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
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage all bookings, payments, and operations
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "dashboard"
                    ? "border-orange-500 text-orange-600 dark:text-orange-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setActiveTab("pricing")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "pricing"
                    ? "border-orange-500 text-orange-600 dark:text-orange-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                📅 Upcoming Bookings
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Bookings
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalBookings}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{stats.totalRevenue.toLocaleString()}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Pending Payments
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{stats.pendingPayments.toLocaleString()}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Upcoming Check-ins
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.upcomingCheckIns}
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cash Collected
                  </p>
                  <IndianRupee className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{stats.cashCollected.toLocaleString()}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    GPay Collected
                  </p>
                  <IndianRupee className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{stats.gpayCollected.toLocaleString()}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Online Collected
                  </p>
                  <IndianRupee className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{stats.onlineCollected.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Additional Admin Stats */}
            <div className="grid lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Today's Check-ins
                  </p>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    bookings.filter((b) => {
                      const today = new Date();
                      const checkIn = new Date(b.checkInDate);
                      return (
                        checkIn.toDateString() === today.toDateString() &&
                        b.paymentStatus !== "cancelled" &&
                        b.status !== "cancelled"
                      );
                    }).length
                  }
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This Week's Bookings
                  </p>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    bookings.filter((b) => {
                      const now = new Date();
                      const weekStart = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate()
                      );
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekEnd.getDate() + 7);
                      const checkIn = new Date(b.checkInDate);
                      return (
                        checkIn >= weekStart &&
                        checkIn <= weekEnd &&
                        b.paymentStatus !== "cancelled" &&
                        b.status !== "cancelled"
                      );
                    }).length
                  }
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Average Booking Value
                  </p>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹
                  {bookings.length > 0
                    ? Math.round(
                        bookings.reduce((sum, b) => sum + b.totalAmount, 0) /
                          bookings.length
                      ).toLocaleString()
                    : 0}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Occupancy Rate
                  </p>
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(() => {
                    const totalRooms = 13;
                    const today = new Date();
                    const todayBookings = bookings.filter((b) => {
                      const checkIn = new Date(b.checkInDate);
                      const checkOut = new Date(b.checkOutDate);
                      return (
                        checkIn <= today &&
                        checkOut > today &&
                        b.paymentStatus !== "cancelled" &&
                        b.status !== "cancelled"
                      );
                    });
                    const occupiedRooms = todayBookings.reduce(
                      (sum, b) => sum + (b.numberOfRooms || 0),
                      0
                    );
                    return Math.round((occupiedRooms / totalRooms) * 100);
                  })()}
                  %
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Manage Bookings
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCheckAvailability}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Check Availability</span>
                  </button>
                  <button
                    onClick={handleRecalculateAvailability}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Recalculate Availability</span>
                  </button>
                <button
                  onClick={() => {
                    setEditingBooking(null);
                    resetBookingForm();
                    setShowBookingForm(true);
                  }}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Booking</span>
                </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, mobile, room..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const balanceDue = getBalanceDue(booking);
                  const bookingPayments = getBookingPayments(booking.id);

                  return (
                    <div
                      key={booking.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {booking.guestName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {booking.mobile}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {booking.address}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                              booking.paymentStatus === "confirmed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : booking.paymentStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                : booking.paymentStatus === "cancelled"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            }`}
                          >
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Check-in
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {formatDate(booking.checkInDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Check-out
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {formatDate(booking.checkOutDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Total Amount
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            ₹{booking.totalAmount}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Balance Due
                          </p>
                          <p
                            className={`font-medium ${
                              balanceDue > 0
                                ? "text-orange-500"
                                : "text-green-500"
                            }`}
                          >
                            ₹{balanceDue}
                          </p>
                        </div>
                      </div>

                      {/* Payment Due Status */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {(() => {
                                const daysUntilCheckIn = getDaysUntilCheckIn(
                                  booking.checkInDate
                                );
                                if (daysUntilCheckIn > 0)
                                  return `${daysUntilCheckIn} days until check-in`;
                                if (daysUntilCheckIn === 0)
                                  return "Check-in today";
                                return "Check-in overdue";
                              })()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-sm font-medium ${
                                getPaymentDueStatus(booking).color
                              }`}
                            >
                              {getPaymentDueStatus(booking).message}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Number of Rooms
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {booking.numberOfRooms || 1}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Price Per Room
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            ₹{booking.pricePerRoom || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Booking Status
                          </p>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            }`}
                          >
                            {booking.status || "pending"}
                          </span>
                        </div>
                      </div>

                      {balanceDue > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                          <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Payment due: ₹{balanceDue}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        <button
                          onClick={() =>
                            setSelectedBooking(
                              selectedBooking === booking.id ? null : booking.id
                            )
                          }
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                        >
                          {selectedBooking === booking.id
                            ? "Hide Details"
                            : "View Details"}
                        </button>
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center space-x-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                        {booking.paymentStatus === "pending" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(booking.id, "confirmed")
                            }
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                          >
                            Confirm
                          </button>
                        )}
                        {booking.paymentStatus === "confirmed" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(booking.id, "completed")
                            }
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            Mark Complete
                          </button>
                        )}
                        {booking.paymentStatus !== "cancelled" &&
                          booking.paymentStatus !== "completed" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(booking.id, "cancelled")
                              }
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          )}
                      </div>

                      {selectedBooking === booking.id && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                              Record Payment
                            </h4>
                            <div className="flex flex-wrap gap-4">
                              <input
                                type="number"
                                placeholder="Amount"
                                value={paymentAmount}
                                onChange={(e) =>
                                  setPaymentAmount(e.target.value)
                                }
                                className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                              />
                              <select
                                value={paymentMode}
                                onChange={(e) =>
                                  setPaymentMode(
                                    e.target.value as "Cash" | "GPay" | "Online"
                                  )
                                }
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                              >
                                <option value="Cash">Cash</option>
                                <option value="GPay">GPay</option>
                                <option value="Online">Online</option>
                              </select>
                              <button
                                onClick={() => handleRecordPayment(booking.id)}
                                disabled={processingPayment || !paymentAmount}
                                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                              >
                                {processingPayment ? "Processing..." : "Record"}
                              </button>
                            </div>
                          </div>

                          {bookingPayments.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                Payment History
                              </h4>
                              <div className="space-y-2">
                                {bookingPayments.map((payment) => (
                                  <div
                                    key={payment.id}
                                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                  >
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {payment.paymentType} -{" "}
                                        {payment.paymentMode}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatDateTime(payment.paymentDate)}
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
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === "pricing" && (
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
                  const daysUntilCheckIn = getDaysUntilCheckIn(
                    booking.checkInDate
                  );

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
          </div>
        )}

        {/* Booking Form Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingBooking ? "Edit Booking" : "Create New Booking"}
                </h2>
                <button
                  onClick={() => {
                    setShowBookingForm(false);
                    setEditingBooking(null);
                    resetBookingForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBookingFormSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Guest Name *
                    </label>
                    <input
                      type="text"
                      value={bookingForm.guestName}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          guestName: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={bookingForm.mobile}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          mobile: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Room and Guest Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Number of Rooms Required *
                    </label>
                    <input
                      type="number"
                      value={bookingForm.numberOfRooms}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          numberOfRooms: parseInt(e.target.value) || 1,
                        }))
                      }
                      min="1"
                      max="13"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Number of Guests *
                    </label>
                    <input
                      type="number"
                      value={bookingForm.numberOfGuests}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          numberOfGuests: parseInt(e.target.value) || 1,
                        }))
                      }
                      min="1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Check-in Date *
                    </label>
                    <input
                      type="date"
                      value={bookingForm.checkInDate}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          checkInDate: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Check-out Date *
                    </label>
                    <input
                      type="date"
                      value={bookingForm.checkOutDate}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          checkOutDate: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Availability Check */}
                {checkingAvailability && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Checking room availability...
                    </p>
                  </div>
                )}

                {availabilityError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-700 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {availabilityError}
                    </p>
                  </div>
                )}

                {/* Pricing Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Pricing Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price of Each Room Per Day (₹) *
                      </label>
                      <input
                        type="number"
                        value={bookingForm.pricePerRoom}
                        onChange={(e) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            pricePerRoom: parseFloat(e.target.value) || 0,
                          }))
                        }
                        min="0"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Number of Extra Beds
                      </label>
                      <input
                        type="number"
                        value={bookingForm.extraBeds}
                        onChange={(e) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            extraBeds: parseInt(e.target.value) || 0,
                          }))
                        }
                        min="0"
                        max="10"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {bookingForm.extraBeds > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price of Each Extra Bed (₹)
                      </label>
                      <input
                        type="number"
                        value={bookingForm.extraBedPrice}
                        onChange={(e) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            extraBedPrice: parseFloat(e.target.value) || 0,
                          }))
                        }
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  )}

                  {/* Hall Selection */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                      Hall Requirements
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={bookingForm.hall1}
                          onChange={(e) =>
                            setBookingForm((prev) => ({
                              ...prev,
                              hall1: e.target.checked,
                            }))
                          }
                          className="rounded"
                        />
                        <label className="text-gray-700 dark:text-gray-300">
                          Hall 1 Required
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={bookingForm.hall2}
                          onChange={(e) =>
                            setBookingForm((prev) => ({
                              ...prev,
                              hall2: e.target.checked,
                            }))
                          }
                          className="rounded"
                        />
                        <label className="text-gray-700 dark:text-gray-300">
                          Hall 2 Required
                        </label>
                      </div>
                    </div>

                    {bookingForm.hall1 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Hall 1 Rate (₹)
                        </label>
                        <input
                          type="number"
                          value={bookingForm.hall1Price}
                          onChange={(e) =>
                            setBookingForm((prev) => ({
                              ...prev,
                              hall1Price: parseFloat(e.target.value) || 0,
                            }))
                          }
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    )}

                    {bookingForm.hall2 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Hall 2 Rate (₹)
                        </label>
                        <input
                          type="number"
                          value={bookingForm.hall2Price}
                          onChange={(e) =>
                            setBookingForm((prev) => ({
                              ...prev,
                              hall2Price: parseFloat(e.target.value) || 0,
                            }))
                          }
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Food Services */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                      Food Services
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={bookingForm.breakfast}
                          onChange={(e) =>
                            setBookingForm((prev) => ({
                              ...prev,
                              breakfast: e.target.checked,
                            }))
                          }
                          className="rounded"
                        />
                        <label className="text-gray-700 dark:text-gray-300">
                          Breakfast
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={bookingForm.lunch}
                          onChange={(e) =>
                            setBookingForm((prev) => ({
                              ...prev,
                              lunch: e.target.checked,
                            }))
                          }
                          className="rounded"
                        />
                        <label className="text-gray-700 dark:text-gray-300">
                          Lunch
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={bookingForm.dinner}
                          onChange={(e) =>
                            setBookingForm((prev) => ({
                              ...prev,
                              dinner: e.target.checked,
                            }))
                          }
                          className="rounded"
                        />
                        <label className="text-gray-700 dark:text-gray-300">
                          Dinner
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {bookingForm.breakfast && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Breakfast Price (₹)
                          </label>
                          <input
                            type="number"
                            value={bookingForm.breakfastPrice}
                            onChange={(e) =>
                              setBookingForm((prev) => ({
                                ...prev,
                                breakfastPrice: parseFloat(e.target.value) || 0,
                              }))
                            }
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      )}
                      {bookingForm.lunch && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Lunch Price (₹)
                          </label>
                          <input
                            type="number"
                            value={bookingForm.lunchPrice}
                            onChange={(e) =>
                              setBookingForm((prev) => ({
                                ...prev,
                                lunchPrice: parseFloat(e.target.value) || 0,
                              }))
                            }
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      )}
                      {bookingForm.dinner && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Dinner Price (₹)
                          </label>
                          <input
                            type="number"
                            value={bookingForm.dinnerPrice}
                            onChange={(e) =>
                              setBookingForm((prev) => ({
                                ...prev,
                                dinnerPrice: parseFloat(e.target.value) || 0,
                              }))
                            }
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Total Amount Display */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                    Booking Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Total Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={bookingForm.totalAmount}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Advance Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={bookingForm.advanceAmount}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Automatically calculated as 50% of total amount
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Balance Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={bookingForm.balanceAmount}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Automatically calculated as total - advance
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={bookingForm.paymentStatus}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          paymentStatus: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Booking Status
                    </label>
                    <select
                      value={bookingForm.status}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          status: e.target.value as
                            | "pending"
                            | "confirmed"
                            | "cancelled",
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingForm(false);
                      setEditingBooking(null);
                      resetBookingForm();
                    }}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!!availabilityError || checkingAvailability}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingBooking ? "Update Booking" : "Create Booking"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
