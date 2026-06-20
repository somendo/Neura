const {json,getSupabase,getAnonSupabase,getUser,ADMIN_EMAIL,SUPABASE_URL,SUPABASE_ANON_KEY}=require('./_lib');
module.exports=async(req,res)=>{try{const sb=getSupabase();const anon=getAnonSupabase();const {action,email,password,profile={}}=req.body||{};
 if(req.method==='GET'){return json(res,200,{ok:true,configured:!!(SUPABASE_URL&&SUPABASE_ANON_KEY),supabaseUrl:SUPABASE_URL,anonKey:SUPABASE_ANON_KEY});}
 if(action==='signup'){
  if(!email||!password)return json(res,400,{error:'Email and password required'});
  const {data,error}=await sb.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:profile.full_name||''}});
  if(error)return json(res,400,{error:error.message});
  const role=(ADMIN_EMAIL&&email.toLowerCase()===ADMIN_EMAIL.toLowerCase())?'admin':'user';
  await sb.from('profiles').upsert({id:data.user.id,email,full_name:profile.full_name||'',phone:profile.phone||'',age:profile.age||null,sex:profile.sex||'',language:profile.language||'en',conditions:profile.conditions||'',allergies:profile.allergies||'',emergency_contact:profile.emergency_contact||'',role,subscription_status:role==='admin'?'active':'inactive'});
  const signin=await anon.auth.signInWithPassword({email,password});
  if(signin.error)return json(res,200,{ok:true,needsLogin:true,message:'Account created. Please sign in.'});
  return json(res,200,{ok:true,session:signin.data.session,role});
 }
 if(action==='signin'){
  const {data,error}=await anon.auth.signInWithPassword({email,password});
  if(error)return json(res,401,{error:error.message});
  return json(res,200,{ok:true,session:data.session});
 }
 if(action==='me'){
  const {user,profile}=await getUser(req);
  return json(res,200,{ok:true,user:{id:user.id,email:user.email},profile});
 }
 return json(res,400,{error:'Unknown action'});
}catch(e){json(res,500,{error:e.message})}}
