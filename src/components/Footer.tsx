import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} FINDMYRAVE. All rights reserved.
          </div>
          
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <Link 
              href="/legal/privacy-policy"
              className="hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/legal/terms"
              className="hover:text-blue-600 transition-colors"
            >
              Terms of Service
            </Link>
            <a 
              href="mailto:support@findmyrave.com"
              className="hover:text-blue-600 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 