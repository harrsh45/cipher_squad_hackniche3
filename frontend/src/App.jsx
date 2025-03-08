import React from 'react'
import {Routes,Route,BrowserRouter} from 'react-router-dom'
import Login from './screens/Login'
import Register from './screens/Register'
import { UserProvider } from './context/user.context.jsx'
import UserAuth from './auth/Userauth'
const App = () => {
  return (
    <UserProvider>
    <BrowserRouter>
        <Routes>
            
            <Route path='/login' element={<Login/>} />
            <Route path='/register' element={<Register/>} />
          
        </Routes>
    </BrowserRouter>
    </UserProvider>
  )
}

export default App