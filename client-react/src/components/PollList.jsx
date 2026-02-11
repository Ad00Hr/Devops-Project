import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPolls, getPoll, votePoll } from '../api';
import Results from './Results';

const styles = {
  pollsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  pollCard: {
    background: 'linear-gradient(135deg, rgba(30, 30, 46, 0.8) 0%, rgba(26, 26, 40, 0.8) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  pollCardHover: {
    borderColor: 'rgba(99, 102, 241, 0.3)',
    boxShadow: '0 6px 16px rgba(99, 102, 241, 0.1)',
    transform: 'translateY(-2px)',
  },
  pollQuestion: {
    fontSize: '1.2em',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#e0e0e0',
  },
  pollMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9em',
    color: 'rgba(224, 224, 224, 0.6)',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.8em',
    fontWeight: '500',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#a0a0ff',
    marginRight: '0.5rem',
  },
  viewButton: {
    marginTop: 'auto',
    padding: '0.6rem 1.2rem',
    fontSize: '0.95em',
  },
  detailsCard: {
    background: 'linear-gradient(135deg, rgba(30, 30, 46, 0.8) 0%, rgba(26, 26, 40, 0.8) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    borderRadius: '12px',
    padding: '2rem',
    marginTop: '2rem',
  },
  optionsList: {
    display: 'grid',
    gap: '1rem',
  },
  option: {
    background: 'rgba(99, 102, 241, 0.05)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.3s ease',
  },
  voteButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.9em',
  },
  alertBanner: {
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.95em',
    fontWeight: '500',
    animation: 'slideDown 0.3s ease-out',
  },
  alertSuccess: {
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#10b981',
  },
  alertError: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
  },
};

// Add animation keyframes to a style tag
const alertStyle = document.createElement('style');
alertStyle.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(alertStyle);

export default function PollList() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery(['polls'], getPolls);
  const [selected, setSelected] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');

  const { data: details } = useQuery(
    ['poll', selected],
    () => getPoll(selected),
    { enabled: !!selected }
  );

  const voteMutation = useMutation(({ id, option_ids }) => votePoll(id, { option_ids }), {
    onSuccess: () => {
      qc.invalidateQueries(['polls']);
      setAlertMessage(' Vote enregistré avec succès!');
      setAlertType('success');
      setTimeout(() => setAlertMessage(null), 4000);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || error.message;
      if (errorMsg.includes('déjà voté')) {
        setAlertMessage(' Vous avez déjà voté sur ce sondage!');
      } else {
        setAlertMessage(` Erreur: ${errorMsg}`);
      }
      setAlertType('error');
      setTimeout(() => setAlertMessage(null), 4000);
    }
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '1.2em', color: 'rgba(224, 224, 224, 0.6)' }}>Loading polls...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
        Error loading polls. Please try again.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'rgba(224, 224, 224, 0.6)' }}>No polls yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.pollsList}>
        {data.map((p) => (
          <div
            key={p.id}
            style={{
              ...styles.pollCard,
              ...(hoveredId === p.id ? styles.pollCardHover : {}),
            }}
            onMouseEnter={() => setHoveredId(p.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div style={styles.pollQuestion}>{p.question}</div>
            <div style={styles.pollMeta}>
              <span style={styles.badge}>{p.type === 'single' ? '🔘 Single' : '☑️ Multiple'}</span>
              <span style={{ color: 'rgba(224, 224, 224, 0.5)' }}>
                {p.options?.length || 0} options
              </span>
            </div>
            <button
              style={styles.viewButton}
              onClick={() => setSelected(p.id)}
            >
              View & Vote
            </button>
          </div>
        ))}
      </div>

      {details && (
        <div style={styles.detailsCard}>
          {alertMessage && (
            <div style={{
              ...styles.alertBanner,
              ...(alertType === 'success' ? styles.alertSuccess : styles.alertError)
            }}>
              {alertMessage}
            </div>
          )}

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
            paddingBottom: '1rem',
          }}>
            <button
              onClick={() => setShowResults(false)}
              style={{
                padding: '0.75rem 1.5rem',
                background: !showResults ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: !showResults ? '#a0a0ff' : '#999',
                border: 'none',
                borderBottom: !showResults ? '2px solid var(--primary)' : 'transparent',
                cursor: 'pointer',
                fontWeight: !showResults ? '600' : '400',
                transition: 'all 0.3s ease',
                fontSize: '0.95rem',
              }}
            >
               Vote
            </button>
            <button
              onClick={() => setShowResults(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: showResults ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: showResults ? '#a0a0ff' : '#999',
                border: 'none',
                borderBottom: showResults ? '2px solid var(--primary)' : 'transparent',
                cursor: 'pointer',
                fontWeight: showResults ? '600' : '400',
                transition: 'all 0.3s ease',
                fontSize: '0.95rem',
              }}
            >
               Results
            </button>
          </div>

          {/* Vote View */}
          {!showResults && (
            <>
              <h3>{details.question}</h3>
              <p style={{ color: 'rgba(224, 224, 224, 0.7)', marginBottom: '1.5rem' }}>
                Type: {details.type === 'single' ? 'Single Choice' : 'Multiple Choice'}
              </p>
              <div style={styles.optionsList}>
                {details.options.map((o) => (
                  <div key={o.id} style={styles.option}>
                    <span>{o.option_text || o.text}</span>
                    <button
                      style={styles.voteButton}
                      onClick={() => voteMutation.mutate({ id: details.id, option_ids: [o.id] })}
                      disabled={voteMutation.isLoading}
                    >
                      {voteMutation.isLoading ? '⏳ Voting...' : ' Vote'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Results View */}
          {showResults && (
            <Results pollId={details.id} />
          )}

          <button
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#a0a0ff',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              cursor: 'pointer',
              borderRadius: '6px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
            }}
            onClick={() => {
              setSelected(null);
              setShowResults(false);
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
