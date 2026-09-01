import { apiRequest, apiUpload } from './api';

export function createEmptyProfile() {
  return {
    major: '',
    academicYear: '',
    skills: [],
    interests: [],
    experience: [],
    availabilityHrs: '',
    portfolioUrl: ''
  };
}

export async function sendMessage(messages) {
  // messages should be an array of { role, content } objects
  return apiRequest('/genie/intake/chat', {
    method: 'POST',
    body: JSON.stringify({ messages })
  });
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload('/genie/intake/resume', formData);
}
