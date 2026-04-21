import { useUIStore } from '@/store'

export function NotificationCenter() {
  const { notifications, removeNotification } = useUIStore()
  const colorMap = {
    success: 'border-emerald-500',
    error: 'border-red-500',
    warning: 'border-amber-500',
    info: 'border-indigo-500',
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start justify-between gap-3 rounded-lg border-l-4 bg-white p-3 shadow-lg ${colorMap[notification.type]}`}
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-sm font-semibold text-slate-800">
              {notification.type === 'success' && '✓'}
              {notification.type === 'error' && '✕'}
              {notification.type === 'warning' && '⚠'}
              {notification.type === 'info' && 'ℹ'}
            </span>
            <span className="text-sm text-slate-700">{notification.message}</span>
          </div>
          <button
            type="button"
            className="rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            onClick={() => removeNotification(notification.id)}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

export default NotificationCenter
