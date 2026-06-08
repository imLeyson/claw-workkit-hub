import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp } from '../services/auth'
import { useAuth } from '../components/AuthProvider'
import Logo from '../components/Logo'

export default function Login() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Already logged in → redirect
  if (user) {
    navigate('/', { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (isRegister) {
        await signUp(email, password)
        setSuccess('注册成功！请检查邮箱确认链接。确认后返回此页面登录。')
      } else {
        await signIn(email, password)
        window.location.href = '/'
      }
    } catch (err: any) {
      setError(err.message || '操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo variant="icon" theme="light" size={40} />
          </div>
          <h1 className="text-[22px] font-light tracking-[-0.02em] text-text-main mb-1">PromoKit AI</h1>
          <p className="text-[13px] text-text-muted">电商大促 AI 工作包系统</p>
        </div>

        <form onSubmit={handleSubmit} className="card-surface rounded-2xl p-6 space-y-4">
          <h2 className="text-[16px] font-medium text-text-main text-center mb-1">
            {isRegister ? '注册账号' : '登录'}
          </h2>

          {error && (
            <div className="text-[12px] text-error bg-error-soft rounded-lg px-3 py-2 leading-relaxed">{error}</div>
          )}
          {success && (
            <div className="text-[12px] text-success bg-success-soft rounded-lg px-3 py-2 leading-relaxed">{success}</div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-text-muted mb-1.5">邮箱</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com" required autoFocus
              className="w-full px-3 py-2.5 border border-border-default rounded-xl text-[13px] focus:outline-none focus:border-accent-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-text-muted mb-1.5">密码</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位" required minLength={6}
              className="w-full px-3 py-2.5 border border-border-default rounded-xl text-[13px] focus:outline-none focus:border-accent-400"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="btn-primary-filled w-full justify-center text-[14px] py-3 disabled:opacity-50"
          >
            {loading ? '处理中...' : isRegister ? '注册' : '登录'}
          </button>

          <p className="text-center text-[12px] text-text-muted pt-1">
            {isRegister ? '已有账号？' : '没有账号？'}
            <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess('') }} className="text-accent-600 font-medium ml-1 hover:underline">
              {isRegister ? '去登录' : '去注册'}
            </button>
          </p>
        </form>

        <div className="text-center mt-5 space-y-2">
          <button onClick={() => navigate('/')} className="text-[12px] text-text-muted hover:text-text-secondary transition-colors">
            ← 返回首页（游客模式）
          </button>
        </div>
      </div>
    </div>
  )
}
