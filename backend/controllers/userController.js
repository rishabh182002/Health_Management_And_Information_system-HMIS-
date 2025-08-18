//api to register the user,login the user
import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import doctorModel from '../models/doctorModel.js'
import jwt from 'jsonwebtoken'
import { json } from 'express'
import appointmentModel from '../models/appointmentModel.js'
import{v2 as cloudinary} from 'cloudinary'
import razorpay from 'razorpay'
const registerUser=async(req,res)=>{
    try {
        const{name,email,password}=req.body
        if(!name||!email||!password)
        {
            res.json({success:false,message:"missing details"})
        }
        if(!validator.isEmail(email))
        {
            res.json({success:false,message:"invalid email"})
        }
        if(password.length<8)
        {
            res.json({success:false,message:"enter password longer than 8 characters"})
        }
        //hashing user password
        const salt=await bcrypt.genSalt(10)
        const hashpassword=await bcrypt.hash(password,salt)
        const userData={
            name,
            email,
            password:hashpassword,
        }
        const newUser=new userModel(userData)
        const user= await newUser.save()
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
        res.json({success:true,token})
        
    } catch (error) {
         console.log(error)
        res.json({success:false,message:error.message})    
    }
}
//api for user login
const userLogin=async(req,res)=>{
    try {
        const {email,password}=req.body
        const user=await userModel.findOne({email})
        if(!user)
        {
            return res.json({success:false,message:"invalid email"})
        }
       const isMatch=await bcrypt.compare(password,user.password)
        if(isMatch)
        {
            const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
            res.json({success:true,token})
        }
        else{
            res.json({success:false,message:"invalid credentials"})
        }
        
    } catch (error) {
         console.log(error)
        res.json({success:false,message:error.message})    
    }
}
//api to get profile details
const getprofile=async(req,res)=>{
    try {
        const{userId}=req.body
        const userData=await userModel.findById(userId).select('-password')
        res.json({success:true,userData})

        
    } catch (error) {
         console.log(error)
        res.json({success:false,message:error.message})  
        
    }
}
//api for user update
const updateProfile=async(req,res)=>{
    try {
        const {userId,name,phone,address,dob,gender}=req.body
        const imageFile=req.file
        if(!name||!phone||!address||!dob||!gender)
        {
            return res.json({success:false,message:"data missing"})
        }
        await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender})
        if(imageFile)
        {
            //upload imagefile to cloudanairy
            const imageUpload=await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
            const imageURL=imageUpload.secure_url
            await userModel.findByIdAndUpdate(userId,{image:imageURL})
        }
        res.json({success:true,message:"profile updated"})
    } catch (error) {
         console.log(error)
        res.json({success:false,message:error.message}) 
        
    }

}
//api to book doctors appointment
const bookAppointment=async(req,res)=>{
    try {
        const {userId,docId,slotDate,slotTime}=req.body
        const docData=await doctorModel.findById(docId).select("-password")
        if(!docData.available)
        {
            return res.json({success:false,message:"doc is not available"})
        }
        let slots_booked=docData.slots_booked
        if(slots_booked[slotDate])
        {
            if(slots_booked[slotDate].includes(slotTime)){
                return res.json({success:false,message:"slots not available"})
            }
            else{
                slots_booked[slotDate].push(slotTime)
            }
        }
        else{
            slots_booked[slotDate]=[]
            slots_booked[slotDate].push(slotTime)
        }
        const userData=await userModel.findById(userId).select("-password")
        delete docData.slots_booked
        const appointmentData={
            userId,docId,userData,docData,
            amount:docData.fees,
            slotTime,
            slotDate,
            date:Date.now()
        }
        const newAppointment=new appointmentModel(appointmentData)
        await newAppointment.save()
        await doctorModel.findByIdAndUpdate(docId,{slots_booked})
        res.json({success:true,message:"Appointment Booked"})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message}) 
    }

}
const listAppointment=async(req,res)=>{
        try {
            const {userId}=req.body
            const appointments=await appointmentModel.find({userId})
            res.json({success:true,appointments})
            
        } catch (error) {
            console.log(error)
        res.json({success:false,message:error.message})   
        }

    }
    // api to cancel appointment
    const cancelAppointment=async(req,res)=>{
        try {
            const {userId,appointmentId}=req.body
            const appointmentData=await appointmentModel.findById(appointmentId)
            //verify appointment
            if(appointmentData.userId!==userId)
            {
                return res.json({success:false,message:"unauthorised action"})
            }
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
    const razorpayInstance=new razorpay({
        key_id:process.env.RAZORPAY_KEY_ID,
        key_secret:process.env.RAZORPAY_KEY_SECRET
    })
    //api for payment gateway
    const paymentRazorpay=async(req,res)=>{
        try {
            const {appointmentId}=req.body
        const appointmentData=await appointmentModel.findById(appointmentId)
        if(!appointmentData||appointmentData.cancelled)
        {
            return res.json({success:false,message:"not found or cancelled"})
        }
        //doing razopay
        const options={
            amount:appointmentData.amount*100,
            currency:process.env.CURRENCY,
            receipt:appointmentId,


        }
        //creation of order
        const order=await razorpayInstance.orders.create(options)
        console.log("hi")
        res.json({success:true,order})
            
        } catch (error) {
             console.log(error)
        res.json({success:false,message:error.message})   
        }  
    }
    //API TO VERIFY THE RAZORPAY PAYMENT
    const verifyRazorpay=async(req,res)=>{
        try {
            const{razorpay_order_id}=req.body
            const orderInfo=await razorpayInstance.orders.fetch(razorpay_order_id)
           if(orderInfo.status==='paid'){
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
            res.json({success:true,message:"Payment successful"})
           }
           else{
            res.json({success:false,message:"Payment Failed"})
           }
        } catch (error) {
             console.log(error)
        res.json({success:false,message:error.message}) 
        }
    }
export {registerUser,userLogin,getprofile,updateProfile,bookAppointment,listAppointment,cancelAppointment,paymentRazorpay,verifyRazorpay}
