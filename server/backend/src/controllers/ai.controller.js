import axios from "axios";
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
