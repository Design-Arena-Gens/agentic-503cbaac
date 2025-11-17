'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { FaTwitter, FaFacebook, FaLinkedin, FaInstagram, FaPlus, FaTrash } from 'react-icons/fa'

interface SocialAccount {
  id: string
  platform: string
  accountName: string
  accountId: string
  isActive: boolean
  createdAt: string
}

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/social/accounts')
      const data = await response.json()
      setAccounts(data.accounts || [])
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return

    try {
      const response = await fetch('/api/social/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      })

      if (response.ok) {
        setAccounts(accounts.filter(acc => acc.id !== accountId))
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <FaTwitter className="text-blue-400 text-3xl" />
      case 'facebook':
        return <FaFacebook className="text-blue-600 text-3xl" />
      case 'linkedin':
        return <FaLinkedin className="text-blue-700 text-3xl" />
      case 'instagram':
        return <FaInstagram className="text-pink-600 text-3xl" />
      default:
        return null
    }
  }

  const availablePlatforms = [
    { id: 'twitter', name: 'Twitter', icon: FaTwitter, color: 'text-blue-400' },
    { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: 'text-blue-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, color: 'text-blue-700' },
    { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: 'text-pink-600' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Social Accounts</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FaPlus className="mr-2" />
            Connect Account
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">No social accounts connected yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FaPlus className="mr-2" />
              Connect Your First Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div key={account.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  {getPlatformIcon(account.platform)}
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{account.accountName}</h3>
                <p className="text-sm text-gray-500 capitalize">{account.platform}</p>
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">Connect Social Account</h2>
              <div className="space-y-4">
                {availablePlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => {
                      alert(`OAuth integration for ${platform.name} would be implemented here. You need to set up OAuth apps for each platform and add the credentials to your .env file.`)
                      setShowAddModal(false)
                    }}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
                  >
                    <platform.icon className={`${platform.color} text-2xl`} />
                    <span className="text-lg font-medium">Connect {platform.name}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="mt-6 w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
