const {json,getSupabase,getUser,requireActive}=require('./_lib');
module.exports=async(req,res)=>{try{const sb=getSupabase();const {user,profile}=await getUser(req);const {action}=req.body||{};
 if(action==='update'){
  const allowed=['full_name','phone','age','sex','language','conditions','allergies','emergency_contact','support_consent_until'];const patch={updated_at:new Date().toISOString()};for(const k of allowed)if(k in req.body)patch[k]=req.body[k];
  const {data,error}=await sb.from('profiles').update(patch).eq('id',user.id).select('*').single();if(error)return json(res,400,{error:error.message});return json(res,200,{ok:true,profile:data});
 }
 if(action==='checkin'){
  requireActive(profile);const {feeling,sleep_hours,steps,note}=req.body;await sb.from('checkins').insert({user_id:user.id,feeling,sleep_hours,steps,note});return json(res,200,{ok:true});
 }
 return json(res,400,{error:'Unknown action'});
}catch(e){json(res,e.message.includes('SUBSCRIPTION')?402:500,{error:e.message})}}
