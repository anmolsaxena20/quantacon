
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function OAuthSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("authToken", token);
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

  return (
    <div>
      <h1>OAuth Success</h1>
      <p>Processing your login, please wait...</p>
    </div>
  );
}

export default OAuthSuccessPage;
