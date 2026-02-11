import axios from "axios";

const BASE = import.meta.env.VITE_GO_GATEWAY || "http://localhost:8081/api/go";

// Generate or retrieve a session user ID
const getUserId = () => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = Math.floor(Math.random() * 100000).toString();
    localStorage.setItem('userId', userId);
  }
  return userId;
};

export const getPolls = async () => {
  const res = await axios.get(`${BASE}/polls`);
  return res.data;
};

export const getPoll = async (id) => {
  const res = await axios.get(`${BASE}/polls/${id}`);
  return res.data;
};

export const createPoll = async (payload) => {
  const res = await axios.post(`${BASE}/polls`, payload);
  return res.data;
};

export const votePoll = async (id, payload) => {
  const userId = getUserId();
  const res = await axios.post(`${BASE}/polls/${id}/vote?user_id=${userId}`, payload);
  return res.data;
};

export const getResults = async (id) => {
  const res = await axios.get(`${BASE}/polls/${id}/results`);
  return res.data;
};
