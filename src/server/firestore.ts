import appletConfig from '../../firebase-applet-config.json';

const PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.VITE_FIREBASE_PROJECT_ID ||
  appletConfig.projectId;

const DATABASE_ID =
  process.env.FIREBASE_DATABASE_ID ||
  process.env.VITE_FIREBASE_DATABASE_ID ||
  appletConfig.firestoreDatabaseId ||
  '(default)';

// Helper to convert simple JS object into Firestore REST API value format
function toFirestoreFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        fields[key] = { integerValue: value.toString() };
      } else {
        fields[key] = { doubleValue: value };
      }
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map(item => {
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'object') return { mapValue: { fields: toFirestoreFields(item) } };
            return { stringValue: String(item) };
          }),
        },
      };
    } else if (typeof value === 'object') {
      fields[key] = { mapValue: { fields: toFirestoreFields(value) } };
    }
  }
  return fields;
}

// Helper to parse Firestore REST API response fields back to plain JS object
function fromFirestoreFields(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(fields)) {
    if ('stringValue' in val) result[key] = val.stringValue;
    else if ('integerValue' in val) result[key] = parseInt(val.integerValue, 10);
    else if ('doubleValue' in val) result[key] = val.doubleValue;
    else if ('booleanValue' in val) result[key] = val.booleanValue;
    else if ('nullValue' in val) result[key] = null;
    else if ('arrayValue' in val) {
      result[key] = (val.arrayValue.values || []).map((v: any) => {
        if ('stringValue' in v) return v.stringValue;
        if ('mapValue' in v) return fromFirestoreFields(v.mapValue.fields || {});
        return v;
      });
    } else if ('mapValue' in val) {
      result[key] = fromFirestoreFields(val.mapValue.fields || {});
    }
  }
  return result;
}

export async function saveConversationHistory(
  idToken: string,
  uid: string,
  record: {
    id: string;
    scenarioId: string;
    scenarioTitle: string;
    difficultyLevel: string;
    summary: string;
    strengths: string;
    improvements: string;
    timestamp: string;
  }
): Promise<boolean> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/users/${uid}/conversationHistory/${record.id}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        fields: toFirestoreFields(record),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('Firestore REST API save error:', res.status, errText);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('Failed to save conversation to Firestore via REST:', err.message);
    return false;
  }
}

export async function getRecentConversations(
  idToken: string,
  uid: string,
  pageSize = 10
): Promise<any[]> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/users/${uid}/conversationHistory?pageSize=${pageSize}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!res.ok) {
      console.warn('Firestore REST API get error:', res.status);
      return [];
    }

    const data = await res.json();
    if (!data.documents) return [];

    return data.documents.map((docItem: any) => {
      const fields = fromFirestoreFields(docItem.fields || {});
      const nameParts = (docItem.name || '').split('/');
      const docId = nameParts[nameParts.length - 1];
      return { id: docId, ...fields };
    });
  } catch (err: any) {
    console.error('Failed to retrieve conversations from Firestore via REST:', err.message);
    return [];
  }
}
