import React, { useState, useMemo, useEffect } from "react";
import "./AdminDashboard.css";
import Button from "../../components/ui/Button";
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader'

export default function AdminDashboard() {
     return (
        <div className="dashboard-outer-container">
    <DashboardHeader headerName='Dashboard' headertype='admin'/>
            <div className="admin-dashboard-content">
                <div className="action-buttons">
                <Button label="Manage Doctors" buttonType="Admin-dashboard" route="/ManageDoctors" />
                <Button label="Manage Admin" buttonType="Admin-dashboard" route="/ManageAdmin" />
                <Button label="Reports" buttonType="Admin-dashboard" route="/Report" />
                <Button label="Trends" buttonType="Admin-dashboard" route='/trends' />

                </div>
                <div className="admin-profile-container">
                <div className="admin-profile-details">
                <img className="admin-logo" src="assets/admin.png" alt="logo" />
                <div className="admin-details">
                    <h3>Welcome Back!</h3>
                    <h4>Admin</h4>
                </div>
                </div>

                </div>

            </div>
        </div>
    );
}
