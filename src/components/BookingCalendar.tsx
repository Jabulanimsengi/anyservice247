// src/components/BookingCalendar.tsx
'use client';

import { useState } from 'react';
import { Button } from './ui/Button';

type Availability = { [key: string]: { start: string; end: string; is24Hours: boolean } };

interface BookingCalendarProps {
    availability: Availability | null | undefined;
    onDateTimeSelected: (dateTime: string) => void;
}

const dayOfWeekMap = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
];

const BookingCalendar = ({ availability, onDateTimeSelected }: BookingCalendarProps) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null); // Reset selected time when date changes
        onDateTimeSelected(''); // Clear selection in parent
        
        if (!availability) {
            setTimeSlots([]);
            return;
        }

        const dayName = dayOfWeekMap[date.getDay()];
        const availabilityForDay = availability[dayName];

        if (availabilityForDay) {
            if (availabilityForDay.is24Hours) {
                const slots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
                setTimeSlots(slots);
                return;
            }

            if (availabilityForDay.start && availabilityForDay.end) {
                const slots: string[] = [];
                const startTime = new Date(`${date.toDateString()} ${availabilityForDay.start}`);
                const endTime = new Date(`${date.toDateString()} ${availabilityForDay.end}`);

                for (let dt = new Date(startTime); dt < endTime; dt.setHours(dt.getHours() + 1)) {
                    slots.push(dt.toTimeString().substring(0, 5));
                }
                setTimeSlots(slots);
                return;
            }
        }

        setTimeSlots([]);
    };

    const handleTimeSelect = (slot: string) => {
        if (selectedDate) {
            setSelectedTime(slot);
            const dateTime = new Date(`${selectedDate.toDateString()} ${slot}`);
            onDateTimeSelected(dateTime.toISOString());
        }
    }

    return (
        <div className="mt-4 p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Select a Date and Time</h4>
            <div className="flex items-center gap-4">
                <input
                    type="date"
                    onChange={(e) => handleDateChange(new Date(e.target.value))}
                    className="p-2 border rounded"
                    min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-sm text-gray-500">Please select a booking date for the quote.</p>
            </div>
            {selectedDate && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                    {timeSlots.length > 0 ? timeSlots.map(slot => (
                        <Button
                            key={slot}
                            variant={selectedTime === slot ? 'default' : 'outline'}
                            onClick={() => handleTimeSelect(slot)}
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