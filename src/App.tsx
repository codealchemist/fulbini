import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SettingsProvider } from './context/SettingsContext'
import { AuthProvider } from './context/AuthContext'
import { AuthGate } from './components/auth/AuthGate'
import { AppShell } from './components/layout/AppShell'
import { Loader } from './components/common/Loader'

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const LeaguesPage = lazy(() => import('./pages/LeaguesPage').then((m) => ({ default: m.LeaguesPage })))
const LeagueDetailPage = lazy(() => import('./pages/LeagueDetailPage').then((m) => ({ default: m.LeagueDetailPage })))
const TeamPage = lazy(() => import('./pages/TeamPage').then((m) => ({ default: m.TeamPage })))
const PlayerPage = lazy(() => import('./pages/PlayerPage').then((m) => ({ default: m.PlayerPage })))
const CoachPage = lazy(() => import('./pages/CoachPage').then((m) => ({ default: m.CoachPage })))
const MatchPage = lazy(() => import('./pages/MatchPage').then((m) => ({ default: m.MatchPage })))

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <AuthGate>
            <Suspense fallback={<Loader label="Loading…" />}>
              <Routes>
                <Route element={<AppShell />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/leagues" element={<LeaguesPage />} />
                  <Route path="/leagues/:id" element={<LeagueDetailPage />} />
                  <Route path="/teams/:id" element={<TeamPage />} />
                  <Route path="/players/:id" element={<PlayerPage />} />
                  <Route path="/coaches/:id" element={<CoachPage />} />
                  <Route path="/matches/:id" element={<MatchPage />} />
                </Route>
              </Routes>
            </Suspense>
          </AuthGate>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  )
}
