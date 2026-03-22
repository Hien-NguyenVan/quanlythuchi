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

// Max URL length safe limit (~7000 chars for data)
const MAX_BATCH = 30;

export async function syncToSheet(transactions) {
  const url = getSheetUrl();
  if (!url) return null;

  try {
    // Split into batches to avoid URL length limit
    let totalAdded = 0;
    for (let i = 0; i < transactions.length; i += MAX_BATCH) {
      const batch = transactions.slice(i, i + MAX_BATCH);
      const data = encodeURIComponent(JSON.stringify(batch));
      const res = await fetch(`${url}?action=sync&data=${data}`);
      const json = await res.json();
      if (json.error) return json;
      totalAdded += json.added || 0;
    }
    return { success: true, added: totalAdded };
  } catch (err) {
    console.error('Sync failed:', err);
    return { error: err.message };
  }
}

export async function deleteFromSheet(id) {
  const url = getSheetUrl();
  if (!url) return null;

  try {
    const res = await fetch(`${url}?action=delete&id=${id}`);
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
    const res = await fetch(`${url}?action=list`);
    return await res.json();
  } catch (err) {
    console.error('Fetch failed:', err);
    return { error: err.message };
  }
}
