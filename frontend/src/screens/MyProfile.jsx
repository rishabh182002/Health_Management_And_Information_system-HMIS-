import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyProfile = () => {
  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)

  const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)

  const updateUserProfileData = async () => {
    try {
      const formData = new FormData()
      formData.append('name', userData.name)
      formData.append('phone', userData.phone)
      formData.append('address', JSON.stringify(userData.address))
      formData.append('gender', userData.gender)
      formData.append('dob', userData.dob)
      image && formData.append('image', image)

      const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })

      if (data.success) {
        toast.success(data.message)
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  return userData ? (
    <div className="max-w-3xl mx-auto px-6 py-10 text-gray-700">
      <div className="flex flex-col items-center gap-4 mb-8">
        {isEdit ? (
          <label htmlFor="image" className="cursor-pointer relative group">
            <img
              className="w-36 h-36 rounded-full object-cover border-4 border-gray-300 group-hover:opacity-70"
              src={image ? URL.createObjectURL(image) : userData.image}
              alt=""
            />
            {!image && (
              <img
                className="w-10 absolute bottom-0 right-2 bg-white rounded-full p-1"
                src={assets.upload_icon}
                alt=""
              />
            )}
            <input type="file" id="image" hidden onChange={(e) => setImage(e.target.files[0])} />
          </label>
        ) : (
          <img
            className="w-36 h-36 rounded-full object-cover border-4 border-gray-300"
            src={userData.image}
            alt=""
          />
        )}

        {isEdit ? (
          <input
            type="text"
            value={userData.name}
            onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
            className="text-2xl font-semibold text-center border-b p-1 outline-none bg-gray-50 w-64"
          />
        ) : (
          <h1 className="text-3xl font-semibold">{userData.name}</h1>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold underline text-gray-800 mb-2">Contact Information</h2>
          <div className="grid grid-cols-[120px_1fr] gap-4 text-sm">
            <span className="font-medium">Email:</span>
            <span className="text-blue-600">{userData.email}</span>

            <span className="font-medium">Phone:</span>
            {isEdit ? (
              <input
                type="text"
                value={userData.phone}
                onChange={(e) => setUserData((prev) => ({ ...prev, phone: e.target.value }))}
                className="bg-gray-50 px-3 py-1 rounded border outline-none"
              />
            ) : (
              <span className="text-blue-600">{userData.phone}</span>
            )}

            <span className="font-medium">Address:</span>
            {isEdit ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={userData.address.line1}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line1: e.target.value },
                    }))
                  }
                  className="bg-gray-50 px-3 py-1 rounded border outline-none w-full"
                />
                <input
                  type="text"
                  value={userData.address.line2}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      address: { ...prev.address, line2: e.target.value },
                    }))
                  }
                  className="bg-gray-50 px-3 py-1 rounded border outline-none w-full"
                />
              </div>
            ) : (
              <span className="text-gray-600">
                {userData.address.line1} <br />
                {userData.address.line2}
              </span>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold underline text-gray-800 mb-2">Basic Information</h2>
          <div className="grid grid-cols-[120px_1fr] gap-4 text-sm">
            <span className="font-medium">Gender:</span>
            {isEdit ? (
              <select
                value={userData.gender}
                onChange={(e) => setUserData((prev) => ({ ...prev, gender: e.target.value }))}
                className="bg-gray-50 px-3 py-1 rounded border outline-none w-32"
              >
                <option value="Not Selected">Not Selected</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : (
              <span>{userData.gender}</span>
            )}

            <span className="font-medium">Birthday:</span>
            {isEdit ? (
              <input
                type="date"
                value={userData.dob}
                onChange={(e) => setUserData((prev) => ({ ...prev, dob: e.target.value }))}
                className="bg-gray-50 px-3 py-1 rounded border outline-none w-40"
              />
            ) : (
              <span>{userData.dob}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        {isEdit ? (
          <button
            onClick={updateUserProfileData}
            className="bg-primary border border-primary text-white px-8 py-2 rounded-full hover:bg-opacity-90 transition"
          >
            Save Information
          </button>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className="border border-primary text-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  ) : null
}

export default MyProfile