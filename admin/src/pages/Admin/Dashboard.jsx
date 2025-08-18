import React, { useContext, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const Dashboard = () => {
  const { atoken, getDashData, cancelAppointment, dashData } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    if (atoken) getDashData()
  }, [atoken])

  return dashData && (
    <div className='m-5'>

      <div className='flex flex-wrap gap-4'>
        {[
          {
            count: dashData.doctors,
            label: 'Doctors',
            icon: assets.doctor_icon
          },
          {
            count: dashData.appointments,
            label: 'Appointments',
            icon: assets.appointments_icon
          },
          {
            count: dashData.patients,
            label: 'Patients',
            icon: assets.patients_icon
          }
        ].map((card, i) => (
          <div
            key={i}
            className='flex items-center gap-3 bg-white p-4 min-w-52 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:scale-105 transition-transform'
          >
            <img className='w-14 h-14 object-contain' src={card.icon} alt='' />
            <div>
              <p className='text-2xl font-semibold text-gray-700'>{card.count}</p>
              <p className='text-gray-500 text-sm'>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className='bg-white mt-10 border rounded-lg overflow-hidden'>
        <div className='flex items-center gap-3 px-5 py-4 border-b bg-gray-50'>
          <img src={assets.list_icon} alt='' />
          <p className='text-base font-semibold text-gray-700'>Latest Bookings</p>
        </div>

        <div>
          {dashData.latestAppointments?.slice(0, 5).map((item, index) => (
            <div
              key={index}
              className='flex items-center gap-3 px-6 py-3 text-sm border-b last:border-b-0 hover:bg-gray-50 transition'
            >
              <img className='w-10 h-10 rounded-full object-cover' src={item.docData.image} alt='' />

              <div className='flex-1'>
                <p className='font-medium text-gray-800'>{item.docData.name}</p>
                <p className='text-gray-500'>Booking on {slotDateFormat(item.slotDate)}</p>
              </div>

              {item.cancelled ? (
                <p className='text-red-500 text-xs font-semibold'>Cancelled</p>
              ) : item.isCompleted ? (
                <p className='text-green-500 text-xs font-semibold'>Completed</p>
              ) : (
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className='w-6 h-6 cursor-pointer hover:scale-110 transition-transform'
                  src={assets.cancel_icon}
                  alt='Cancel'
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard