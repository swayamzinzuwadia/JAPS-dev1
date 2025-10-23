// import React, { useState, useEffect } from "react";
// import {
//   subscribeToDefaultPricing,
//   calculateBookingTotalAmount,
//   createBookingWithAvailability,
//   DefaultPricing,
// } from "../lib/firestoreService";
// import { formatDate } from "../utils/dateUtils";

// interface BookingFormProps {
//   onSubmit: (bookingData: any) => Promise<void>;
//   onCancel?: () => void;
//   initialData?: any;
//   isEditing?: boolean;
//   showTitle?: boolean;
// }

// export default function BookingForm({
//   onSubmit,
//   onCancel,
//   initialData,
//   isEditing = false,
//   showTitle = true,
// }: BookingFormProps) {
//   const [defaultPricing, setDefaultPricing] = useState<DefaultPricing | null>(
//     null
//   );
//   const [isLoading, setIsLoading] = useState(false);
//   const [status, setStatus] = useState("");

//   const [formData, setFormData] = useState({
//     guestName: "",
//     mobile: "",
//     address: "",
//     noOfPersons: 1,
//     numberOfRooms: 1,
//     pricePerRoom: 0,
//     hall1: false,
//     hall2: false,
//     extraBeds: 0,
//     extraBedPrice: 500,
//     breakfast: false,
//     lunch: false,
//     dinner: false,
//     breakfastPrice: 0,
//     lunchPrice: 0,
//     dinnerPrice: 0,
//     hall1Price: 0,
//     hall2Price: 0,
//     totalAmount: 0,
//     advanceAmount: 0,
//     balanceAmount: 0,
//     paymentMode: "cash",
//     paymentStatus: "pending",
//     status: "pending" as "pending" | "confirmed" | "cancelled",
//     checkInDate: "",
//     checkOutDate: "",
//     specialNote: "",
//   });

//   useEffect(() => {
//     // Subscribe to default pricing
//     const unsubscribeDefaultPricing = subscribeToDefaultPricing(
//       (pricingData) => {
//         setDefaultPricing(pricingData);
//       }
//     );

//     // Set initial data if provided
//     if (initialData) {
//       setFormData({
//         guestName: initialData.guestName || "",
//         mobile: initialData.mobile || "",
//         address: initialData.address || "",
//         noOfPersons: initialData.noOfPersons || 1,
//         numberOfRooms: initialData.numberOfRooms || 1,
//         pricePerRoom: initialData.pricePerRoom || 0,
//         hall1: initialData.hall1 || false,
//         hall2: initialData.hall2 || false,
//         extraBeds: initialData.extraBeds || 0,
//         extraBedPrice: initialData.extraBedPrice || 500,
//         breakfast: initialData.breakfast || false,
//         lunch: initialData.lunch || false,
//         dinner: initialData.dinner || false,
//         breakfastPrice: initialData.breakfastPrice || 0,
//         lunchPrice: initialData.lunchPrice || 0,
//         dinnerPrice: initialData.dinnerPrice || 0,
//         hall1Price: initialData.hall1Price || 0,
//         hall2Price: initialData.hall2Price || 0,
//         totalAmount: initialData.totalAmount || 0,
//         advanceAmount: initialData.advanceAmount || 0,
//         balanceAmount: initialData.balanceAmount || 0,
//         paymentMode: initialData.paymentMode || "cash",
//         paymentStatus: initialData.paymentStatus || "pending",
//         status: initialData.status || "pending",
//         checkInDate: initialData.checkInDate || "",
//         checkOutDate: initialData.checkOutDate || "",
//         specialNote: initialData.specialNote || "",
//       });
//     }

//     return () => {
//       unsubscribeDefaultPricing();
//     };
//   }, [initialData]);

//   const calculateTotalAmount = async () => {
//     if (
//       formData.checkInDate &&
//       formData.checkOutDate &&
//       formData.numberOfRooms &&
//       defaultPricing
//     ) {
//       try {
//         const result = await calculateBookingTotalAmount(
//           formData.checkInDate,
//           formData.checkOutDate,
//           formData.numberOfRooms,
//           formData.extraBeds,
//           formData.hall1,
//           formData.hall2,
//           formData.breakfast,
//           formData.lunch,
//           formData.dinner,
//           formData.pricePerRoom || undefined
//         );

