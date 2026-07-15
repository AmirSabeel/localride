'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import {
  ArrowLeft, ChevronLeft, ChevronRight, MapPin,
  Clock, IndianRupee,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import DriverBottomNav from '@/components/driver/driver-bottom-nav';

type SlotStatus = 'available' | 'booked' | 'unavailable';

interface TimeSlot {
  hour: number;
  label: string;
  status: SlotStatus;
  customer?: string;
  from?: string;
  to?: string;
  fare?: number;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMonthName(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function generateTimeSlots(bookedHours: number[]): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let h = 8; h <= 22; h++) {
    const hour12 = h > 12 ? h - 12 : h;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const label = `${hour12} ${ampm}`;
    const isBooked = bookedHours.includes(h);
    const isUnavailable = h >= 21;
    slots.push({
      hour: h,
      label,
      status: isBooked ? 'booked' : isUnavailable ? 'unavailable' : 'available',
      ...(isBooked ? {
        customer: ['Rahul Verma', 'Sneha Patel', 'Arun Kumar'][bookedHours.indexOf(h) % 3],
        from: ['Payyoli Town', 'Iringal', 'Muttil'][bookedHours.indexOf(h) % 3],
        to: ['Vadakara', 'Thikkodi', 'Keezhariyur'][bookedHours.indexOf(h) % 3],
        fare: [156, 210, 98][bookedHours.indexOf(h) % 3],
      } : {}),
    });
  }
  return slots;
}

