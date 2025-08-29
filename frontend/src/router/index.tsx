import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from 'react-router-dom'
import { DashBoard } from '../pages/DashBoard'
import { LoginPage } from '../pages/Login'
import { SignUpPage } from '../pages/SignUp'
import { ChangePasswordPage } from '../pages/ChangePassword'
import { useUser } from '../context'

export const RouterWrapper = () => {
  const { user } = useUser()

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/'>
        <Route index element={user ? <DashBoard /> : <Navigate to='/login' />} />
        <Route path='/dashboard' element={user ? <DashBoard /> : <Navigate to='/login' />} />
        <Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/dashboard' />} />
        {/* <Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/login' />} /> */}
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path='*' element={user ? <DashBoard /> : <LoginPage />} />
      </Route>
    )
  )

  return <RouterProvider router={router} />
}