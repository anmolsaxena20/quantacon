import { useMemo } from "react";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WorkoutCalendar({ workoutDates = [] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); 

  
  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();


  const workoutSet = useMemo(() => {
    const set = new Set();
    workoutDates.forEach((d) => {
      const date = new Date(d);
      if (date.getMonth() === month && date.getFullYear() === year) {
        set.add(date.getDate());
      }
    });
    return set;
  }, [workoutDates, month, year]);

  
  const cells = [];

  for (let i = 0; i < startDay; i++) {
    cells.push({ type: "empty" });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      workout: workoutSet.has(day),
    });
  }

  return (
    <div className="w-fit rounded-xl bg-black p-4 text-white">
      {/* Week Header */}
      <div className="grid grid-cols-7 gap-3 mb-3 text-xs text-muted-foreground">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {cells.map((cell, idx) => {
          if (cell.type === "empty") {
            return <div key={idx} />;
          }

          return (
            <div
              key={idx}
              title={`Day ${cell.day}`}
              className={`
                h-10 w-10 flex items-center justify-center rounded-full
                border border-neutral-700
                ${cell.workout ? "bg-orange-500" : "bg-neutral-900"}
              `}
            >
              {cell.workout ? "🔥" : `${cell.day}`}
            </div>
          );
        })}
      </div>
    </div>
  );
}
