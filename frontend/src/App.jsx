
import React from 'react'
import {Routes,Route,BrowserRouter} from 'react-router-dom'
import Login from './screens/Login'
import Register from './screens/Register'
import { UserProvider } from './context/user.context.jsx'
import UserAuth from './auth/Userauth'
import Home from './screens/Home.jsx'
import Pickwinner from './screens/Pickwinner.jsx'
const App = () => {
  return (
    <UserProvider>
    <BrowserRouter>
        <Routes>
            
            <Route path='/login' element={<Login/>} />
            <Route path='/register' element={<Register/>} />
            <Route path='/' element={<Home/>} />
            <Route path='/pickwinner' element={<Pickwinner/>} />
          
        </Routes>
    </BrowserRouter>
    </UserProvider>
  )
}

export default App
