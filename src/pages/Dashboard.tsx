import { useEffect } from "react";
import { useNavigate } from "react-router";

// Redirect legacy /dashboard route to the farmer dashboard
export default function Dashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);
  return null;
}
