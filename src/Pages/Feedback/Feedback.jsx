import React, { useState } from 'react';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Button from '../../components/ui/Button';
import './Feedback.css';
import { collection, query, where, getDocs, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import db from '../../firebase';
import { useNavigate } from "react-router-dom";
import Modal from '../../components/Modal/Modal';
import { Checkmark } from 'react-checkmark'
import { AiOutlineCloseCircle } from "react-icons/ai";

export default function Feedback() {
    const [showModal, setshowModal] = useState({
        status: '',
        message: ''
      });
    const navigate = useNavigate();
    const UserId =localStorage.getItem('LogInUserId');
    const [ratingValue, setRatingValue] = useState(0);
    const [feedback,setFeedback] = useState('');
    const feedbackdata={ratingValue,feedback,UserId}
    const handleSubmitFeedback = async () => {
        await addDoc(collection(db, 'Feedback'), feedbackdata);
        setshowModal({
            status:'Success',
            message:'Submitted'
        })
    };

    const feedbackUpdate = (event) => {
        setFeedback(event.target.value);
        console.log(feedbackdata);
    };
    const handleModalClose = () => {
        setshowModal({
          status: '',
          message: '',
          icon: ''
        });
        if (showModal.status === 'Success') {
          navigate('/home');
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
    return (
        <div className="dashboard-outer-container">
            <DashboardHeader headerName='Feedback' headertype='patient' />
            <div className="feedback-outercontainer">
                <Stack spacing={1} className='fedback-component-stack'>
                    <Rating 
                        size="large" 
                        value={ratingValue} 
                        onChange={(event, newValue) => {
                            setRatingValue(newValue);
                          }}
                        className='fedback-component' 
                    />
                </Stack>
            </div>
            <textarea className='feedback-input' onChange={feedbackUpdate}></textarea>
            <div className="feedback-button-container">
                <Button label="Submit" buttonType="primary" handleFunction={handleSubmitFeedback} />
            </div>
            {showModal.status && <Modal userType='patient-modal'>
        {ModalIcon()}
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
    );
}
