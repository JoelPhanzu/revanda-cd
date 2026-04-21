import { useState } from 'react'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { useUserStore } from '@/store/userStore'

export function SettingsPage() {
  const { preferences, paymentMethods, addresses, setPreferences, setPaymentMethods, setAddresses } =
    useUserStore()
  const [email, setEmail] = useState('user@revanda.com')
  const [password, setPassword] = useState('')
  const [newPaymentMethod, setNewPaymentMethod] = useState('')
  const [newAddress, setNewAddress] = useState('')

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Settings</h1>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Account settings</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input
            label="Change password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <Button className="mt-4">Update account</Button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Notification preferences</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={(event) => setPreferences({ emailNotifications: event.target.checked })}
            />
            Email notifications
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.smsNotifications}
              onChange={(event) => setPreferences({ smsNotifications: event.target.checked })}
            />
            SMS notifications
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Privacy settings</h2>
        <select
          value={preferences.profileVisibility}
          onChange={(event) =>
            setPreferences({
              profileVisibility: event.target.value as typeof preferences.profileVisibility,
            })
          }
          className="mt-3 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm md:max-w-sm"
        >
          <option value="private">Private</option>
          <option value="contacts">Contacts</option>
          <option value="public">Public</option>
        </select>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Payment methods</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {paymentMethods.map((method) => (
              <li key={method} className="rounded-md border border-slate-100 p-2">
                {method}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Add payment method"
              value={newPaymentMethod}
              onChange={(event) => setNewPaymentMethod(event.target.value)}
            />
            <Button
              type="button"
              onClick={() => {
                if (!newPaymentMethod.trim()) {
                  return
                }
                setPaymentMethods([...paymentMethods, newPaymentMethod.trim()])
                setNewPaymentMethod('')
              }}
            >
              Add
            </Button>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Addresses</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {addresses.map((address) => (
              <li key={address} className="rounded-md border border-slate-100 p-2">
                {address}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Add address"
              value={newAddress}
              onChange={(event) => setNewAddress(event.target.value)}
            />
            <Button
              type="button"
              onClick={() => {
                if (!newAddress.trim()) {
                  return
                }
                setAddresses([...addresses, newAddress.trim()])
                setNewAddress('')
              }}
            >
              Add
            </Button>
          </div>
        </article>
      </section>
    </div>
  )
}

export default SettingsPage
