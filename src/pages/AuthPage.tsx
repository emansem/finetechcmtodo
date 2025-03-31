import { useNavigate } from "react-router-dom";
import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useDispatch } from "react-redux";
import { setUser } from "../store/authSlice";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const AuthPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGithubSignIn = async () => {
    try {
      const provider = new GithubAuthProvider();
      provider.addScope("read:user");
      provider.addScope("user:email");

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      dispatch(
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        })
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing in with GitHub:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)]">
      <Card className="max-w-md w-full p-8 space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-[var(--text-primary)]">
            Welcome to FineTech Todo
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Sign in with your GitHub account to continue
          </p>
        </div>
        <Button onClick={handleGithubSignIn} fullWidth className="relative">
          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-[var(--text-primary)]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </span>
          Sign in with GitHub
        </Button>
      </Card>
    </div>
  );
};

export default AuthPage;
