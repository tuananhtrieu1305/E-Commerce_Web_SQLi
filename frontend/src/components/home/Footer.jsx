export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-4 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-white mb-4">About Us</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Company Info</li>
            <li className="hover:text-white cursor-pointer">Careers</li>
            <li className="hover:text-white cursor-pointer">Press</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white mb-4">Customer Service</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Contact Us</li>
            <li className="hover:text-white cursor-pointer">FAQ</li>
            <li className="hover:text-white cursor-pointer">Shipping Info</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white mb-4">Policies</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Privacy Policy</li>
            <li className="hover:text-white cursor-pointer">
              Terms of Service
            </li>
            <li className="hover:text-white cursor-pointer">Return Policy</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-white mb-4">Connect</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Facebook</li>
            <li className="hover:text-white cursor-pointer">Instagram</li>
            <li className="hover:text-white cursor-pointer">Twitter</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-700 pt-8 text-center text-sm">
        <p>
          &copy; 2025 NextPick - Your Premium Tech Store. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
