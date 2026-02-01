import WorkoutSession from "../models/workoutSession.model.js";
import UserStats from "../models/userStats.model.js";
import User from "../models/user.model.js";
import Exercise from "../models/exercise.model.js";
import { getValidAccessToken } from "../utils/googleToken.util.js";
import axios from "axios";
import { v5 as uuidv5 } from "uuid";
export const generateWorkout = async (req, res) => {
  try {
    const { energyLevel } = req.body;

    const day = new Date().getDay();
    let muscleGroups;
    let title;
    switch (day) {
      case 1:
        muscleGroups = ["chest", "triceps"];
        title = "Chest And Triceps";
        break;

      case 2:
        muscleGroups = ["back", "biceps"];
        title = "Back And Biceps";
        break;

      case 3:
        muscleGroups = ["legs", "glutes"];
        title = "Legs And Glutes";
        break;

      case 4:
        muscleGroups = ["shoulders", "core"];
        title = "Shoulders And Core";
        break;

      case 5:
        muscleGroups = ["core", "cardio"];
        title = "Core And Cardio";
        break;

      case 6:
        muscleGroups = ["legs", "cardio"];
        title = "Legs And Cardio";
        break;

      default:
        muscleGroups = ["full body", "cardio"];
        title = "Full Body And Cardio";
    }

    const exercises = await Exercise.find({
      muscleGroups: { $in: muscleGroups },
    }).limit(6);
    const plan = exercises.map((ex) => ({
      id: ex._id,
      name: ex.name,
      reps: ex.baseReps[energyLevel],
      duration: ex.baseDuration[energyLevel],
      xp: ex.xpReward[energyLevel],
      difficulty: energyLevel,
      //video: ex.demoVideoUrl,
    }));
    console.log("plan=", plan);
    const response = {
      title: title,
      difficulty: energyLevel,
      estimatedTime: plan.reduce((t, e) => t + e.duration, 0),
      exercises: plan,
    };
    res.json(response);
  } catch (err) {
    console.log("error");
    res.status(500).json({ message: err.message });
  }
};
export const completeWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { exercises, energyLevel, totalDuration } = req.body;

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return res
        .status(400)
        .json({ message: "Exercises must be a non-empty array" });
    }

    const formattedExercises = exercises.map((ex) => ({
      exerciseId: ex.exerciseId || null,
      name: ex.name,
      repsDone: ex.repsDone || 0,
      durationDone: ex.durationDone || 0,
      xpEarned: ex.xpEarned || 0,
      completed: ex.completed ?? true,
    }));

    const totalXp = formattedExercises.reduce(
      (sum, ex) => sum + ex.xpEarned,
      0,
    );

    await WorkoutSession.create({
      user: userId,
      energyLevel,
      exercises: formattedExercises,
      totalXpEarned: totalXp,
      totalDuration,
      completed: true,
    });

    let stats = await UserStats.findOne({ user: userId });

    if (!stats) {
      stats = await UserStats.create({
        user: userId,
        currentXp: 0,
        totalXp: 0,
        level: 1,
        workoutsCompleted: 0,
        streak: { current: 0, longest: 0, lastWorkoutDate: null },
      });
    }

    stats.currentXp += totalXp;
    stats.totalXp += totalXp;
    stats.workoutsCompleted += 1;
    stats.level = Math.floor(Math.sqrt(stats.totalXp / 100)) + 1;

    const today = new Date();
    const lastDate = stats.streak.lastWorkoutDate;

    if (!lastDate || today.toDateString() !== lastDate.toDateString()) {
      const diffDays = lastDate
        ? Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))
        : 1;

      stats.streak.current = diffDays === 1 ? stats.streak.current + 1 : 1;
      stats.streak.longest = Math.max(
        stats.streak.longest,
        stats.streak.current,
      );
      stats.streak.lastWorkoutDate = today;
    }

    await stats.save();

    res.json({
      message: "Workout saved successfully",
      xpEarned: totalXp,
      newLevel: stats.level,
      streak: stats.streak.current,
      totalXp: stats.totalXp,
    });
  } catch (err) {
    console.error("COMPLETE WORKOUT ERROR:", err);
    res.status(500).json({ message: "Failed to complete workout" });
  }
};

export const oauthCalendarSuccess = async (req, res) => {
  console.log("calendar access gained");
  res.redirect("http://localhost:5173/");
};
export const createWorkoutAlarm = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const token = await getValidAccessToken(user);
    console.log("token=", token);
    const { title, dateTime } = req.body;
    const startTime = new Date(dateTime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    if (isNaN(startTime)) {
      return res.status(400).json({ error: "Invalid dateTime format " });
    }
    const result = await axios.post(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        summary: title,
        description: "Workout reminder from PulseNet 💪",
        start: {
          dateTime: startTime.toISOString(),
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "Asia/Kolkata",
        },
        reminders: {
          useDefault: false,
          overrides: [{ method: "popup", minutes: 10 }],
        },
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    console.log(result);
    res.status(200).json({ message: "alarm created successfully" });
  } catch (err) {
    if (err.message === "Google reconnect required") {
      return res.status(401).json({
        reconnectGoogle: true,
        authUrl: "/api/calendar/google",
        method: "GET",
      });
    }
    console.log(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create alarm" });
  }
};
export const getWorkoutDaysOfMonth = async (req, res) => {
  const { year, month } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const sessions = await WorkoutSession.find({
    userId: req.user.id,
    date: { $gte: start, $lt: end },
  }).select("date");

  const days = sessions.map((s) => new Date(s.date).getUTCDate());

  res.json({ days });
};
export const getWorkoutsOfDay = async (req, res) => {
  const date = new Date(req.query.date);

  const start = new Date(date.setHours(0, 0, 0, 0));
  const end = new Date(date.setHours(23, 59, 59, 999));

  const sessions = await WorkoutSession.find({
    userId: req.user.id,
    date: { $gte: start, $lte: end },
  }).populate("exercises.exerciseId", "name muscleGroups type");

  res.json({ sessions });
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    let { year, month } = req.query;

    year = Number(year);
    month = Number(month);

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ message: "Invalid year or month" });
    }

    const stats = await UserStats.findOne({ user: userId });
    if (!stats) return res.status(404).json({ message: "Stats not found" });

    const xpRequiredForNextLevel = stats.level * 500;
    const xpToNextLevel = Math.max(xpRequiredForNextLevel - stats.currentXp, 0);

    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 1));

    const monthlySessions = await WorkoutSession.find({
      user: userId,
      completed: true,
      date: { $gte: startOfMonth, $lt: endOfMonth },
    }).select("date");

    const workoutDays = monthlySessions.map((s) =>
      new Date(s.date).getUTCDate(),
    );

    res.json({
      level: stats.level,
      currentXp: stats.currentXp,
      totalXp: stats.totalXp,
      xpToNextLevel,

      streak: stats.streak.current,
      longestStreak: stats.streak.longest,

      workoutsCompleted: stats.workoutsCompleted,
      minutesTrained: stats.minutesTrained,

      workoutDays,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
