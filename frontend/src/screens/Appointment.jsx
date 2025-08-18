import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'

function Appointment() {
  const { docId } = useParams()
  const { doctors, backendUrl, getDoctorsData, token } = useContext(AppContext)
  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const navigate = useNavigate()

  const fetchInfo = async () => {
    const selectedDoc = doctors.find(doc => doc._id === docId)
    setDocInfo(selectedDoc)
  }

  const getAvailableSlots = async () => {
    setDocSlots([]);
    let today = new Date()
    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      let endTime = new Date()
      endTime.setDate(today.getDate() + i)
      endTime.setHours(21, 0, 0, 0)

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots = []
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        let day = currentDate.getDate()
        let month = currentDate.getMonth() + 1
        let year = currentDate.getFullYear()
        const slotDate = day + "_" + month + "_" + year
        const slotTime = formattedTime
        const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true
        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime
          })
        }
        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }
      setDocSlots(prev => [...prev, timeSlots])
    }
  }

  useEffect(() => {
    fetchInfo()
  }, [doctors, docId])

  useEffect(() => {
    getAvailableSlots()
  }, [docInfo])

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book appointment')
      return navigate('/login')
    }
    try {
      const date = docSlots[slotIndex][0].datetime
      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()
      const slotDate = day + "_" + month + "_" + year

      const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime }, { headers: { token } })

      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/myAppointment')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  return docInfo && (
    <div className="bg-background min-h-screen px-4 md:px-10 py-6">
      {/* Doctor Details */}
      <div className="flex flex-col sm:flex-row gap-6">
        <img className="bg-primary w-full sm:max-w-72 rounded-xl shadow-md" src={docInfo.image} alt="" />

        <div className="flex-1 border border-primary-light rounded-xl p-6 bg-white shadow-sm">
          <p className="flex items-center gap-2 text-2xl font-semibold text-primary">
            {docInfo.name}
            <img className="w-5" src={assets.verified_icon} />
          </p>
          <div className="flex gap-2 items-center text-sm mt-1 text-gray-600">
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className="py-1 px-2 border border-primary-light text-xs rounded-full">{docInfo.experience}</button>
          </div>

          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-gray-800 mt-4">About <img src={assets.info_icon} /></p>
            <p className="text-sm text-gray-600 mt-1">{docInfo.about}</p>
          </div>

          <p className="text-gray-600 font-medium mt-4">
            Appointment fee: ₹<span className="text-gray-800">{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* Booking Slots */}
      <div className="mt-10 font-medium text-gray-800">
        <p className="text-lg mb-4">Booking Slots</p>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {docSlots.length > 0 && docSlots.map((item, index) => (
            <div
              onClick={() => setSlotIndex(index)}
              key={index}
              className={`text-center py-4 px-3 min-w-[70px] rounded-lg cursor-pointer transition-all duration-200 ${
                slotIndex === index ? 'bg-primary text-white shadow-md' : 'border border-gray-300 bg-white text-gray-700'
              }`}
            >
              <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
              <p>{item[0] && item[0].datetime.getDate()}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap mt-4">
          {docSlots.length > 0 && docSlots[slotIndex].map((item, index) => (
            <p
              key={index}
              onClick={() => setSlotTime(item.time)}
              className={`text-sm px-5 py-2 rounded-full cursor-pointer transition ${
                slotTime === item.time
                  ? 'bg-primary text-white shadow'
                  : 'border border-gray-300 text-gray-600 bg-white'
              }`}
            >
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>

        <button
          onClick={bookAppointment}
          className="bg-primary text-white text-sm font-medium px-10 py-3 rounded-full mt-6 hover:bg-purple-900 transition"
        >
          Book an Appointment
        </button>
      </div>

      {/* Related Doctors */}
      <div className="mt-12">
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    </div>
  )
}

export default Appointment