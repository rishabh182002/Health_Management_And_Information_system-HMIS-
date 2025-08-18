import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'

const Navbar = () => {
  const navigate = useNavigate()
  const { atoken, setAtoken } = useContext(AdminContext)
  const { dToken, setDToken } = useContext(DoctorContext)

  const logout = () => {
    navigate('/')
    atoken && setAtoken('')
    atoken && localStorage.removeItem('aToken')
    dToken && setDToken('')
    dToken && localStorage.removeItem('dToken')
  }

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-4 border-b bg-white shadow-sm">
      <div className="flex items-center gap-3 text-xs sm:text-sm">
        <img
          className="w-32 sm:w-40 cursor-pointer select-none"
          src={assets.admin_logo}
          alt="Logo"
        />
        <p className="border px-3 py-1 rounded-full border-gray-400 text-gray-600 bg-gray-50">
          {atoken ? 'Admin' : 'Doctor'}
        </p>
      </div>
      <button
        onClick={logout}
        className="bg-primary hover:bg-primary/90 transition-all duration-200 text-white text-sm px-6 sm:px-10 py-2 rounded-full"
      >
        Logout
      </button>
    </div>
  )
}

export default Navbar