function CalendarHeader({
  monthDate,
  onPrev,
  onNext,
}: {
  monthDate: Date;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      className="flex items-center justify-between"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.button
        onClick={onPrev}
        className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center"
        whileTap={{ scale: 0.9 }}
      >
        <ChevronLeft className="h-4 w-4" />
      </motion.button>
      <h3 className="text-sm font-semibold">{getMonthName(monthDate)}</h3>
      <motion.button
        onClick={onNext}
        className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center"
        whileTap={{ scale: 0.9 }}
      >
        <ChevronRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}

function WeekDaySelector({
  selectedDay,
  onSelectDay,
}: {
  selectedDay: number;
  onSelectDay: (day: number) => void;
}) {
  const today = new Date().getDay();
  // Map getDay() to Mon=0 index: Sun=6 becomes 6, Mon=1 becomes 0, etc.
  const todayIdx = today === 0 ? 6 : today - 1;

  return (
    <motion.div
      className="flex gap-2 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {DAYS.map((day, i) => {
        const isToday = i === todayIdx;
        const isSelected = i === selectedDay;
        return (
          <motion.button
            key={day}
            onClick={() => onSelectDay(i)}
            className={`flex flex-col items-center gap-1 rounded-xl px-4 py-3 min-w-[52px] flex-shrink-0 transition-premium ${
              isSelected
                ? 'gradient-primary text-white shadow-glow-green'
                : isToday
                  ? 'bg-ride-green/10 text-ride-green'
                  : 'bg-muted/50 text-muted-foreground'
            }`}
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.04 }}
          >
            <span className="text-[10px] font-medium">{day}</span>
            <span className="text-sm font-bold">
              {(() => {
                const d = new Date();
                d.setDate(d.getDate() + (i - todayIdx));
                return d.getDate();
              })()}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

function TimeSlotGrid({
  slots,
  onToggleSlot,
}: {
  slots: TimeSlot[];
  onToggleSlot: (hour: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {slots.map((slot, i) => {
        const isBooked = slot.status === 'booked';
        const isUnavailable = slot.status === 'unavailable';

        return (
          <motion.div
            key={slot.hour}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.03 }}
          >
            <motion.button
              onClick={() => !isBooked && onToggleSlot(slot.hour)}
              disabled={isBooked}
              className={`w-full flex items-center gap-3 rounded-xl p-3 transition-premium text-left ${
                isBooked
                  ? 'bg-ride-green/10 border border-ride-green/30'
                  : isUnavailable
                    ? 'bg-muted/30 opacity-50'
                    : 'bg-muted/50 hover:bg-muted'
              }`}
              whileTap={isBooked || isUnavailable ? {} : { scale: 0.98 }}
            >
              {/* Time */}
              <div className="flex-shrink-0 w-16">
                <span className={`text-xs font-semibold ${isBooked ? 'text-ride-green' : isUnavailable ? 'text-muted-foreground/50' : 'text-foreground'}`}>
                  {slot.label}
                </span>
              </div>

              {/* Status Indicator */}
              <div className="flex-1 flex items-center gap-2">
                {isBooked ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-ride-green" />
                    <span className="text-xs font-medium text-ride-green">Booked</span>
                    <span className="text-xs text-muted-foreground">· {slot.customer}</span>
                  </>
                ) : isUnavailable ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                    <span className="text-xs text-muted-foreground/50">Unavailable</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full border-2 border-ride-green" />
                    <span className="text-xs text-muted-foreground">Available</span>
                  </>
                )}
              </div>

              {/* Fare for booked */}
              {isBooked && slot.fare && (
                <div className="flex items-center gap-0.5">
                  <IndianRupee className="h-3 w-3 text-ride-green" />
                  <span className="text-xs font-semibold text-ride-green">{slot.fare}</span>
                </div>
              )}
            </motion.button>

            {/* Booked details */}
            <AnimatePresence>
              {isBooked && (
                <motion.div
                  className="ml-16 mt-1 space-y-1 overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{slot.from} → {slot.to}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

function UpcomingRides({ slots }: { slots: TimeSlot[] }) {
  const bookedSlots = slots.filter((s) => s.status === 'booked');
  if (bookedSlots.length === 0) return null;

  return (
    <motion.div
      className="mt-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h3 className="text-sm font-semibold mb-3">Today&apos;s Upcoming Rides</h3>
      <div className="flex flex-col gap-2.5">
        {bookedSlots.map((slot, i) => (
          <motion.div
            key={slot.hour}
            className="glass-strong shadow-premium rounded-xl p-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 + i * 0.08 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                  {slot.customer?.[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold">{slot.customer}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {slot.label}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <IndianRupee className="h-3 w-3 text-ride-green" />
                <span className="text-sm font-bold text-ride-green">{slot.fare}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex flex-col items-center gap-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-ride-green" />
                <div className="w-0.5 h-3 bg-muted-foreground/20" />
                <div className="h-1.5 w-1.5 rounded-sm bg-ride-red" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[11px] text-muted-foreground truncate">{slot.from}</p>
                <p className="text-[11px] text-muted-foreground truncate">{slot.to}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function ScheduleView() {
  const { setDriverView } = useAppStore();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [monthDate, setMonthDate] = useState(new Date());

  // Mock booked hours for today
  const [bookedHoursMap, setBookedHoursMap] = useState<Record<number, number[]>>({
    0: [9, 14, 17],
    1: [10, 16],
    2: [8, 13, 18],
    3: [11, 15],
    4: [9, 14, 17],
    5: [10, 19],
    6: [],
  });

  const [unavailableHoursMap, setUnavailableHoursMap] = useState<Record<number, number[]>>({});

  const currentBooked = bookedHoursMap[selectedDay] || [];
  const currentUnavailable = unavailableHoursMap[selectedDay] || [];
  const slots = useMemo(
    () => generateTimeSlots(currentBooked),
    [currentBooked]
  );

  const handleToggleSlot = (hour: number) => {
    const isUnavailable = currentUnavailable.includes(hour);
    if (isUnavailable) {
      setUnavailableHoursMap((prev) => ({
        ...prev,
        [selectedDay]: (prev[selectedDay] || []).filter((h) => h !== hour),
      }));
      toast('Slot set to available', { icon: '🟢' });
    } else {
      setUnavailableHoursMap((prev) => ({
        ...prev,
        [selectedDay]: [...(prev[selectedDay] || []), hour],
      }));
      toast('Slot set to unavailable', { icon: '⚪' });
    }
  };

  return (
    <div className="relative min-h-dvh bg-background">
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="relative z-10 px-4 pt-6 pb-24 flex flex-col gap-5">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            onClick={() => setDriverView('home')}
            className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="h-4 w-4" />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold">Schedule</h1>
            <p className="text-xs text-muted-foreground">Manage your availability</p>
          </div>
        </motion.div>

        {/* Calendar */}
        <div className="glass-strong shadow-premium rounded-2xl p-4 flex flex-col gap-3">
          <CalendarHeader
            monthDate={monthDate}
            onPrev={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}
            onNext={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}
          />
          <WeekDaySelector selectedDay={selectedDay} onSelectDay={setSelectedDay} />
        </div>

        {/* Time Slots */}
        <div className="glass-strong shadow-premium rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Time Slots</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full border-2 border-ride-green" />
                <span className="text-[10px] text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-ride-green" />
                <span className="text-[10px] text-muted-foreground">Booked</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                <span className="text-[10px] text-muted-foreground">Off</span>
              </div>
            </div>
          </div>
          <TimeSlotGrid slots={slots} onToggleSlot={handleToggleSlot} />
        </div>

        {/* Upcoming Rides */}
        <UpcomingRides slots={slots} />
      </div>

      <DriverBottomNav />
    </div>
  );
}