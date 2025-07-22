import { createContext, useContext, useState, type ReactNode } from 'react'

type User = {
  email: string
  message: string
  phone: string
  userId: string
  username: string
}

type UserContextType = {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<any>>
} | null

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  return (
   <UserContext.Provider value={{ user, setUser }}>
      {children}
   </UserContext.Provider>
  )
}
