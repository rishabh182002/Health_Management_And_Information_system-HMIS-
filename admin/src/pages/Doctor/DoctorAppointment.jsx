import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets.js';
import VideoCall from '../../components/VideoCall';

const DoctorAppointment = () => {
  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment, profileData } = useContext(DoctorContext);
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext);
  const [activeCall, setActiveCall] = useState(null);
  const [activeCallUserId, setActiveCallUserId] = useState(null);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  return (
    <div className="w-full max-w-6xl mx-auto my-5 px-4">
      <p className="mb-4 text-xl font-semibold text-gray-800">All Appointments</p>

      <div className="bg-white border rounded-xl shadow-sm text-sm max-h-[80vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-3 py-3 px-6 border-b bg-gray-50 text-gray-700 font-medium">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {appointments.slice().reverse().map((item, index) => (
          <div
            key={index}
            className="flex flex-wrap justify-between sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] items-center gap-3 text-gray-600 py-3 px-6 border-b hover:bg-gray-50 transition-all"
          >
            <p className="hidden sm:block">{index + 1}</p>

            <div className="flex items-center gap-3">
              <img src={item.userData.image} className="w-8 h-8 rounded-full object-cover" alt="" />
              <p className="font-medium">{item.userData.name}</p>
            </div>

            <div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                item.payment ? 'text-green-600 border-green-400 bg-green-50' : 'text-yellow-700 border-yellow-400 bg-yellow-50'
              }`}>
                {item.payment ? 'Online' : 'CASH'}
              </span>
            </div>

            <p className="hidden sm:block">{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <p className="font-medium">{currency}{item.amount}</p>

            {item.cancelled ? (
              <p className="text-red-500 text-xs font-semibold">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="text-green-600 text-xs font-semibold">Completed</p>
            ) : (
              <div className="flex gap-2 items-center">
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className="w-6 sm:w-8 cursor-pointer hover:scale-105 transition-transform"
                  src={assets.cancel_icon}
                  alt="Cancel"
                />
                <img
                  onClick={() => completeAppointment(item._id)}
                  className="w-6 sm:w-8 cursor-pointer hover:scale-105 transition-transform"
                  src={assets.tick_icon}
                  alt="Complete"
                />
                <img
                  onClick={() => {
                    setActiveCall(`${item.docData._id}_${item.userData._id}`);
                    setActiveCallUserId(item.userData._id);
                  }}
                  className="w-6 sm:w-8 cursor-pointer hover:scale-105 transition-transform"
                  src={assets.video_call_icon}
                  alt="Video Call"
                  title="Start Video Call"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {activeCall && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50 w-screen h-screen">
          <VideoCall roomId={activeCall} onEnd={() => setActiveCall(null)} />
        </div>
      )}
    </div>
  );
};

export default DoctorAppointment;