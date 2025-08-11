"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { MockAuthService } from "@/lib/mock-auth"

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface Company {
  id: string
  name: string
  industry: string
  size: string
  website: string
}

interface AuthContextType {
  user: User | null
  company: Company | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: { message: string } }>
  signUp: (
    email: string,
    password: string,
    companyName: string,
    fullName: string,
  ) => Promise<{ error?: { message: string } }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize the auth system
    const initAuth = async () => {
      try {
        console.log("🔄 Initializing auth system...")

        // Initialize mock users and storage
        MockAuthService.initializeUsers()

        // Check for existing session
        const session = MockAuthService.getSession()
        if (session.data.session?.user) {
          const currentUser = MockAuthService.getCurrentUser()
          if (currentUser) {
            setUser(currentUser.user)
            setCompany(currentUser.company)
            console.log("✅ Restored session for:", currentUser.user.email)
          }
        } else {
          console.log("ℹ️ No existing session found")
        }
      } catch (error) {
        console.error("❌ Error initializing auth:", error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log("🔐 Signing in user:", email)

      const result = await MockAuthService.signIn(email, password)

      if (result.error) {
        console.log("❌ Sign in failed:", result.error.message)
        return { error: result.error }
      }

      if (result.data.session?.user) {
        const currentUser = MockAuthService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser.user)
          setCompany(currentUser.company)
          console.log("✅ Sign in successful for:", currentUser.user.email)
        }
      }

      return {}
    } catch (error) {
      console.error("❌ Sign in error:", error)
      return { error: { message: "An unexpected error occurred" } }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, companyName: string, fullName: string) => {
    try {
      setLoading(true)
      console.log("📝 Signing up user:", email)

      const result = await MockAuthService.signUp(email, password, companyName, fullName)

      if (result.error) {
        console.log("❌ Sign up failed:", result.error.message)
        return { error: result.error }
      }

      if (result.data.user) {
        const currentUser = MockAuthService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser.user)
          setCompany(currentUser.company)
          console.log("✅ Sign up successful for:", currentUser.user.email)
        }
      }

      return {}
    } catch (error) {
      console.error("❌ Sign up error:", error)
      return { error: { message: "An unexpected error occurred" } }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      console.log("🚪 Signing out user")

      await MockAuthService.signOut()
      setUser(null)
      setCompany(null)

      console.log("✅ Sign out successful")
    } catch (error) {
      console.error("❌ Sign out error:", error)
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    company,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
