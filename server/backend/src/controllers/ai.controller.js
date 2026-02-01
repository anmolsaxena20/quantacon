import axios from "axios";
import { v5 as uuidv5 } from "uuid";
export const getAiGuidance = async (req, res) => {
  try {
    const { additonal_context, exercise } = req.body;
    const ans = await axios.post(`${process.env.AI_URI}/coach/guidance`, {
      additonal_context,
      exercise,
      user_id: req.user.id,
    });
    res.status(200).json(ans.data);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "unable to fetch response" });
  }
};
export const getAiMotivation = async (req, res) => {
  try {
    const ans = await axios.post(`${process.env.AI_URI}/coach/guidance`, {
      user_id: req.user.id,
    });
    res.status(200).json(ans.data);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "unable to fetch response" });
  }
};
export const generateAiWorkout = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { energyLevel, goal, time, injuries, location } = req.body;

    const payload = {
      energy_level: energyLevel ?? "medium",
      goal: goal ?? "general fitness",
      injuries: Array.isArray(injuries) ? injuries : [],
      location: location ?? "home",
      time_available: Number(time) || 30,
      user_id: uuidv5(req.user.id.toString(), uuidv5.DNS),
    };

    const response = await axios.post(
      `${process.env.AI_URI}/workout/generate`,
      payload,
    );

    return res.status(200).json(response.data);
  } catch (err) {
    console.error("AI ERROR:", err.response?.data || err.message);

    return res.status(err.response?.status || 500).json({
      message: err.response?.data?.message || "Failed to generate workout",
    });
  }
};
