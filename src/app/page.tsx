import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Three Good Things
        </h1>
        <p className="text-xl text-gray-700 mb-12 leading-relaxed max-w-2xl mx-auto">
          毎日3つの良いことを記録して、<br />ポジティブな習慣を育てましょう
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/auth/signup"
            className="px-8 py-3 bg-blue-500 text-white rounded-xl font-semibold shadow-md hover:bg-blue-600 hover:shadow-lg hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            始める
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-white text-blue-700 rounded-xl font-semibold border-2 border-blue-700 shadow-sm hover:bg-blue-50 hover:shadow-md hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            ログイン
          </Link>
        </div>
      </div>
    </main>
  )
}
