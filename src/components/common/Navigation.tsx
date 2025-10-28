import { Button } from '@/components';
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              AIStyleHub
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/body-parts" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Body Parts Composer
              </Link>
              <Link 
                href="/generate-image" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Generate Image
              </Link>
              <Link 
                href="/products" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Products
              </Link>
              <Link 
                href="/recommend" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Recommend
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
