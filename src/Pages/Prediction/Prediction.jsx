import React, { useState, useEffect } from "react";
import "./Prediction.css";
import Button from "../../components/ui/Button";
import OpenAI from 'openai';
import { useNavigate } from "react-router-dom";
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader'

function Prediction() {
    let symptoms = [];
    const navigate = useNavigate();
    const openAi = new OpenAI({
        apiKey: "",
        dangerouslyAllowBrowser: true
    });
    const values = localStorage.getItem('symptoms');
    const [response, setResponse] = useState({});
    
    const loadPredictor = async () => {

        if (values) {
            symptoms = values.split(',');
        } else {
            console.error('Symptoms data not found in localStorage.');
        }
        const messageContent = `I am suffering with ${symptoms.join(',')}
                                now suggest me the precautions, the doctor specialization to consult  and the name of the disease
                                give the answer in JSON format`;
        try {
            const result = await openAi.chat.completions.create({
                model: "gpt-3.5-turbo-16k-0613",
                messages: [
                    {
                        role: "user",
                        content: messageContent
                    },
                ],
            });

            setResponse(JSON.parse(result.choices[0].message.content))
        } catch (error) {
            console.error("Error:", error);
        }

    };

    useEffect(() => {
        loadPredictor();
    }, []);

    const handleOnClick = () => { navigate('/FindDoctor')};

    return (
        <>
        <div className="dashboard-outer-container">
        <DashboardHeader headerName='Predicted data' headertype='patient'/>
            <div className="predictor-outer-container">
                <div className="predictor-inner-container">
                    <div className="predicted-disease">
                        <div className="predicted-disease-name">Disease name</div>
                        <div className="predicted-disease-description">{response.disease_name}</div>
                    </div>
                    <div className="predicted-disease">
                        <div className="predicted-disease-name">Precautions</div>
                        <div className="predicted-disease-description">{response.precautions}</div>
                    </div>
                    <div className="predicted-disease">
                        <div className="predicted-disease-name">Doctors to consult</div>
                        <div className="predicted-disease-description">{response.doctor_specialization}</div>
                    </div>
                </div>
                <div className="button-group">
                    <Button
                        label="Find Doctors"
                        buttonType="primary"
                        handleFunction={handleOnClick}
                    />
                </div>
            </div>
            </div>
        </>
    );
}

export default Prediction;
