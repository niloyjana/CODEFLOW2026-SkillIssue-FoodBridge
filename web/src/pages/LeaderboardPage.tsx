import React from 'react';
import Leaderboard from '../components/leaderboard/Leaderboard';

export const LeaderboardPage: React.FC = () => {
  return React.createElement(
    'div',
    null,
    React.createElement(Leaderboard, null)
  );
};
export default LeaderboardPage;
