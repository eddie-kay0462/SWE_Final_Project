'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) throw error;
      
      // Navigate to success page or login
      router.push('/signup-success');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 flex flex-col">
      <Head>
        <title>CISOFT - Sign Up</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="px-2 py-2 bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center ">
          <div className="flex items-center">
            <span className="text-base font-bold text-purple-600">CSOFT</span>
          </div>
          <nav className="flex space-x-4">
            <Link href="/home" className="text-xs text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/services" className="text-xs text-gray-600 hover:text-gray-900">Services</Link>
            <Link href="/about" className="text-xs text-gray-600 hover:text-gray-900">About Us</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-2 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl max-w-xl w-full">
          <div className="flex flex-col md:flex-row">
            {/* Left Side - Signup Form */}
            <div className="w-full md:w-1/2 p-3">
              <div className="mb-2">
                <h2 className="text-base font-bold">Create Account 🚀</h2>
                <p className="text-gray-500 text-xs">Join our platform to access career services</p>
              </div>
              
              {error && (
                <div className="mb-2 p-1.5 bg-red-100 border border-red-400 text-red-700 rounded text-xs">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-1.5">
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-0.5" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                    placeholder="Eddie"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-0.5" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                    placeholder="Kay"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-0.5" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                    placeholder="yourname@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-0.5" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-0.5" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-1 px-2 rounded-md transition duration-300 text-xs"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
              
             <p className="text-center text-xs text-gray-500 mt-1.5">
                Already have an account? <Link href="/auth/login" className="text-orange-500 hover:text-orange-600">Sign in</Link>
              </p>
            </div>
            
            {/* Right Side - Image */}
            <div className="hidden md:block w-1/2 relative h-[400px]">
              <Image 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop"
                alt="Professional team collaborating"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-1 text-center text-white text-xs">
        <div className="container mx-auto">
          <p>© 2023 Career Services Platform. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}