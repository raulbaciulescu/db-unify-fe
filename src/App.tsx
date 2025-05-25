import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Connections from './pages/Connections';
import QueryBuilder from './pages/QueryBuilder';
import VisualQueryBuilder from './pages/VisualQueryBuilder';
import TableExplorer from './pages/TableExplorer';
import ScheduledJobs from './pages/ScheduledJobs';
import JobResults from './pages/JobResults';
import Settings from './pages/Settings';
import { ThemeProvider } from './context/ThemeContext';
import { ConnectionProvider } from './context/ConnectionContext';

function App() {
  return (
      <ThemeProvider>
        <ConnectionProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="/query-builder" element={<QueryBuilder />} />
                <Route path="/visual-query-builder" element={<VisualQueryBuilder />} />
                <Route path="/table-explorer" element={<TableExplorer />} />
                <Route path="/scheduled-jobs" element={<ScheduledJobs />} />
                <Route path="/scheduled-jobs/:jobId/results" element={<JobResults />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </Router>
        </ConnectionProvider>
      </ThemeProvider>
  );
}

export default App;