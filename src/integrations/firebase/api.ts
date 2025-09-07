import { auth, db, storage } from "@/integrations/firebase/client";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  type ConfirmationResult,
} from "firebase/auth";
import { doc, setDoc, getDocs, getDoc, collection, query, where, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Phone OTP helpers
let recaptcha: RecaptchaVerifier | null = null;
let phoneConfirmation: ConfirmationResult | null = null;
function ensureRecaptcha() {
  if (!recaptcha) {
    let container = document.getElementById("recaptcha-container") as HTMLElement | null;
    if (!container) {
      container = document.createElement("div");
      container.id = "recaptcha-container";
      container.style.display = "none";
      document.body.appendChild(container);
    }
    recaptcha = new RecaptchaVerifier(auth, container, { size: "invisible" });
  }
  return recaptcha;
}

// Auth
export async function signInWithEmailOtp(_email: string) {
  throw new Error("Email OTP sign-in not implemented with Firebase");
}

export async function signInWithPhoneOtp(phone: string) {
  const verifier = ensureRecaptcha();
  phoneConfirmation = await signInWithPhoneNumber(auth, phone, verifier);
  return { sent: true } as any;
}

export async function verifyPhoneOtp(_phone: string, token: string) {
  if (!phoneConfirmation) throw new Error("No OTP in progress. Please request OTP again.");
  const cred = await phoneConfirmation.confirm(token);
  return { user: cred.user } as any;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  return { user: cred.user } as any;
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
  try {
    const now = new Date().toISOString();
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      name: name || cred.user.displayName || "",
      email,
      phone: cred.user.phoneNumber || null,
      role: "farmer",
      language_preference: null,
      created_at: now,
      updated_at: now,
    });
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

export function onAuthStateChange(callback: (session: any | null) => void) {
  const unsub = onAuthStateChanged(auth, (user) => {
    callback(user ? { user: { id: user.uid, email: user.email } } : null);
  });
  return unsub;
}

export async function getCurrentUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  return { id: user.uid, email: user.email, name: user.displayName } as any;
}

// User profile (onboarding)
export async function getUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return null;
  return snap.data() as any;
}

export async function upsertUserProfile(profile: { name: string; location?: { district?: string; village?: string; state?: string }; language_preference?: string; phone?: string }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const now = new Date().toISOString();
  const payload: any = {
    uid: user.uid,
    email: user.email || "",
    name: profile.name,
    phone: profile.phone ?? user.phoneNumber ?? null,
    role: "farmer",
    language_preference: profile.language_preference ?? null,
    location: profile.location ?? null,
    updated_at: now,
  };
  const existing = await getDoc(doc(db, "users", user.uid));
  if (!existing.exists()) payload.created_at = now;
  await setDoc(doc(db, "users", user.uid), payload, { merge: true } as any);
  return payload;
}

// Farms
export async function createFarm(input: any) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const farm_id = crypto.randomUUID();
  const now = new Date().toISOString();
  const farmDoc = {
    farm_id,
    farmer_uid: user.uid,
    farm_name: input.farm_name || input.name,
    location: input.location ?? null,
    livestock_type: input.livestock_type,
    herd_size: input.herd_size ?? 0,
    biosecurity_level: input.biosecurity_level ?? null,
    created_at: now,
    updated_at: now,
  };
  await setDoc(doc(db, "farms", farm_id), farmDoc as any);
  return farmDoc as any;
}

export async function listMyFarms() {
  const user = auth.currentUser;
  if (!user) return [];
  try {
    const q = query(collection(db, "farms"), where("farmer_uid", "==", user.uid));
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => d.data()) as any[];
    return rows.map((r) => ({ ...r, id: r.farm_id, name: r.farm_name }));
  } catch {
    return [];
  }
}

// Risk assessments
function riskLevelFromScore(score: number) {
  if (score <= 40) return "low";
  if (score <= 70) return "medium";
  return "high";
}

export async function submitRiskAssessment(input: { farm_id: string; score: number; assessment_details?: any; answers?: any }) {
  const assessment_id = crypto.randomUUID();
  const date = new Date().toISOString();
  const answers = input.answers ?? input.assessment_details ?? {};
  const docBody = {
    assessment_id,
    farm_id: input.farm_id,
    date,
    score: input.score,
    risk_level: riskLevelFromScore(input.score),
    answers,
  };
  await setDoc(doc(db, "risk_assessments", assessment_id), docBody as any);
  return docBody as any;
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

// Training modules
export async function listTrainingModules(_params: { livestock_type?: any; language?: any; type?: any }) {
  try {
    const snap = await getDocs(collection(db, "training_modules"));
    return snap.docs.map((d) => {
      const data: any = d.data();
      return { ...data, id: data.module_id ?? data.id };
    }) as any[];
  } catch {
    return [];
  }
}

export async function upsertTrainingModule(module: any) {
  const module_id = module.module_id || module.id || crypto.randomUUID();
  const body = { module_id, ...module };
  await setDoc(doc(db, "training_modules", module_id), body, { merge: true } as any);
  return body as any;
}

// Compliance
export async function uploadComplianceDocument(farmId: string, file: File, document_type: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const path = `compliance_docs/${farmId}/${crypto.randomUUID()}-${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, { contentType: file.type || "application/octet-stream" });
  const url = await getDownloadURL(fileRef);
  const record_id = crypto.randomUUID();
  const submission_date = new Date().toISOString();
  await setDoc(doc(db, "compliance_records", record_id), {
    record_id,
    farm_id: farmId,
    document_type,
    file_url: url,
    submitted_by: user.uid,
    submission_date,
    status: "pending",
  } as any);
  return { record_id, file_url: url } as any;
}

export async function getComplianceFileUrl(path: string, _expiresInSeconds = 3600) {
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

// Alerts
export async function listAlertsByLocation(location?: string, severity?: any) {
  try {
    const snap = await getDocs(collection(db, "alerts"));
    let rows = snap.docs.map((d) => d.data()) as any[];
    if (location) rows = rows.filter((r) => ((r.location?.district + ", " + r.location?.state) || "").toLowerCase().includes(location.toLowerCase()));
    if (severity) rows = rows.filter((r) => r.severity === severity);
    return rows;
  } catch {
    return [];
  }
}

export async function createAlert(alert: any) {
  const alert_id = crypto.randomUUID();
  const issued_date = new Date().toISOString();
  const body = { alert_id, issued_date, ...alert };
  await setDoc(doc(db, "alerts", alert_id), body as any);
  return body as any;
}

// Summaries (placeholder)
export async function getFarmerSummary() {
  return { totalFarms: 0, averageRiskScore: 0, complianceProgress: "0/0" };
}

export async function getRegulatorSummary() {
  return { farmersOnboarded: 0, highRiskFarms: 0, pendingCompliance: 0 };
}

export async function savePushToken(_token: string, _platform?: string) {
  return { ok: true } as any;
}
