import { apiRequest } from './api';

export const applyAssistService = {
  generateDraft: async (labId) => {
    return apiRequest(`/labs/${labId}/apply-assist`, { method: 'POST' });
  },

  sendApplication: async (data) => {
    // data should contain { lab_id, message, answers }
    return apiRequest('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyApplications: async () => {
    return apiRequest('/applications');
  },

  updateApplicationStatus: async (applicationId, status) => {
    // status: "Applied"|"Pending"|"Interview"|"Decision"
    return apiRequest(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  markNoResponse: async (applicationId) => {
    return apiRequest(`/applications/${applicationId}/no-response`, { method: 'POST' });
  },
};
