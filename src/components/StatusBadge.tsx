const variants: Record<string, { label: string; cls: string; dot: string }> = {
  draft: { label: '草稿', cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  pending: { label: '待生成', cls: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
  ready: { label: '可分析', cls: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.5)]' },
  generated: { label: '已生成', cls: 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200', dot: 'bg-purple-500 shadow-[0_0_4px_rgba(124,58,237,0.5)]' },
  in_progress: { label: '进行中', cls: 'bg-gradient-to-r from-ai-50 to-blue-50 text-ai-700 border border-ai-200', dot: 'bg-ai-500 shadow-[0_0_4px_rgba(59,130,246,0.5)]' },
  submitted: { label: '已提交', cls: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]' },
  completed: { label: '已完成', cls: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]' },
}

export default function StatusBadge({ status }: { status: string }) {
  const v = variants[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${v.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
      {v.label}
    </span>
  )
}
