// src/services/supportService.js
import api from './api';

// Support tickets are under the shared support routes for all authenticated users
export const getSupportTickets = async (params) => {
  const response = await api.get('/support/tickets', { params });
  return response?.data?.data || response?.data || {};
};

export const getTicketDetails = async (ticketId) => {
  const response = await api.get(`/support/tickets/${ticketId}`);
  return response?.data?.data || response?.data || {};
};

export const createSupportTicket = async (data) => {
  const response = await api.post('/support/tickets', data);
  return response?.data?.data || response?.data || {};
};

export const getTicketMessages = async (ticketId) => {
  const response = await api.get(`/support/tickets/${ticketId}/messages`);
  return response?.data?.data || response?.data || {};
};

export const addTicketMessage = async ({ ticketId, message }) => {
  const response = await api.post(`/support/tickets/${ticketId}/messages`, { message });
  return response?.data?.data || response?.data || {};
};

export const updateTicketStatus = async ({ ticketId, status }) => {
  const response = await api.patch(`/support/tickets/${ticketId}/status`, { status });
  return response?.data?.data || response?.data || {};
};

export const getKnowledgeBaseArticles = async (params) => {
  const response = await api.get('/support/knowledge-base', { params });
  return response?.data?.data || response?.data || {};
};