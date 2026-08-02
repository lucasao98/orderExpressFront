import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const API_URL = 'http://localhost:3002/v1/auth/signin'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cm_user')
    return saved ? JSON.parse(saved) : null
  })

  async function login(email, password) {
    try {
      const response = await fetch(API_URL, {
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
      // Ajuste conforme o formato de retorno real da sua API
      // (ex: { token, user: { email, ... } })
      const sessionUser = { email, token: data.token, ...data.user }

      localStorage.setItem('cm_user', JSON.stringify(sessionUser))
      setUser(sessionUser)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: 'Não foi possível conectar ao servidor.' }
    }
  }

  function logout() {
    localStorage.removeItem('cm_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}