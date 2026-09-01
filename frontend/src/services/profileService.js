import { apiRequest } from './api';

export const profileService = {
  async getProfile() {
    return apiRequest('/students/me');
  },
  
  async updateProfile(profileUpdates) {
    return apiRequest('/students/me', {
      method: 'PUT',
      body: JSON.stringify(profileUpdates)
    });
  },
};
