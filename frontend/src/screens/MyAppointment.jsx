import { toast } from 'react-toastify'
import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'

const MyAppointment = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const navigate = useNavigate()

  const slotDareFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
  }

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      if (data.success) {
        setAppointments(data.appointments.reverse())
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(backendUrl + "/api/user/verifyRazorpay", response, { headers: { token } });
          if (data.success) {
            navigate('/my-appointments')
            getUserAppointments()
          }
        } catch (error) {
          console.log(error)
          toast.error(error.message)
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  const appointmentRazorPay = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } })
      if (data.success) {
        initPay(data.order)
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="mt-12">
      <p className="pb-3 font-semibold text-zinc-800 text-xl border-b mb-6">My Appointments</p>
      <div className="flex flex-col gap-6">
        {appointments.slice(0, 2).map((item, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-6 p-4 border rounded-xl shadow-sm bg-white">
            <img className="w-32 h-32 object-cover rounded-md bg-indigo-50" src={item.docData.image} alt="" />
            <div className="flex-1 text-sm text-zinc-600 space-y-1">
              <p className="text-lg font-semibold text-neutral-800">{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className="text-zinc-700 font-medium mt-2">Address:</p>
              <p className="text-xs">{item.docData.address.line1}</p>
              <p className="text-xs">{item.docData.address.line2}</p>
              <p className="text-xs mt-2">
                <span className="text-sm text-neutral-700 font-medium">Date & Time: </span>
                {slotDareFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div className="flex flex-col gap-2 justify-center min-w-[180px]">
              {!item.cancelled && item.payment && (
                <button className="py-2 border border-green-500 rounded text-green-600 font-medium bg-green-50">Paid</button>
              )}
              {!item.cancelled && !item.payment && (
                <button onClick={() => appointmentRazorPay(item._id)} className="py-2 border rounded text-primary hover:bg-primary hover:text-white transition-all">
                  Pay Online
                </button>
              )}
              {!item.cancelled && (
                <button onClick={() => cancelAppointment(item._id)} className="py-2 border rounded text-red-500 hover:bg-red-500 hover:text-white transition-all">
                  Cancel Appointment
                </button>
              )}
              {item.cancelled && !item.isCompleted && (
                <button className="py-2 border border-red-500 rounded text-red-500 bg-red-50 font-medium">Appointment Cancelled</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAppointment