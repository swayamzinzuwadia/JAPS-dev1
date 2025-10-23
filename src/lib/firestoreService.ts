import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { db, auth, ADMIN_CREDENTIALS } from "./firebase";

// Types
export interface Room {
  id: string;
  roomNo: string; // Changed from roomNumber to roomNo
  beds: number; // Changed from capacity to beds
  pricePerNight: number;
  description?: string;
  isActive: boolean;
  amenities: string[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Hall {
  id: string;
  hallName: string;
  capacity: number;
  pricePerDay: number;
  description?: string;
  isActive: boolean;
  amenities: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Booking {
  id: string;
  guestName: string;
  mobile: string;
  numberOfRooms: number;
  numberOfGuests: number;
  pricePerRoom: number;
  hall1?: boolean;
  hall2?: boolean;
  extraBeds: number;
  extraBedPrice: number;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  breakfastPrice: number;
  lunchPrice: number;
  dinnerPrice: number;
  hall1Price: number;
  hall2Price: number;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
  paymentMode: string;
  paymentStatus: string;
  status: "pending" | "confirmed" | "cancelled";
  checkInDate: string;
  checkOutDate: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  specialNote?: string;
  // Legacy fields for backward compatibility
  noOfPersons?: number;
  address?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentMode: string;
  paymentType: string;
  paymentDate: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Pricing {
  id: string;
  startDate: string;
  endDate: string;
  pricePerRoomPerNight: number;
  description?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Availability {
  id: string;
  date: string;
  totalRooms: number;
  totalHalls: number;
  availableRooms: number;
  availableHalls: number;
  bookedRooms: number;
  bookedHalls: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Authentication functions
export const signInAsAdmin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      ADMIN_CREDENTIALS.email,
      ADMIN_CREDENTIALS.password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Admin sign-in error:", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-out error:", error);
    throw error;
  }
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Rooms functions
export const getRooms = async (): Promise<Room[]> => {
  try {
    const roomsRef = collection(db, "rooms");
    const q = query(
      roomsRef,
      where("isActive", "==", true),
      orderBy("roomNumber")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Room)
    );
  } catch (error) {
    console.error("Error getting rooms:", error);
    throw error;
  }
};

export const getRoomById = async (roomId: string): Promise<Room | null> => {
  try {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
      return { id: roomSnap.id, ...roomSnap.data() } as Room;
    }
    return null;
  } catch (error) {
    console.error("Error getting room:", error);
    throw error;
  }
};

export const addRoom = async (
  roomData: Omit<Room, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const roomsRef = collection(db, "rooms");
    const docRef = await addDoc(roomsRef, {
      ...roomData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding room:", error);
    throw error;
  }
};

// Halls functions
export const getHalls = async (): Promise<Hall[]> => {
  try {
    const hallsRef = collection(db, "halls");
    const q = query(
      hallsRef,
      where("isActive", "==", true),
      orderBy("hallName")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Hall)
    );
  } catch (error) {
    console.error("Error getting halls:", error);
    throw error;
  }
};

export const getHallById = async (hallId: string): Promise<Hall | null> => {
  try {
    const hallRef = doc(db, "halls", hallId);
    const hallSnap = await getDoc(hallRef);

    if (hallSnap.exists()) {
      return { id: hallSnap.id, ...hallSnap.data() } as Hall;
    }
    return null;
  } catch (error) {
    console.error("Error getting hall:", error);
    throw error;
  }
};

export const addHall = async (
  hallData: Omit<Hall, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const hallsRef = collection(db, "halls");
    const docRef = await addDoc(hallsRef, {
      ...hallData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding hall:", error);
    throw error;
  }
};

// Bookings functions
export const getBookings = async (): Promise<Booking[]> => {
  try {
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Booking)
    );
  } catch (error) {
    console.error("Error getting bookings:", error);
    throw error;
  }
};

export const getBookingsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<Booking[]> => {
  try {
    const bookingsRef = collection(db, "bookings");
    // Use a simpler query to avoid index requirements
    // Get all bookings and filter on client side
    const q = query(bookingsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const allBookings = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Booking)
    );

    // Filter bookings that overlap with the date range and are not cancelled
    const overlappingBookings = allBookings.filter((booking) => {
      const bookingStart = new Date(booking.checkInDate);
      const bookingEnd = new Date(booking.checkOutDate);
      const queryStart = new Date(startDate);
      const queryEnd = new Date(endDate);

      // Check if booking overlaps with the query date range
      const overlaps = bookingStart < queryEnd && bookingEnd > queryStart;

      // Check if booking is not cancelled
      const notCancelled =
        booking.paymentStatus !== "cancelled" && booking.status !== "cancelled";

      return overlaps && notCancelled;
    });

    return overlappingBookings;
  } catch (error) {
    console.error("Error getting bookings by date range:", error);
    throw error;
  }
};

