import { useEffect, useState } from 'react';
import { BedDouble, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Room {
  id: string;
  room_number: string;
  capacity: number;
  price_per_night: number;
  description: string | null;
}

interface Hall {
  id: string;
  hall_name: string;
  capacity: number;
  price_per_day: number;
  description: string | null;
}

export default function RoomsHalls() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomsAndHalls();
  }, []);

  const fetchRoomsAndHalls = async () => {
    try {
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('room_number');

      const { data: hallsData, error: hallsError } = await supabase
        .from('halls')
        .select('*')
        .eq('is_active', true)
        .order('hall_name');

      if (roomsError) throw roomsError;
      if (hallsError) throw hallsError;

      setRooms(roomsData || []);
      setHalls(hallsData || []);
    } catch (error) {
      console.error('Error fetching rooms and halls:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="rooms" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">Loading rooms and halls...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="rooms" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Rooms & Halls
          </h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
        </div>

        <div className="mb-16">
          <h3 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
            Our Rooms
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-bold">{room.room_number}</h4>
                    <BedDouble className="w-8 h-8" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-5 h-5" />
                      <span>{room.capacity} beds</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-500">
                      ₹{room.price_per_night}
                      <span className="text-sm text-gray-500 dark:text-gray-400">/night</span>
                    </div>
                  </div>
                  {room.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {room.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
            Our Halls
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {halls.map((hall) => (
              <div
                key={hall.id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-8 text-white">
                  <div className="flex items-center justify-between">
                    <h4 className="text-2xl font-bold">{hall.hall_name}</h4>
                    <Users className="w-10 h-10" />
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-6 h-6" />
                      <span className="text-lg">Capacity: {hall.capacity} persons</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-500">
                      ₹{hall.price_per_day}
                      <span className="text-sm text-gray-500 dark:text-gray-400">/day</span>
                    </div>
                  </div>
                  {hall.description && (
                    <p className="text-gray-600 dark:text-gray-300">
                      {hall.description}
                    </p>
                  )}
                  <div className="mt-4 p-4 bg-orange-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Perfect for spiritual gatherings, family functions, and community events
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
