-- Sample Training Modules
insert into public.training_modules (title, description, type, link, livestock_type, language)
values
  ('Biosecurity Basics for Pig Farms', 'Introductory video on hygiene and farm access control', 'video', 'https://example.com/pig-biosecurity.mp4', 'pig', 'en'),
  ('सूअर फार्म बायोसेक्योरिटी', 'हाइजीन और प्रवेश नियंत्रण पर बुनियादी मॉड्यूल', 'pdf', 'https://example.com/pig-biosecurity-hi.pdf', 'pig', 'hi'),
  ('Poultry Farm Disinfection', 'Step-by-step guide for disinfection protocols', 'pdf', 'https://example.com/poultry-disinfection.pdf', 'poultry', 'en'),
  ('मुर्गी पालन टीकाकरण क्विज', 'टीकाकरण शेड्यूल पर प्रश्नोत्तरी', 'quiz', 'https://example.com/poultry-vaccine-quiz', 'poultry', 'hi')
on conflict do nothing;

-- Sample Alerts
insert into public.alerts (disease_name, description, location, severity)
values
  ('ASF', 'African Swine Fever suspected in nearby district', 'Nashik, MH', 'high'),
  ('Avian Influenza', 'H5N1 cases reported in region', 'Pune, MH', 'medium'),
  ('Classical Swine Fever', 'Vaccination drive scheduled', 'Kolhapur, MH', 'low')
on conflict do nothing;
