import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";

const GitHubCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!code) {
          throw new Error("No code provided");
        }

        // Exchange code for access token using your backend endpoint
        const response = await fetch(
          "http://localhost:3000/auth/github/callback",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ code })
          }
        );

        if (!response.ok) {
          throw new Error("Failed to exchange code for token");
        }

        const data = await response.json();

        // Fetch user data from GitHub
        const userResponse = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${data.access_token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();

        // Get user's primary email
        const emailResponse = await fetch(
          "https://api.github.com/user/emails",
          {
            headers: {
              Authorization: `Bearer ${data.access_token}`
            }
          }
        );

        if (!emailResponse.ok) {
          throw new Error("Failed to fetch user email");
        }

        const emails = await emailResponse.json();
        const primaryEmail =
          emails.find((email: any) => email.primary)?.email || emails[0]?.email;

        // Set user in Redux store
        dispatch(
          setUser({
            uid: userData.id.toString(),
            email: primaryEmail,
            displayName: userData.name || userData.login,
            photoURL: userData.avatar_url
          })
        );

        // Redirect to dashboard
        navigate("/dashboard");
      } catch (error) {
        console.error("Authentication error:", error);
        navigate("/auth");
      }
    };

    fetchUser();
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)]">
      <div className="text-[var(--text-primary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
        <p>Authenticating...</p>
      </div>
    </div>
  );
};

export default GitHubCallback;
