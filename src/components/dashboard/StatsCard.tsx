import React from 'react';
import { Trophy, Zap, Star } from 'lucide-react';
import type { UserStats } from '../../types';

interface StatsCardProps {
  stats: UserStats;
}

export default function StatsCard({ stats }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalPoints}</div>
          <div className="text-sm text-gray-500">Total Points</div>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Zap className="h-6 w-6 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.currentStreak}</div>
          <div className="text-sm text-gray-500">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Star className="h-6 w-6 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.rank}</div>
          <div className="text-sm text-gray-500">Global Rank</div>
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Recent Activity</h4>
        {stats.recentActivity.map((activity, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{activity.action}</span>
            <span className="font-medium text-indigo-600">+{activity.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}