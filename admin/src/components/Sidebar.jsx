import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { assets } from '../assets/assets.js'
import { NavLink } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext.jsx'

const Sidebar = () => {
  const { atoken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)

  const navLinkStyle = ({ isActive }) =>
    `flex items-center gap-4 py-3.5 px-4 md:px-10 md:min-w-72 cursor-pointer transition-colors duration-200 ${
      isActive ? 'bg-[#F2F3FF] border-r-4 border-primary font-medium text-primary' : 'hover:bg-gray-50'
    }`

  return (
    <div className="min-h-screen bg-white border-r">
      {atoken && (
        <ul className="text-[#515151] mt-6 space-y-1">
          <NavLink className={navLinkStyle} to="/admin-dashboard">
            <img src={assets.home_icon} alt="" className="w-5" />
            <p>Dashboard</p>
          </NavLink>
          <NavLink className={navLinkStyle} to="/all-appointments">
            <img src={assets.appointment_icon} alt="" className="w-5" />
            <p>Appointments</p>
          </NavLink>
          <NavLink className={navLinkStyle} to="/add-doctor">
            <img src={assets.add_icon} alt="" className="w-5" />
            <p>Add Doctors</p>
          </NavLink>
          <NavLink className={navLinkStyle} to="/doctors-list">
            <img src={assets.people_icon} alt="" className="w-5" />
            <p>Doctors List</p>
          </NavLink>
        </ul>
      )}

      {dToken && (
        <ul className="text-[#515151] mt-6 space-y-1">
          <NavLink className={navLinkStyle} to="/doctor-dashboard">
            <img src={assets.home_icon} alt="" className="w-5" />
            <p>Dashboard</p>
          </NavLink>
          <NavLink className={navLinkStyle} to="/doctor-appointment">
            <img src={assets.appointment_icon} alt="" className="w-5" />
            <p>Appointments</p>
          </NavLink>
          <NavLink className={navLinkStyle} to="/doctor-profile">
            <img src={assets.people_icon} alt="" className="w-5" />
            <p>Doctor Profile</p>
          </NavLink>
        </ul>
      )}
    </div>
  )
}

export default Sidebar