//         const advanceAmount = Math.round(result.totalAmount * 0.5); // 50% advance

//         setFormData((prev) => ({
//           ...prev,
//           totalAmount: result.totalAmount,
//           advanceAmount: advanceAmount,
//           balanceAmount: result.totalAmount - advanceAmount,
//           // Update individual prices from default pricing
//           extraBedPrice: defaultPricing.extraBedPrice,
//           breakfastPrice: defaultPricing.breakfastPrice,
//           lunchPrice: defaultPricing.lunchPrice,
//           dinnerPrice: defaultPricing.dinnerPrice,
//           hall1Price: defaultPricing.hall1Price,
//           hall2Price: defaultPricing.hall2Price,
//         }));
//       } catch (error) {
//         console.error("Error calculating total:", error);
//         setStatus("Error calculating total amount");
//       }
//     }
//   };

//   // Auto-calculate total when relevant fields change
//   useEffect(() => {
//     if (defaultPricing) {
//       calculateTotalAmount();
//     }
//   }, [
//     formData.checkInDate,
//     formData.checkOutDate,
//     formData.numberOfRooms,
//     formData.extraBeds,
//     formData.hall1,
//     formData.hall2,
//     formData.breakfast,
//     formData.lunch,
//     formData.dinner,
//     formData.pricePerRoom,
//     defaultPricing,
//   ]);

//   const handleInputChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
//     >
//   ) => {
//     const { name, value, type } = e.target;
//     const checked = (e.target as HTMLInputElement).checked;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setStatus("");

//     try {
//       await onSubmit(formData);
//       setStatus("Booking saved successfully!");

//       // Reset form if not editing
//       if (!isEditing) {
//         setFormData({
//           guestName: "",
//           mobile: "",
//           address: "",
//           noOfPersons: 1,
//           numberOfRooms: 1,
//           pricePerRoom: 0,
//           hall1: false,
//           hall2: false,
//           extraBeds: 0,
//           extraBedPrice: 500,
//           breakfast: false,
//           lunch: false,
//           dinner: false,
//           breakfastPrice: 0,
//           lunchPrice: 0,
//           dinnerPrice: 0,
//           hall1Price: 0,
//           hall2Price: 0,
//           totalAmount: 0,
//           advanceAmount: 0,
//           balanceAmount: 0,
//           paymentMode: "cash",
//           paymentStatus: "pending",
//           status: "pending",
//           checkInDate: "",
//           checkOutDate: "",
//           specialNote: "",
//         });
//       }
//     } catch (error: any) {
//       setStatus(`Error: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
//       {showTitle && (
//         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
//           {isEditing ? "Edit Booking" : "Create New Booking"}
//         </h2>
//       )}

//       {status && (
//         <div
//           className={`mb-4 p-3 rounded-lg ${
//             status.includes("Error")
//               ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
//               : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
//           }`}
//         >
//           {status}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Guest Information */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//             Guest Information
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Guest Name *
//               </label>
//               <input
//                 type="text"
//                 name="guestName"
//                 value={formData.guestName}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Mobile Number *
//               </label>
//               <input
//                 type="tel"
//                 name="mobile"
//                 value={formData.mobile}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//               />
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Address *
//             </label>
//             <textarea
//               name="address"
//               value={formData.address}
//               onChange={handleInputChange}
//               required
//               rows={3}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Number of Persons *
//             </label>
//             <input
//               type="number"
//               name="noOfPersons"
//               value={formData.noOfPersons}
//               onChange={handleInputChange}
//               min="1"
//               required
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//             />
//           </div>
//         </div>

