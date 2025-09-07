import { auth, db, storage } from "@/integrations/firebase/client";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDocs, collection, query, where, orderBy } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

// Auth
export async function signInWithEmailOtp(email: string) {
  throw new Error("Email OTP sign-in not implemented with Firebase");
}

export async function signInWithPhoneOtp(phone: string) {
  throw new Error("Phone OTP sign-in not implemented with Firebase");
}

export async function verifyPhoneOtp(phone: string, token: string) {
  throw new Error("Phone OTP verification not implemented with Firebase");
}

export async function signOut() {
  await fbSignOut(auth);
}

export async function signInWithPassword(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return { user: cred.user } as any;
}

export async function signUpWithPassword(email: string, password: string, name?: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
  // Create a basic user profile document if needed
  try {
    await setDoc(doc(db, "users", cred.user.uid), { id: cred.user.uid, email, name: name || cred.user.displayName || "" });
  } catch {}
  return { session: { user: { id: cred.user.uid } } } as any;
}

export async function getSession() {
  return new Promise<any>((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve({ session: user ? { user: { id: user.uid, email: user.email } } : null });
    });
  });
}

export async function getCurrentUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  return { id: user.uid, email: user.email, name: user.displayName } as any;
}

// Data access (Firestore collections). Return empty arrays by default if none found.
export async function createFarm(input: any) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const id = crypto.randomUUID();
  await setDoc(doc(db, "farms", id), { id, farmer_id: user.uid, created_at: Date.now(), updated_at: Date.now(), ...input });
  return { id, ...input } as any;
}

export async function listMyFarms() {
  const user = auth.currentUser;
  if (!user) return [];
  try {
    const q = query(collection(db, "farms"), where("farmer_id", "==", user.uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data()) as any[];
  } catch {
    return [];
  }
}

export async function submitRiskAssessment(input: any) {
  const id = crypto.randomUUID();
  await setDoc(doc(db, "risk_assessments", id), { id, date: Date.now(), ...input });
  return { id, ...input } as any;
}

export async function listFarmAssessments(farmId: string) {
  try {
    const q = query(collection(db, "risk_assessments"), where("farm_id", "==", farmId), orderBy("date", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data()) as any[];
  } catch {
    return [];
  }
}

export async function listTrainingModules(params: { livestock_type?: any; language?: any; type?: any }) {
  try {
    const snap = await getDocs(collection(db, "training_modules"));
    return snap.docs.map((d) => d.data()) as any[];
  } catch {
    return [];
  }
}

export async function upsertTrainingModule(module: any) {
  const id = module.id || crypto.randomUUID();
  await setDoc(doc(db, "training_modules", id), { id, ...module }, { merge: true } as any);
  return { id, ...module } as any;
}

export async function uploadComplianceDocument(farmId: string, file: File, document_type: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const path = `farm/${farmId}/${crypto.randomUUID()}-${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, { contentType: file.type || "application/octet-stream" });
  const id = crypto.randomUUID();
  await setDoc(doc(db, "compliance_records", id), {
    id,
    farm_id: farmId,
    document_type,
    file_url: path,
    submitted_by: user.uid,
    submission_date: Date.now(),
    status: "Pending",
  });
  return { id, file_url: path } as any;
}

export async function getComplianceFileUrl(path: string, _expiresInSeconds = 3600) {
  // Public Storage download URLs require getDownloadURL, but bucket rules may vary.
  // For simplicity, return the storage path; UI only shows file name currently.
  return path;
}

export async function listComplianceRecordsByFarm(farmId: string) {
  try {
    const q = query(collection(db, "compliance_records"), where("farm_id", "==", farmId), orderBy("submission_date", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data()) as any[];
  } catch {
    return [];
  }
}

export async function setComplianceStatus(recordId: string, status: any) {
  await setDoc(doc(db, "compliance_records", recordId), { status }, { merge: true } as any);
  return { id: recordId, status } as any;
}

export async function listAlertsByLocation(location?: string, severity?: any) {
  try {
    const snap = await getDocs(collection(db, "alerts"));
    let rows = snap.docs.map((d) => d.data()) as any[];
    if (location) rows = rows.filter((r) => (r.location || "").toLowerCase().includes(location.toLowerCase()));
    if (severity) rows = rows.filter((r) => r.severity === severity);
    return rows;
  } catch {
    return [];
  }
}

export async function createAlert(alert: any) {
  const id = crypto.randomUUID();
  await setDoc(doc(db, "alerts", id), { id, issued_date: Date.now(), ...alert });
  return { id, ...alert } as any;
}

export async function getFarmerSummary() {
  return { totalFarms: 0, averageRiskScore: 0, complianceProgress: "0/0" };
}

export async function getRegulatorSummary() {
  return { farmersOnboarded: 0, highRiskFarms: 0, pendingCompliance: 0 };
}

export async function savePushToken(_token: string, _platform?: string) {
  return { ok: true } as any;
}
