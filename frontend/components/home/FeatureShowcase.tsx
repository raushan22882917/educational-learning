import { Card, CardContent } from '@/components/ui/card';

interface Feature {
  icon: string;
  title: string;
  description: string;
  stat: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: '🎯',
    title: 'Personalized Learning',
    description: 'AI adapts to your learning style and pace',
    stat: '3x faster learning',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: '⚡',
    title: 'Instant Feedback',
    description: 'Get real-time answers and explanations',
    stat: '<1s response time',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: '📈',
    title: 'Track Progress',
    description: 'Detailed analytics and insights',
    stat: '100+ metrics tracked',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: '🏆',
    title: 'Gamification',
    description: 'Earn badges and maintain streaks',
    stat: '50+ achievements',
    color: 'from-purple-500 to-pink-500'
  }
];

export function FeatureShowcase() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => (
        <Card 
          key={index}
          className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-transparent relative overflow-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
          <CardContent className="pt-6 relative z-10">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {feature.description}
            </p>
            <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${feature.color} text-white text-xs font-semibold`}>
              {feature.stat}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
