import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import axios from "axios";
import React, { useState } from 'react';

import './App.css'
import PollList from './components/PollList'
import CreatePoll from './components/CreatePoll'

const queryClient = new QueryClient();

function CurrentTime(props) {
  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: [props.api],
    queryFn: () =>
      axios
        .get(`${props.api}`)
        .then((res) => res.data),
  });

  if (isLoading) return `Loading ${props.api}... `;
  if (error) return "An error has occurred: " + error.message;

  return (
    <div className="App">
      <p>---</p>
      <p>API: {data.api}</p>
      <p>Time from DB: {data.now}</p>
      <div>{isFetching ? "Updating..." : ""}</div>
    </div>
  )
}

export function App() {
  const [view, setView] = useState('home');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <header>
          <h1>Voting App</h1>
          <nav>
            <button 
              onClick={() => setView('home')} 
              className={view === 'home' ? 'active' : ''}
            >
              Home
            </button>
            <button 
              onClick={() => setView('polls')}
              className={view === 'polls' ? 'active' : ''}
            >
               Polls
            </button>
            <button 
              onClick={() => setView('create')}
              className={view === 'create' ? 'active' : ''}
            >
              ➕ Create Poll
            </button>
          </nav>
        </header>

        <main>
          {view === 'home' && (
            <div>
              <h2 className="section-title">Welcome to Voting App</h2>
              <p>Create polls, view results, and vote on important questions. Navigate using the buttons above.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <CurrentTime api="/api/golang/" />
                <CurrentTime api="/api/node/" />
              </div>
            </div>
          )}

          {view === 'polls' && (
            <div>
              <h2 className="section-title">Available Polls</h2>
              <PollList />
            </div>
          )}

          {view === 'create' && (
            <div style={{ maxWidth: '500px' }}>
              <h2 className="section-title">Create New Poll</h2>
              <CreatePoll />
            </div>
          )}
        </main>

        <ReactQueryDevtools initialIsOpen={false} />
      </div>
    </QueryClientProvider>
  );
}

export default App
