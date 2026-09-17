import { useNavigate } from "react-router-dom";

import ReepinLogo from "../components/onboarding/ReepinLogo";
import OnboardingIllustration from "../components/onboarding/OnboardingIllustration";
import OnboardingDots from "../components/onboarding/OnboardingDots";

import "./Welcome.css";

function Welcome() {
  const navigate = useNavigate();

  return (
    <main className="welcome-page">
      <ReepinLogo />

      <OnboardingIllustration />

      <section className="welcome-content">
        <p className="welcome-eyebrow">BUSINESS MADE SIMPLE</p>

        <h1>
          Keep your business
          <span> organized.</span>
        </h1>

        <p className="welcome-description">
          Manage orders, customers and follow-ups in one simple place.
        </p>
      </section>

      <OnboardingDots />

      <div className="welcome-actions">
        <button className="primary-button" onClick={() => navigate("/login")}>
          Get Started
        </button>

        <button className="login-link" onClick={() => navigate("/login")}>
          Already have an account? <strong>Log in</strong>
        </button>
      </div>
    </main>
  );
}

export default Welcome;
