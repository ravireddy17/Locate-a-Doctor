import React, { useState, useEffect } from "react";
import "./FindDoctor.css";
import { collection, query, where, getDocs, onSnapshot, addDoc, doc } from 'firebase/firestore';
import db from '../../firebase';
import Select from 'react-select';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Datetime from 'react-datetime';
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import "react-datetime/css/react-datetime.css";
import Modal from '../../components/Modal/Modal';
import { Checkmark } from 'react-checkmark';
import moment from 'moment';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import { ReactBingmaps } from 'react-bingmaps';

function FindDoctor() {
    const key = 'x6OZKyXJIcbImEhKdULS';

    const [appointmentDetails, setAppointmentDetails] = useState({
        allDoctors: [],
        allowBooking: true,
        showAppointmentBookingModal: false,
        selectedDate: '',
        doctorsList: [],
        doctorSpecializationsList: [],
        selectedDoctor: {},
        bookingMessage: '',
        showConfirmation: false
    });
    const [values, setValues] = useState({
        AppointmentDate: '',
        AppointmentTime: '',
        Doctor: '',
        Patient: doc(db, 'Users', localStorage.getItem("LogInUserId"))
    })
    const navigate = useNavigate();
    const [currentLocation, setCurrentLocation] = useState({
        longitude: 0,
        latitude: 0
    });
    const [locationError, setLocationError] = useState(null);

    useEffect(() => {
        let temp = [];
        const unsubscribe = onSnapshot(collection(db, 'Doctors'), (snapshot) => {
            const Doctors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // console.log(Doctors);
            setAppointmentDetails(prevState => ({ ...prevState, allDoctors: Doctors }));
            Doctors.forEach(doctor => {
                if (doctor.specialization !== undefined && !temp.some(item => item.value === doctor.specialization)) {
                    temp.push({ value: doctor.specialization, label: doctor.specialization });
                }
            });
            setAppointmentDetails(prevState => ({ ...prevState, doctorSpecializationsList: temp }));
        });

        return async () => {
            await getCurrentLocation();
            unsubscribe();
        }
    }, []);
    const getCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(
            position => {
                setCurrentLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });

            },
            error => {
                setLocationError(error.message);
            }
        );
    };
    const updateSpecialization = async (event) => {
        setAppointmentDetails(prevState => ({ ...prevState, doctorsList: [] }));
        const temp = appointmentDetails.allDoctors.filter(element => element.specialization === event.value);
        setAppointmentDetails(prevState => ({ ...prevState, doctorsList: temp }));
    }

    const showDoctors = () => {
        const showSelectedDoctor = (doctor) => {
            setValues(prevValues => ({
                ...prevValues,
                Doctor: doc(db, 'Doctors', doctor.id)
            }));

            setAppointmentDetails(prevState => ({ ...prevState, selectedDoctor: doctor, showAppointmentBookingModal: true }));
        };

        return (
            appointmentDetails.doctorsList.map((doctor) => (
                <div className="doctors-list-item" key={doctor.id} onClick={() => showSelectedDoctor(doctor)}>
                    {console.log(doctor)}
                    <div className="doctors-list-item-logo">
                        <img src={doctor.image ? doctor.image : "assets/doctor.png"} alt="" style={{ borderRadius: '20px', marginTop: '10px' }} />
                    </div>
                    <div className="doctors-list-item-details">
                        <div className="doctor-name">{doctor.FullName}</div>
                        <Stack spacing={1}>
                            <Rating name={`rating-${doctor.id}`} value={doctor.rating} size="large" readOnly />
                        </Stack>
                    </div>
                </div>
            ))
        );
    }

    const handleDateChange = (date) => {
        if (!date || !moment.isMoment(date)) {
            console.error("Invalid date object provided.");
            return;
        }
        setValues(prevValues => ({
            ...prevValues,
            AppointmentDate: date.format("MM-DD-YYYY"),
            AppointmentTime: date.format("hh:mm A")
        }));
        const selectedDate = date.format("MM-DD-YYYY");
        setAppointmentDetails(prevState => ({ ...prevState, selectedDate, allowBooking: false }));
    };

    const callBackMethod = (e) => {
        console.log("Push pin clicked!", e);
        // Handle click event logic here
    };
    const handleBooking = async () => {
        if (!appointmentDetails.selectedDate) {
            console.error('Please select a date before booking.');
            return;
        }

        try {
            const bookingresult = await addDoc(collection(db, 'Appointments'), values);
            setAppointmentDetails(prevState => ({ ...prevState, showAppointmentBookingModal: false }));
            const message = 'Your appointment is confirmed on ' + appointmentDetails.selectedDate;
            setAppointmentDetails(prevState => ({ ...prevState, bookingMessage: message, showConfirmation: true }));

        } catch (error) {
            console.error('Error in booking', error);
        }
    }


    const handleModalClose = () => {
        setAppointmentDetails(prevState => ({ ...prevState, showConfirmation: false }));
        navigate('/feedback');
    }

    const handleCancel = () => {
        setAppointmentDetails(prevState => ({ ...prevState, allowBooking: true, selectedDate: '', showAppointmentBookingModal: false }));
    }

    return (
        <div className="dashboard-outer-container">
            <DashboardHeader headerName='Find doctors' headertype='patient' />
            <div className="dashboard-menu-list">
                <div style={{ width: '90%' }}>
                    <Select options={appointmentDetails.doctorSpecializationsList} placeholder={'Select specialization'} clearable={true} onChange={updateSpecialization} />
                </div>
                <div className="doctors-list-displayer">
                    {showDoctors()}
                </div>
                {appointmentDetails.showAppointmentBookingModal &&
                    <Modal userType='patient-modal'>
                        <div>
                            <div className="doctor-name-logo">
                                <div className="doctor-logo">
                                    <img src={appointmentDetails.selectedDoctor.image ? appointmentDetails.selectedDoctor.image : "assets/doctor.png"} alt="" />
                                </div>
                                <div className="show-doctor-book-appointment">
                                    <div className="doctor-name-specialization">
                                        <div className="doctor-name">{appointmentDetails.selectedDoctor.FullName}</div>
                                        <div className="doctor-specialization">{appointmentDetails.selectedDoctor.specialization}</div>
                                    </div>
                                </div>
                                {currentLocation && appointmentDetails.selectedDoctor && (
    <div className="maps">
        <ReactBingmaps
    bingmapKey="AovBFsjRcPwxJpnHjbwyHb8SduZ01r76rbqwOAvFl5B5NISCQ1E4bK3s7DvejJ1R"
    center={[currentLocation.latitude, currentLocation.longitude]}
    pushPins={[
        {
            "location": [currentLocation.latitude, currentLocation.longitude],
            "option": { color: 'red' },
            "addHandler": { "type": "click", callback: callBackMethod }
        },
        {
            "location": [appointmentDetails.selectedDoctor.Latitude, appointmentDetails.selectedDoctor.Longitude],
            "option": { color: 'green' },
            "addHandler": { "type": "click", callback: callBackMethod }
        }
    ]}

/>
    </div>
)}
                            </div>
                            <div className="doctor-description-details">
                                <div className="doctor-description-title">Description</div>
                                <div className="doctor-description-content">Doctor {appointmentDetails.selectedDoctor.FullName} is a well known {appointmentDetails.selectedDoctor.specialization}</div>
                                <div className="appointment-time-selector">
                                    <div className="appointment-time-selector-text">Select your date and time for scheduling appointment</div>
                                    <Datetime className="appointment-time-selector-input" dateFormat="MM-DD-yyyy" selected={appointmentDetails.selectedDate} showTimeSelect timeFormat="hh:mm A" onChange={handleDateChange} updateOnView="time" />
                                </div>
                                <div className="book-appointment-button">
                                    <Button label="Cancel" buttonType="primary" handleFunction={handleCancel} />
                                    <Button label="Book Appointment" buttonType="primary" handleFunction={handleBooking} disabled={!appointmentDetails.selectedDate} />
                                </div>
                            </div>
                        </div>
                    </Modal>
                }
            </div>
            {appointmentDetails.showConfirmation &&
                <Modal userType='patient-modal'>
                    <Checkmark size='60px' color='green' />
                    <div className="modal-message">{typeof appointmentDetails.bookingMessage === 'string' ? appointmentDetails.bookingMessage : ''}</div>
                    <div style={{ margin: 'auto' }}>

                        <Button style={{ margin: 'auto' }}
                            label="Continue to Feedback"
                            buttonType="primary"
                            handleFunction={handleModalClose}
                        />
                    </div>
                </Modal>
            }
        </div>
    );
}

export default FindDoctor;


