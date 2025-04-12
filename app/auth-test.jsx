'use client'

import { useAuth } from '@/hooks/useAuth'

export default function AuthTest() {
  const { user, loading } = useAuth()
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Auth Provider Test</h1>
      
      {loading ? (
        <p>Loading authentication state...</p>
      ) : user ? (
        <div>
          <p className="text-green-600">✅ AuthProvider is working correctly!</p>
          <p>Logged in as: {user.email}</p>
        </div>
      ) : (
        <div>
          <p className="text-green-600">✅ AuthProvider is working correctly!</p>
          <p>Not logged in</p>
        </div>
      )}
    </div>
  )
} 