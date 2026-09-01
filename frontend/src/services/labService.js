import { apiRequest } from './api';

export const labService = {
  async getRecommendedLabs() {
    return apiRequest('/matches');
  },
  
  async getExploreLabs(search = '', takingStudents = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (takingStudents) params.append('taking_students', takingStudents);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/labs${queryString}`);
  },
  
  async getLabById(id) {
    return apiRequest(`/labs/${id}`);
  },

  async getMyLabs() {
    return apiRequest('/labs/mine');
  },

  async getLabApplicants(labId) {
    return apiRequest(`/labs/${labId}/applicants`);
  },

  async getLabStats(labId) {
    return apiRequest(`/labs/${labId}/stats`);
  },

  async createLab(data) {
    return apiRequest('/labs', { method: 'POST', body: JSON.stringify(data) });
  },

  async updateLab(labId, data) {
    return apiRequest(`/labs/${labId}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async getLearningResources() {
    return [];
  },
};
