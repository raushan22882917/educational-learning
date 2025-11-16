'use client';

import { Card } from '@/components/ui/card';

interface Connection {
  topic: string;
  connection: string;
  relevance: string;
}

interface ConnectionsViewProps {
  connections: Connection[];
}

export function ConnectionsView({ connections }: ConnectionsViewProps) {
  if (connections.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-600 dark:text-gray-400">
          No connections available
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        🔗 Topic Connections
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Discover how this content connects to other topics and fields of study
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {connections.map((connection, index) => (
          <div
            key={index}
            className="p-5 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  {connection.topic}
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">
                      Connection
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {connection.connection}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase">
                      Why It Matters
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {connection.relevance}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
