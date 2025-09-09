<h1 align="center">🌾 FarmGuard</h1>

<p align="center">
  <strong>FarmGuard is a digital platform to empower farmers and veterinarians with farm risk assessments, compliance tracking, training, and outbreak alerts — all backed by secure role-based access control using Supabase + PostgreSQL.</strong>
</p>

---

<h2>✨ Features</h2>
<ul>
  <li>👨‍🌾 <strong>Farmer Dashboard</strong> – Manage farms, upload compliance documents, complete risk assessments, and access training modules.</li>
  <li>🐾 <strong>Vet Dashboard</strong> – Review compliance records, oversee farm risk reports, and issue disease outbreak alerts.</li>
  <li>📑 <strong>Compliance Management</strong> – Farmers upload required documents, vets/admins review and approve.</li>
  <li>🎓 <strong>Training Modules</strong> – Access to multilingual training materials (video, PDF, quiz).</li>
  <li>🚨 <strong>Outbreak Alerts</strong> – Vets can issue disease outbreak alerts; farmers receive instant notifications.</li>
  <li>🔒 <strong>Secure Authentication</strong> – Supabase Auth + PostgreSQL RLS policies ensure farmers and vets can only access their own data.</li>
</ul>

---

<h2>🗄️ Database Schema</h2>
<p>The project uses <strong>Supabase (PostgreSQL)</strong> with row-level security (RLS). Key tables include:</p>

<ul>
  <li><code>users</code> – Farmer / Vet / Admin roles</li>
  <li><code>farms</code> – Farm details linked to farmers</li>
  <li><code>risk_assessments</code> – Farm risk scoring system</li>
  <li><code>compliance_records</code> & <code>compliance_docs</code> – Document uploads & vet reviews</li>
  <li><code>training_modules</code> – Multilingual training content</li>
  <li><code>alerts</code> & <code>outbreak_reports</code> – Disease outbreak and awareness system</li>
</ul>

---

<h2>🚀 Tech Stack</h2>
<ul>
  <li><strong>Backend:</strong> Supabase (PostgreSQL, Auth, Storage)</li>
  <li><strong>Frontend:</strong> React / Next.js or Builder.io generated UI</li>
  <li><strong>Storage:</strong> Supabase Storage for compliance documents</li>
  <li><strong>AI/ML (optional):</strong> Risk prediction model (future feature)</li>
</ul>

---

<h2>🔑 Authentication Flow</h2>
<ol>
  <li>Users sign up via email/phone & password (role = farmer by default).</li>
  <li>Vet sign-ups require invite code / admin approval.</li>
  <li>RLS policies restrict farmers to their own data; vets/admins can view/approve across farms.</li>
  <li>After login → Redirect to Farmer Dashboard or Vet Dashboard based on role.</li>
</ol>

---

<h2>📱 App Flow</h2>

<h3>For Farmers</h3>
<ul>
  <li>Login → Farmer Dashboard</li>
  <li>Register farm → Perform risk assessment</li>
  <li>Upload compliance docs → Track status (pending/approved/rejected)</li>
  <li>Access training modules in preferred language</li>
  <li>Receive outbreak alerts instantly</li>
</ul>

<h3>For Vets</h3>
<ul>
  <li>Login → Vet Dashboard</li>
  <li>View farms & risk assessments</li>
  <li>Review compliance records and approve/reject</li>
  <li>Upload/assign new training modules</li>
  <li>Issue outbreak alerts to farmers in affected regions</li>
</ul>

<h2>📜 License</h2>
<p>MIT License © 2025 FarmGuard Team</p>
