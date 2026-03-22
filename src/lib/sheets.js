const STORAGE_KEY = 'gsheet_url';

export function getSheetUrl() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setSheetUrl(url) {
  if (url) {
    localStorage.setItem(STORAGE_KEY, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export async function syncToSheet(transactions) {
  const url = getSheetUrl();
  if (!url) return null;

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action: 'sync', transactions }),
    });
    return await res.json();
  } catch (err) {
    console.error('Sync failed:', err);
    return { error: err.message };
  }
}

export async function deleteFromSheet(id) {
  const url = getSheetUrl();
  if (!url) return null;

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', id }),
    });
    return await res.json();
  } catch (err) {
    console.error('Delete sync failed:', err);
    return { error: err.message };
  }
}

export async function fetchFromSheet() {
  const url = getSheetUrl();
  if (!url) return null;

  try {
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error('Fetch failed:', err);
    return { error: err.message };
  }
}
