import React, { useEffect } from 'react'
import { useState,useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
const UserAuth = ({children}) => {
    const navigate = useNavigate()
    const [loading, setloading] = useState(true)
    const {user} = useContext(UserContext)
    const token =localStorage.getItem('token')

    useEffect(() => {
        if(user){
            setloading(false)
        }
        if(!token){
            navigate('/login')
        }
        if(!user){
            navigate('/login')
        }
        
    },[])       
    if(loading){
        return (
            <div>
                Loading...
            </div>
        )
    }
  return (
    <>
    {children}
    </>
  )
}

export default UserAuth