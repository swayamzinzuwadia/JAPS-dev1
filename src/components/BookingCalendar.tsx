import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  subscribeToAvailabilityByDateRange,
  subscribeToRooms,
  subscribeToHalls,
  Room,
  Hall,
  Availability,
} from "../lib/firestoreService";
import { formatDate } from "../utils/dateUtils";

interface DayAvailability {
  date: Date;
  availableRooms: number;
  availableHalls: number;
  totalRooms: number;
  totalHalls: number;
}

export default function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [availabilityData, setAvailabilityData] = useState<Availability[]>([]);

  useEffect(() => {
    console.log("BookingCalendar: Setting up subscriptions...");
    // Subscribe to rooms data
    const unsubscribeRooms = subscribeToRooms((roomsData) => {
      console.log("BookingCalendar: Rooms data received:", roomsData);
      setRooms(roomsData);
    });

    // Subscribe to halls data
    const unsubscribeHalls = subscribeToHalls((hallsData) => {
      console.log("BookingCalendar: Halls data received:", hallsData);
      setHalls(hallsData);
    });

    return () => {
      console.log("BookingCalendar: Cleaning up subscriptions...");
      unsubscribeRooms();
      unsubscribeHalls();
    };
  }, []);

  useEffect(() => {
    console.log(
      "BookingCalendar: Setting up availability subscription for month:",
      currentDate.getMonth() + 1
    );
    // Subscribe to availability for current month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).toISOString().split("T")[0];
    const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const unsubscribeAvailability = subscribeToAvailabilityByDateRange(
      firstDay,
      lastDay,
      (availabilityData) => {
        console.log(
          "BookingCalendar: Availability data received:",
          availabilityData
        );
        setAvailabilityData(availabilityData);
        calculateAvailabilityFromTable(availabilityData);
      }
    );

    return () => {
      console.log("BookingCalendar: Cleaning up availability subscription...");
      unsubscribeAvailability();
    };
  }, [currentDate, rooms, halls]);

  const calculateAvailabilityFromTable = (availabilityData: Availability[]) => {
    try {
      console.log(
        "BookingCalendar: Calculating availability from table:",
        availabilityData
      );
      console.log("BookingCalendar: Current rooms:", rooms);
      console.log("BookingCalendar: Current halls:", halls);

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const calendarAvailability: DayAvailability[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        // Fix timezone issue - use local date string instead of ISO
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;

        // Look for availability data for this specific date - use the date field inside document
        const dayAvailability = availabilityData.find(
          (av) => av.date === dateStr
        );

        if (dayAvailability) {
          // Use data from availability table
          console.log(
            `Using availability data for ${dateStr}:`,
            dayAvailability
          );
          console.log(
            `Raw data - availableRooms: ${dayAvailability.availableRooms}, availableHalls: ${dayAvailability.availableHalls}, totalRooms: ${dayAvailability.totalRooms}, totalHalls: ${dayAvailability.totalHalls}`
          );

          calendarAvailability.push({
            date,
            availableRooms: dayAvailability.availableRooms || 0,
            availableHalls: dayAvailability.availableHalls || 0, // Use actual value, don't default to 2
            totalRooms: dayAvailability.totalRooms || 13,
            totalHalls: dayAvailability.totalHalls || 2,
          });
          console.log(
            `Added to calendar: availableRooms=${dayAvailability.availableRooms}/${dayAvailability.totalRooms}, availableHalls=${dayAvailability.availableHalls}/${dayAvailability.totalHalls}`
          );
        } else {
          // If no availability data exists for this date, assume all available
          console.log(
            `No availability data for ${dateStr}, showing all available: 13/13 rooms, 2/2 halls`
          );
          calendarAvailability.push({
            date,
            availableRooms: 13, // All 13 rooms available
            availableHalls: 2, // All 2 halls available
            totalRooms: 13,
            totalHalls: 2,
          });
        }
      }

      console.log(
        "BookingCalendar: Calculated calendar availability:",
        calendarAvailability
      );
      setAvailability(calendarAvailability);
      setLoading(false);
    } catch (error) {
      console.error(
        "BookingCalendar: Error calculating availability from table:",
        error
      );
      setLoading(false);
    }
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  return (
    <section id="calendar" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Availability Calendar
          </h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Check room and hall availability for your preferred dates
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300">
                Loading availability...
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center font-semibold text-gray-700 dark:text-gray-300 py-2"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {availability.map((day, index) => (
                  <div
                    key={index}
                    className={`border border-gray-200 dark:border-gray-700 rounded-lg p-2 min-h-[80px] ${
                      day.date.toDateString() === new Date().toDateString()
                        ? "bg-orange-50 dark:bg-orange-900/20 border-orange-500"
                        : "bg-white dark:bg-gray-800"
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {day.date.getDate()}
                    </div>
                    <div className="text-xs space-y-1">
                      <div
                        className={`${
                          day.availableRooms > day.totalRooms * 0.5
                            ? "text-green-600 dark:text-green-400"
                            : day.availableRooms > 0
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        R: {day.availableRooms}/{day.totalRooms}
                      </div>
                      <div
                        className={`${
                          day.availableHalls > 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        H: {day.availableHalls}/{day.totalHalls}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Good Availability
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Limited
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Fully Booked
                  </span>
                </div>
              </div>

              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                R = Available Rooms | H = Available Halls
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
