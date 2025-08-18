import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div className="bg-background min-h-screen px-6 md:px-20 text-sm">
      <div className="text-center text-3xl pt-12 text-primary font-semibold tracking-wide">
        ABOUT <span className="text-gray-800 font-bold">US</span>
      </div>

      <div className="my-12 flex flex-col md:flex-row gap-12 items-center">
        <img className="w-full md:max-w-[360px] rounded-xl shadow-md" src={assets.about_image} alt="About" />
        
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-700">
          <p>
            Welcome to <span className="text-primary font-medium">HMIS</span>, your trusted partner in managing your healthcare needs conveniently and efficiently. At HMIS, we understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records.
          </p>
          <p>
            HMIS is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service. Whether you're booking your first appointment or managing ongoing care, HMIS is here to support you every step of the way.
          </p>

          <b className="text-primary text-lg">Our Vision</b>
          <p>
            Our vision at HMIS is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.
          </p>
        </div>
      </div>

      <div className="text-xl font-semibold my-6 text-primary text-center">
        WHY <span className="text-gray-800">CHOOSE US</span>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-20 justify-center">
        {[
          {
            title: "Efficiency",
            desc: "Streamlined appointment scheduling that fits into your busy lifestyle.",
          },
          {
            title: "Convenience",
            desc: "Access to a network of trusted healthcare professionals in your area.",
          },
          {
            title: "Personalization",
            desc: "Tailored recommendations and reminders to help you stay on top of your health.",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="border border-primary rounded-xl bg-white px-8 md:px-12 py-8 sm:py-14 shadow-md hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer flex flex-col gap-4 w-full md:w-1/3"
          >
            <b className="text-lg">{item.title}:</b>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default About