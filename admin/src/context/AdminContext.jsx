import { createContext, useState } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'
export const AdminContext = createContext();

const AdminContextProvider = ({children}) => {
  const [atoken, setAtoken] = useState(
    localStorage.getItem('aToken') || ''
  );
  const [doctors,setDoctors]=useState([])
  const [appointments,setAppointments]=useState([])
  const [dashData,setDashData]=useState([])

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const changeAvailability=async(docId)=>{
    try {
      const {data}=await axios.post(backendUrl+'/api/admin/change-availability',{docId},{headers:{atoken}})
      if(data.success)
      {
        toast.success(data.message)
        getAllDoctors()
      }
      else{
        toast.error(error.message)
      }

      
    } catch (error) {
      toast.error(error.message)
      
    }

  }
  const getAllDoctors=async()=>{
    try {
      const {data}=await axios.post(backendUrl+'/api/admin/all-doctors',{},{headers:{atoken}})
      if(data.success)
      {
        setDoctors(data.doctors)
        console.log(data.doctors)
      }
      else{
        toast.error(data.message)
      }
      
    } catch (error) {
      toast.error(error.message)
      
    }
  }
  const getAllAppointments=async(req,res)=>{
    try {
      const {data}=await axios.get(backendUrl+'/api/admin/appointments',{headers:{atoken}})
      if(data.success)
      {
        setAppointments(data.appointments)
      }
      else{
        toast.error(data.message)
      }
      
    } catch (error) {
      
    }

  }
  const cancelAppointment = async (appointmentId) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { headers: { atoken } })

            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }
    const getDashData=async()=>{
       try {

            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { atoken } })

            if (data.success) {
                setDashData(data.dashData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

  const value = {
    atoken,
    setAtoken,
    backendUrl,doctors,getAllDoctors,changeAvailability,appointments,setAppointments,getAllAppointments,cancelAppointment,dashData,getDashData
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;