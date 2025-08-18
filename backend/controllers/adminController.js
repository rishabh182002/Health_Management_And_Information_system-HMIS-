import validator from 'validator'
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import userModel from '../models/userModel.js'


//api for adding doctor
const addDoctor=async(req,res)=>{
    try{
        const {name,email,password,speciality,degree,experience,about,fees,address}=req.body
        const imageFile=req.file
        console.log({name,email,password,speciality,degree,experience,about,fees,address},imageFile)
        if(!name||!email||!password||!speciality||!degree||!experience||!about||!fees||!address)
            return res.json({success:false,message:"Missing details"})
        if(!validator.isEmail(email))
            res.json({success:false,message:"please enter valid email id"})
        if(password.length<8)
            res.json({success:false,message:"please enter a strong password"})
        ///hashing passwords
        const salt=await bcrypt.genSalt(10)
        const hashedpassword=await bcrypt.hash(password,salt)
        //upload image on to cloudinary
        const imageUpload=await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})
        const imageUrl=imageUpload.secure_url
        const doctorData={
            name,
            email,
            image:imageUrl,
            password:hashedpassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address:JSON.parse(address),
            date:Date.now()
        }
        const newDoctor=new doctorModel(doctorData)
        await newDoctor.save()
        res.json({success:true,message:"doctor added to database"})

    }
    catch(error){
            console.log(error)
            res.json({success:false,message:error})
        }
}
///API FOR admin Login
const loginAdmin=async(req,res)=>{
    try {
        const{email,password}=req.body
        if(email===process.env.ADMIN_EMAIL&&password===process.env.ADMIN_PASSWORD)
        {
          const token= jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({success:true,token})
        }
        else{
            res.json({status:false,message:"invalid creadentials"})

        }

    } catch (error) {
        console.log(error)
            res.json({success:false,message:error})
        
    }

}
//api for all doctors
const allDoctors=async(req,res)=>{
    try {
        const doctors=await doctorModel.find({}).select('-password')
        res.json({success:true,doctors})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
        
    }
}
//api to get all appointments list
const appointmentsAdmin=async(req,res)=>{
    try {
        const appointments=await appointmentModel.find({})
        res.json({success:true,appointments})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})

    }

}
//api to cancel appointment from admin side
 const appointmentCancel=async(req,res)=>{
        try {
            const {appointmentId}=req.body
            const appointmentData=await appointmentModel.findById(appointmentId)
            //verify appointment
            
            await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})
            //releasing doctors slot
            const {docId,slotDate,slotTime}=appointmentData
            const docData=await doctorModel.findById(docId)
            let slots_booked=docData.slots_booked
            slots_booked[slotDate]=slots_booked[slotDate].filter(e=>e!==slotTime)
            await doctorModel.findByIdAndUpdate(docId,{slots_booked})
            res.json({success:true,message:"Appointment deleted"})

            
        } catch (error) {
            console.log(error)
        res.json({success:false,message:error.message})   
            
        }
    }
    //api to get dashboard data in admin panel
    const adminDashboard=async(req,res)=>{
        try {
            const doctors=await doctorModel.find({})
            const users=await userModel.find({})
            const appointments=await appointmentModel.find({})
            const dashData={
                doctors:doctors.length,
                appointments:appointments.length,
                patients:users.length,
                latestAppointments:appointments.reverse().slice(0,5)

            }
            res.json({success:true,dashData})
        } catch (error) {
             console.log(error)
        res.json({success:false,message:error.message})     
        }
    }
export{addDoctor,loginAdmin,allDoctors,appointmentsAdmin,appointmentCancel,adminDashboard}
