'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LazyQuizInterface } from '@/components/quiz/LazyQuizComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  quizAPI,
  Question,
  Feedback,
  GenerateQuizRequest,
} from '@/lib/api-client';

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const [topic, setTopic] = useState(searchParams.get('topic') || '');
  const [difficulty, setDifficulty] = useState('medium');
  const [quizId, setQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If topic is provided in URL, auto-generate quiz
    const urlTopic = searchParams.get('topic');
    if (urlTopic && !isQuizStarted && !isGenerating) {
      setTopic(urlTopic);
      handleGenerateQuiz(urlTopic, difficulty);
    }
  }, [searchParams]);

  const handleGenerateQuiz = async (quizTopic?: string, quizDifficulty?: string) => {
    const topicToUse = quizTopic || topic;
    const difficultyToUse = quizDifficulty || difficulty;

    if (!topicToUse.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const request: GenerateQuizRequest = {
        topic: topicToUse,
        difficulty: difficultyToUse,
        count: 5, // Default to 5 questions
      };

      const response = await quizAPI.generateQuiz(request);
      setQuizId(response.quiz_id);
      setQuestions(response.questions);
      setIsQuizStarted(true);
    } catch (err: any) {
      console.error('Failed to generate quiz:', err);
      console.error('Error response:', err.response?.data);
      const errorDetail = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to generate quiz. Please try again.';
      setError(errorDetail);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitQuiz = async (
    answers: { question_id: string; selected_answer: number }[]
  ) => {
    if (!quizId) return;

    try {
      const response = await quizAPI.submitQuiz({
        quiz_id: quizId,
        answers,
      });

      setScore(response.score);
      setFeedback(response.feedback);
    } catch (err: any) {
      console.error('Failed to submit quiz:', err);
      setError(
        err.response?.data?.error || 'Failed to submit quiz. Please try again.'
      );
    }
  };

  const handleQuizComplete = (finalScore: number, finalFeedback: Feedback[]) => {
    setQuizCompleted(true);
    setScore(finalScore);
    setFeedback(finalFeedback);
  };

  const handleRetakeQuiz = () => {
    setIsQuizStarted(false);
    setQuizCompleted(false);
    setQuizId(null);
    setQuestions([]);
    setScore(null);
    setFeedback([]);
    setError(null);
  };

  const handleNewTopic = () => {
    setTopic('');
    setDifficulty('medium');
    handleRetakeQuiz();
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Please log in to take quizzes
            </p>
            <Button onClick={() => router.push('/auth/login')}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Quiz Challenge
        </h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
          Test your knowledge and reinforce your learning
        </p>
      </div>

      {/* Quiz Setup Form */}
      {!isQuizStarted && !quizCompleted && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle>Create Your Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Topic
              </label>
              <Input
                type="text"
                placeholder="Enter a topic (e.g., Python Functions, World War II)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleGenerateQuiz();
                  }
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['easy', 'medium', 'hard'].map((level) => (
                  <Button
                    key={level}
                    variant={difficulty === level ? 'default' : 'outline'}
                    onClick={() => setDifficulty(level)}
                    className="capitalize text-sm sm:text-base"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button
              onClick={() => handleGenerateQuiz()}
              disabled={isGenerating || !topic.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quiz Interface */}
      {isQuizStarted && !quizCompleted && questions.length > 0 && (
        <LazyQuizInterface
          questions={questions}
          onSubmit={handleSubmitQuiz}
          onComplete={handleQuizComplete}
        />
      )}

      {/* Quiz Results */}
      {quizCompleted && score !== null && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Quiz Complete! 🎉
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {Math.round(score)}%
                </div>
                <p className="text-muted-foreground mt-2">
                  You got {feedback.filter((f) => f.correct).length} out of{' '}
                  {questions.length} correct
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                <Button onClick={handleRetakeQuiz} variant="outline" className="w-full sm:w-auto">
                  Retake Quiz
                </Button>
                <Button onClick={handleNewTopic} className="w-full sm:w-auto">Try New Topic</Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Review Your Answers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question, index) => {
                const questionFeedback = feedback.find(
                  (f) => f.question_id === question.id
                );
                const isCorrect = questionFeedback?.correct;

                return (
                  <div
                    key={question.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                          isCorrect
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-2">
                          Question {index + 1}: {question.question || question.text}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Correct Answer: {question.correct_answer !== undefined ? question.options[question.correct_answer] : 'N/A'}
                        </p>
                        {question.explanation && (
                          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                            <p className="text-sm">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
