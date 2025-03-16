'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      router.push('/');
      router.refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 flex flex-col">
      <Head>
        <title>CISOFT - Login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="px-3 py-2 bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xl font-bold text-purple-600">CSOFT</span>
          </div>
          <nav className="flex space-x-4">
            <Link href="/home" className="text-sm text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/services" className="text-sm text-gray-600 hover:text-gray-900">Services</Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">About Us</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-3 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
          <div className="flex flex-col md:flex-row">
            {/* Left Side - Login Form */}
            <div className="w-full md:w-1/2 p-4">
              <div className="mb-3">
                <h2 className="text-xl font-bold mb-1">Welcome Back 👋</h2>
                <p className="text-gray-500 text-xs">Please enter your details to access your account</p>
              </div>
              {error && (
                <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-xs">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                    placeholder="yourname@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-1" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-1.5 px-3 rounded-md transition duration-300 text-sm"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              
              <p className="text-center text-xs text-gray-500 mt-3">
                Don't have an account yet? <Link href="/auth/signup" className="text-orange-500 hover:text-orange-600">Sign up</Link>
              </p>
            </div>
            
            {/* Right Side - Image */}
            <div className="hidden md:block w-1/2 relative h-[350px]">
              <Image 
                src="https://images.unsplash.com/photo-1543269664-56d93c1b41a6?auto=format&fit=crop"
                alt="Professional person smiling"
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
      <footer className="py-2 text-center text-white text-xs mt-auto">
        <div className="container mx-auto">
          <p>© 2023 Career Services Platform. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}