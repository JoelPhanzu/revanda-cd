import { Input } from './Input'
import { Button } from './Button'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Revanda</h3>
          <p className="mt-2 text-sm text-slate-600">Smart marketplace for modern businesses.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>About</li>
            <li>Contact</li>
            <li>Careers</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Support</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Help center</li>
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Newsletter</h4>
          <form className="mt-3 space-y-2" onSubmit={(event) => event.preventDefault()}>
            <Input type="email" placeholder="Enter your email" aria-label="Newsletter email" />
            <Button type="submit" className="w-full">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Revanda. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
