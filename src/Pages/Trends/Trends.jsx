import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import db from '../../firebase';
import Button from "../../components/ui/Button";
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader'
import { BarChart } from '@mui/x-charts/BarChart';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

export default function Trends() {
  const [specializationArray, setSpecializationArray] = useState([]);
  const [barGraphData, setBarGraphData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const doctorCollection = collection(db, 'Doctors');
      const doctorSnapshot = await getDocs(query(doctorCollection));
      const specializationCounts = new Map();
      const doctorsReference = new Map();
      
      doctorSnapshot.forEach(doc => {
        const specialization = doc.data().specialization;
        if (specialization) {
          specializationCounts.set(specialization, (specializationCounts.get(specialization) || 0) + 1);
        }
      });
      
      await Promise.all(doctorSnapshot.docs.map(async doc => {
        const doctorData = doc.data();
        const appointmentsCollection = collection(db, 'Appointments');
        const appointmentsSnapshot = await getDocs(query(appointmentsCollection, where('Doctor', '==', doc.ref)));
        const appointmentsCount = appointmentsSnapshot.size;
        doctorsReference.set(doctorData.specialization, appointmentsCount);
      }));
      
      const tempArray = [];
      const temp2 = Array.from(specializationCounts).map(([label, value]) => {
        tempArray.push(label); // Pushing the label into tempArray
        return {
          specialization: label,
          doctorCount: value,
          appointmentCount: doctorsReference.get(label) || 0
        };
      });
      
      setBarGraphData(temp2);
      setSpecializationArray(tempArray);
    };

    fetchData();
  }, []);
  
  return (
    <div className="dashboard-outer-container">
      <DashboardHeader headerName='Platform Trends Overview' headertype='admin' />
      
        {barGraphData.length > 0 && (
        <>
        <div style={{ marginLeft: '25%', marginTop: '20px', paddingBottom: '30px' }}>
          <BarChart
            xAxis={[{ scaleType: 'band', data: specializationArray }]}
            series={[
              {
                data: barGraphData.map(item => item.doctorCount || 0),
                label: 'Doctors Available'
              },
              {
                data: barGraphData.map(item => item.appointmentCount || 0),
                label: 'Appointments Booked'
              }
            ]}
            width={600}
            height={300}
          />
          </div>
          <div style={{marginLeft:'40%',marginTop:'20px',paddingBottom:'30px'}}>
                <Button label="Back to Menu" buttonType="Admin-dashboard" route='/admin'/>
            </div>
            </>
        )}
      
        
    </div>
  )
}
