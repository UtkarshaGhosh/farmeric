import { supabase } from './client'
import type { Tables, TablesInsert, Enums } from './types'

export async function signInWithEmailOtp(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
  if (error) throw error
  return data
}

export async function signInWithPhoneOtp(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({ phone })
  if (error) throw error
  return data
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getCurrentUserProfile() {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) return null
  const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single<Tables<'users'>>()
  if (error) throw error
  return data
}

// Farms
export async function createFarm(input: Omit<TablesInsert<'farms'>, 'id' | 'updated_at' | 'created_at'>) {
  const { data, error } = await supabase.from('farms').insert(input).select('*').single<Tables<'farms'>>()
  if (error) throw error
  return data
}

export async function listMyFarms() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase.from('farms').select('*').eq('farmer_id', user.id).order('created_at', { ascending: false })
  if (error) throw error
  return data as Tables<'farms'>[]
}

// Risk Assessments
export async function submitRiskAssessment(input: Omit<TablesInsert<'risk_assessments'>, 'id' | 'date' | 'risk_level'>) {
  const { data, error } = await supabase.from('risk_assessments').insert(input).select('*').single<Tables<'risk_assessments'>>()
  if (error) throw error
  return data
}

export async function listFarmAssessments(farmId: string) {
  const { data, error } = await supabase.from('risk_assessments').select('*').eq('farm_id', farmId).order('date', { ascending: false })
  if (error) throw error
  return data as Tables<'risk_assessments'>[]
}

// Training Modules
export async function listTrainingModules(params: { livestock_type?: Enums<'livestock_type'>, language?: Enums<'language'>, type?: Enums<'module_type'> }) {
  let query = supabase.from('training_modules').select('*')
  if (params.livestock_type) query = query.eq('livestock_type', params.livestock_type)
  if (params.language) query = query.eq('language', params.language)
  if (params.type) query = query.eq('type', params.type)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data as Tables<'training_modules'>[]
}

export async function upsertTrainingModule(module: Partial<Tables<'training_modules'>> & Pick<Tables<'training_modules'>, 'title' | 'type' | 'link' | 'livestock_type'>) {
  const { data, error } = await supabase.from('training_modules').upsert(module).select('*').single<Tables<'training_modules'>>()
  if (error) throw error
  return data
}

// Compliance Records (Storage + Row)
export async function uploadComplianceDocument(farmId: string, file: File, document_type: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const path = `farm/${farmId}/${crypto.randomUUID()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from('compliance').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'application/octet-stream'
  })
  if (uploadError) throw uploadError

  const { data, error } = await supabase.from('compliance_records').insert({
    farm_id: farmId,
    document_type,
    file_url: path,
    submitted_by: user.id
  } satisfies TablesInsert<'compliance_records'>).select('*').single<Tables<'compliance_records'>>()
  if (error) throw error
  return data
}

export async function getComplianceFileUrl(path: string, expiresInSeconds = 3600) {
  const { data, error } = await supabase.storage.from('compliance').createSignedUrl(path, expiresInSeconds)
  if (error) throw error
  return data.signedUrl
}

export async function listComplianceRecordsByFarm(farmId: string) {
  const { data, error } = await supabase.from('compliance_records').select('*').eq('farm_id', farmId).order('submission_date', { ascending: false })
  if (error) throw error
  return data as Tables<'compliance_records'>[]
}

export async function setComplianceStatus(recordId: string, status: Enums<'record_status'>) {
  const { data, error } = await supabase.from('compliance_records').update({ status }).eq('id', recordId).select('*').single<Tables<'compliance_records'>>()
  if (error) throw error
  return data
}

// Alerts
export async function listAlertsByLocation(location?: string, severity?: Enums<'alert_severity'>) {
  let query = supabase.from('alerts').select('*')
  if (location) query = query.ilike('location', `%${location}%`)
  if (severity) query = query.eq('severity', severity)
  const { data, error } = await query.order('issued_date', { ascending: false })
  if (error) throw error
  return data as Tables<'alerts'>[]
}

export async function createAlert(alert: Omit<Tables<'alerts'>, 'id' | 'issued_date'>) {
  const { data, error } = await supabase.from('alerts').insert(alert).select('*').single<Tables<'alerts'>>()
  if (error) throw error
  return data
}

// Dashboards
export async function getFarmerSummary() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const [{ data: farms }, { data: assessments }, { data: compliance } ] = await Promise.all([
    supabase.from('farms').select('id, biosecurity_level'),
    supabase.from('risk_assessments').select('score, risk_level, farm_id'),
    supabase.from('compliance_records').select('status')
  ])
  const totalFarms = (farms || []).length
  const avgRisk = (assessments || []).reduce((acc, a) => acc + (a.score || 0), 0) / Math.max(1, (assessments || []).length)
  const completedCompliance = (compliance || []).filter(c => c.status === 'Approved').length
  const totalCompliance = (compliance || []).length
  return {
    totalFarms,
    averageRiskScore: Math.round(avgRisk),
    complianceProgress: `${completedCompliance}/${totalCompliance}`
  }
}

export async function getRegulatorSummary() {
  const [{ data: farmers }, { data: highRisk }, { data: pending }] = await Promise.all([
    supabase.from('users').select('id').eq('role','farmer'),
    supabase.from('risk_assessments').select('id').eq('risk_level','high'),
    supabase.from('compliance_records').select('id').eq('status','Pending')
  ])
  return {
    farmersOnboarded: (farmers || []).length,
    highRiskFarms: (highRisk || []).length,
    pendingCompliance: (pending || []).length
  }
}

// Notifications
export async function savePushToken(token: string, platform?: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase.from('push_tokens').upsert({ user_id: user.id, token, platform }).select('*').single<Tables<'push_tokens'>>()
  if (error) throw error
  return data
}
