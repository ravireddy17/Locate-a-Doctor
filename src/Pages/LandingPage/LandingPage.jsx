import React from "react";
import Button from "../../components/ui/Button";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <>
      <div className="landing-head">
        <Button label="Login" buttonType="primary" route="login" />
        <Button label="Register" buttonType="primary" route="register" />
      </div>
    </>
  );
}
