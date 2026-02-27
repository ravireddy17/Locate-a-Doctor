import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import {getDoc, doc, updateDoc } from 'firebase/firestore';
import db from '../../firebase';
import Modal from '../../components/Modal/Modal';
import { Checkmark } from 'react-checkmark';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader'
import { AiOutlineCloseCircle } from "react-icons/ai";
import "./UserDetail.css"

export default function UserDetail() {
  const userId = localStorage.getItem('LogInUserId');
  const [UserUi, setUserUi] = useState({
    buttonType: '', route: '', modal:'',fill:''
  })
  const [error, seterror] = useState('');
  const UserType = localStorage.getItem('LogInUserType');
  const [values, setValues] = useState({});
  const [initialValues, setInitialValues] = useState({});
  const [modalDetails, setModalDetails] = useState({
    show: false,
    status: '',
    message: ''
  });

  useEffect(() => {
    getUserProfile();
    initializeUserUI();
  }, []);

  function initializeUserUI() {
    if (UserType == 'admin') {
      setUserUi({ buttonType: 'Admin-dashboard', route: '/admin',modal:'admin-modal',fill:'#2D239F' })
    }
    else if (UserType == 'patient') {
      setUserUi({ buttonType: 'primary', route: '/home',modal:'patient-modal',fill:'green' })
    }
    else {
      setUserUi({ buttonType: 'doctor-button', route: '/doctor',modal:'doctor-modal',fill:'#9F2341' })
    }

  }
  const getUserProfile = async () => {
    const userDocRef = doc(db, 'Users', userId);
    const doctorDocRef = doc(db, 'Doctors', userId);

    const [userDoc, doctorDoc] = await Promise.all([
      getDoc(userDocRef),
      getDoc(doctorDocRef),
    ]);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      setValues(userData);
      setInitialValues(userData)
    }
    else if (doctorDoc.exists()) {
      const doctorData = doctorDoc.data();
      setValues((prevValues) => ({ ...prevValues, ...doctorData }));
      setInitialValues((prevValues) => ({ ...prevValues, ...doctorData }));
    }
  };

  const handleChange = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const closeModal = () => {
    setModalDetails({ ...modalDetails, show: false });
  };
  async function UpdateUserDetails() {
    const hasChanged = Object.entries(values).some(([key, value]) => {
      return value !== initialValues[key];
    });
  
    if (!hasChanged) {
      seterror('No changes detected.');
      return;
    }
  
    try {
      const {...updatedValues } = values;
  
      const userRef = doc(db, "Users", userId);
      const DoctorRef = doc(db, "Doctors", userId);
      console.log('updatedValues',updatedValues);
      if(updatedValues.UserType == 'admin' || updatedValues.UserType == 'patient'){
        await updateDoc(userRef, updatedValues);
      }
      else{
        console.log(DoctorRef);
        await updateDoc(DoctorRef, updatedValues);

      }
  
      setInitialValues(updatedValues);
  
      setModalDetails({
        show: true,
        status: 'success',
        message: 'User Profile updated Successfully',
      });
    } catch (error) {
      setModalDetails({
        show: true,
        status: 'error',
        message: 'Failed To Update Profile',
      });
      console.error('Error updating data:', error);
    }
  }
  
  return (
    <div className="dashboard-outer-container">
      <DashboardHeader headerName='User Profile' headertype={UserType} />
      <div className="justify-content-center ">
        <div className="register-main user-update d-flex flex-column g-2 justify-content-center align-items-center">
          <div className="register-details">
            <div className="register-inputStyle">
              <div>First Name</div>
              <input type="text" name='FullName' onChange={handleChange} value={values.FullName} />
            </div>
            <div className="register-inputStyle">
              <div>User Name</div>
              <input type="text" name='UserName' onChange={handleChange} value={values.UserName} readOnly />
            </div>
          </div>
          <div className="register-details">
            <div className="register-inputStyle">
              <div>Email</div>
              <input type="email" name='Email' onChange={handleChange} value={values.Email} />
            </div>
            <div className="register-inputStyle">
              <div>Phone</div>
              <input type="number" name='Phone' onChange={handleChange} value={values.Phone} />
            </div>
          </div>
          <div className="register-details">
            <div className="register-inputStyle">
              <div>Password</div>
              <input type="text" name='Password' onChange={handleChange} value={values.Password} />
            </div>
          </div>
          <div className="update-buttons" style={{ justifyContent: 'center', marginTop: '20px' }}>
            <Button label="Cancel" buttonType={UserUi.buttonType} route={UserUi.route} />
            <Button label='Update' buttonType={UserUi.buttonType} handleFunction={UpdateUserDetails} />
          </div>
        </div>
        {error && <div className="error-message" style={{ textAlign: 'center' }}>{error}</div>}
      </div>
      {modalDetails.show === true && (
                <Modal userType={UserUi.modal}>
                    {modalDetails.status === 'success' && <Checkmark size='60px' color={UserUi.fill} />}
                    {modalDetails.status === 'error' && <AiOutlineCloseCircle style={{ fill: '#ff0000', fontSize: '70px', animation: 'scaleAnimation 1s ease forwards',margin:'auto'}}/>}
                    
                    <div className="modal-message">{modalDetails.message}</div>
                    <div style={{ margin: 'auto', textAlign: 'center' }}>
                        <Button
                            label="Continue"
                            buttonType={UserUi.buttonType}
                            handleFunction={closeModal}
                            style={{ marginTop: '20px' }}
                        />
                    </div>
                </Modal>
            )}

    </div>
  )
}