export const addBooking = async (
  bookingData: Omit<Booking, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const bookingsRef = collection(db, "bookings");
    const docRef = await addDoc(bookingsRef, {
      ...bookingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding booking:", error);
    throw error;
  }
};

export const updateBookingStatus = async (
  bookingId: string,
  status: Booking["status"]
): Promise<void> => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToRooms = (callback: (rooms: Room[]) => void) => {
  const roomsRef = collection(db, "rooms");
  const q = query(
    roomsRef,
    where("isActive", "==", true),
    orderBy("roomNumber")
  );

  return onSnapshot(q, (querySnapshot) => {
    const rooms = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Room)
    );
    callback(rooms);
  });
};

export const subscribeToHalls = (callback: (halls: Hall[]) => void) => {
  const hallsRef = collection(db, "halls");
  const q = query(hallsRef, where("isActive", "==", true), orderBy("hallName"));

  return onSnapshot(q, (querySnapshot) => {
    const halls = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Hall)
    );
    callback(halls);
  });
};

export const subscribeToBookings = (
  callback: (bookings: Booking[]) => void
) => {
  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (querySnapshot) => {
    const bookings = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Booking)
    );
    callback(bookings);
  });
};

export const subscribeToBookingsByDateRange = (
  startDate: string,
  endDate: string,
  callback: (bookings: any[]) => void
) => {
  const bookingsRef = collection(db, "bookings");
  const q = query(
    bookingsRef,
    where("checkInDate", "<=", endDate),
    where("checkOutDate", ">=", startDate)
    // Removed status filter since we're using paymentStatus
  );

  return onSnapshot(q, (querySnapshot) => {
    const bookings = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as any)
    );
    callback(bookings);
  });
};

// Initialize sample data
export const initializeSampleData = async () => {
  try {
    // Check if rooms already exist
    const existingRooms = await getRooms();
    if (existingRooms.length === 0) {
      // Add temple rooms
      const templeRooms = Array.from({ length: 13 }, (_, i) => ({
        roomNumber: (i + 1).toString().padStart(2, "0"),
        capacity: 5,
        pricePerNight: 1000,
        description: `Room ${i + 1} - Comfortable stay for devotees (5 beds)`,
        isActive: true,
        amenities: ["Fan", "Hot Water", "Clean Bedding", "Attached Bathroom"],
      }));

      for (const room of templeRooms) {
        await addRoom(room);
      }
    }

    // Check if halls already exist
    const existingHalls = await getHalls();
    if (existingHalls.length === 0) {
      // Add temple halls
      const templeHalls = [
        {
          hallName: "Hall 1",
          capacity: 100,
          pricePerDay: 4000,
          description:
            "Spacious hall for religious gatherings, small weddings & events",
          isActive: true,
          amenities: ["Stage", "Speakers", "Lighting", "AC", "Chairs"],
        },
        {
          hallName: "Hall 2",
          capacity: 60,
          pricePerDay: 2500,
          description: "Compact hall suitable for satsangs & family occasions",
          isActive: true,
          amenities: ["Fans", "Lighting", "Seating", "Stage"],
        },
      ];

      for (const hall of templeHalls) {
        await addHall(hall);
      }
    }

    console.log("Sample data initialized successfully");
  } catch (error) {
    console.error("Error initializing sample data:", error);
    throw error;
  }
};

// Subscribe to availability data by date range
export const subscribeToAvailabilityByDateRange = (
  startDate: string,
  endDate: string,
  callback: (availability: Availability[]) => void
) => {
  const availabilityRef = collection(db, "availability");
  const q = query(
    availabilityRef,
    where("date", ">=", startDate),
    where("date", "<=", endDate),
    orderBy("date", "asc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const availability = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Availability)
    );
    console.log("Availability subscription received data:", availability);
    callback(availability);
  });
};

