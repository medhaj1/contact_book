// inviteService.js
// Service to send invite emails via backend API

export async function sendInviteEmail(email) {
  try {
    const response = await fetch('/api/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error('Failed to send invite');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}
