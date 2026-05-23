import React from 'react';
import Leaderboard from '../components/leaderboard/Leaderboard';

export const LeaderboardPage: React.FC = () => {
  return React.createElement(
    'div',
    { className: 'mask-reveal' },
    React.createElement(Leaderboard, null)
  );
};
export default LeaderboardPage;
