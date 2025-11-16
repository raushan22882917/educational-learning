'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  MapPinIcon,
  AcademicCapIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    bio: '',
    location: '',
    educationLevel: '',
    interests: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      setFormData({
        fullName: user.username || '',
        email: user.email || '',
        bio: '',
        location: '',
        educationLevel: '',
        interests: '',
      });
    }
  }, [isAuthenticated, router, user]);

  const handleSave = () => {
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.username || '',
        email: user.email || '',
        bio: '',
        location: '',
        educationLevel: '',
        interests: '',
      });
    }
    setIsEditing(false);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage your personal information and preferences
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <PencilIcon className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <XMarkIcon className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {formData.fullName || user.username}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {user.email}
                  </p>
                  
                  <Button variant="outline" className="w-full">
                    Change Avatar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Learning Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Topics Completed</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Current Streak</span>
                  <span className="font-semibold">5 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total Time</span>
                  <span className="font-semibold">24h 30m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Level</span>
                  <span className="font-semibold text-blue-600">Intermediate</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{formData.fullName || 'Not set'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-white flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4" />
                      {user.email}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">
                      {formData.bio || 'No bio added yet'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, Country"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4" />
                        {formData.location || 'Not set'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Education Level
                    </label>
                    {isEditing ? (
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        value={formData.educationLevel}
                        onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                      >
                        <option value="">Select level</option>
                        <option value="high-school">High School</option>
                        <option value="undergraduate">Undergraduate</option>
                        <option value="graduate">Graduate</option>
                        <option value="postgraduate">Postgraduate</option>
                        <option value="professional">Professional</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 dark:text-white flex items-center gap-2">
                        <AcademicCapIcon className="h-4 w-4" />
                        {formData.educationLevel || 'Not set'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Interests & Topics
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.interests}
                      onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                      placeholder="Mathematics, Physics, Computer Science..."
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">
                      {formData.interests || 'No interests specified'}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Preferred Learning Style</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="learningStyle" value="visual" className="mr-2" />
                        Visual (diagrams, charts)
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="learningStyle" value="auditory" className="mr-2" />
                        Auditory (explanations)
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="learningStyle" value="kinesthetic" className="mr-2" />
                        Hands-on (practice)
                      </label>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Difficulty Preference</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="difficulty" value="beginner" className="mr-2" />
                        Beginner
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="difficulty" value="intermediate" className="mr-2" defaultChecked />
                        Intermediate
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="difficulty" value="advanced" className="mr-2" />
                        Advanced
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
