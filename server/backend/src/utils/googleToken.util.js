export const getValidAccessToken = async (user) => {
  try {
    if (Date.now() < user.googleTokenExpiry) {
      return user.googleCalendarAccessToken;
    }
    console.log(process.env.GOOGLE_CLIENT_ID);
    console.log(process.env.GOOGLE_CLIENT_SECRET);
    const payload = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: user.googleCalendarRefreshToken,
      grant_type: "refresh_token",
    };

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Google JSON Error Response:", data);
      throw new Error(
        `Google OAuth Error: ${data.error_description || data.error}`,
      );
    }
    user.googleCalendarAccessToken = data.access_token;
    user.googleTokenExpiry = Date.now() + data.expires_in * 1000;
    console.log(`new credentials = ${user.googleCalendarAccessToken}`);
    await user.save();
    return user.googleCalendarAccessToken;
  } catch (err) {
    console.log("refresh token error");
    user.googleCalendarConnected = false;
    user.googleCalendarAccessToken = null;
    user.googleCalendarRefreshToken = null;
    await user.save();
    throw new Error("Google reconnect required");
  }
};
