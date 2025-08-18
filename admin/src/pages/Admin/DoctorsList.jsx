import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";

const DoctorsList = () => {
  const { atoken, doctors, getAllDoctors, changeAvailability } = useContext(AdminContext);

  useEffect(() => {
    if (atoken) getAllDoctors();
  }, [atoken]);

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">All Doctors</h1>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {doctors.map((item, index) => (
          <div
            className="border border-gray-200 rounded-2xl overflow-hidden shadow hover:shadow-md transition-all bg-white"
            key={index}
          >
            <img
              className="w-full h-40 object-cover bg-indigo-50 group-hover:bg-primary transition-all duration-300"
              src={item.image}
              alt=""
            />
            <div className="p-4">
              <p className="text-lg font-medium text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-500">{item.speciality}</p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.available}
                  onChange={() => changeAvailability(item._id)}
                  className="accent-primary w-4 h-4"
                />
                <label className="text-gray-600 select-none">Available</label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;