import React, { useState } from "react";
import "./SymptomsInput.css";
import Select from 'react-select';
import Button from "../../components/ui/Button";
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader'
import { useNavigate } from "react-router-dom";
const closeIcon = () => {
    return (
        <span className="material-symbols-outlined">
            close
        </span>
    );
}
function SymptomsInput() {
    const navigate = useNavigate();

    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [isSymptomsSelected, setIsSymptomsSelected] = useState(false);

    const handleSymptomChange = (selectedOption) => {
        if (selectedOption) {
            const newSymptoms = selectedOption.map(option => option.value);
            setSelectedSymptoms(newSymptoms);
            setIsSymptomsSelected(newSymptoms.length > 0);
        } else {
            console.error('Selected option is null or undefined.');
        }
    }
    

    const ShowSelectedSymptoms = () => {
        return (
            <div className="selected-symptoms-list">
                {selectedSymptoms.map((symptom, index) => (
                    <div className="selected-symptoms-list-item" key={index}>
                        <div className="selected-symptoms-list-item-text">{symptom}</div>
                        <div className="selected-symptoms-list-item-icon">{closeIcon()}</div>
                    </div>
                ))}
            </div>
        );
    };
const handleOnClick= () =>{
    localStorage.setItem('symptoms',selectedSymptoms);
    navigate('/Prediction')
};
    let symptoms = [
        "Fever", "Cough", "Shortness of breath", "Fatigue", "Muscle or body aches", "Headache",
        "Sore throat", "Loss of taste or smell", "Congestion or runny nose", "Nausea or vomiting",
        "Diarrhea", "Chills", "Repeated shaking with chills", "Sore throat", "New loss of taste or smell",
        "Headache", "Muscle or body aches", "Fatigue", "Sore throat", "Congestion or runny nose",
        "Nausea or vomiting", "Diarrhea", "Fever", "Cough", "Shortness of breath", "Fatigue",
        "Muscle or body aches", "Headache", "Sore throat", "Loss of taste or smell", "Congestion or runny nose",
        "Nausea or vomiting", "Diarrhea", "Chills", "Repeated shaking with chills", "Sore throat",
        "New loss of taste or smell", "Congestion or runny nose", "Nausea or vomiting", "Diarrhea",
        "Headache", "Muscle or body aches", "Fatigue", "Sore throat", "Congestion or runny nose",
        "Nausea or vomiting", "Diarrhea"
    ];

    symptoms = [...new Set(symptoms)];
    symptoms = symptoms.map(symptom => ({ value: symptom, label: symptom }));

    return (
        <div className="dashboard-outer-container symptoms-input-section">
            <DashboardHeader headerName='Enter Your Symptoms' headertype='patient'/>
            <div className="dashboard-inner-container">
                <div style={{width: '80%'}}>

                <Select
                    options={symptoms}
                    placeholder={'Select Symptoms'}
                    clearable={true}
                    isMulti
                    onChange={handleSymptomChange}
                />
                </div>
                {/* Display selected symptoms */}
                {isSymptomsSelected && <ShowSelectedSymptoms />}
            </div>
            <div className="submit-symptoms-button">
                <Button
          label="Submit"
          buttonType="primary"
          handleFunction={handleOnClick}
        />
            </div>
            
        </div>
    );
}

export default SymptomsInput;
