const EVOLUTION_API_URL = import.meta.env.VITE_EVOLUTION_API_URL || '';
const EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || '';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'apikey': EVOLUTION_API_KEY,
  'ngrok-skip-browser-warning': 'true',
});

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${EVOLUTION_API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }
  
  return response.json();
}

// ========== INSTANCE ==========

export async function createInstance(instanceName: string, webhookUrl?: string) {
  return apiCall('/instance/create', {
    method: 'POST',
    body: JSON.stringify({
      instanceName,
      integration: 'WHATSAPP-BAILEYS',
      qrcode: true,
      webhook: webhookUrl ? {
        url: webhookUrl,
        byEvents: false,
        base64: false,
        events: [
          'MESSAGES_UPSERT',
          'SEND_MESSAGE',
          'CONNECTION_UPDATE',
          'MESSAGES_UPDATE',
        ],
      } : undefined,
    }),
  });
}

export async function getInstanceInfo(instanceName: string) {
  return apiCall(`/instance/fetchInstances?instanceName=${instanceName}`);
}

export async function connectInstance(instanceName: string) {
  return apiCall(`/instance/connect/${instanceName}`);
}

export async function getConnectionState(instanceName: string) {
  return apiCall(`/instance/connectionState/${instanceName}`);
}

export async function logoutInstance(instanceName: string) {
  return apiCall(`/instance/logout/${instanceName}`, { method: 'DELETE' });
}

export async function deleteInstance(instanceName: string) {
  return apiCall(`/instance/delete/${instanceName}`, { method: 'DELETE' });
}

// ========== MESSAGES ==========

export async function sendText(instanceName: string, number: string, text: string) {
  return apiCall(`/message/sendText/${instanceName}`, {
    method: 'POST',
    body: JSON.stringify({ number, text }),
  });
}

export async function findMessages(instanceName: string, remoteJid: string) {
  return apiCall(`/chat/findMessages/${instanceName}`, {
    method: 'POST',
    body: JSON.stringify({
      where: { key: { remoteJid } },
    }),
  });
}

export async function findChats(instanceName: string) {
  return apiCall(`/chat/findChats/${instanceName}`, { method: 'POST' });
}

// ========== CONTACTS ==========

export async function findContacts(instanceName: string) {
  return apiCall(`/chat/findContacts/${instanceName}`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function getProfilePicture(instanceName: string, number: string) {
  try {
    const data = await apiCall(`/chat/fetchProfilePictureUrl/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify({ number }),
    });
    return data?.profilePictureUrl || null;
  } catch {
    return null;
  }
}

// ========== HELPERS ==========

export function extractPhoneFromJid(jid: string): string {
  return jid?.replace(/@s\.whatsapp\.net$/, '').replace(/@g\.us$/, '').replace(/@lid$/, '') || '';
}

export function formatPhoneForJid(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  return `${clean}@s.whatsapp.net`;
}

export function formatPhoneDisplay(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 13) {
    return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
  }
  if (clean.length === 12) {
    return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 8)}-${clean.slice(8)}`;
  }
  return phone;
}

export function isGroupJid(jid: string): boolean {
  return jid?.endsWith('@g.us') || false;
}
