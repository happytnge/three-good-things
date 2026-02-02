import SignupForm from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            新規登録
          </h1>
          <p className="text-gray-700 leading-relaxed">
            Three Good Things を始めましょう
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-300 p-8">
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
