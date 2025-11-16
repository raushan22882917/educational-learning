"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error?: string;
  title?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorFallback = ({
  error = "Something went wrong",
  title = "Oops!",
  onRetry,
  showRetry = true,
}: ErrorFallbackProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="mb-6">
        <svg
          className="w-20 h-20 text-red-500 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md">{error}</p>
      
      {showRetry && onRetry && (
        <Button
          onClick={onRetry}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          Try Again
        </Button>
      )}
    </motion.div>
  );
};

interface LoadingFallbackProps {
  message?: string;
}

export const LoadingFallback = ({ message = "Loading..." }: LoadingFallbackProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="mb-4">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-400">{message}</p>
    </motion.div>
  );
};

interface EmptyStateFallbackProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyStateFallback = ({
  title = "No data available",
  message = "There's nothing to display here yet.",
  icon,
  action,
}: EmptyStateFallbackProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      {icon ? (
        <div className="mb-6">{icon}</div>
      ) : (
        <div className="mb-6">
          <svg
            className="w-20 h-20 text-gray-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md">{message}</p>
      
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
};

export default ErrorFallback;
