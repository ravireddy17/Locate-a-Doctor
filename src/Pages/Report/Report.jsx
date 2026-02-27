import React, { useEffect, useState } from 'react';
import { collection, query, where, getDoc, getDocs } from 'firebase/firestore';
import db from '../../firebase';
import "./Report.css";
import Button from "../../components/ui/Button";
import { PieChart } from '@mui/x-charts/PieChart';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
export default function Report() {
    const [analyticsData, setAnalyticsData] = useState({ patients: 0, doctors: 0, dspecializationCounts: [], preferredSpecializations: new Map(), totalAppointments: 0, patientsAndDoctors: [] });
    const [pieChartData, setPieChartData] = useState([]);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            let tempPatientsAndDoctors = []
            const patientCollection = collection(db, 'Users');
            const patientSnapshot = await getDocs(query(patientCollection, where('UserType', '==', 'patient')));
            const patientCount = patientSnapshot.size;
            tempPatientsAndDoctors.push({ label: 'Patients', value: patientCount })

            const doctorCollection = collection(db, 'Doctors');
            const doctorSnapshot = await getDocs(query(doctorCollection));
            const doctorCount = doctorSnapshot.size;
            tempPatientsAndDoctors.push({ label: 'Doctors', value: doctorCount })
            const specializationCounts = new Map();
            doctorSnapshot.forEach(doc => {
                const specialization = doc.data().specialization;
                if (specialization) {
                    specializationCounts.set(specialization, (specializationCounts.get(specialization) || 0) + 1);
                }
            });

            const doctorsReference = new Map();
            await Promise.all(doctorSnapshot.docs.map(async doc => {
                const doctorData = doc.data();
                const appointmentsCollection = collection(db, 'Appointments');
                const appointmentsSnapshot = await getDocs(query(appointmentsCollection, where('Doctor', '==', doc.ref)));
                const appointmentsCount = appointmentsSnapshot.size;
                doctorsReference.set(doctorData.specialization, appointmentsCount);
            }));

            const temp2 = Array.from(specializationCounts).map(([label, value], index) => ({ id: index, value, label }));

            setAnalyticsData({ patients: patientCount, doctors: doctorCount, dspecializationCounts: temp2, preferredSpecializations: doctorsReference, totalAppointments: doctorsReference.size, patientsAndDoctors: tempPatientsAndDoctors });
            setPieChartData(temp2);
        };

        fetchData();
    }, []);


    useEffect(() => {
        // console.log('Analytics Data:', analyticsData.preferredSpecializations);
    }, [analyticsData]);

    return (
        <div className="dashboard-outer-container">
            <DashboardHeader headerName='Platform Data Analysis' headertype='admin'/>
{pieChartData.length > 0 && (
<>
<div style={{justifyContent:'center',textAlign:'center',marginTop:'2%'}}>

<Stack direction="column" width="100%" textAlign="center" spacing={2}>
    <Box flexGrow={1}>
        <h4 className='Typography'>Patients & Doctors Distribution</h4>
        <PieChart
            title="Specialization Distribution"
            series={[
                {
                    data: analyticsData.dspecializationCounts,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'green' },
                },
            ]}
            height={400}
        />
    </Box>
    <Box flexGrow={1}>
        <h4 className='Typography'>Patients & Doctors Distribution</h4>
        <PieChart
            series={[
                {
                    data: analyticsData.patientsAndDoctors,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'green' },
                },
            ]}
            height={400}
        />
    </Box>
</Stack>
</div>
<div style={{marginLeft:'35%',marginTop:'20px',paddingBottom:'30px'}}>
    <Button label="Back to Menu" buttonType="Admin-dashboard" route='/admin'/>
</div>


</>
)

}</div>
    );
}
