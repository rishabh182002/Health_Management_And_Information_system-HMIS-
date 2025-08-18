import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext)
  const [state, setState] = useState('Sign Up')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const navigate = useNavigate()

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/user/register', { name, password, email })
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/user/login', { email, password })
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center bg-background'>
      <div className='flex flex-col gap-4 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-2xl bg-white text-zinc-600 text-sm shadow-xl'>
        <p className='text-3xl font-bold text-primary'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p className='text-gray-500'>Please {state === 'Sign Up' ? "sign up" : "log in"} to book appointment</p>

        {state === "Sign Up" && (
          <div className='w-full'>
            <p className='mb-1 text-gray-700'>Full Name</p>
            <input
              className='border border-zinc-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-primary-light'
              type='text'
              placeholder='Enter your name'
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>
        )}

        <div className='w-full'>
          <p className='mb-1 text-gray-700'>Email</p>
          <input
            className='border border-zinc-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-primary-light'
            type='email'
            placeholder='Enter your email'
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>

        <div className='w-full'>
          <p className='mb-1 text-gray-700'>Password</p>
          <input
            className='border border-zinc-300 rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-primary-light'
            type='password'
            placeholder='Enter your password'
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
          />
        </div>

        <button
          type='submit'
          className='bg-primary hover:bg-primary-light transition-all text-white w-full py-2 rounded-md font-medium'
        >
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </button>

        {state === "Sign Up" ? (
          <p className='text-gray-600'>
            Already have an account?{' '}
            <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>
              Login here
            </span>
          </p>
        ) : (
          <p className='text-gray-600'>
            Create a new account?{' '}
            <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  )
}

export default Login