//         {/* Booking Details */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//             Booking Details
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Number of Rooms *
//               </label>
//               <input
//                 type="number"
//                 name="numberOfRooms"
//                 value={formData.numberOfRooms}
//                 onChange={handleInputChange}
//                 min="1"
//                 max="13"
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Custom Room Price (₹) - Optional
//               </label>
//               <input
//                 type="number"
//                 name="pricePerRoom"
//                 value={formData.pricePerRoom}
//                 onChange={handleInputChange}
//                 min="0"
//                 step="0.01"
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//               />
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                 Leave empty to use default pricing
//               </p>
//             </div>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Check-in Date *
//               </label>
//               <input
//                 type="date"
//                 name="checkInDate"
//                 value={formData.checkInDate}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Check-out Date *
//               </label>
//               <input
//                 type="date"
//                 name="checkOutDate"
//                 value={formData.checkOutDate}
//                 onChange={handleInputChange}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Additional Services */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//             Additional Services
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Number of Extra Beds
//               </label>
//               <input
//                 type="number"
//                 name="extraBeds"
//                 value={formData.extraBeds}
//                 onChange={handleInputChange}
//                 min="0"
//                 max="10"
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Extra Bed Price (₹)
//               </label>
//               <input
//                 type="number"
//                 name="extraBedPrice"
//                 value={formData.extraBedPrice}
//                 onChange={handleInputChange}
//                 min="0"
//                 step="0.01"
//                 readOnly
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
//               />
//             </div>
//           </div>

//           {/* Hall Services */}
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Hall Services
//             </label>
//             <div className="flex items-center space-x-6">
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   name="hall1"
//                   checked={formData.hall1}
//                   onChange={handleInputChange}
//                   className="mr-2"
//                 />
//                 <span className="text-gray-700 dark:text-gray-300">
//                   Hall 1 (₹{formData.hall1Price}/day)
//                 </span>
//               </label>
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   name="hall2"
//                   checked={formData.hall2}
//                   onChange={handleInputChange}
//                   className="mr-2"
//                 />
//                 <span className="text-gray-700 dark:text-gray-300">
//                   Hall 2 (₹{formData.hall2Price}/day)
//                 </span>
//               </label>
//             </div>
//           </div>

//           {/* Food Services */}
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Food Services
//             </label>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   name="breakfast"
//                   checked={formData.breakfast}
//                   onChange={handleInputChange}
//                   className="mr-2"
//                 />
//                 <span className="text-gray-700 dark:text-gray-300">
//                   Breakfast (₹{formData.breakfastPrice}/person)
//                 </span>
//               </label>
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   name="lunch"
//                   checked={formData.lunch}
//                   onChange={handleInputChange}
//                   className="mr-2"
//                 />
//                 <span className="text-gray-700 dark:text-gray-300">
//                   Lunch (₹{formData.lunchPrice}/person)
//                 </span>
//               </label>
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   name="dinner"
//                   checked={formData.dinner}
//                   onChange={handleInputChange}
//                   className="mr-2"
//                 />
//                 <span className="text-gray-700 dark:text-gray-300">
//                   Dinner (₹{formData.dinnerPrice}/person)
//                 </span>
//               </label>
//             </div>
//           </div>
//         </div>

//         {/* Payment Information */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//             Payment Information
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Total Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 value={formData.totalAmount}
//                 readOnly
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed font-semibold"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Advance Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 value={formData.advanceAmount}
//                 readOnly
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
//               />
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                 50% of total amount
//               </p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Balance Amount (₹)
//               </label>
//               <input
//                 type="number"
//                 value={formData.balanceAmount}
//                 readOnly
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
//               />
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Payment Mode
//             </label>
//             <select
//               name="paymentMode"
//               value={formData.paymentMode}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//             >
//               <option value="cash">Cash</option>
//               <option value="gpay">GPay</option>
//               <option value="online">Online</option>
//             </select>
//           </div>
//         </div>

//         {/* Special Notes */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             Special Notes
//           </label>
//           <textarea
//             name="specialNote"
//             value={formData.specialNote}
//             onChange={handleInputChange}
//             rows={3}
//             className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//             placeholder="Any special requests or notes..."
//           />
//         </div>

//         {/* Form Actions */}
//         <div className="flex justify-end space-x-4">
//           {onCancel && (
//             <button
//               type="button"
//               onClick={onCancel}
//               className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//             >
//               Cancel
//             </button>
//           )}
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
//           >
//             {isLoading
//               ? "Saving..."
//               : isEditing
//               ? "Update Booking"
//               : "Create Booking"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// src/components/BookingForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import { createBookingWithAvailability } from "../lib/firestoreService"; // uses your existing function
import { format } from "date-fns";

