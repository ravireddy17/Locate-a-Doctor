import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./DashboardHeader.css";
import { AiFillHome } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

export default function DashboardHeader({ headertype, headerName }) {
  const navigate = useNavigate();

  const [arrowRotated, setArrowRotated] = useState(false);
  const menuArrowDown = (rotated, fillColor) => {
    const rotationStyle = rotated ? { transform: "rotate(180deg)" } : {};
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={fillColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={rotationStyle}
        className="icon-transition"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    );
  };
  const toggleArrowRotation = () => {
    setArrowRotated(!arrowRotated);
  };
  function handleLogoutClick() {
    localStorage.setItem('LogInUserId','');
    
  }
  function handleHomeNavigation() {
    if(headertype == 'admin'){
      navigate('/admin')
    }
    else if(headertype == 'patient'){
      navigate('/home')
    }
    else{
      navigate('/doctor')
    }
    // console.log('headertype',headertype);
    
  }
  return (
    <div className={`${headertype} dashboard-headers`}>
      {/* <div><IoHomeOutline /></div> */}
      <AiFillHome style={{
          fill: 'white', fontSize: '35px',cursor:'pointer'
        }} onClick={handleHomeNavigation}/>
      <div className="dashboard-header-text">{headerName}</div>
      <div className="dashboard-header-menu">
        <img className="user-logo" src="assets/Patient-logo.jpg" alt="logo" />
        <div className="user-logo-arrow" onClick={toggleArrowRotation}>
          {menuArrowDown(arrowRotated, "black")}
        </div>
        {arrowRotated && (
          <div className={`${headertype}-dropdown dashboard-dropdown`}>
            <Link to={"/UserDetail"}>User profile</Link>
            <Link to={"/login"} onClick={handleLogoutClick}>Logout</Link>
            
          </div>
        )}
      </div>
    </div>
  );
} 