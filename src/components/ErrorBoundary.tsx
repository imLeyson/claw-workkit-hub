import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State { return { hasError: true } }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <div className="text-[60px] font-light text-accent-200 leading-none mb-4">!</div>
          <h2 className="text-[18px] font-medium text-text-main mb-2">页面遇到错误</h2>
          <p className="text-[14px] text-text-muted mb-6">请刷新页面或返回首页重试。</p>
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.reload()} className="btn-primary">刷新页面</button>
            <Link to="/" className="btn-ghost">返回首页</Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
