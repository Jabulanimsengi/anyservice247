// src/components/BookingCalendar.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/Button';

interface BookingCalendarProps {
    providerId: string;
    onDateTimeSelected: (dateTime: string) => void;
}

const BookingCalendar = ({ providerId, onDateTimeSelected }: BookingCalendarProps) => {
    const [availabilities, setAvailabilities] = useState<{ day_of_week: number; start_time: string; end_time: string }[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);

    useEffect(() => {
        const fetchAvailabilities = async () => {
            const { data } = await supabase
                .from('availabilities')
                .select('*')
                .eq('provider_id', providerId);
            setAvailabilities(data || []);
        };
        fetchAvailabilities();
    }, [providerId]);

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        const dayOfWeek = date.getDay();
        const availabilityForDay = availabilities.find(a => a.day_of_week === dayOfWeek);

        if (availabilityForDay) {
            // Generate time slots (this is a simplified example)
            const slots: string[] = [];
            const currentTime = new Date(`${date.toDateString()} ${availabilityForDay.start_time}`);
            const endTime = new Date(`${date.toDateString()} ${availabilityForDay.end_time}`);

            while (currentTime < endTime) {
                slots.push(currentTime.toTimeString().substring(0, 5));
                currentTime.setHours(currentTime.getHours() + 1);
            }
            setTimeSlots(slots);
        } else {
            setTimeSlots([]);
        }
    };

    return (
        <div className="mt-4 p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Select a Date and Time</h4>
            <input 
                type="date" 
                onChange={(e) => handleDateChange(new Date(e.target.value))}
                className="p-2 border rounded"
            />
            {selectedDate && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                    {timeSlots.length > 0 ? timeSlots.map(slot => (
                        <Button 
                            key={slot} 
                            variant="outline"
                            onClick={() => onDateTimeSelected(new Date(`${selectedDate.toDateString()} ${slot}`).toISOString())}
                        >
                            {slot}
                        </Button>
                    )) : <p>No available slots for this day.</p>}
                </div>
            )}
        </div>
    );
};

export default BookingCalendar;