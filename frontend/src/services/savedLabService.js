import { apiRequest } from './api';

export const savedLabService = {
  getSavedLabs: async () => {
    return apiRequest('/labs/saved/list');
  },
  
  saveLab: async (labId) => {
    return apiRequest(`/labs/${labId}/save`, { method: 'POST' });
  },
  
  unsaveLab: async (labId) => {
    return apiRequest(`/labs/${labId}/save`, { method: 'DELETE' });
  },

  // /labs/saved/list returns full lab objects keyed by lab_id (not id).
  getSavedLabIds: async () => {
    const list = await apiRequest('/labs/saved/list');
    return list.map(lab => lab.lab_id);
  },
};
