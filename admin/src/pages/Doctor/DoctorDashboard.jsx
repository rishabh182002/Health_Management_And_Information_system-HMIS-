import React, { useContext, useEffect } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext);
  const { slotDateFormat, currency } = useContext(AppContext);

  useEffect(() => {
    if (dToken) getDashData();
  }, [dToken]);

  return dashData && (
    <div className='p-4 sm:p-6'>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        <div className='flex items-center gap-3 bg-white p-4 rounded-xl border hover:shadow-lg transition-all'>
          <img className='w-14' src={assets.earning_icon} alt="Earnings" />
          <div>
            <p className='text-2xl font-bold text-gray-700'>{currency} {dashData.earnings}</p>
            <p className='text-gray-400'>Earnings</p>
          </div>
        </div>

        <div className='flex items-center gap-3 bg-white p-4 rounded-xl border hover:shadow-lg transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="Appointments" />
          <div>
            <p className='text-2xl font-bold text-gray-700'>{dashData.appointments}</p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </div>

        <div className='flex items-center gap-3 bg-white p-4 rounded-xl border hover:shadow-lg transition-all'>
          <img className='w-14' src={assets.patients_icon} alt="Patients" />
          <div>
            <p className='text-2xl font-bold text-gray-700'>{dashData.patients}</p>
            <p className='text-gray-400'>Patients</p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-xl border overflow-hidden'>
        <div className='flex items-center gap-3 px-6 py-4 border-b bg-gray-50'>
          <img src={assets.list_icon} alt="List" className='w-5' />
          <h2 className='font-semibold text-gray-700 text-lg'>Latest Bookings</h2>
        </div>

        <div className='divide-y'>
          {dashData.latestAppointments.slice(0, 5).reverse().map((item, index) => (
            <div key={index} className='flex items-center px-6 py-4 gap-4 hover:bg-gray-50 transition-all'>
              <img className='w-10 h-10 rounded-full object-cover' src={item.userData.image} alt="User" />
              <div className='flex-1 text-sm'>
                <p className='font-medium text-gray-800'>{item.userData.name}</p>
                <p className='text-gray-500 text-xs'>Booking on {slotDateFormat(item.slotDate)}</p>
              </div>

              {item.cancelled ? (
                <p className='text-red-500 text-xs font-semibold'>Cancelled</p>
              ) : item.isCompleted ? (
                <p className='text-green-600 text-xs font-semibold'>Completed</p>
              ) : (
                <div className='flex gap-2'>
                  <img onClick={() => cancelAppointment(item._id)} className='w-8 cursor-pointer hover:scale-105' src={assets.cancel_icon} alt="Cancel" />
                  <img onClick={() => completeAppointment(item._id)} className='w-8 cursor-pointer hover:scale-105' src={assets.tick_icon} alt="Complete" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default DoctorDashboard;