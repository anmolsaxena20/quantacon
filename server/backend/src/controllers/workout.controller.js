import WorkoutSession from "../models/workoutSession.model.js";
import UserStats from "../models/userStats.model.js";
import Exercise from "../models/exercise.model.js";

export const generateWorkout = async (req, res) => {
  try {
    const { muscleGroups, energyLevel } = req.body;

    const exercises = await Exercise.find({
      muscleGroups: { $in: muscleGroups },
    }).limit(6);

    const plan = exercises.map((ex) => ({
      id: ex._id,
      name: ex.name,
      reps: ex.baseReps[energyLevel],
      duration: ex.baseDuration[energyLevel],
      xp: ex.xpReward[energyLevel],
      video: ex.demoVideoUrl,
    }));

    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const completeWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { exercises, energyLevel } = req.body;

    const totalXp = exercises.reduce((sum, e) => sum + e.xpEarned, 0);

    await WorkoutSession.create({
      user: userId,
      energyLevel,
      exercises,
      totalXpEarned: totalXp,
      completed: true,
    });

    let stats = await UserStats.findOne({ user: userId });
    if (!stats) stats = await UserStats.create({ user: userId });

    stats.currentXp += totalXp;
    stats.totalXp += totalXp;
    stats.workoutsCompleted += 1;

    const today = new Date().toDateString();
    const last = stats.streak.lastWorkoutDate?.toDateString();

    if (last !== today) {
      stats.streak.current += 1;
      stats.streak.longest = Math.max(
        stats.streak.longest,
        stats.streak.current,
      );
      stats.streak.lastWorkoutDate = new Date();
    }

    stats.level = Math.floor(Math.sqrt(stats.totalXp / 100)) + 1;

    await stats.save();

    res.json({ message: "Workout saved", newLevel: stats.level });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
