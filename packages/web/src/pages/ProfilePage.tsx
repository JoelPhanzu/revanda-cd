import { useState } from 'react'
import { useAuthStore } from '@/store'
import { useUserStore } from '@/store/userStore'
import { Input } from '@/components/Input'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { formatDate, formatPrice } from '@/utils/formatters'

export function ProfilePage() {
  const { user } = useAuthStore()
  const { profile, orders, wishlist, preferences, setProfile } = useUserStore()
  const [isModalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(profile.phone)

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={profile.avatar} alt={profile.name} className="h-16 w-16 rounded-full object-cover" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
              <p className="text-sm text-slate-600">{user?.email || profile.email}</p>
              <p className="text-sm text-slate-600">{profile.phone}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Edit Profile
          </Button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900">Order history</h2>
          <div className="mt-4 space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold text-slate-900">{order.id}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize text-slate-600">
                    {order.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDate(order.createdAt)} · {formatPrice(order.total)}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900">Wishlist</h2>
          {wishlist.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No products in wishlist yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {wishlist.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                  <img src={item.image} alt={item.name} className="h-12 w-12 rounded-md object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-600">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900">Account preferences</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-100 p-3">
            <p className="text-sm font-medium text-slate-900">Email notifications</p>
            <p className="text-sm text-slate-600">{preferences.emailNotifications ? 'Enabled' : 'Disabled'}</p>
          </div>
          <div className="rounded-lg border border-slate-100 p-3">
            <p className="text-sm font-medium text-slate-900">Profile visibility</p>
            <p className="text-sm text-slate-600 capitalize">{preferences.profileVisibility}</p>
          </div>
        </div>
      </section>

      <Modal isOpen={isModalOpen} title="Edit profile" onClose={() => setModalOpen(false)}>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            setProfile({ name, phone })
            setModalOpen(false)
          }}
        >
          <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ProfilePage
