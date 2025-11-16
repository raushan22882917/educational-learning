'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformStats } from "@/components/home/PlatformStats";
import { LiveActivityFeed } from "@/components/home/LiveActivityFeed";
import { FeatureShowcase } from "@/components/home/FeatureShowcase";
import { Navbar } from "@/components/home/Navbar";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navbar */}
      <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Powered by Gemini AI & Wolfram Alpha
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Learn Smarter,
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Not Harder
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Your personal AI tutor that adapts to your learning style. Master any subject with interactive lessons, real-time feedback, and computational intelligence.
            </p>

            {/* Hero Illustration */}
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-250">
              <div className="relative max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-4">
                    {/* AI Chat Illustration */}
                    <div className="col-span-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm">AI</div>
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-2 text-xs">
                          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-1"></div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 justify-end">
                        <div className="flex-1 bg-blue-500 rounded-lg p-2 text-xs max-w-[70%]">
                          <div className="h-2 bg-blue-400 rounded w-2/3"></div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white text-xs">U</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm">AI</div>
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-2 text-xs">
                          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-full mb-1"></div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-4/5"></div>
                        </div>
                      </div>
                    </div>
                    {/* Stats Panel */}
                    <div className="space-y-2">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">95%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Accuracy</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">24/7</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Available</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">∞</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Topics</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <button
                onClick={() => router.push('/auth/register')}
                className="w-full sm:w-auto inline-flex items-center justify-center text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all rounded-md text-white font-medium cursor-pointer"
              >
                Start Learning Free
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full sm:w-auto inline-flex items-center justify-center text-lg px-8 py-6 border-2 border-gray-300 dark:border-gray-600 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-md font-medium cursor-pointer transition-all"
              >
                Sign In
              </button>
            </div>

            {/* Animated Stats */}
            <PlatformStats />
          </div>
        </div>
      </section>

      {/* Key Benefits Showcase */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Powerful features that accelerate your learning
            </p>
          </div>
          <FeatureShowcase />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive learning tools designed to help you achieve your goals faster
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {/* Feature 1 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-500 dark:hover:border-blue-400">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  🤖
                </div>
                <CardTitle className="text-xl">AI-Powered Tutoring</CardTitle>
                <CardDescription>Personalized learning experience</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get instant answers and explanations from our advanced AI tutor. Learn at your own pace with adaptive content that matches your skill level.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-purple-500 dark:hover:border-purple-400">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  📊
                </div>
                <CardTitle className="text-xl">Progress Tracking</CardTitle>
                <CardDescription>Monitor your growth</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visualize your learning journey with detailed analytics, streaks, and achievements. Stay motivated with real-time progress updates.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-pink-500 dark:hover:border-pink-400">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  🧮
                </div>
                <CardTitle className="text-xl">Wolfram Integration</CardTitle>
                <CardDescription>Computational intelligence</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Solve complex math and science problems with step-by-step solutions powered by Wolfram Alpha's computational engine.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-green-500 dark:hover:border-green-400">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  ✨
                </div>
                <CardTitle className="text-xl">Interactive Quizzes</CardTitle>
                <CardDescription>Test your knowledge</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Practice with AI-generated quizzes tailored to your learning topics. Get instant feedback and improve your retention.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-orange-500 dark:hover:border-orange-400">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  📚
                </div>
                <CardTitle className="text-xl">YouTube Notebooks</CardTitle>
                <CardDescription>Learn from videos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Transform YouTube videos into interactive notebooks with notes, flashcards, quizzes, and AI-powered insights.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-indigo-500 dark:hover:border-indigo-400">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <CardTitle className="text-xl">Smart Recommendations</CardTitle>
                <CardDescription>Personalized learning path</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get AI-powered topic recommendations based on your interests, progress, and learning goals. Never run out of things to learn.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Start your learning journey in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            <div className="text-center group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Sign Up Free</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create your account in seconds. No credit card required.
              </p>
              <div className="mt-4 flex justify-center">
                <svg className="w-12 h-12 text-blue-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Choose Your Topic</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Pick what you want to learn or let AI recommend topics for you.
              </p>
              <div className="mt-4 flex justify-center">
                <svg className="w-12 h-12 text-purple-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Start Learning</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Engage with your AI tutor and watch your knowledge grow.
              </p>
              <div className="mt-4 flex justify-center">
                <svg className="w-12 h-12 text-pink-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Real-time Learning Preview */}
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden border-2 border-purple-200 dark:border-purple-800">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-white/50"></div>
                    <div className="w-3 h-3 rounded-full bg-white/50"></div>
                    <div className="w-3 h-3 rounded-full bg-white/50"></div>
                  </div>
                  <span className="text-sm font-medium">Live Learning Session</span>
                </div>
              </div>
              <CardContent className="p-6 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      AI
                    </div>
                    <div className="flex-1 bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Let's learn about <span className="font-semibold text-purple-600 dark:text-purple-400">Quantum Physics</span>! What would you like to know?
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 justify-end">
                    <div className="flex-1 max-w-[80%] bg-purple-500 rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-white">
                        Can you explain the double-slit experiment?
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                      U
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      AI
                    </div>
                    <div className="flex-1 bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        Great question! The double-slit experiment demonstrates wave-particle duality...
                      </p>
                      <div className="flex gap-2">
                        <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-xs text-purple-700 dark:text-purple-300">
                          📊 Show Diagram
                        </div>
                        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs text-blue-700 dark:text-blue-300">
                          🧮 Calculate
                        </div>
                        <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-xs text-green-700 dark:text-green-300">
                          ✅ Quiz Me
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Activity Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live Activity
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Learning Happening Right Now
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Join thousands of active learners on the platform
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <LiveActivityFeed />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loved by Learners Worldwide
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              See what our community has to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                  "This platform completely changed how I study. The AI tutor explains concepts in ways that finally make sense to me!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                    SK
                  </div>
                  <div>
                    <div className="font-semibold">Sarah Kim</div>
                    <div className="text-sm text-gray-500">Computer Science Student</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                  "The Wolfram integration is a game-changer for math. I can see step-by-step solutions and actually understand the process."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-bold">
                    MR
                  </div>
                  <div>
                    <div className="font-semibold">Marcus Rodriguez</div>
                    <div className="text-sm text-gray-500">Engineering Major</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                  "I love the progress tracking! Seeing my streak grow keeps me motivated to learn every single day."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold">
                    EP
                  </div>
                  <div>
                    <div className="font-semibold">Emily Patel</div>
                    <div className="text-sm text-gray-500">High School Student</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already achieving their goals with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={() => router.push('/auth/register')}
              className="inline-flex items-center justify-center text-lg px-8 py-6 bg-white text-purple-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all rounded-md font-medium cursor-pointer"
            >
              Get Started for Free
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <div className="flex items-center gap-2 text-white/90">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
          </div>
          
          {/* User Avatars */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-3">
              <div className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">A</div>
              <div className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">B</div>
              <div className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">C</div>
              <div className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">D</div>
              <div className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-bold">E</div>
            </div>
            <p className="text-white/90 text-sm">
              <span className="font-bold">10,247</span> learners joined this week
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 AI Tutor Platform. Empowering learners worldwide.</p>
        </div>
      </footer>
    </div>
  );
}
