import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Doctor = () => {
  const { speciality } = useParams()
  const { doctors } = useContext(AppContext)
  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const navigate = useNavigate()

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality))
    } else {
      setFilterDoc(doctors)
    }
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality])

  return (
    <div className="p-4">
      <p className="text-gray-600 text-xl mb-2">Browse through the doctor specialists</p>
      
      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
        {/* Toggle Button for Mobile Filter */}
        <button
          className={`py-1 px-4 border rounded text-sm transition-all sm:hidden ${
            showFilter ? 'bg-primary text-white' : ''
          }`}
          onClick={() => setShowFilter(prev => !prev)}
        >
          {showFilter ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Filter Sidebar */}
        <div
          className={`flex-col gap-4 text-sm text-gray-600 ${
            showFilter ? 'flex' : 'hidden sm:flex'
          }`}
        >
          {[
            'General physician',
            'Gynecologist',
            'Dermatologist',
            'Pediatricians',
            'Neurologist',
            'Gastroenterologist'
          ].map(spec => (
            <p
              key={spec}
              onClick={() =>
                speciality === spec
                  ? navigate('/doctors')
                  : navigate(`/doctors/${spec}`)
              }
              className={`w-[94vw] sm:w-auto px-3 py-1.5 border border-gray-300 rounded cursor-pointer transition-all ${
                speciality === spec ? 'bg-primary-light text-black font-medium' : ''
              }`}
            >
              {spec}
            </p>
          ))}
        </div>

        {/* Doctor Cards Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filterDoc.map(item => (
            <div
              key={item._id}
              onClick={() => navigate(`/appointment/${item._id}`)}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-500 shadow-sm hover:shadow-md"
            >
              <img className="bg-blue-50 w-full h-40 object-cover" src={item.image} alt="" />
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-green-500 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <p>Available</p>
                </div>
                <p className="text-gray-900 text-lg font-medium">{item.name}</p>
                <p className="text-gray-600 text-sm">{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Doctor