import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import "./ManageAdmin.css";
import Select from 'react-select';
import { collection, query, where, getDocs, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import db from '../../firebase';
import Modal from '../../components/Modal/Modal';
import { Checkmark } from 'react-checkmark';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader'
import { AiOutlineCloseCircle } from "react-icons/ai";
export default function ManageAdmin() {
    const [modalDetails, setModalDetails] = useState({
        show: false,
        status: '',
        message: ''
    });
    const [error, seterror] = useState('');
    const [initialValues, setInitialValues] = useState({});
    const [allAdmins, setallAdmins] = useState([]);
    const [adminsList, setadminsList] = useState([]);
    const [values, setValues] = useState({
        UserName: '',
        Password: '',
        Email: '',
        UserType: 'admin',
        FullName: '',
        ConfirmPassword: '',
        Phone: ''
    });
    const closeModal = () => {
        console.log('acaszzd');
        setModalDetails({ ...modalDetails, show: false });
    };
    const handleChange = (event) => {
        setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };
    const getAdmins = async () => {
        let temp = [];
        const doctorsCollection = collection(db, 'Users');
        const querySnapshot = query(doctorsCollection, where('UserType', '==', 'admin'));
        await onSnapshot(querySnapshot, (snapshot) => {
            const Admins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setallAdmins(Admins);
            Admins.forEach(admin => {
                temp.push({ value: admin.id, label: `Mr. ${admin.FullName}` });
            });
            setadminsList(temp);
        });
    }
    const AddAdmin = async () => {
        if (Object.values(values).some(value => value === '')) {
            seterror('Please fill in all fields.');
            return;
        }
        console.log(values);
        const userQuery = query(collection(db, "Users"), where("UserName", "==", values.UserName));
        try {
            console.log('-->',userQuery,values);
            const querySnapshot = await getDocs(userQuery);
            if (querySnapshot.empty) {
                await addDoc(collection(db, 'Users'), values);
                setModalDetails({ show: true, status: 'success', message: 'Admin Created Successfully' });
            } else {
                setModalDetails({ show: true, status: 'error', message: 'Username already exists.' });
            }
        } catch (error) {
            console.error("Error adding user:", error);
        }
    }
    const [action, setAction] = useState('');

    const handleCancelUpdate = (actionName) => {
        setAction(actionName);
        seterror('');
        setValues({
            UserName: '',
            Password: 'Admin@123',
            Email: '',
            FullName: '',
            Phone: '',
            UserType: 'admin',
        });
        console.log(actionName);
        if (actionName === 'update') {
            getAdmins();
        }
    };
    const SetSelectedAdmin = (event) => {
        // const selectedAdmin = allDoctors.find(doctor => doctor.id === event.value);
        let selectedAdmin = allAdmins.filter(admin => admin.id === event.value);
        console.log(selectedAdmin[0]);
        setValues(selectedAdmin[0]);
        setInitialValues(selectedAdmin[0]);
    }
    const UpdateAdminDetails = async () => {
        if (Object.values(values).some(value => value === '')) {
            seterror('Please fill in all fields.');
            return;
        }
        const hasChanged = Object.entries(values).some(([key, value]) => {
            return value !== initialValues[key];
        });

        if (!hasChanged) {
            seterror('No changes detected.');
            
            return;
        }
        const userRef = doc(db, "Users", values.id);

        try {
            await updateDoc(userRef, values);
            setModalDetails({ show: true, status: 'success', message: 'Admin updated Successfully' });
        } catch (error) {
            console.error('Error updating data:', error);
        }
    }

    return (
        <div className="dashboard-outer-container">
            <DashboardHeader headerName='Manage Admin' headertype='admin'/>
            <div className="admin-dashboard-content">
                <div className="action-buttons">
                    <Button label="Add Admin" buttonType="Admin-dashboard" handleFunction={() => handleCancelUpdate('add')} />
                    <Button label="Update Admin" buttonType="Admin-dashboard" handleFunction={() => handleCancelUpdate('update')} />
                </div>
                {action &&
                    <div className="d-flex justify-content-center ">
                        <div className="register-main add-doctor d-flex flex-column g-2 justify-content-center align-items-center">
                           <div className="show-options">

                            {action === 'update' && <Select className='doctors-list-display' options={adminsList} placeholder={'Select Admin to update'} clearable={true} styles={{ width: '300px' }} onChange={SetSelectedAdmin} />}
                           </div>

                            <div className="register-details">
                                <div className="register-inputStyle">
                                    <div>First Name</div>
                                    <input type="text" name='FullName' onChange={handleChange} value={values.FullName}/>
                                </div>
                                <div className="register-inputStyle">
                                    <div>User Name</div>
                                    <input type="text" name='UserName' onChange={handleChange} value={values.UserName} readOnly={action === 'update'} />
                                </div>
                            </div>
                            <div className="register-details">
                                <div className="register-inputStyle">
                                    <div>Email</div>
                                    <input type="email" name='Email' onChange={handleChange} value={values.Email}/>
                                </div>
                                <div className="register-inputStyle">
                                    <div>Phone</div>
                                    <input type="number" name='Phone' onChange={handleChange} value={values.Phone}/>
                                </div>
                            </div>
                            <div className="register-details">
                                <div className="register-inputStyle">
                                    <div>Password</div>
                                    <input type="text" name='Password' onChange={handleChange} readOnly={action === 'add'} value={values.Password} />
                                </div>
                            </div>
                            <div className="register-details" style={{ justifyContent: 'center' ,marginTop:'20px'}}>
                                <Button label="Cancel" buttonType="Admin-dashboard" route='/admin' />
                                <Button label={action === 'add' ? 'Add' : 'Update'} buttonType="Admin-dashboard" handleFunction={action === 'add' ? AddAdmin : UpdateAdminDetails} />
                            </div>
                            <div className='note-message'>
                                {action === 'add' ? `The default password is ${values.Password}. You cannot change it.` : 'The Username is immutable and cannot be altered.'}
                            </div>
                            {error && <div className="error-message">{error}</div>}
                        </div>
                    </div>
                }
            </div>
            {modalDetails.show === true && (
                <Modal userType='admin-modal'>
                    {modalDetails.status === 'success' && <Checkmark size='60px' color='blue' />}
                    {modalDetails.status === 'error' && <AiOutlineCloseCircle style={{ fill: '#ff0000', fontSize: '70px', animation: 'scaleAnimation 1s ease forwards',margin:'auto'}}/>}
                    
                    <div className="modal-message">{modalDetails.message}</div>
                    <div style={{ margin: 'auto', textAlign: 'center' }}>
                        <Button
                            label="Continue"
                            buttonType="Admin-dashboard"
                            handleFunction={closeModal}
                            style={{ marginTop: '20px' }}
                        />
                    </div>
                </Modal>
            )}

        </div>
    );
}
