'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { validateEmail } from '@/lib/utils/validationUtils'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // バリデーション
    if (!validateEmail(email)) {
      setError('有効なメールアドレスを入力してください')
      return
    }

    if (!password) {
      setError('パスワードを入力してください')
      return
    }

    setLoading(true)

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      console.error('Login error:', signInError)

      // エラーメッセージを詳細に表示
      if (signInError.message.includes('Email not confirmed')) {
        setError('メールアドレスの確認が完了していません。受信したメールの確認リンクをクリックしてください。')
      } else if (signInError.message.includes('Invalid login credentials')) {
        setError('メールアドレスまたはパスワードが間違っています。')
      } else {
        setError(`ログインエラー: ${signInError.message}`)
      }
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
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
          placeholder="••••••••"
          required
        />
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
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>

      <p className="text-center text-sm text-gray-700">
        アカウントをお持ちでない方は{' '}
        <Link href="/auth/signup" className="text-blue-600 hover:underline font-semibold">
          新規登録
        </Link>
      </p>
    </form>
  )
}
