import React, { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../lib/firebase";

export default function FirestorePopulator() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const addStatus = (msg) => {
    setStatus((prev) => [...prev, msg]);
    console.log(msg);
  };

  // 13 Rooms
  const rooms = Array.from({ length: 13 }, (_, i) => ({
    roomNo: (i + 1).toString().padStart(2, "0"),
    beds: 5,
    pricePerNight: 1000,
    description: `Room ${i + 1} – 5 beds, Satvik comfort`,
    isActive: true,
    amenities: ["Fan", "Hot Water", "Clean Bedding", "Attached Bathroom"],
    createdAt: serverTimestamp(),
  }));

  // 2 Halls
  const halls = [
    {
      hallName: "Hall 1",
      capacity: 100,
      pricePerDay: 4000,
      description: "Large hall for weddings and spiritual gatherings",
      amenities: ["Stage", "Lighting", "Speakers"],
      isActive: true,
      createdAt: serverTimestamp(),
    },
    {
      hallName: "Hall 2",
      capacity: 60,
      pricePerDay: 2500,
      description: "Compact hall for satsangs & family functions",
      amenities: ["Fans", "Lighting", "Seating"],
      isActive: true,
      createdAt: serverTimestamp(),
    },
  ];

  // Sample bookings
  const bookings = [
    {
      guestName: "Suresh Patel",
      mobile: "9876543210",
      address: "Ahmedabad",
      noOfPersons: 4,
      numberOfRooms: 2,
      pricePerRoom: 500,
      hall1: false,
      hall2: true,
      extraBeds: 0,
      extraBedPrice: 500,
      breakfast: true,
      lunch: false,
      dinner: true,
      breakfastPrice: 200,
      lunchPrice: 300,
      dinnerPrice: 400,
      hall1Price: 1000,
      hall2Price: 1200,
      totalAmount: 2000,
      advanceAmount: 1000,
      balanceAmount: 1000,
      paymentMode: "gpay",
      paymentStatus: "advance_paid",
      status: "confirmed",
      checkInDate: "2025-11-15",
      checkOutDate: "2025-11-17",
      createdAt: serverTimestamp(),
    },
    {
      guestName: "Kirit Mehta",
      mobile: "9123456780",
      address: "Mumbai",
      noOfPersons: 2,
      numberOfRooms: 1,
      pricePerRoom: 600,
      hall1: true,
      hall2: false,
      extraBeds: 1,
      extraBedPrice: 500,
      breakfast: false,
      lunch: true,
      dinner: false,
      breakfastPrice: 200,
      lunchPrice: 300,
      dinnerPrice: 400,
      hall1Price: 1000,
      hall2Price: 1200,
      totalAmount: 6000,
      advanceAmount: 3000,
      balanceAmount: 3000,
      paymentMode: "cash",
      paymentStatus: "pending",
      status: "pending",
      checkInDate: "2025-12-05",
      checkOutDate: "2025-12-07",
      createdAt: serverTimestamp(),
    },
  ];

  // Payments (linked to bookings)
  const payments = [
    {
      bookingRef: null, // Will be linked dynamically
      guestName: "Suresh Patel",
      amount: 1000,
      paymentType: "advance",
      paymentMode: "gpay",
      transactionDate: serverTimestamp(),
      remarks: "Advance for Room 03 booking",
    },
    {
      bookingRef: null,
      guestName: "Kirit Mehta",
      amount: 3000,
      paymentType: "advance",
      paymentMode: "cash",
      transactionDate: serverTimestamp(),
      remarks: "Advance for Room 05 booking",
    },
  ];

  // Function: Create Admin User
  const createAdminUser = async () => {
    try {
      addStatus("🔄 Creating admin user...");
      const cred = await createUserWithEmailAndPassword(
        auth,
        "admin@neelkanthresidency.com",
        "Admin@123456"
      );
      addStatus("✅ Admin user created.");
      return cred.user;
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        addStatus("ℹ️ Admin already exists");
      } else addStatus("❌ Admin creation failed: " + err.message);
    }
  };

  // Populate Rooms
  const populateRooms = async () => {
    const ref = collection(db, "rooms");
    const existing = await getDocs(query(ref, where("isActive", "==", true)));
    if (!existing.empty) return addStatus("ℹ️ Rooms already exist.");
    for (const r of rooms) {
      await addDoc(ref, r);
      addStatus(`✅ Room ${r.roomNo} added`);
    }
  };

  // Populate Halls
  const populateHalls = async () => {
    const ref = collection(db, "halls");
    const existing = await getDocs(query(ref, where("isActive", "==", true)));
    if (!existing.empty) return addStatus("ℹ️ Halls already exist.");
    for (const h of halls) {
      await addDoc(ref, h);
      addStatus(`✅ ${h.hallName} added`);
    }
  };

  // Populate Bookings + Payments + Availability + Logs
  const populateBookings = async () => {
    const bookingRef = collection(db, "bookings");
    const paymentRef = collection(db, "payments");
    const logRef = collection(db, "logs");

    for (const b of bookings) {
      const bookingDoc = await addDoc(bookingRef, b);
      addStatus(`✅ Booking added for ${b.guestName}`);

      // Add corresponding payment
      const payment = payments.find((p) => p.guestName === b.guestName);
      if (payment) {
        await addDoc(paymentRef, {
          ...payment,
          bookingRef: bookingDoc.id,
        });
        addStatus(`💰 Payment logged for ${b.guestName}`);
      }

      // Update availability
      const dateKey = b.checkInDate;
      const availRef = doc(db, "availability", dateKey);

      const existingAvail = await getDoc(availRef);
      if (existingAvail.exists()) {
        const data = existingAvail.data();
        await setDoc(
          availRef,
          {
            bookedRooms: (data.bookedRooms || 0) + 1,
            availableRooms:
              (data.totalRooms || 13) - (data.bookedRooms || 0) - 1,
            bookings: [...(data.bookings || []), bookingDoc.id],
            lastUpdated: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        await setDoc(availRef, {
          date: dateKey,
          totalRooms: 13,
          bookedRooms: 1,
          availableRooms: 12,
          bookings: [bookingDoc.id],
          lastUpdated: serverTimestamp(),
        });
      }
      addStatus(`📅 Availability updated for ${dateKey}`);

      // Log action
      await addDoc(logRef, {
        action: "booking_created",
        byUser: "system_populator",
        details: `Booking created for ${b.guestName}`,
        timestamp: serverTimestamp(),
      });
    }
  };

  // Function: Initialize default pricing
  const initializeDefaultPricing = async () => {
    try {
      addStatus("🔄 Initializing default pricing...");

      const defaultPricingData = {
        extraBedPrice: 500,
        breakfastPrice: 200,
        lunchPrice: 300,
        dinnerPrice: 400,
        hall1Price: 1000,
        hall2Price: 1200,
        defaultRoomPrice: 500,
        updatedAt: serverTimestamp(),
      };

      const defaultPricingRef = doc(db, "defaultPricing", "default");
      await setDoc(defaultPricingRef, defaultPricingData);

      addStatus("✅ Default pricing initialized successfully!");
    } catch (error: any) {
      addStatus(`❌ Error initializing default pricing: ${error.message}`);
    }
  };

  // Function: Add a test booking dynamically
  const addTestBooking = async () => {
    const testBooking = {
      guestName: "Test Guest",
      mobile: "9999999999",
      address: "Test City",
      noOfPersons: 3,
      numberOfRooms: 1,
      pricePerRoom: 500,
      hall1: false,
      hall2: false,
      extraBeds: 0,
      extraBedPrice: 500,
      breakfast: true,
      lunch: true,
      dinner: true,
      breakfastPrice: 200,
      lunchPrice: 300,
      dinnerPrice: 400,
      hall1Price: 1000,
      hall2Price: 1200,
      totalAmount: 3000,
      advanceAmount: 1500,
      balanceAmount: 1500,
      paymentMode: "gpay",
      paymentStatus: "advance_paid",
      status: "confirmed",
      checkInDate: "2025-10-20",
      checkOutDate: "2025-10-22",
      createdAt: serverTimestamp(),
    };

    try {
      addStatus("🔄 Adding test booking...");

      // Add booking
      const bookingRef = collection(db, "bookings");
      const bookingDoc = await addDoc(bookingRef, testBooking);
      addStatus(`✅ Test booking added for ${testBooking.guestName}`);

      // Update availability
      const dateKey = testBooking.checkInDate;
      const availRef = doc(db, "availability", dateKey);
      const existingAvail = await getDoc(availRef);

      if (existingAvail.exists()) {
        const data = existingAvail.data();
        await setDoc(
          availRef,
          {
            bookedRooms: (data.bookedRooms || 0) + 1,
            availableRooms:
              (data.totalRooms || 13) - (data.bookedRooms || 0) - 1,
            bookings: [...(data.bookings || []), bookingDoc.id],
            lastUpdated: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        await setDoc(availRef, {
          date: dateKey,
          totalRooms: 13,
          bookedRooms: 1,
          availableRooms: 12,
          bookings: [bookingDoc.id],
          lastUpdated: serverTimestamp(),
        });
      }
      addStatus(`📅 Availability updated for ${dateKey}`);

      // Log action
      const logRef = collection(db, "logs");
      await addDoc(logRef, {
        action: "test_booking_created",
        byUser: "system_populator",
        details: `Test booking created for ${testBooking.guestName}`,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      addStatus(`❌ Error adding test booking: ${err.message}`);
    }
  };

  const populateAll = async () => {
    setIsLoading(true);
    setStatus([]);
    setIsComplete(false);

    try {
      addStatus("🚀 Populating Firestore data...");
      await createAdminUser();
      await populateRooms();
      await populateHalls();
      await populateBookings();
      addStatus("🎉 Firestore setup complete!");
      setIsComplete(true);
    } catch (err) {
      addStatus(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-orange-600 mb-4">
          🛕 Neelkanth Residency Firestore Populator
        </h2>

        <p className="text-gray-600 mb-4">
          Populates Firestore with rooms, halls, bookings, payments, and daily
          availability data.
        </p>

        <button
          onClick={populateAll}
          disabled={isLoading}
          className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 font-semibold disabled:opacity-60"
        >
          {isLoading ? "Populating..." : "Populate Firestore"}
        </button>

        <button
          onClick={addTestBooking}
          disabled={isLoading}
          className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold disabled:opacity-60"
        >
          Add Test Booking
        </button>

        <button
          onClick={initializeDefaultPricing}
          disabled={isLoading}
          className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-semibold disabled:opacity-60"
        >
          Initialize Default Pricing
        </button>

        {status.length > 0 && (
          <div className="mt-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto text-sm font-mono">
            {status.map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </div>
        )}

        {isComplete && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg font-semibold">
            ✅ All temple data added successfully.
          </div>
        )}
      </div>
    </div>
  );
}
