import { supabase } from "@/integrations/supabase/client";

export async function signInWithEmailOtp(_email: string) {
  throw new Error("Email OTP sign-in not implemented with Supabase");
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data as any;
}

export async function signUpWithPassword(email: string, password: string, name?: string, role: 'farmer' | 'vet' = 'farmer') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: name || "" },
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth?confirmed=1` : undefined,
    },
  });
  if (error) throw error;
  try {
    const uid = data.session?.user?.id;
    const now = new Date().toISOString();
    if (uid) {
      await supabase.from('users').upsert({
        uid,
        email,
        name: name || (data.session?.user?.user_metadata as any)?.name || "",
        phone: (data.session?.user as any)?.phone ?? null,
        role,
        language_preference: 'en',
        created_at: now,
      } as any, { onConflict: 'uid' });
    }
  } catch {}
  return data as any;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined } });
  if (error) throw error;
  return data as any;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data as any;
}

export function onAuthStateChange(callback: (session: any | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session as any);
  });
  return () => { data.subscription.unsubscribe(); };
}

export async function getCurrentUserProfile() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const u = data.user;
  if (!u) return null;
  return { id: u.id, email: u.email, name: (u.user_metadata as any)?.name || "" } as any;
}

export async function getUserProfile() {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return null;
  const { data, error } = await supabase.from('users').select('*').eq('uid', user.id).single();
  if (error) return null;
  return data as any;
}

export async function upsertUserProfile(profile: { name: string; location?: { district?: string; village?: string; state?: string }; language_preference?: string; phone?: string; role?: 'farmer' | 'vet' }) {
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  const user = authData.user;
  if (!user) throw new Error('Not authenticated');
  const now = new Date().toISOString();
  const payload: any = {
    uid: user.id,
    email: user.email || '',
    name: profile.name,
    phone: profile.phone ?? (user as any).phone ?? null,
    // role preserved unless provided explicitly
    language_preference: profile.language_preference ?? 'en',
    created_at: now,
  };
  // Determine if exists
  const { data: existing } = await supabase.from('users').select('*').eq('uid', user.id).maybeSingle();
  if (profile.role) payload.role = profile.role; if (!existing) payload.created_at = now;
  const { error } = await supabase.from('users').upsert(payload, { onConflict: 'uid' });
  if (error) throw error;
  return { ...existing, ...payload };
}

export async function createFarm(input: any) {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) throw new Error('Not authenticated');
  const farm_id = crypto.randomUUID();
  const now = new Date().toISOString();
  const farmDoc = {
    farm_id,
    farmer_uid: user.id,
    farm_name: input.farm_name || input.name,
    district: input.location?.district ?? null,
    state: input.location?.state ?? null,
    lat: null as any,
    lng: null as any,
    livestock_type: input.livestock_type,
    herd_size: input.herd_size ?? 0,
    biosecurity_level: input.biosecurity_level ?? 'low',
    created_at: now,
  } as any;
  const { error } = await supabase.from('farms').insert(farmDoc as any);
  if (error) throw error;
  return farmDoc as any;
}

export async function listMyFarms() {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return [];
  const { data, error } = await supabase.from('farms').select('*').eq('farmer_uid', user.id);
  if (error) return [];
  const rows = (data || []) as any[];
  return rows.map((r) => ({ ...r, id: r.farm_id, name: r.farm_name }));
}

function riskLevelFromScore(score: number) { if (score <= 40) return 'low'; if (score <= 70) return 'medium'; return 'high'; }

export async function submitRiskAssessment(input: { farm_id: string; score: number; assessment_details?: any; answers?: any }) {
  const assessment_id = crypto.randomUUID();
  const date = new Date().toISOString();
  const answers = input.answers ?? input.assessment_details ?? {};
  const body = { assessment_id, farm_id: input.farm_id, date, score: input.score, risk_level: riskLevelFromScore(input.score), answers };
  const { error } = await supabase.from('risk_assessments').insert(body as any);
  if (error) throw error;
  return body as any;
}

export async function listFarmAssessments(farmId: string) {
  const { data, error } = await supabase.from('risk_assessments').select('*').eq('farm_id', farmId).order('date', { ascending: false });
  if (error) return [];
  return (data || []) as any[];
}

export async function listTrainingModules(_params: { livestock_type?: any; language?: any; type?: any }) {
  const { data, error } = await supabase.from('training_modules').select('*');
  if (error) return [];
  return (data || []).map((d: any) => ({ ...d, id: d.module_id ?? d.id }));
}

export async function upsertTrainingModule(module: any) {
  const module_id = module.module_id || module.id || crypto.randomUUID();
  const body = { module_id, ...module };
  const { error } = await supabase.from('training_modules').upsert(body as any, { onConflict: 'module_id' });
  if (error) throw error;
  return body as any;
}

export async function uploadComplianceDocument(farmId: string, file: File, document_type: string) {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) throw new Error('Not authenticated');
  const path = `${farmId}/${crypto.randomUUID()}-${file.name}`;
  const { error: upErr } = await supabase.storage.from('compliance_docs').upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false });
  if (upErr) throw upErr;
  const { data: pub } = supabase.storage.from('compliance_docs').getPublicUrl(path);
  const url = pub.publicUrl;
  const record_id = crypto.randomUUID();
  const submission_date = new Date().toISOString();
  const { error } = await supabase.from('compliance_records').insert({
    record_id,
    farm_id: farmId,
    document_type,
    file_url: url,
    submitted_by: user.id,
    submission_date,
    status: 'pending',
  } as any);
  if (error) throw error;
  return { record_id, file_url: url } as any;
}

export async function getComplianceFileUrl(path: string, expiresInSeconds = 3600) {
  const { data, error } = await supabase.storage.from('compliance_docs').createSignedUrl(path, expiresInSeconds);
  if (error) return path;
  return data.signedUrl;
}

export async function listComplianceRecordsByFarm(farmId: string) {
  const { data, error } = await supabase.from('compliance_records').select('*').eq('farm_id', farmId).order('submission_date', { ascending: false });
  if (error) return [];
  return (data || []) as any[];
}

export async function setComplianceStatus(recordId: string, status: any) {
  const { error } = await supabase.from('compliance_records').update({ status }).eq('record_id', recordId);
  if (error) throw error;
  return { id: recordId, status } as any;
}

export async function listAlertsByLocation(location?: string, severity?: any) {
  const { data, error } = await supabase.from('alerts').select('*');
  if (error) return [];
  let rows = (data || []) as any[];
  if (location) rows = rows.filter((r) => ((`${r.district || ''}${r.state ? ', ' + r.state : ''}`).toLowerCase().includes(location.toLowerCase())));
  if (severity) rows = rows.filter((r) => r.severity === severity);
  return rows;
}

export async function createAlert(alert: any) {
  const alert_id = crypto.randomUUID();
  const issued_date = new Date().toISOString();
  const body = { alert_id, issued_date, ...alert };
  const { error } = await supabase.from('alerts').insert(body as any);
  if (error) throw error;
  return body as any;
}

export async function getFarmerSummary() { return { totalFarms: 0, averageRiskScore: 0, complianceProgress: '0/0' }; }
export async function getRegulatorSummary() { return { farmersOnboarded: 0, highRiskFarms: 0, pendingCompliance: 0 }; }
export async function savePushToken(_token: string, _platform?: string) { return { ok: true } as any; }

export async function listAllFarms() {
  const { data, error } = await supabase.from('farms').select('*');
  if (error) return [];
  const rows = (data || []) as any[];
  return rows.map((r) => ({ ...r, id: r.farm_id, name: r.farm_name }));
}

export async function listPendingCompliance() {
  const { data, error } = await supabase.from('compliance_records').select('*').eq('status', 'pending').order('submission_date', { ascending: false });
  if (error) return [];
  return (data || []) as any[];
}

// Seed helpers for demo
export async function seedDemoData() {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) throw new Error('Login required');
  const now = new Date().toISOString();

  await supabase.from('users').upsert({ uid: user.id, role: 'farmer', email: user.email || null, name: (user.user_metadata as any)?.name || 'Farmer', created_at: now } as any, { onConflict: 'uid' } as any);

  const tm1 = { module_id: 'mod-safe-housing', title: 'Safe Poultry Housing', description: 'Reduce infection risk with proper housing.', type: 'video', link: 'https://www.youtube.com/watch?v=ysz5S6PUM-U', livestock_type: 'poultry', language: 'hi' };
  const tm2 = { module_id: 'mod-biosecurity-basics', title: 'Biosecurity Basics for Pig Farms', description: 'Visitor control, PPE, and hygiene.', type: 'pdf', link: 'https://www.who.int/docs/default-source/food-safety/biosecurity.pdf', livestock_type: 'pig', language: 'en' };
  const tm3 = { module_id: 'mod-disease-prevention-quiz', title: 'Disease Prevention Quiz', description: 'Test your knowledge on prevention.', type: 'quiz', link: '#', livestock_type: 'both', language: 'en' };
  await supabase.from('training_modules').upsert([tm1, tm2, tm3] as any, { onConflict: 'module_id' });

  const a1 = { alert_id: 'alert-ai-nadia', disease_name: 'Avian Influenza', description: 'Outbreak reported in Nadia district.', district: 'Nadia', state: 'West Bengal', severity: 'high', issued_by: 'govt', issued_date: now };
  const a2 = { alert_id: 'alert-asf-north', disease_name: 'African Swine Fever', description: 'ASF reported in nearby district.', district: 'North 24 Parganas', state: 'West Bengal', severity: 'medium', issued_by: 'govt', issued_date: now };
  await supabase.from('alerts').upsert([a1, a2] as any, { onConflict: 'alert_id' });

  const farmsRes = await supabase.from('farms').select('farm_id').eq('farmer_uid', user.id).limit(1);
  let farmId = farmsRes.data?.[0]?.farm_id as string | undefined;
  if (!farmId) {
    const f = { farm_id: crypto.randomUUID(), farmer_uid: user.id, farm_name: 'Shanti Poultry Farm', district: 'Nadia', state: 'West Bengal', livestock_type: 'poultry', herd_size: 500, biosecurity_level: 'medium', created_at: now } as any;
    await supabase.from('farms').insert(f as any);
    farmId = f.farm_id;
  }

  if (farmId) {
    const ra = { assessment_id: crypto.randomUUID(), farm_id: farmId, date: now, score: 65, risk_level: 'medium', answers: { fencing: 'yes', ppe: 'no', vaccination: 'yes', visitor_control: 'no' } };
    await supabase.from('risk_assessments').insert(ra as any);
  }

  if (farmId) {
    const record_id = 'sample-record';
    await supabase.from('compliance_records').upsert({ record_id, farm_id: farmId, document_type: 'vaccination', file_url: 'https://example.com/vaccination.pdf', status: 'pending', submission_date: now } as any, { onConflict: 'record_id' });
  }

  return { ok: true } as any;
}
