import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
const changeAvailability=async(req,res)=>{
    try {
        const {docId}=req.body
        const docData=await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId,{available:!docData.available})
        res.json({success:true,message:"availability changed"})


        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
        
    }

}
const doctorList=async(req,res)=>{
    try {
        const doctors=await doctorModel.find({}).select(['-password','-email'])
        res.json({success:true,doctors})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
        
    }
}
//api for doctor login
const loginDoctor = async (req, res) => {

    try {

        const { email, password } = req.body
        const user = await doctorModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {

        const  docId  = req.docId
        const appointments = await appointmentModel.find({ docId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//api to mark the appointment completed for doctor panel
const AppointmentComplete=async(req,res)=>{
    try {
        const {appointmentId}=req.body
        const  docId  = req.docId
        const appointmentData=await appointmentModel.findById(appointmentId)
        if(appointmentData&&appointmentData.docId===docId)
        {
            await appointmentModel.findByIdAndUpdate(appointmentId,{isCompleted:true})
            return res.json({success:true,message:"Appointment completed"})
        }
        else{
            res.json({success:false,message:"appointment not completed"})
        }
        
    } catch (error) {
         console.log(error)
        res.json({ success: false, message: error.message })
        
    }
}
//api for cancellation
const AppointmentCancel=async(req,res)=>{
    try {
        const {appointmentId}=req.body
        const  docId  = req.docId
        const appointmentData=await appointmentModel.findById(appointmentId)
        if(appointmentData&&appointmentData.docId===docId)
        {
            await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})
            return res.json({success:true,message:"Appointment cancelled"})
        }
        else{
            res.json({success:false,message:"cancellation failed"})
        }
        
    } catch (error) {
         console.log(error)
        res.json({ success: false, message: error.message })
        
    }
}
// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {

        const  docId  = req.docId
        console.log(docId)

        const appointments = await appointmentModel.find({ docId })

        let earnings = 0

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []

        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })



        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse()
        }
        console.log(dashData)

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//api to get the doctors profile
const doctorProfile = async (req, res) => {
    try {

         const  docId  = req.docId
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const updateDoctorProfile = async (req, res) => {
    try {

        const {fees, address, available,about } = req.body
         const  docId  = req.docId

        await doctorModel.findByIdAndUpdate(docId, { fees, address, available,about })

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}



export{changeAvailability,doctorList,loginDoctor,appointmentsDoctor,AppointmentComplete,AppointmentCancel,doctorDashboard,doctorProfile,updateDoctorProfile}