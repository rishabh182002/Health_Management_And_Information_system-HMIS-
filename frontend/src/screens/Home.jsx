import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'

const Home = () => {
  return (
    <div className="flex flex-col gap-8">
      <Header />

      <section className="px-4 sm:px-8 md:px-16 mt-4">
        <SpecialityMenu />
      </section>

      <section className="bg-gray-50 py-8 px-4 sm:px-8 md:px-16">
        <TopDoctors />
      </section>

      <section className="px-4 sm:px-8 md:px-16">
        <Banner />
      </section>
    </div>
  )
}

export default Home