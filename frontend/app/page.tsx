import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8">
      <main className="w-full max-w-4xl">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TUTOR
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 px-4">
            Interactive learning powered by Gemini AI and Wolfram Alpha
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>🤖 AI Tutor</CardTitle>
              <CardDescription>
                Learn any topic through conversational AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start interactive learning sessions with an AI tutor that adapts to your pace and style.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>📊 Progress Tracking</CardTitle>
              <CardDescription>
                Monitor your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your progress, earn achievements, and get personalized recommendations.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>🧮 Computational Intelligence</CardTitle>
              <CardDescription>
                Powered by Wolfram Alpha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get step-by-step solutions for mathematical and scientific problems.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>✨ Interactive Quizzes</CardTitle>
              <CardDescription>
                Test your knowledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Practice with AI-generated quizzes tailored to your learning topics.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <Link href="/auth/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
