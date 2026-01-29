export const allowTiers = (...allowedTiers) => {
  return (req, res, next) => {
    const userTier = req.user?.tier;

    if (!userTier) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedTiers.includes(userTier)) {
      return res.status(403).json({ message: "Upgrade required" });
    }

    next();
  };
};
