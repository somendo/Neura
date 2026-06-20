const {json,getSupabase,getUser,isAdmin}=require('./_lib');
module.exports=async(req,res)=>{try{const sb=getSupabase();const {profile}=await getUser(req);if(!isAdmin(profile))return json(res,403,{error:'Admin only'});const {action}=req.body||{};
 if(action==='overview'){
  const [users,payments,usage,risks,doctors]=await Promise.all([
   sb.from('profiles').select('id,subscription_status,created_at',{count:'exact',head:false}).limit(1000),
   sb.from('payment_requests').select('*').order('created_at',{ascending:false}).limit(200),
   sb.from('usage_logs').select('*').order('created_at',{ascending:false}).limit(200),
   sb.from('risk_events').select('*').order('created_at',{ascending:false}).limit(50),
   sb.from('doctor_directory').select('*').order('created_at',{ascending:false}).limit(100)
  ]);
  const p=payments.data||[];const approved=p.filter(x=>x.status==='approved').reduce((a,b)=>a+(b.amount_bdt||0),0);return json(res,200,{ok:true,users:users.data||[],payments:p,usage:usage.data||[],risks:risks.data||[],doctors:doctors.data||[],revenue_bdt:approved});
 }
 if(action==='users'){
  const {data}=await sb.from('profiles').select('id,email,full_name,phone,role,subscription_status,subscription_plan,subscription_expires_at,support_consent_until,created_at').order('created_at',{ascending:false}).limit(200);return json(res,200,{ok:true,users:data||[]});
 }
 return json(res,400,{error:'Unknown action'});
}catch(e){json(res,500,{error:e.message})}}
