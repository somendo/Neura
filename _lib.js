const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

function json(res,status,data){res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));}
function getSupabase(){if(!SUPABASE_URL||!SUPABASE_SERVICE_ROLE_KEY)throw new Error('Missing Supabase env vars');return createClient(SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}})}
function getAnonSupabase(){if(!SUPABASE_URL||!SUPABASE_ANON_KEY)throw new Error('Missing Supabase anon env vars');return createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:false}})}
async function getUser(req){const h=req.headers.authorization||'';const token=h.startsWith('Bearer ')?h.slice(7):null;if(!token)throw new Error('NO_TOKEN');const sb=getSupabase();const {data,error}=await sb.auth.getUser(token);if(error||!data.user)throw new Error('INVALID_TOKEN');const {data:profile}=await sb.from('profiles').select('*').eq('id',data.user.id).maybeSingle();return {user:data.user,profile,token};}
function requireActive(profile){if(!profile)throw new Error('NO_PROFILE'); if(profile.role==='admin')return true; if(profile.subscription_status!=='active')throw new Error('SUBSCRIPTION_REQUIRED'); if(profile.subscription_expires_at && new Date(profile.subscription_expires_at)<new Date())throw new Error('SUBSCRIPTION_EXPIRED'); return true;}
function isAdmin(profile){return profile?.role==='admin'}
function emergency(text=''){return /(chest pain|heart attack|stroke|face droop|arm weakness|slurred speech|unconscious|not breathing|severe bleeding|seizure|suicide|poison|anaphylaxis|major accident|বুক ব্যথা|স্ট্রোক|অজ্ঞান|শ্বাসকষ্ট|রক্তপাত|খিঁচুনি)/i.test(text)}
function specialty(text=''){const t=text.toLowerCase();const map=[['heart|chest|cardiac|বুক','Cardiologist'],['stroke|nerve|weakness|neurology|মাথা ঘোরা','Neurologist'],['skin|rash|itch|চুলকানি','Dermatologist'],['stomach|gastric|abdomen|পেট','Gastroenterologist'],['fever|cough|flu|জ্বর|কাশি','Medicine Specialist'],['diabetes|sugar','Endocrinologist'],['pregnan|period|gyne|গর্ভ','Gynecologist / Obstetrician'],['eye|vision|চোখ','Ophthalmologist'],['tooth|dental|দাঁত','Dentist'],['mental|anxiety|depress','Psychiatrist / Psychologist']];for(const [re,s] of map)if(new RegExp(re,'i').test(t))return s;return 'Medicine Specialist / General Physician'}
async function geminiJSON(prompt, parts=[]){if(!GEMINI_API_KEY)throw new Error('Missing GEMINI_API_KEY');const body={contents:[{role:'user',parts:[{text:prompt},...parts]}],generationConfig:{temperature:0.2,topP:0.85,maxOutputTokens:1800,responseMimeType:'application/json'}};const model=process.env.GEMINI_MODEL||'gemini-1.5-flash';const url=`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const raw=await r.text();if(!r.ok)throw new Error(raw);const data=JSON.parse(raw);const text=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('\n')||'{}';try{return JSON.parse(text)}catch{return {reply:text}}}
async function geminiVisionJSON(prompt, dataUrl, mimeType){const b64=String(dataUrl).includes(',')?String(dataUrl).split(',').pop():dataUrl;return geminiJSON(prompt,[{inline_data:{mime_type:mimeType||'image/jpeg',data:b64}}])}
async function usage(sb,user_id,type,meta={}){await sb.from('usage_logs').insert({user_id,type,meta})}
module.exports={json,getSupabase,getAnonSupabase,getUser,requireActive,isAdmin,emergency,specialty,geminiJSON,geminiVisionJSON,usage,ADMIN_EMAIL,SUPABASE_URL,SUPABASE_ANON_KEY};