// Pricing functions
export const addPricing = async (
  pricing: Omit<Pricing, "id" | "createdAt" | "updatedAt">
) => {
  const pricingRef = collection(db, "pricing");
  return await addDoc(pricingRef, {
    ...pricing,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getPricing = async () => {
  const pricingRef = collection(db, "pricing");
  const q = query(
    pricingRef,
    where("isActive", "==", true),
    orderBy("startDate", "asc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Pricing)
  );
};

export const subscribeToPricing = (callback: (pricing: Pricing[]) => void) => {
  const pricingRef = collection(db, "pricing");
  const q = query(
    pricingRef,
    where("isActive", "==", true),
    orderBy("startDate", "asc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const pricing = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Pricing)
    );
    callback(pricing);
  });
};

export const getPriceForDate = async (date: string) => {
  try {
    const pricingRef = collection(db, "pricing");
    const q = query(
      pricingRef,
      where("isActive", "==", true),
      where("startDate", "<=", date),
      where("endDate", ">=", date),
      orderBy("startDate", "desc")
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const pricing = querySnapshot.docs[0].data() as Pricing;
      return pricing.pricePerRoomPerNight;
    }

    // Default price if no pricing found
    return 1000;
  } catch (error) {
    console.error("Error getting price for date:", error);
    return 1000; // Default price
  }
};

export const calculateBookingTotal = async (
  checkInDate: string,
  checkOutDate: string,
  numberOfRooms: number
) => {
  try {
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    let totalAmount = 0;

    // Calculate for each night
    for (
      let date = new Date(startDate);
      date < endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dateStr = date.toISOString().split("T")[0];
      const pricePerRoom = await getPriceForDate(dateStr);
      totalAmount += pricePerRoom * numberOfRooms;
    }

    return totalAmount;
  } catch (error) {
    console.error("Error calculating booking total:", error);
    return 0;
  }
};

// Subscribe to all payments
export const subscribeToPayments = (
  callback: (payments: Payment[]) => void
) => {
  const paymentsRef = collection(db, "payments");
  const q = query(paymentsRef, orderBy("paymentDate", "desc"));

  return onSnapshot(q, (querySnapshot) => {
    const payments = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Payment)
    );
    callback(payments);
  });
};

// Update booking
export const updateBooking = async (
  bookingId: string,
  updates: Partial<Booking>
) => {
  const bookingRef = doc(db, "bookings", bookingId);
  return await updateDoc(bookingRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Delete booking
export const deleteBooking = async (bookingId: string) => {
  const bookingRef = doc(db, "bookings", bookingId);
  return await deleteDoc(bookingRef);
};

// Add payment
export const addPayment = async (
  paymentData: Omit<Payment, "id" | "createdAt" | "updatedAt">
) => {
  const paymentsRef = collection(db, "payments");
  return await addDoc(paymentsRef, {
    ...paymentData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Update availability for a specific date
export const updateAvailabilityForDate = async (
  date: string,
  roomsToReduce: number,
  hallsToReduce: number = 0
) => {
  const availabilityRef = doc(db, "availability", date);
  const availabilityDoc = await getDoc(availabilityRef);

  console.log(
    `Updating availability for ${date}: reducing ${roomsToReduce} rooms, ${hallsToReduce} halls`
  );

  if (availabilityDoc.exists()) {
    // Update existing entry
    const currentData = availabilityDoc.data();
    console.log(`Current availability data:`, currentData);

    const newAvailableRooms = Math.max(
      0,
      (currentData.availableRooms || 13) - roomsToReduce
    );
    const newAvailableHalls = Math.max(
      0,
      (currentData.availableHalls || 2) - hallsToReduce
    );

    console.log(
      `New availability: ${newAvailableRooms} rooms, ${newAvailableHalls} halls`
    );

    await updateDoc(availabilityRef, {
      availableRooms: newAvailableRooms,
      availableHalls: newAvailableHalls,
      bookedRooms: (currentData.bookedRooms || 0) + roomsToReduce,
      bookedHalls: (currentData.bookedHalls || 0) + hallsToReduce,
      updatedAt: serverTimestamp(),
    });
  } else {
    // Create new entry
    const totalRooms = 13;
    const totalHalls = 2;
    const newAvailableRooms = Math.max(0, totalRooms - roomsToReduce);
    const newAvailableHalls = Math.max(0, totalHalls - hallsToReduce);

    console.log(
      `Creating new availability entry: ${newAvailableRooms} rooms, ${newAvailableHalls} halls`
    );

    await setDoc(availabilityRef, {
      date: date,
      totalRooms: totalRooms,
      totalHalls: totalHalls,
      availableRooms: newAvailableRooms,
      availableHalls: newAvailableHalls,
      bookedRooms: roomsToReduce,
      bookedHalls: hallsToReduce,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

// Restore availability when booking is cancelled
export const restoreAvailabilityForDate = async (
  date: string,
  roomsToRestore: number,
  hallsToRestore: number = 0
) => {
  const availabilityRef = doc(db, "availability", date);
  const availabilityDoc = await getDoc(availabilityRef);

  if (availabilityDoc.exists()) {
    const currentData = availabilityDoc.data();
    const newAvailableRooms = Math.min(
      13,
      (currentData.availableRooms || 0) + roomsToRestore
    );
    const newAvailableHalls = Math.min(
      2,
      (currentData.availableHalls || 0) + hallsToRestore
    );

    await updateDoc(availabilityRef, {
      availableRooms: newAvailableRooms,
      availableHalls: newAvailableHalls,
      bookedRooms: Math.max(0, (currentData.bookedRooms || 0) - roomsToRestore),
      bookedHalls: Math.max(0, (currentData.bookedHalls || 0) - hallsToRestore),
      updatedAt: serverTimestamp(),
    });
  }
};

// Create booking with availability updates
export const createBookingWithAvailability = async (
  bookingData: Omit<Booking, "id" | "createdAt" | "updatedAt">
) => {
  const bookingsRef = collection(db, "bookings");

  // Determine status based on advance payment
  const status = bookingData.advanceAmount > 0 ? "confirmed" : "pending";

  // Create booking with legacy field mapping for backward compatibility
  const bookingToCreate = {
    ...bookingData,
    noOfPersons: bookingData.numberOfGuests, // Map numberOfGuests to noOfPersons for legacy compatibility
    status: status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Create booking
  const bookingDoc = await addDoc(bookingsRef, bookingToCreate);

  // Update availability for each date in the booking period
  const startDate = new Date(bookingData.checkInDate);
  const endDate = new Date(bookingData.checkOutDate);

  console.log(
    `Creating booking for ${bookingData.guestName}: ${bookingData.checkInDate} to ${bookingData.checkOutDate}`
  );
  console.log(
    `Rooms: ${bookingData.numberOfRooms}, Hall1: ${bookingData.hall1}, Hall2: ${bookingData.hall2}`
  );

  for (
    let date = new Date(startDate);
    date < endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dateString = date.toISOString().split("T")[0];
    const hallsToReduce =
      (bookingData.hall1 ? 1 : 0) + (bookingData.hall2 ? 1 : 0);

    console.log(
      `Updating availability for ${dateString}: ${bookingData.numberOfRooms} rooms, ${hallsToReduce} halls`
    );

    await updateAvailabilityForDate(
      dateString,
      bookingData.numberOfRooms,
      hallsToReduce
    );
  }

  console.log("Booking created and availability updated successfully");
  return bookingDoc;
};

// Recalculate availability for all dates based on current bookings
export const recalculateAvailability = async () => {
  try {
    console.log("Recalculating availability for all dates...");

    // Get all bookings
    const bookingsRef = collection(db, "bookings");
    const bookingsSnapshot = await getDocs(bookingsRef);
    const allBookings = bookingsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Booking)
    );

    // Filter out cancelled bookings
    const activeBookings = allBookings.filter(
      (b) => b.paymentStatus !== "cancelled" && b.status !== "cancelled"
    );

    console.log(`Found ${activeBookings.length} active bookings`);

    // Create a map to track total bookings per date
    const bookingsByDate = new Map<string, { rooms: number; halls: number }>();

    // Process each booking
    activeBookings.forEach((booking) => {
      const startDate = new Date(booking.checkInDate);
      const endDate = new Date(booking.checkOutDate);

      const hallsToBook = (booking.hall1 ? 1 : 0) + (booking.hall2 ? 1 : 0);

      // Add booking for each date in the range
      for (
        let date = new Date(startDate);
        date < endDate;
        date.setDate(date.getDate() + 1)
      ) {
        const dateString = date.toISOString().split("T")[0];
        const current = bookingsByDate.get(dateString) || {
          rooms: 0,
          halls: 0,
        };
        bookingsByDate.set(dateString, {
          rooms: current.rooms + (booking.numberOfRooms || 0),
          halls: current.halls + hallsToBook,
        });
      }
    });

    // Update availability for each date
    for (const [dateString, bookings] of bookingsByDate) {
      const totalRooms = 13;
      const totalHalls = 2;
      const availableRooms = Math.max(0, totalRooms - bookings.rooms);
      const availableHalls = Math.max(0, totalHalls - bookings.halls);

      const availabilityRef = doc(db, "availability", dateString);
      await setDoc(
        availabilityRef,
        {
          date: dateString,
          totalRooms: totalRooms,
          totalHalls: totalHalls,
          availableRooms: availableRooms,
          availableHalls: availableHalls,
          bookedRooms: bookings.rooms,
          bookedHalls: bookings.halls,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      console.log(
        `Updated ${dateString}: ${availableRooms}/${totalRooms} rooms, ${availableHalls}/${totalHalls} halls`
      );
    }

    console.log("Availability recalculation completed");
  } catch (error) {
    console.error("Error recalculating availability:", error);
    throw error;
  }
};

// Get availability for a specific date
export const getAvailabilityForDate = async (date: string) => {
  try {
    const availabilityRef = doc(db, "availability", date);
    const availabilityDoc = await getDoc(availabilityRef);

    if (availabilityDoc.exists()) {
      const data = availabilityDoc.data();
      console.log(`Availability for ${date}:`, data);
      return {
        id: availabilityDoc.id,
        ...data,
      } as Availability;
    } else {
      console.log(`No availability data found for ${date}`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting availability for ${date}:`, error);
    throw error;
  }
};
