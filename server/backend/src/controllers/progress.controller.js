import User from "../models/user.model.js";
import WorkoutSessions from "../models/workoutSession.model.js";
import UserStats from "../models/userStats.model.js";
export const getProgressStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);

    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date(today);
    monthStart.setDate(1);

    const sessions = await WorkoutSessions.find({
      user: userId,
      completed: true,
      date: { $gte: lastWeekStart },
    }).populate("exercises.exerciseId", "calories");

    let stats = await UserStats.findOne({ user: userId });
    if (!stats) stats = await UserStats.create({ user: userId });

    // 🔹 Build local date map
    const daysMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      daysMap[new Date(d).toLocaleDateString("en-CA")] = 0;
    }

    let todayMinutes = 0;
    let weeklyMinutes = 0;
    let lastWeekMinutes = 0;
    let weeklyCalories = 0;
    let weeklyWorkouts = 0;
    let caloriesToday = 0;

    sessions.forEach((session) => {
      const dayKey = new Date(session.date).toLocaleDateString("en-CA");

      let sessionMinutes = 0;

      session.exercises.forEach((ex) => {
        sessionMinutes += ex.durationDone || 0;

        // AI fallback calories estimation
        const calories =
          ex.exerciseId?.calories || Math.round((ex.durationDone || 0) * 0.12);

        weeklyCalories += calories;

        if (session.date >= today) {
          caloriesToday += calories;
        }
      });

      if (session.date >= today) {
        todayMinutes += sessionMinutes;
      }

      if (session.date >= weekStart) {
        weeklyMinutes += sessionMinutes;
        weeklyWorkouts++;
        if (daysMap[dayKey] !== undefined) {
          daysMap[dayKey] += sessionMinutes;
        }
      }

      if (session.date >= lastWeekStart && session.date < weekStart) {
        lastWeekMinutes += sessionMinutes;
      }
    });

    const weeklyAvg = Math.round(weeklyMinutes / 7);
    const lastWeeklyAvg = Math.round(lastWeekMinutes / 7);
    const weeklyChange = lastWeeklyAvg
      ? Math.round(((weeklyAvg - lastWeeklyAvg) / lastWeeklyAvg) * 100)
      : 0;

    const currentStreak = stats.streak.current;
    const lastWeekStreak = Math.max(0, currentStreak - 2);
    const streakChange = currentStreak - lastWeekStreak;

    const monthlyAvg = Math.round((stats.minutesTrained || 0) / 30);

    const workoutsThisMonth = await WorkoutSessions.countDocuments({
      user: userId,
      completed: true,
      date: { $gte: monthStart },
    });

    res.status(200).json({
      summary: {
        currentStreak,
        streakChange,
        totalWorkouts: stats.workoutsCompleted,
        caloriesToday,
        monthlyGoal: {
          completed: workoutsThisMonth,
          target: 20,
        },
      },

      weeklyChart: Object.entries(daysMap).map(([date, minutes]) => ({
        day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        minutes,
      })),

      timeMetrics: {
        todayMinutes,
        weeklyAverage: weeklyAvg,
        weeklyChange,
        monthlyAverage: monthlyAvg,
      },

      weeklyReport: {
        totalCalories: weeklyCalories,
        workouts: weeklyWorkouts,
        percentAboveAverage: weeklyChange,
      },
    });
  } catch (err) {
    console.error("Progress Stats Error:", err);
    res.status(500).json({ message: "Failed to fetch progress stats" });
  }
};
