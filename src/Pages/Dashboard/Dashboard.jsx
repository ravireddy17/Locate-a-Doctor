import React, { useState, useMemo, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import Modal from '../../components/Modal/Modal';
import Button from "../../components/ui/Button";
import Datetime from 'react-datetime';
import moment from 'moment';
import { doc, updateDoc,getDocs, getDoc,collection } from 'firebase/firestore';
import { Checkmark } from 'react-checkmark';
import { AiOutlineCloseCircle } from "react-icons/ai";
import db from '../../firebase';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader'
export default function Dashboard() {
    const [showModal, setShowModal] = useState({ status: '', message: '' });
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState('');
    const [openMenuIndex, setOpenMenuIndex] = useState(-1);
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState([]);
    const [showAppointmentRescheduling, setShowAppointmentRescheduling] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        const patientId = localStorage.getItem('LogInUserId');
        try {
            let tempAppointments = [];
            const querySnapshot = await getDocs(collection(db, 'Appointments'));
            querySnapshot.forEach(async (doc) => {
                let temp = { appointment: { id: doc.id, ...doc.data() } };
                if (temp.appointment.Doctor) {
                    let doctorData = await getDoc(temp.appointment.Doctor);
                    temp.appointment.Doctor = { DoctorID: doctorData.id, ...doctorData.data() };
                }
                if (temp.appointment.Patient) {
                    let patientData = await getDoc(temp.appointment.Patient);
                    temp.appointment.Patient = { PatientID: patientData.id, ...patientData.data() };
                }
                if(temp.appointment.Patient.PatientID == patientId){

                    tempAppointments.push(temp);
                }
            });
            setAppointments(tempAppointments);
        } catch (error) {
            console.error('Error fetching appointments: ', error);
        }
    };

    const menuArrowDown = (rotated, fillColor) => {
        const rotationStyle = rotated ? { transform: 'rotate(180deg)' } : {};
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={fillColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={rotationStyle} className="icon-transition">
                <path d="m6 9 6 6 6-6" />
            </svg>
        );
    }
    const ModalIcon = () => {
        if (showModal.status === 'Success') {
            return <Checkmark size='60px' color='green' />;
        } else {
            return <AiOutlineCloseCircle
                style={{
                    fill: '#ff0000', fontSize: '70px', animation: 'scaleAnimation 1s ease forwards',
                }}
            />;
        }
    };
        
    const handleCancelUpdate = () => {
        setShowAppointmentRescheduling(false)
    }

    const handleModalClose = () => {
        setShowModal({ status: '', message: '' });
        if (showModal.status === 'Success') {
            navigate('/home');
        }
    };

    const handleDateChange = (date) => {
        if (!moment.isMoment(date)) {
            console.error("Invalid date object provided.");
            return;
        }
        setSelectedDate({
            AppointmentDate: date.format("MM-DD-YYYY"),
            AppointmentTime: date.format("hh:mm A")
        });
    };

    const handleAppointmentSelection = (appointment) => {
        setSelectedAppointment(appointment);
        setShowAppointmentRescheduling(true);
    };

    const toggleMenu = (index) => {
        setOpenMenuIndex(openMenuIndex === index ? -1 : index);
    }

    const TodaysDate = useMemo(() => {
        const date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }, []);

    const isValidDate = (current) => {
        const today = new Date();
        return current.isAfter(today);
    };

    const handleBooking = async () => {
        const appointmentDocRef = doc(db, 'Appointments', selectedAppointment.appointment.id);
        try {
            await updateDoc(appointmentDocRef, selectedDate);
            const successMessage = { status: 'Success', message: 'Appointment Rescheduled' };
            setShowModal(successMessage);
            setShowAppointmentRescheduling(false);
            fetchAppointments();
        } catch (error) {
            console.error('Error updating document: ', error);
            const failureMessage = { status: 'Failed', message: 'Failed to Reschedule Appointment' };
            setShowModal(failureMessage);
        }
    }

    const pastAppointments = () => {
        const pastAppointments = appointments.filter(Appointment => {
            const appointmentDate = new Date(Appointment.appointment.AppointmentDate);
            const todayDate = new Date(TodaysDate);
            return appointmentDate < todayDate;
        });
    
        if (pastAppointments.length === 0) {
            return 'No Past Appointments.'
        }
    
        return (
            <div className="appointment">
                {pastAppointments.map((Appointment, index) => (
                    <div key={Appointment.id} className="appointments-list-item">
                        <div className="appointments-list-item-content">
                            <div className="appointment-number">Appointment #{index + 1}</div>
                            <div>{Appointment.appointment.Doctor.FullName}</div>
                            <div>{Appointment.appointment.Doctor.specialization}</div>
                        </div>
                        <div className="appointments-list-item-content">
                            <div>{Appointment.appointment.AppointmentDate}</div>
                            <div>{Appointment.appointment.AppointmentTime}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    

    const upcomingAppointments = () => {
        const upcomingAppointments = appointments.filter(Appointment => {
            const appointmentDate = new Date(Appointment.appointment.AppointmentDate);
            const todayDate = new Date(TodaysDate);
            return appointmentDate >= todayDate;
        });
    
        if (upcomingAppointments.length === 0) {
            return 'No upcoming Appointments.'
        }
    
        return (
            <div className="appointment">
                {upcomingAppointments.map((Appointment, index) => (
                    <div key={Appointment.id} className="appointments-list-item" onClick={() => handleAppointmentSelection(Appointment)}>
                        <div className="appointments-list-item-content">
                            <div className="appointment-number">Appointment #{index + 1}</div>
                            <div>{Appointment.appointment.Doctor.FullName}</div>
                            <div>{Appointment.appointment.Doctor.specialization}</div>
                        </div>
                        <div className="appointments-list-item-content">
                            <div>{Appointment.appointment.AppointmentDate}</div>
                            <div>{Appointment.appointment.AppointmentTime}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    

    const symptomsInput = () => {
        navigate('/SymptomsInput');
    }

    const findDoctors = () => {
        navigate('/FindDoctor');
    }

    const menuItems  = [
        { title: 'Past Appointments', content: pastAppointments() || 'No Scheduled Appointments.', click: pastAppointments },
        { title: 'Upcoming Appointments', content: upcomingAppointments() || 'No Scheduled Appointments.', click: upcomingAppointments },
        { title: 'Symptoms Input', content: 'Click here to enter symptoms', click: symptomsInput },
        { title: 'Find Doctors', content: 'Click here to find doctors', click: findDoctors },
    ];

    return (
        <div className="dashboard-outer-container">
            <DashboardHeader headerName='Dashboard' headertype='patient'/>
            <div className="dashboard-menu-list">
                {menuItems.map((item, index) => (
                    <div key={index} className="dashboard-menu-list-item">
                        <div className="dashboard-menu-list-item-text">{item.title}</div>
                        <div className="dashboard-menu-list-item-icon" onClick={() => toggleMenu(index)}>
                            {menuArrowDown(openMenuIndex === index, 'white')}
                        </div>
                        {openMenuIndex === index && (
                            <div className="dashboard-menu-list-item-content" onClick={item.click}>
                                {item.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {showAppointmentRescheduling && (
                <Modal userType='patient-modal' className="appointment-modal-content">
                    <div className="Appointment-details">
                        <h2 className="white-text">Selected Appointment Details</h2>
                        <div className="appointment-date-time">
                            <div className="white-text">Date: {selectedAppointment.appointment.AppointmentDate}</div>
                            <div className="white-text">Time: {selectedAppointment.appointment.AppointmentTime}</div>
                        </div>
                        <div className="appointment-date-time">
                            <div className="appointment-time-selector-text white-text">Select your date and time for rescheduling appointment</div>
                            <Datetime className="appointment-time-selector-input" dateFormat="MM-DD-yyyy" selected={selectedDate} showTimeSelect timeFormat="hh:mm A" onChange={handleDateChange} updateOnView="time" isValidDate={isValidDate} />
                        </div>
                    </div>
                    <div className="book-appointment-button">
                        <Button label="Cancel" buttonType="Cancel" handleFunction={handleCancelUpdate} />
                        <Button label="Reschedule" buttonType="Reschedule" handleFunction={handleBooking} disabled={!selectedDate} />
                    </div>
                </Modal>
            )}
            {showModal.status && (
                <Modal userType='patient-modal'>
                    <div className="Modal-icon">{ModalIcon()}</div>
                    <div className="modal-message">{showModal.message}</div>
                    <Button label="Continue" buttonType="primary" handleFunction={handleModalClose} />
                </Modal>
            )}
        </div>
    );
}
