import React, { useState } from 'react';
import { Checkmark } from 'react-checkmark'
import "./Register.css";
import Button from "../../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import AuthUserDetails from './AuthUserDetails';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import Modal from '../../components/Modal/Modal';
import { AiOutlineCloseCircle } from "react-icons/ai";
import db from '../../firebase';
export default function Register() {
  const navigate = useNavigate();
  const [errors, setError] = useState({});
  const [values, setValues] = useState({
    UserName: '',
    Password: '',
    Email: '',
    UserType: 'patient',
    FullName: '',
    ConfirmPassword: '',
    Phone: ''
  });
  const [showModal, setshowModal] = useState({
    status: '',
    message: ''
  });

  const handleChange = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleModalClose = () => {
    setshowModal({
      status: '',
      message: '',
      icon: ''
    });
    if (showModal.status === 'Success') {
      navigate('/login');
    }
  };

  const ModalIcon = () => {
    if (showModal.status === 'Success') {
      return <Checkmark size='60px' color='green' />;
    } else {
      return <AiOutlineCloseCircle
        style={{
          fill: '#ff0000', fontSize: '70px', animation: 'scaleAnimation 1s ease forwards',margin:'auto'
        }}
      />;
    }
  };

  const handleRegister = async () => {
    const validationErrors = AuthUserDetails(values);
    setError(validationErrors);
    const hasNoErrors = Object.values(validationErrors).every(error => error === '');
    
    if (hasNoErrors) {
      const userQuery = query(collection(db, "Users"), where("UserName", "==", values.UserName));
      try {
        const querySnapshot = await getDocs(userQuery);
        if (querySnapshot.empty) {
          delete values.ConfirmPassword;
          values.Phone=parseInt(values.Phone);
          await addDoc(collection(db, 'Users'), values);
          setshowModal({ status: 'Success', message: 'User Created' });
        } else {
          setshowModal({ status: 'Failed', message: 'UserName already exists' });
        }
      } catch (error) {
        console.error("Error adding user:", error);
      }
    }
  };

  return (
    <>
      <div className="register-outer-container">
        <div className="login-header"> Register </div>
        <div className="login-details">

        <div className="register-details">
        <div className="register-inputStyle">
              <div className='input-label'>Full Name</div>
              <input type="text" name='FullName' onChange={handleChange} />
              {errors.FullName && <div className="error-message">{errors.FullName}</div>}
            </div>
            <div className="register-inputStyle">
              <div className='input-label'>User Name</div>
              <input type="text" name='UserName' onChange={handleChange} />
              {errors.UserName && <div className="error-message">{errors.UserName}</div>}
            </div>
        </div>
        <div className="register-details">
            <div className="register-inputStyle">
              <div className='input-label'>Email</div>
              <input type="email" name='Email' onChange={handleChange} />
              {errors.Email && <div className="error-message">{errors.Email}</div>}
            </div>
            <div className="register-inputStyle">
              <div className='input-label'>Phone</div>
              <input type="number" name='Phone' onChange={handleChange} />
              {errors.Phone && <div className="error-message">{errors.Phone}</div>}
            </div>
          </div>
          <div className="register-details">
            <div className="register-inputStyle">
              <div className='input-label'>Password</div>
              <input type="password" name='Password' onChange={handleChange} />
              {errors.Password && <div className="error-message">{errors.Password}</div>}
            </div>
            <div className="register-inputStyle">
              <div className='input-label'>Confirm Password</div>
              <input type="password" name='ConfirmPassword' onChange={handleChange} />
              {errors.ConfirmPassword && <div className="error-message">{errors.ConfirmPassword}</div>}
            </div>
          </div>
          <Button
            label="Register"
            buttonType="primary"
            handleFunction={handleRegister}
          />
          <div className=" mb-2 ">
            Already a member ? <Link to={"/login"}>Login</Link>
          </div>
        </div>
        {showModal.status && <Modal userType='patient-modal'>
        {ModalIcon()}
        {/* <div className="Modal-icon">{ModalIcon()}</div> */}
        <div className="modal-message">{showModal.message}</div>
        <div className="modal-button">
        <Button
          label="Continue"
          buttonType="primary"
          handleFunction={handleModalClose}
        />
        </div>
      </Modal>}
      </div>
    </>
  );
}
