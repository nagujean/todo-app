'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/store/authStore'
import { useInvitationStore, isInvitationExpired } from '@/store/invitationStore'

interface InvitationData {
  id: string
  teamId: string
  teamName: string
  type: 'email' | 'link'
  email?: string
  role: string
  status: 'pending' | 'accepted' | 'declined'
  expiresAt: string
  maxUses?: number
  uses?: number
}

type PageState = 'loading' | 'not_found' | 'expired' | 'already_used' | 'email_mismatch' | 'valid' | 'accepting' | 'success' | 'error'

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()
  const invitationId = params.invitationId as string

  const { user, initialized } = useAuthStore()
  const { acceptInvitation } = useInvitationStore()

  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [pageState, setPageState] = useState<PageState>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    if (!initialized) return

    async function fetchInvitation() {
      if (!db) {
        setPageState('error')
        setErrorMessage('Database connection error')
        return
      }

      try {
        const invitationRef = doc(db, 'invitations', invitationId)
        const invitationDoc = await getDoc(invitationRef)

        if (!invitationDoc.exists()) {
          setPageState('not_found')
          return
        }

        const data = invitationDoc.data()
        const expiresAt = data.expiresAt instanceof Timestamp
          ? data.expiresAt.toDate().toISOString()
          : data.expiresAt

        const invitationData: InvitationData = {
          id: invitationDoc.id,
          teamId: data.teamId,
          teamName: data.teamName,
          type: data.type,
          email: data.email,
          role: data.role,
          status: data.status,
          expiresAt,
          maxUses: data.maxUses,
          uses: data.uses,
        }

        setInvitation(invitationData)

        if (isInvitationExpired(expiresAt)) {
          setPageState('expired')
          return
        }

        if (data.status !== 'pending') {
          setPageState('already_used')
          return
        }

        if (data.type === 'link' && data.maxUses && data.uses >= data.maxUses) {
          setPageState('already_used')
          return
        }

        if (data.type === 'email' && user && data.email !== user.email?.toLowerCase()) {
          setPageState('email_mismatch')
          return
        }

        setPageState('valid')
      } catch (error) {
        console.error('Error fetching invitation:', error)
        setPageState('error')
        setErrorMessage('Failed to load invitation')
      }
    }

    fetchInvitation()
  }, [invitationId, initialized, user])

  const handleAccept = async () => {
    if (!user || !invitation) return

    setPageState('accepting')

    try {
      const success = await acceptInvitation(
        invitationId,
        user.uid,
        user.email || '',
        user.displayName || ''
      )

      if (success) {
        setPageState('success')
        setTimeout(() => {
          router.push('/teams')
        }, 2000)
      } else {
        setPageState('error')
        setErrorMessage('Failed to accept invitation. Please try again.')
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      setPageState('error')
      setErrorMessage('An error occurred while accepting the invitation.')
    }
  }

  const handleDecline = () => {
    router.push('/')
  }

  const handleLogin = () => {
    const returnUrl = encodeURIComponent(`/join/${invitationId}`)
    router.push(`/login?returnUrl=${returnUrl}`)
  }

  if (!initialized || pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-600 mb-6">
            Please log in to accept the team invitation.
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Log In
          </button>
        </div>
      </div>
    )
  }

  if (pageState === 'not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Not Found</h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has been removed.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  if (pageState === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Expired</h1>
          <p className="text-gray-600 mb-6">
            This invitation has expired. Please request a new invitation from the team admin.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  if (pageState === 'already_used') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Already Used</h1>
          <p className="text-gray-600 mb-6">
            This invitation has already been used or reached its maximum number of uses.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  if (pageState === 'email_mismatch') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Mismatch</h1>
          <p className="text-gray-600 mb-4">
            This invitation was sent to <strong>{invitation?.email}</strong>.
          </p>
          <p className="text-gray-600 mb-6">
            You are logged in as <strong>{user.email}</strong>. Please log in with the correct email address.
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Log In with Different Account
          </button>
        </div>
      </div>
    )
  }

  if (pageState === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to the Team!</h1>
          <p className="text-gray-600 mb-6">
            You have successfully joined <strong>{invitation?.teamName}</strong>.
            Redirecting to your teams...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Invitation</h1>
          <p className="text-gray-600">
            You have been invited to join
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">{invitation?.teamName}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Role: <span className="font-medium capitalize">{invitation?.role}</span>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleAccept}
            disabled={pageState === 'accepting'}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {pageState === 'accepting' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Joining...
              </>
            ) : (
              'Accept Invitation'
            )}
          </button>
          <button
            onClick={handleDecline}
            disabled={pageState === 'accepting'}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Decline
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Logged in as {user.email}
        </p>
      </div>
    </div>
  )
}
