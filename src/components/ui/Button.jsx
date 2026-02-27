import React from "react";
import { useNavigate } from "react-router-dom";
import "./Button.css";

export default function Button({ label, buttonType, route, handleFunction, disabled }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!disabled) {
      if (route) {
        navigate(route);
      } else {
        handleFunction();
      }
    }
  };

  return (
    <div className={`${buttonType} ${disabled ? 'disabled-button' : 'default-button'}`} onClick={handleClick}>
      {label}
    </div>
  );
}
