import React, { useState } from 'react';
import db from '../../firebase';
import { Link, useNavigate } from "react-router-dom";
import UserAuth from './UserAuth';
import "./Login.css";
import Button from "../../components/ui/Button";
import { query, where, getDocs, collection } from 'firebase/firestore';
export default function Login() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({ Username: '', Password: '' });

  const handleChange = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value.trim() }));
  };

  const handleOnClick = async () => {
    const CheckData = UserAuth(values);
    setErrors(CheckData);
    const hasNoErrors = isInputValid(CheckData);

    if (hasNoErrors) {
      try {
        const userQuery = query(collection(db, "Users"), where("UserName", "==", values.Username));
        const doctorQuery = query(collection(db, "Doctors"), where("UserName", "==", values.Username));
        
        const [userSnapshot, doctorSnapshot] = await Promise.all([
          getDocs(userQuery),
          getDocs(doctorQuery)
        ]);
        
        if (!userSnapshot.empty || !doctorSnapshot.empty) {
          const userDocs = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const doctorDocs = doctorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const allDocs = [...userDocs, ...doctorDocs];
          
          const foundUser = findUserByPassword(allDocs, values.Password);
          if (foundUser) {
            localStorage.setItem("LogInUserId", foundUser.id);
            console.log(foundUser.UserType);
            if (foundUser.UserType === 'patient') {
              localStorage.setItem("LogInUserType", foundUser.UserType);
              navigate('/home');
            } else if (foundUser.UserType === 'admin') {
              localStorage.setItem("LogInUserType", foundUser.UserType);
              navigate('/Admin');
            } else {
              localStorage.setItem("LogInUserType", 'doctor');
              navigate('/doctor');
            }
          } else {
            setErrors({ errorMessage: 'Incorrect Password' });
          }
        } else {
          setErrors({ errorMessage: `No user found with Username ${values.Username}` });
        }
      } catch (error) {
        handleDatabaseError(error);
      }
    }
  };

  const findUserByPassword = (users, password) => {
    return users.find(user => comparePasswords(user.Password, password));
  };

  const comparePasswords = (storedPassword, inputPassword) => {
    console.log(storedPassword,inputPassword);
    if(storedPassword == inputPassword){
      return true;
    }
    else{
      return false;
    }
  };

  const isInputValid = (errors) => {
    return Object.values(errors).every(error => error === '');
  };

  const handleDatabaseError = (error) => {
    console.error("Error searching for user:", error);
  };
  return (
    <div className="login-outer-container">
      <div className="login-header">
        Login
      </div>
      <div className="login-details">

      <div className="d-flex flex-column g-1 px-2 login-inputs">
            <div className='input-label'>User name</div>
            <input type="text" name='Username' className='LoginInput' onChange={handleChange} />
            {errors.Username && <div className="error-message">{errors.Username}</div>}
          </div>
          <div className="d-flex flex-column g-1 px-2 mb-3 login-inputs">
            <div className='input-label'>Password</div>
            <input type="password" name='Password' className='LoginInput' onChange={handleChange} />
            {errors.Password && <div className="error-message">{errors.Password}</div>}
          </div>
          {errors.errorMessage && <div className="error-message">{errors.errorMessage}</div>}
          <Button label="Login" buttonType="primary" handleFunction={handleOnClick} />
          <div>
            Not a member? <Link to={"/register"}>Register</Link>
          </div>
      </div>
    </div>
  )
}
