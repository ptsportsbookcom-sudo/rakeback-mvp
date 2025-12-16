import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import PlayerLayout from './components/player/PlayerLayout';
import AchievementsList from './components/admin/AchievementsList';
import AchievementForm from './components/admin/AchievementForm';
import ChallengesList from './components/admin/challenges/ChallengesList';
import ChallengeForm from './components/admin/challenges/ChallengeForm';
import QuestsList from './components/admin/quests/QuestsList';
import QuestForm from './components/admin/quests/QuestForm';
import ManagementTabs from './components/admin/ManagementTabs';
import TransactionLogs from './components/admin/TransactionLogs';
import AnalyticsDashboard from './components/admin/AnalyticsDashboard';
import AchievementsLobby from './components/player/AchievementsLobby';
import AchievementDetail from './components/player/AchievementDetail';
import PlayerWallet from './components/player/PlayerWallet';
import PlayerBonuses from './components/player/PlayerBonuses';
import ChallengesLobby from './components/player/challenges/ChallengesLobby';
import ChallengeDetail from './components/player/challenges/ChallengeDetail';
import QuestsLobby from './components/player/quests/QuestsLobby';
import QuestDetail from './components/player/quests/QuestDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/player" replace />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="achievements" replace />} />
          <Route path="achievements" element={<AchievementsList />} />
          <Route path="achievements/new" element={<AchievementForm />} />
          <Route path="achievements/edit/:id" element={<AchievementForm />} />
          <Route path="challenges" element={<ChallengesList />} />
          <Route path="challenges/new" element={<ChallengeForm />} />
          <Route path="challenges/edit/:id" element={<ChallengeForm />} />
          <Route path="quests" element={<QuestsList />} />
          <Route path="quests/new" element={<QuestForm />} />
          <Route path="quests/edit/:id" element={<QuestForm />} />
          <Route path="management" element={<ManagementTabs />} />
          <Route path="logs" element={<TransactionLogs />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
        </Route>
        <Route path="/player" element={<PlayerLayout />}>
          <Route index element={<Navigate to="achievements" replace />} />
          <Route path="achievements" element={<AchievementsLobby />} />
          <Route path="achievement/:id" element={<AchievementDetail />} />
          <Route path="challenges" element={<ChallengesLobby />} />
          <Route path="challenge/:id" element={<ChallengeDetail />} />
          <Route path="quests" element={<QuestsLobby />} />
          <Route path="quest/:id" element={<QuestDetail />} />
          <Route path="wallet" element={<PlayerWallet />} />
          <Route path="bonuses" element={<PlayerBonuses />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

