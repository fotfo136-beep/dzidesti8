import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Receipt, Quote, AppSettings } from "./types";

// Helper to convert Firestore timestamps to ISO strings
const convertTimestamp = (data: Record<string, unknown>) => {
  if (data.date && data.date instanceof Timestamp) {
    return { ...data, date: data.date.toDate().toISOString() };
  }
  return data;
};

// ===== RECEIPTS =====

export const receiptsCollection = (userId: string) => 
  collection(db, "users", userId, "receipts");

export const addReceipt = async (userId: string, receipt: Omit<Receipt, "id">) => {
  const docRef = await addDoc(receiptsCollection(userId), {
    ...receipt,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateReceipt = async (userId: string, receiptId: string, receipt: Partial<Receipt>) => {
  const docRef = doc(db, "users", userId, "receipts", receiptId);
  await updateDoc(docRef, receipt);
};

export const deleteReceipt = async (userId: string, receiptId: string) => {
  const docRef = doc(db, "users", userId, "receipts", receiptId);
  await deleteDoc(docRef);
};

export const getReceipts = async (userId: string): Promise<Receipt[]> => {
  const q = query(receiptsCollection(userId), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data() as Record<string, unknown>),
  })) as Receipt[];
};

// Real-time listener for receipts
export const subscribeToReceipts = (
  userId: string,
  callback: (receipts: Receipt[]) => void
) => {
  const q = query(receiptsCollection(userId), orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const receipts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamp(doc.data() as Record<string, unknown>),
    })) as Receipt[];
    callback(receipts);
  });
};

// ===== QUOTES =====

export const quotesCollection = (userId: string) => 
  collection(db, "users", userId, "quotes");

export const addQuote = async (userId: string, quote: Omit<Quote, "id">) => {
  const docRef = await addDoc(quotesCollection(userId), {
    ...quote,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateQuote = async (userId: string, quoteId: string, quote: Partial<Quote>) => {
  const docRef = doc(db, "users", userId, "quotes", quoteId);
  await updateDoc(docRef, quote);
};

export const deleteQuote = async (userId: string, quoteId: string) => {
  const docRef = doc(db, "users", userId, "quotes", quoteId);
  await deleteDoc(docRef);
};

export const getQuotes = async (userId: string): Promise<Quote[]> => {
  const q = query(quotesCollection(userId), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data() as Record<string, unknown>),
  })) as Quote[];
};

// Real-time listener for quotes
export const subscribeToQuotes = (
  userId: string,
  callback: (quotes: Quote[]) => void
) => {
  const q = query(quotesCollection(userId), orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const quotes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertTimestamp(doc.data() as Record<string, unknown>),
    })) as Quote[];
    callback(quotes);
  });
};

// ===== SETTINGS =====

export const settingsCollection = (userId: string) => 
  collection(db, "users", userId, "settings");

export const saveSettings = async (userId: string, settings: AppSettings) => {
  // Store settings as a single document (ID: "company")
  const docRef = doc(db, "users", userId, "settings", "company");
  await updateDoc(docRef, {
    ...settings,
    updatedAt: Timestamp.now(),
  }).catch(async () => {
    // If document doesn't exist, create it
    await addDoc(settingsCollection(userId), {
      id: "company",
      ...settings,
      updatedAt: Timestamp.now(),
    });
  });
};

export const getSettings = async (userId: string): Promise<AppSettings | null> => {
  const docRef = doc(db, "users", userId, "settings", "company");
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return snapshot.data() as AppSettings;
  }
  return null;
};

// Real-time listener for settings
export const subscribeToSettings = (
  userId: string,
  callback: (settings: AppSettings | null) => void
) => {
  const docRef = doc(db, "users", userId, "settings", "company");
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as AppSettings);
    } else {
      callback(null);
    }
  });
};

// ===== EXPORT/IMPORT =====

export const exportAllData = async (userId: string) => {
  const [receipts, quotes, settings] = await Promise.all([
    getReceipts(userId),
    getQuotes(userId),
    getSettings(userId),
  ]);
  return {
    receipts,
    quotes,
    settings,
    exportDate: new Date().toISOString(),
  };
};

export const importAllData = async (
  userId: string,
  data: { receipts?: Receipt[]; quotes?: Quote[]; settings?: AppSettings }
) => {
  // Import receipts
  if (data.receipts) {
    for (const receipt of data.receipts) {
      const { id, ...rest } = receipt;
      await addReceipt(userId, rest as Omit<Receipt, "id">);
    }
  }

  // Import quotes
  if (data.quotes) {
    for (const quote of data.quotes) {
      const { id, ...rest } = quote;
      await addQuote(userId, rest as Omit<Quote, "id">);
    }
  }

  // Import settings
  if (data.settings) {
    await saveSettings(userId, data.settings);
  }
};
