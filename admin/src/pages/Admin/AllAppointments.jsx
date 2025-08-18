import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const AllAppointments = () => {
  const { atoken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

  useEffect(() => {
    if (atoken) getAllAppointments()
  }, [atoken])

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-4 text-xl font-semibold text-gray-700'>All Appointments</p>

      <div className='bg-white border rounded-lg text-sm max-h-[80vh] overflow-y-auto shadow-sm'>
        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3 px-6 border-b bg-gray-50 font-medium text-gray-700'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {appointments.map((item, index) => (
          <div
            key={index}
            className='flex flex-wrap justify-between sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-600 py-3 px-6 border-b hover:bg-gray-50 transition-all duration-150 ease-in-out'
          >
            <p className='max-sm:hidden'>{index + 1}</p>

            <div className='flex items-center gap-2'>
              <img className='w-8 h-8 rounded-full object-cover' src={item.userData.image} alt='' />
              <p className='font-medium'>{item.userData.name}</p>
            </div>

            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>

            <p>
              {slotDateFormat(item.slotDate)}, <br className='sm:hidden' />
              {item.slotTime}
            </p>

            <div className='flex items-center gap-2'>
              <img className='w-8 h-8 rounded-full object-cover' src={item.docData.image} alt='' />
              <p className='font-medium'>{item.docData.name}</p>
            </div>

            <p className='font-medium'>
              {currency}
              {item.amount}
            </p>

            {item.cancelled ? (
              <p className='text-red-500 text-xs font-semibold'>Cancelled</p>
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
  )
}

export default AllAppointments