import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './screens/Home'
import About from './screens/About'
import Contact from './screens/Contact'
import Doctor from './screens/Doctor'
import Login from './screens/Login'
import MyAppointment from './screens/MyAppointment'
import MyProfile from './screens/MyProfile'
import Appointment from './screens/Appointment'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ToastContainer, toast } from 'react-toastify'
import GlobalSocketListener from './components/GlobalSocketListener';
const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <GlobalSocketListener />
      <ToastContainer/>
      <Navbar/>
      <Routes>
        <Route path='/'element={<Home/>}/>
         <Route path='/about'element={<About/>}/>
          <Route path='/contact'element={<Contact/>}/>
           <Route path='/doctors'element={<Doctor/>}/>
           <Route path='/doctors/:speciality'element={<Doctor/>}/>
            <Route path='/login'element={<Login/>}/>
             <Route path='/myAppointment'element={<MyAppointment/>}/>
              <Route path='/myProfile'element={<MyProfile/>}/>
              <Route path='/appointment/:docId' element={<Appointment/>}/>
             
      </Routes>
      <Footer/>
    </div>
  )
}

export default App