import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import "./ManageDoctor.css";
import Select from 'react-select';
import { collection, query, where, getDocs, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import db from '../../firebase';
import Modal from '../../components/Modal/Modal';
import { Checkmark } from 'react-checkmark';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import { AiOutlineCloseCircle } from "react-icons/ai";
import imageCompression from 'browser-image-compression';
export default function ManageDoctor() {
    const [file, setFile] = useState(null);
    const [location, setLocation] = useState('');
    const [modalDetails, setModalDetails] = useState({
        show: false,
        status: '',
        message: ''
    });
    const [error, setError] = useState('');
    const [initialValues, setInitialValues] = useState({});
    const [allDoctors, setAllDoctors] = useState([]);
    const [doctorsList, setDoctorsList] = useState([]);
    const [values, setValues] = useState({
        UserName: '',
        Password: 'Doctor@123',
        Email: '',
        FullName: '',
        Phone: '',
        specialization: '',
        rating: 0,
        pincode: '',
        image:''
    });
    const [action, setAction] = useState('');

    const resetForm = () => {
        setError('');
        setValues({
            UserName: '',
            Password: 'Doctor@123',
            Email: '',
            FullName: '',
            Phone: '',
            specialization: '',
            rating: 3,
            pincode: ''
        });
        setFile(null);
        setLocation('');
    };

    const handleUpdate = (actionName) => {
        setAction(actionName);
        if (actionName === 'update') {
            getDoctors();
        }
        resetForm();
    };

    const handleChange = (event) => {
        setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const getDoctors = async () => {
        try {
            const doctorsSnapshot = await getDocs(collection(db, 'Doctors'));
            const doctorsData = doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllDoctors(doctorsData);

            const doctorsOptions = doctorsData.map(doctor => ({
                value: doctor.id,
                label: `Dr. ${doctor.FullName}: ${doctor.specialization}`
            }));
            setDoctorsList(doctorsOptions);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        }
    };

    const AddDoctor = async () => {
        if (Object.values(values).some(value => value === '')) {
            setError('Please fill in all fields.');
            return;
        }

        const userQuery = query(collection(db, "Doctors"), where("UserName", "==", values.UserName));
        try {
            const querySnapshot = await getDocs(userQuery);
            if (querySnapshot.empty) {
                if (file) {
                    const storage = getStorage();
                    const storageRef = ref(storage, `doctors/${values.UserName}`);
                    const uploadTask = uploadBytesResumable(storageRef, file);

                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            // Handle progress if needed
                        },
                        (error) => {
                            console.error('Error uploading image:', error);
                        },
                        () => {
                            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                // Include the downloadURL and location in the data to be saved to Firestore
                                values.imageUrl = downloadURL;
                                values.location = location;
                                addDocWithImageAndLocation();
                            });
                        }
                    );
                } else {
                    values.location = location;
                    addDocWithImageAndLocation();
                }
            } else {
                setModalDetails({ show: true, status: 'error', message: 'Username already exists.' });
            }
        } catch (error) {
            console.error("Error adding user:", error);
        }
    };

    const addDocWithImageAndLocation = async () => {
        try {
            await addDoc(collection(db, 'Doctors'), values);
            setModalDetails({ show: true, status: 'success', message: 'Doctor added Successfully' });
            resetForm();
        } catch (error) {
            console.error("Error adding user:", error);
        }
    };

    const SetSelectedDoctor = (event) => {
        const selectedDoctor = allDoctors.find(doctor => doctor.id === event.value);
        setValues(selectedDoctor);
        setInitialValues(selectedDoctor);
        setLocation(selectedDoctor.location || '');
    };

    const UpdateDoctorDetails = async () => {
        if (Object.values(values).some(value => value === '')) {
            setError('Please fill in all fields.');
            return;
        }

        const hasChanged = Object.entries(values).some(([key, value]) => {
            return value !== initialValues[key];
        });

        if (!hasChanged && !file) {
            setError('No changes detected.');
            return;
        }

        const userRef = doc(db, "Doctors", values.id);
        delete values.id;
        values.location = location;

        if (file) {
            const storage = getStorage();
            const storageRef = ref(storage, `doctors/${values.UserName}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Handle progress if needed
                },
                (error) => {
                    console.error('Error uploading image:', error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        // Include the downloadURL in the data to be updated in Firestore
                        values.imageUrl = downloadURL;
                        updateDocWithImageAndLocation(userRef, values);
                    });
                }
            );
        } else {
            updateDocWithImageAndLocation(userRef, values);
        }
    };

    const updateDocWithImageAndLocation = async (userRef, updatedValues) => {
        try {
            await updateDoc(userRef, updatedValues);
            setModalDetails({ show: true, status: 'success', message: 'Doctor Updated Successfully' });
            handleUpdate('update');
            resetForm();
        } catch (error) {
            setModalDetails({ show: true, status: 'error', message: 'Failed to update Doctor' });
            console.error('Error updating data:', error);
        }
    };

    const closeModal = () => {
        setModalDetails({ ...modalDetails, show: false });
    };

    // const handleFileChange = (event) => {
    //     console.log(event.target.files[0]);
    //     setFile(event.target.files[0]);
    // };
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.error('No file selected');
            return;
        }
    
        try {
            const compressedFile = await compressImage(file);
            const base64String = await readFileAsBase64(compressedFile);
            setValues((prev) => ({ ...prev, image: base64String }));
            console.log('base64String--->', base64String);
        } catch (error) {
            console.error('Error handling file:', error);
        }
    };
    
    const compressImage = async (file) => {
        const options = {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 500,
            useWebWorker: true,
        };
        try {
            const compressedFile = await imageCompression(file, options);
            return compressedFile;
        } catch (error) {
            throw new Error('Image compression failed:', error);
        }
    };
    
    const readFileAsBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };
    const handleLocationChange = (event) => {
        setLocation(event.target.value);
    };
    return (
        <div className="dashboard-outer-container">
            <DashboardHeader headerName='Manage Doctors' headertype='admin' />
            <div className="admin-dashboard-content">
                <div className="action-buttons">
                    <Button label="Add Doctor" buttonType="Admin-dashboard" handleFunction={() => handleUpdate('add')} />
                    <Button label="Update Doctor" buttonType="Admin-dashboard" handleFunction={() => handleUpdate('update')} />
                </div>
                {action &&
                    <div className="d-flex justify-content-center ">
                        <div className="register-main add-doctor d-flex flex-column g-2 justify-content-center align -items-center">
                            <div className="show-options">
                                {action === 'update' && <Select className='doctors-list-display' options={doctorsList} placeholder={'Select Doctor to update'} clearable={true} onChange={SetSelectedDoctor} />}
                            </div>
                            <div className="register-details ">
                                <div className="register-inputStyle">
                                    <div >Full Name</div>
                                    <input type="text" name="FullName" onChange={handleChange} value={values.FullName} />
                                </div>
                                <div className="register-inputStyle">
                                    <div>Email</div>
                                    <input type="email" name="Email" onChange={handleChange} value={values.Email} />
                                </div>
                            </div>
                            <div className="register-details">
                                <div className="register-inputStyle">
                                    <div>Specialization</div>
                                    <input type="text" name="specialization" onChange={handleChange} value={values.specialization} />
                                </div>
                                <div className="register-inputStyle">
                                    <div>Phone</div>
                                    <input type="number" name="Phone" onChange={handleChange} value={values.Phone} />
                                </div>
                            </div>
                            <div className="register-details">
                                <div className="register-inputStyle">
                                    <div>Rating</div>
                                    <input type="number" name="rating" onChange={handleChange} value={values.rating} />
                                </div>
                                <div className="register-inputStyle">
                                    <div>Pincode</div>
                                    <input type="number" name="pincode" onChange={handleChange} value={values.pincode} />
                                </div>
                            </div>
                            <div className="register-details">
                                <div className="register-inputStyle">
                                    <div>User Name</div>
                                    <input type="text" name="UserName" onChange={handleChange} value={values.UserName} readOnly={action === 'update'} />
                                </div>
                                <div className="register-inputStyle">
                                    <div>Password</div>
                                    <input type="text" name="Password" readOnly={action === 'add'} value={values.Password} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="register-details">
                                <div className="register-inputStyle">
                                    <div>Latitude</div>
                                    <input type="text" name="Latitude" onChange={handleChange} value={values.Latitude} />
                                </div>
                                <div className="register-inputStyle">
                                    <div>Longitude</div>
                                    <input type="text" name="Longitude" value={values.Longitude} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="register-details" style={{alignItems:'center'}}>
                                {action === 'update' && (
                            <div className="register-inputStyle">
                                    <div>Profile picture</div>
                                    <img src={values.image ? values.image:"assets/doctor.png"} alt='doctor image' className='update-doctor-image'/>
                                </div>
                                )}
                                <div className="register-inputStyle">
                                    <div>{action === 'update'?'Update Image':'Upload Image'}</div>
                                    <input
                                        type="file"
                                        name="image"
                                        onChange={handleFileChange}
                                        accept=".jpg,.png"
                                    />
                                </div>
                                
                            </div>
                            <div className="register-details" style={{ justifyContent: 'center', marginTop: '20px' }}>
                                <Button label="Cancel" buttonType="Admin-dashboard" route='/admin' />
                                <Button label={action === 'add' ? 'Add' : 'Update'} buttonType="Admin-dashboard" handleFunction={action === 'add' ? AddDoctor : UpdateDoctorDetails} />
                            </div>
                            <div className='note-message'>
                                {action === 'add' ? 'The default password is "Doctor@123". You cannot change it.' : 'The Username is immutable and cannot be altered.'}
                            </div>
                            {error && <div className="error-message">{error}</div>}
                        </div>
                    </div>
                }
            </div>
            {modalDetails.show && (
                <Modal userType='admin-modal'>
                    {modalDetails.status === 'success' && <Checkmark size='60px' color='blue' />}
                    {modalDetails.status === 'error' && <AiOutlineCloseCircle style={{ fill: '#ff0000', fontSize: '70px', animation: 'scaleAnimation 1s ease forwards',margin:'auto'}}/>}
                    <div className="modal-message">{modalDetails.message}</div>
                    <div style={{ margin: 'auto', textAlign: 'center' }}>
                        <Button label="Continue" buttonType="Admin-dashboard" handleFunction={closeModal} style={{ marginTop: '20px' }} />
                    </div>
                </Modal>
            )}
        </div>
    );
}
