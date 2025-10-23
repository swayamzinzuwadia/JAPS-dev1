import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCF3mIrwKciFHUD2oXbRxvvB1iXWGpdi5k",
  authDomain: "japs-dev.firebaseapp.com",
  projectId: "japs-dev",
  storageBucket: "japs-dev.firebasestorage.app",
  messagingSenderId: "159427250831",
  appId: "1:159427250831:web:e3920238cabeff69fdfefa",
  measurementId: "G-J0MFFCM9ZM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sample rooms data
const sampleRooms = [
  {
    roomNumber: "101",
    capacity: 2,
    pricePerNight: 1500,
    description: "Deluxe room with AC and modern amenities",
    isActive: true,
    amenities: ["AC", "TV", "WiFi", "Hot Water", "Balcony"],
  },
  {
    roomNumber: "102",
    capacity: 3,
    pricePerNight: 2000,
    description: "Family room with AC and extra bed",
    isActive: true,
    amenities: ["AC", "TV", "WiFi", "Hot Water", "Extra Bed"],
  },
  {
    roomNumber: "103",
    capacity: 2,
    pricePerNight: 1200,
    description: "Standard room with basic amenities",
    isActive: true,
    amenities: ["Fan", "TV", "WiFi", "Hot Water"],
  },
  {
    roomNumber: "104",
    capacity: 4,
    pricePerNight: 2500,
    description: "Executive suite with premium amenities",
    isActive: true,
    amenities: ["AC", "TV", "WiFi", "Hot Water", "Mini Bar", "Balcony"],
  },
  {
    roomNumber: "105",
    capacity: 2,
    pricePerNight: 1800,
    description: "Superior room with city view",
    isActive: true,
    amenities: ["AC", "TV", "WiFi", "Hot Water", "City View"],
  },
];

// Sample halls data
const sampleHalls = [
  {
    hallName: "Conference Hall A",
    capacity: 50,
    pricePerDay: 5000,
    description: "Large conference hall with projector and sound system",
    isActive: true,
    amenities: ["Projector", "Sound System", "AC", "WiFi", "Whiteboard"],
  },
  {
    hallName: "Meeting Room B",
    capacity: 20,
    pricePerDay: 2500,
    description: "Small meeting room for intimate gatherings",
    isActive: true,
    amenities: ["AC", "WiFi", "Whiteboard", "Coffee Machine"],
  },
  {
    hallName: "Banquet Hall C",
    capacity: 100,
    pricePerDay: 8000,
    description: "Large banquet hall for weddings and events",
    isActive: true,
    amenities: ["AC", "Sound System", "Stage", "Lighting", "Catering Kitchen"],
  },
];

// Sample bookings data
const sampleBookings = [
  {
    guestId: "guest-001",
    guestName: "John Doe",
    guestEmail: "john.doe@example.com",
    guestPhone: "+91-9876543210",
    roomId: "room-101",
    checkInDate: "2024-01-15",
    checkOutDate: "2024-01-17",
    numberOfPersons: 2,
    extraBeds: 0,
    extraBedPrice: 0,
    foodBreakfast: true,
    foodLunch: false,
    foodDinner: true,
    foodTotalCost: 800,
    baseAmount: 3000,
    totalAmount: 3800,
    advanceAmount: 1500,
    balanceAmount: 2300,
    paymentDueDate: "2024-01-14",
    status: "confirmed",
    specialRequests: "Late checkout requested",
  },
  {
    guestId: "guest-002",
    guestName: "Jane Smith",
    guestEmail: "jane.smith@example.com",
    guestPhone: "+91-9876543211",
    hallId: "hall-001",
    checkInDate: "2024-01-20",
    checkOutDate: "2024-01-20",
    numberOfPersons: 30,
    extraBeds: 0,
    extraBedPrice: 0,
    foodBreakfast: false,
    foodLunch: true,
    foodDinner: false,
    foodTotalCost: 1500,
    baseAmount: 5000,
    totalAmount: 6500,
    advanceAmount: 3000,
    balanceAmount: 3500,
    paymentDueDate: "2024-01-19",
    status: "pending",
    specialRequests: "Need projector setup",
  },
];

async function createAdminUser() {
  try {
    console.log("Creating admin user...");
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      "admin@japs-dev.com",
      "Admin@123456"
    );
    console.log(
      "✅ Admin user created successfully:",
      userCredential.user.email
    );
    return userCredential.user;
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log("ℹ️ Admin user already exists");
      return null;
    } else {
      console.error("❌ Error creating admin user:", error);
      throw error;
    }
  }
}

async function populateRooms() {
  try {
    console.log("Adding rooms to Firestore...");
    const roomsRef = collection(db, "rooms");

    for (const room of sampleRooms) {
      await addDoc(roomsRef, {
        ...room,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Added room: ${room.roomNumber}`);
    }
    console.log("✅ All rooms added successfully");
  } catch (error) {
    console.error("❌ Error adding rooms:", error);
    throw error;
  }
}

async function populateHalls() {
  try {
    console.log("Adding halls to Firestore...");
    const hallsRef = collection(db, "halls");

    for (const hall of sampleHalls) {
      await addDoc(hallsRef, {
        ...hall,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Added hall: ${hall.hallName}`);
    }
    console.log("✅ All halls added successfully");
  } catch (error) {
    console.error("❌ Error adding halls:", error);
    throw error;
  }
}

async function populateBookings() {
  try {
    console.log("Adding sample bookings to Firestore...");
    const bookingsRef = collection(db, "bookings");

    for (const booking of sampleBookings) {
      await addDoc(bookingsRef, {
        ...booking,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Added booking for: ${booking.guestName}`);
    }
    console.log("✅ All sample bookings added successfully");
  } catch (error) {
    console.error("❌ Error adding bookings:", error);
    throw error;
  }
}

async function populateFirestore() {
  try {
    console.log("🚀 Starting Firestore population...");

    // Create admin user first
    await createAdminUser();

    // Add rooms
    await populateRooms();

    // Add halls
    await populateHalls();

    // Add sample bookings
    await populateBookings();

    console.log("🎉 Firestore population completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`- Admin user: admin@japs-dev.com / Admin@123456`);
    console.log(`- Rooms added: ${sampleRooms.length}`);
    console.log(`- Halls added: ${sampleHalls.length}`);
    console.log(`- Sample bookings: ${sampleBookings.length}`);
  } catch (error) {
    console.error("❌ Error populating Firestore:", error);
    process.exit(1);
  }
}

// Run the population script
populateFirestore();
