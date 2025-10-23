import React from "react";
import BookingForm from "./BookingForm";
import { createBookingWithAvailability } from "../lib/firestoreService";

export default function QuickBookingForm() {
  const handleBookingSubmit = async (bookingData: any) => {
    await createBookingWithAvailability(bookingData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <BookingForm onSubmit={handleBookingSubmit} showTitle={true} />
    </div>
  );
}
