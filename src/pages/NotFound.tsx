import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div className="text-[80px] font-light text-accent-200 leading-none mb-4">404</div>
      <h2 className="text-[20px] font-medium text-text-main mb-2">页面不存在</h2>
      <p className="text-[14px] text-text-muted mb-8">你访问的页面可能已被移除或地址有误。</p>
      <Link to="/" className="btn-primary-filled">
        返回看板 <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
