import WorkoutSession from "../models/workoutSession.model.js";
import UserStats from "../models/userStats.model.js";
import Exercise from "../models/exercise.model.js";
export const generateWorkout = async (req, res) => {
  try {
    const { energyLevel } = req.body;

    let muscleGroups;

    const day = new Date().getDay();

    if (day === 1) muscleGroups = ["chest", "triceps"];
    else if (day === 2) muscleGroups = ["back", "biceps"];
    else if (day === 3) muscleGroups = ["legs"];
    else if (day === 4) muscleGroups = ["shoulders", "core"];
    else muscleGroups = ["fullBody"];

    const exercises = await Exercise.find({
      muscleGroups: { $in: muscleGroups },
    }).limit(6);

    const plan = exercises.map((ex) => ({
      id: ex._id,
      name: ex.name,
      sets: ex.baseSets[energyLevel],
      reps: ex.baseReps[energyLevel],
      duration: ex.baseDuration[energyLevel],
      xp: ex.xpReward[energyLevel],
      difficulty: energyLevel,
      //video: ex.demoVideoUrl,
    }));

    res.json({
      title: "Upper Body Power",
      difficulty: energyLevel,
      estimatedTime: plan.reduce((t, e) => t + e.duration, 0),
      exercises: plan,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const completeWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { exercises, energyLevel, totalDuration } = req.body;
    if (!exercises || exercises.length === 0) {
      return res.status(400).json({ message: "No exercises data provided" });
    }
    const totalXp = exercises.reduce((sum, ex) => sum + (ex.xpEarned || 0), 0);
    await WorkoutSession.create({
      user: userId,
      energyLevel,
      exercises,
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
        streak: {
          current: 0,
          longest: 0,
          lastWorkoutDate: null,
        },
      });
    }
    stats.currentXp += totalXp;
    stats.totalXp += totalXp;
    stats.workoutsCompleted += 1;
    stats.level = Math.floor(Math.sqrt(stats.totalXp / 100)) + 1;
    const today = new Date();
    const lastDate = stats.streak.lastWorkoutDate;

    const isNewDay =
      !lastDate || today.toDateString() !== lastDate.toDateString();

    if (isNewDay) {
      if (lastDate) {
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          stats.streak.current += 1;
        } else {
          stats.streak.current = 1;
        }
      } else {
        stats.streak.current = 1;
      }

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
    res.status(500).json({ message: err.message });
  }
};
