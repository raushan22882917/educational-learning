'use client';

import React, { useState } from 'react';
import { Question, Feedback } from '@/lib/api-client';
import { QuestionCard } from './QuestionCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuizInterfaceProps {
  questions: Question[];
  onSubmit: (answers: { question_id: string; selected_answer: number }[]) => Promise<void>;
  onComplete: (score: number, feedback: Feedback[]) => void;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  questions,
  onSubmit,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [revealedQuestions, setRevealedQuestions] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isQuestionRevealed = revealedQuestions.has(currentQuestionIndex);
  const questionId = String(currentQuestion.question_id || currentQuestion.id);
  const selectedAnswer = answers.get(questionId) ?? null;
  const canProceed = selectedAnswer !== null;

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isQuestionRevealed) {
      const newAnswers = new Map(answers);
      newAnswers.set(questionId, answerIndex);
      setAnswers(newAnswers);
    }
  };

  const handleCheckAnswer = () => {
    setRevealedQuestions(new Set([...revealedQuestions, currentQuestionIndex]));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    try {
      const answerArray = Array.from(answers.entries()).map(([question_id, selected_answer]) => ({
        question_id,
        selected_answer,
      }));
      
      await onSubmit(answerArray);
      setQuizCompleted(true);
      
      // Calculate score locally for immediate feedback
      let correctCount = 0;
      const feedback: Feedback[] = questions.map((q) => {
        const qId = String(q.question_id || q.id);
        const userAnswer = answers.get(qId);
        const isCorrect = userAnswer === q.correct_answer;
        if (isCorrect) correctCount++;
        
        return {
          question_id: qId,
          correct: isCorrect,
          explanation: q.explanation || '',
        };
      });
      
      const score = (correctCount / questions.length) * 100;
      onComplete(score, feedback);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = answers.size;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>
                {answeredCount} / {questions.length} answered
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={handleAnswerSelect}
        isRevealed={isQuestionRevealed}
      />

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="w-full sm:w-auto min-h-[44px]"
        >
          <span className="hidden sm:inline">← Previous</span>
          <span className="sm:hidden">← Prev</span>
        </Button>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {!isQuestionRevealed && canProceed && (
            <Button onClick={handleCheckAnswer} variant="secondary" className="w-full sm:w-auto min-h-[44px]">
              Check Answer
            </Button>
          )}

          {isQuestionRevealed && !isLastQuestion && (
            <Button onClick={handleNext} className="w-full sm:w-auto min-h-[44px]">
              <span className="hidden sm:inline">Next Question →</span>
              <span className="sm:hidden">Next →</span>
            </Button>
          )}

          {isLastQuestion && answeredCount === questions.length && (
            <Button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto min-h-[44px]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigation Dots */}
      <div className="flex justify-center gap-2 flex-wrap px-2">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestionIndex(index)}
            className={cn(
              'w-10 h-10 sm:w-8 sm:h-8 rounded-full text-xs font-medium transition-all',
              'active:scale-95 touch-manipulation',
              index === currentQuestionIndex
                ? 'bg-primary text-primary-foreground scale-110'
                : answers.has(String(questions[index].question_id || questions[index].id))
                ? 'bg-primary/30 text-primary hover:bg-primary/40 active:bg-primary/50'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 active:bg-muted'
            )}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};