type BookingPayload = {
  guestName: string;
  mobile: string;
  numberOfRooms: number;
  noOfPersons: number;
  pricePerRoom: number;
  extraBeds: number;
  extraBedPrice: number;
  hall1: boolean;
  hall2: boolean;
  hall1Price: number;
  hall2Price: number;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  breakfastPrice: number;
  lunchPrice: number;
  dinnerPrice: number;
  checkInDate: string; // yyyy-mm-dd
  checkOutDate: string; // yyyy-mm-dd
  totalAmount?: number;
  advanceAmount?: number;
  balanceAmount?: number;
  paymentMode?: string;
  paymentStatus?: string;
  status?: "pending" | "confirmed" | "cancelled";
  address?: string;
};

interface BookingFormProps {
  initialData?: Partial<BookingPayload>;
  onClose?: () => void;
  onSuccess?: (createdBookingId?: string) => void;
  maxRoomsAvailable?: number; // optional local fallback
}

export default function BookingForm({
  initialData,
  onClose,
  onSuccess,
  maxRoomsAvailable = 13,
}: BookingFormProps) {
  const [form, setForm] = useState<BookingPayload>({
    guestName: initialData?.guestName ?? "",
    mobile: initialData?.mobile ?? "",
    numberOfRooms: initialData?.numberOfRooms ?? 1,
    noOfPersons: initialData?.noOfPersons ?? 1,
    pricePerRoom: initialData?.pricePerRoom ?? 0,
    extraBeds: initialData?.extraBeds ?? 0,
    extraBedPrice: initialData?.extraBedPrice ?? 0,
    hall1: initialData?.hall1 ?? false,
    hall2: initialData?.hall2 ?? false,
    hall1Price: initialData?.hall1Price ?? 0,
    hall2Price: initialData?.hall2Price ?? 0,
    breakfast: initialData?.breakfast ?? false,
    lunch: initialData?.lunch ?? false,
    dinner: initialData?.dinner ?? false,
    breakfastPrice: initialData?.breakfastPrice ?? 0,
    lunchPrice: initialData?.lunchPrice ?? 0,
    dinnerPrice: initialData?.dinnerPrice ?? 0,
    checkInDate: initialData?.checkInDate ?? "",
    checkOutDate: initialData?.checkOutDate ?? "",
    address: initialData?.address ?? "",
    paymentMode: initialData?.paymentMode ?? "cash",
    paymentStatus: initialData?.paymentStatus ?? "pending",
    status: (initialData?.status as any) ?? "pending",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availabilityMsg, setAvailabilityMsg] = useState<string | null>(null);

  // nights calculation
  const nights = useMemo(() => {
    if (!form.checkInDate || !form.checkOutDate) return 0;
    const ci = new Date(form.checkInDate);
    const co = new Date(form.checkOutDate);
    const diff = Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [form.checkInDate, form.checkOutDate]);

  // Preview total calculation (basic): rooms + extra beds + halls + food
  const previewTotal = useMemo(() => {
    if (nights <= 0) return 0;

    const roomTotal = (form.pricePerRoom || 0) * form.numberOfRooms * nights;
    const extraBedsTotal = (form.extraBedPrice || 0) * (form.extraBeds || 0) * nights;
    const hallTotal =
      (form.hall1 ? (form.hall1Price || 0) : 0) + (form.hall2 ? (form.hall2Price || 0) : 0);

    // food per person per day multiplied by noOfPersons and nights
    const foodTotal =
      ((form.breakfast ? form.breakfastPrice : 0) +
        (form.lunch ? form.lunchPrice : 0) +
        (form.dinner ? form.dinnerPrice : 0)) *
      (form.noOfPersons || 1) *
      nights;

    const total = roomTotal + extraBedsTotal + hallTotal + foodTotal;
    return Math.round(total);
  }, [
    form.pricePerRoom,
    form.numberOfRooms,
    nights,
    form.extraBeds,
    form.extraBedPrice,
    form.hall1,
    form.hall1Price,
    form.hall2,
    form.hall2Price,
    form.breakfast,
    form.lunch,
    form.dinner,
    form.breakfastPrice,
    form.lunchPrice,
    form.dinnerPrice,
    form.noOfPersons,
  ]);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      totalAmount: previewTotal,
      advanceAmount: Math.round(previewTotal * 0.5),
      balanceAmount: Math.max(0, previewTotal - Math.round(previewTotal * 0.5)),
    }));
  }, [previewTotal]);

  // client side validations
  const validate = (): string | null => {
    if (!form.guestName.trim()) return "Guest name is required.";
    if (!form.mobile.trim()) return "Phone number is required.";
    if (!form.checkInDate || !form.checkOutDate) return "Check-in and check-out dates are required.";
    if (new Date(form.checkOutDate) <= new Date(form.checkInDate))
      return "Check-out must be after check-in.";
    if (form.numberOfRooms <= 0) return "Enter at least 1 room.";
    if (form.numberOfRooms > maxRoomsAvailable) return `You cannot request more than ${maxRoomsAvailable} rooms.`;
    // if an extra bed is requested but price is 0, warn
    if (form.extraBeds > 0 && (form.extraBedPrice === 0 || !isFinite(form.extraBedPrice)))
      return "Please enter a price for extra bed.";
    // if hall1/hall2 checked and price 0, warn
    if (form.hall1 && (form.hall1Price === 0)) return "Please enter Hall 1 rate.";
    if (form.hall2 && (form.hall2Price === 0)) return "Please enter Hall 2 rate.";
    // food prices if selected
    if (form.breakfast && form.breakfastPrice === 0) return "Please enter breakfast price.";
    if (form.lunch && form.lunchPrice === 0) return "Please enter lunch price.";
    if (form.dinner && form.dinnerPrice === 0) return "Please enter dinner price.";
    if (nights <= 0) return "Select valid check-in and check-out dates.";
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setAvailabilityMsg(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);

    try {
      // Build payload in the shape your backend expects
      const payload: any = {
        guestName: form.guestName,
        mobile: form.mobile,
        address: form.address,
        noOfPersons: form.noOfPersons,
        numberOfRooms: form.numberOfRooms,
        pricePerRoom: form.pricePerRoom,
        extraBeds: form.extraBeds,
        extraBedPrice: form.extraBedPrice,
        hall1: form.hall1,
        hall2: form.hall2,
        hall1Price: form.hall1Price,
        hall2Price: form.hall2Price,
        breakfast: form.breakfast,
        lunch: form.lunch,
        dinner: form.dinner,
        breakfastPrice: form.breakfastPrice,
        lunchPrice: form.lunchPrice,
        dinnerPrice: form.dinnerPrice,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        totalAmount: form.totalAmount ?? previewTotal,
        advanceAmount: form.advanceAmount ?? Math.round(previewTotal * 0.5),
        balanceAmount: form.balanceAmount ?? Math.max(0, previewTotal - Math.round(previewTotal * 0.5)),
        paymentMode: form.paymentMode ?? "cash",
        paymentStatus: form.paymentStatus ?? "pending",
        status: form.status ?? "pending",
      };

      // createBookingWithAvailability should attempt to create the booking only if rooms available.
      // It should throw an error / return an error message if not available.
      const result = await createBookingWithAvailability(payload);

      // If your createBookingWithAvailability returns created booking id or object, use it.
      const createdId = (result && (result.id || result.bookingId)) ?? undefined;

      setAvailabilityMsg("Booking created successfully.");
      if (onSuccess) onSuccess(createdId);
      if (onClose) onClose();
    } catch (err: any) {
      // Expect backend to return structure like { message: "Only X rooms available" }
      console.error("Booking error:", err);
      if (err?.message) setError(err.message);
      else if (typeof err === "string") setError(err);
      else setError("Failed to create booking. Rooms may not be available for selected dates.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
          <input
            type="text"
            value={form.guestName}
            onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
          <input
            type="tel"
            value={form.mobile}
            onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Rooms / Guests / Price */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Number of Rooms *</label>
          <input
            type="number"
            min={1}
            max={maxRoomsAvailable}
            value={form.numberOfRooms}
            onChange={(e) => setForm((f) => ({ ...f, numberOfRooms: parseInt(e.target.value || "0", 10) }))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Number of Guests *</label>
          <input
            type="number"
            min={1}
            value={form.noOfPersons}
            onChange={(e) => setForm((f) => ({ ...f, noOfPersons: parseInt(e.target.value || "1", 10) }))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price per Room / day (₹)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.pricePerRoom}
            onChange={(e) => setForm((f) => ({ ...f, pricePerRoom: parseFloat(e.target.value || "0") }))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Extra Bed / Halls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Extra Beds (count)</label>
          <input
            type="number"
            min={0}
            max={10}
            value={form.extraBeds}
            onChange={(e) => setForm((f) => ({ ...f, extraBeds: parseInt(e.target.value || "0", 10) }))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price per Extra Bed (₹)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.extraBedPrice}
            onChange={(e) => setForm((f) => ({ ...f, extraBedPrice: parseFloat(e.target.value || "0") }))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="flex gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.hall1}
              onChange={(e) => setForm((f) => ({ ...f, hall1: e.target.checked }))}
            />
            Hall 1
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.hall1Price}
            onChange={(e) => setForm((f) => ({ ...f, hall1Price: parseFloat(e.target.value || "0") }))}
            placeholder="Hall1 rate"
            className="px-3 py-2 border rounded-lg flex-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="flex gap-2 items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.hall2}
              onChange={(e) => setForm((f) => ({ ...f, hall2: e.target.checked }))}
            />
            Hall 2
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.hall2Price}
            onChange={(e) => setForm((f) => ({ ...f, hall2Price: parseFloat(e.target.value || "0") }))}
            placeholder="Hall2 rate"
            className="px-3 py-2 border rounded-lg flex-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address (optional)</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Food with prices (user can enter each price) */}
      <div className="space-y-2">
        <h4 className="font-medium">Food options (tick to include)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.breakfast}
              onChange={(e) => setForm((f) => ({ ...f, breakfast: e.target.checked }))}
            />
            <label className="flex-1">Breakfast</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.breakfastPrice}
              onChange={(e) => setForm((f) => ({ ...f, breakfastPrice: parseFloat(e.target.value || "0") }))}
              placeholder="₹ per person"
              className="w-36 px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.lunch}
              onChange={(e) => setForm((f) => ({ ...f, lunch: e.target.checked }))}
            />
            <label className="flex-1">Lunch</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.lunchPrice}
              onChange={(e) => setForm((f) => ({ ...f, lunchPrice: parseFloat(e.target.value || "0") }))}
              placeholder="₹ per person"
              className="w-36 px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.dinner}
              onChange={(e) => setForm((f) => ({ ...f, dinner: e.target.checked }))}
            />
            <label className="flex-1">Dinner</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.dinnerPrice}
              onChange={(e) => setForm((f) => ({ ...f, dinnerPrice: parseFloat(e.target.value || "0") }))}
              placeholder="₹ per person"
              className="w-36 px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Check-in Date *</label>
          <input
            type="date"
            value={form.checkInDate}
            onChange={(e) => setForm((f) => ({ ...f, checkInDate: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Check-out Date *</label>
          <input
            type="date"
            value={form.checkOutDate}
            onChange={(e) => setForm((f) => ({ ...f, checkOutDate: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
      </div>

      {/* Preview totals + nights */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div>
          <div className="text-sm text-gray-600">
            Nights: <strong>{nights}</strong>
          </div>
          <div className="text-sm text-gray-600">
            Rooms requested: <strong>{form.numberOfRooms}</strong>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Estimated Total:</div>
          <div className="text-xl font-semibold">₹{previewTotal}</div>
          <div className="text-xs text-gray-500">Advance (50%): ₹{Math.round(previewTotal * 0.5)}</div>
        </div>
      </div>

      {/* Error / availability messages */}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {availabilityMsg && <div className="text-sm text-green-600">{availabilityMsg}</div>}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
          }}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-60"
        >
          {submitting ? "Checking availability..." : "Create Booking"}
        </button>
      </div>
    </form>
  );
}
