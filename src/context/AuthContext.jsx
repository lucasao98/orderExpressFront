import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const BASE_URL = 'http://localhost:3002/v1'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cm_user')
    return saved ? JSON.parse(saved) : null
  })

  async function login(email, password) {
    try {
      const response = await fetch(`${BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        let errorMessage = 'Email ou senha incorretos.'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          // resposta sem corpo JSON, mantém mensagem padrão
        }
        return { ok: false, error: errorMessage }
      }

      const data = await response.json()
      const { token, user_id: userId } = data

      // Busca os dados completos do usuário (name, email, role) antes de liberar acesso
      const userResponse = await fetch(`${BASE_URL}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!userResponse.ok) {
        return { ok: false, error: 'Não foi possível carregar os dados do usuário.' }
      }

      const userData = await userResponse.json()
      const sessionUser = {
        userId,
        token,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      }

      localStorage.setItem('cm_user', JSON.stringify(sessionUser))
      setUser(sessionUser)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: 'Não foi possível conectar ao servidor.' }
    }
  }

  async function register(name, email, password, role = "CLIENT") {
    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      })

      if (!response.ok) {
        let errorMessage = 'Não foi possível criar sua conta.'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          // resposta sem corpo JSON, mantém mensagem padrão
        }
        return { ok: false, error: errorMessage }
      }

      return { ok: true }
    } catch (err) {
      return { ok: false, error: 'Não foi possível conectar ao servidor.' }
    }
  }

  function logout() {
    localStorage.removeItem('cm_user')
    setUser(null)
  }

  function hasRole(role) {
    return user?.role === role
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}