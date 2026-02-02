'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { validateEmail, validatePassword } from '@/lib/utils/validationUtils'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // バリデーション
    if (!validateEmail(email)) {
      setError('有効なメールアドレスを入力してください')
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || 'パスワードが無効です')
      return
    }

    if (!displayName.trim()) {
      setError('表示名を入力してください')
      return
    }

    setLoading(true)

    const { error: signUpError } = await signUp(email, password, displayName)

    if (signUpError) {
      setError(signUpError.message || '登録に失敗しました')
      setLoading(false)
      return
    }

    // 登録成功
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div>
        <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 mb-2">
          表示名
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500 transition-all duration-150"
          placeholder="山田太郎"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500 transition-all duration-150"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
          パスワード
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500 transition-all duration-150"
          placeholder="8文字以上"
          required
        />
        <p className="mt-1 text-xs text-gray-700">
          8文字以上のパスワードを設定してください
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold shadow-md hover:bg-blue-600 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {loading ? '登録中...' : '新規登録'}
      </button>

      <p className="text-center text-sm text-gray-700">
        既にアカウントをお持ちの方は{' '}
        <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
          ログイン
        </Link>
      </p>
    </form>
  )
}
