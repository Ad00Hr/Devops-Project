import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPoll } from '../api';

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontWeight: '500',
    color: '#e0e0e0',
    fontSize: '0.95em',
  },
  input: {
    padding: '0.75rem',
    background: 'rgba(30, 30, 46, 0.8)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '6px',
    color: '#e0e0e0',
    fontSize: '1em',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  },
  textarea: {
    padding: '0.75rem',
    background: 'rgba(30, 30, 46, 0.8)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '6px',
    color: '#e0e0e0',
    fontSize: '1em',
    fontFamily: 'inherit',
    minHeight: '120px',
    resize: 'vertical',
    transition: 'all 0.3s ease',
  },
  select: {
    padding: '0.75rem',
    background: 'rgba(30, 30, 46, 0.8)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '6px',
    color: '#e0e0e0',
    fontSize: '1em',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1em',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
    marginTop: '0.5rem',
  },
  status: {
    padding: '0.75rem',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '0.95em',
    fontWeight: '500',
  },
  errorStatus: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ff6b6b',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  successStatus: {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
};

export default function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [type, setType] = useState('single');
  const qc = useQueryClient();

  const mutation = useMutation((payload) => createPoll(payload), {
    onSuccess: () => {
      qc.invalidateQueries(['polls']);
      setQuestion('');
      setOptionsText('');
      setTimeout(() => {
        mutation.reset();
      }, 3000);
    }
  });

  const submit = (e) => {
    e.preventDefault();
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }
    const options = optionsText.split('\n').map((s) => s.trim()).filter(Boolean);
    if (options.length < 2) {
      alert('Please enter at least 2 options (one per line)');
      return;
    }
    mutation.mutate({ question, type, options });
  };

  return (
    <form style={styles.form} onSubmit={submit}>
      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="question">
           Poll Question
        </label>
        <input
          id="question"
          type="text"
          style={styles.input}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What do you want to ask?"
          disabled={mutation.isLoading}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="options">
           Options
        </label>
        <textarea
          id="options"
          style={styles.textarea}
          value={optionsText}
          onChange={(e) => setOptionsText(e.target.value)}
          placeholder="Enter one option per line"
          disabled={mutation.isLoading}
        />
        <small style={{ color: 'rgba(224, 224, 224, 0.6)' }}>
          Minimum 2 options required
        </small>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="type">
           Poll Type
        </label>
        <select
          id="type"
          style={styles.select}
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={mutation.isLoading}
        >
          <option value="single">🔘 Single Choice</option>
          <option value="multiple">☑️ Multiple Choice</option>
        </select>
      </div>

      <button
        type="submit"
        style={styles.submitButton}
        disabled={mutation.isLoading}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.35)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.25)';
        }}
      >
        {mutation.isLoading ? '⏳ Creating...' : '✨ Create Poll'}
      </button>

      {mutation.isSuccess && (
        <div style={{ ...styles.status, ...styles.successStatus }}>
           Poll created successfully!
        </div>
      )}

      {mutation.isError && (
        <div style={{ ...styles.status, ...styles.errorStatus }}>
           Error creating poll. Please try again.
        </div>
      )}
    </form>
  );
}