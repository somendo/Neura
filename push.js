const {json,getSupabase,getUser,requireActive}=require('./_lib');
module.exports=async(req,res)=>{try{const {action,subscription}=req.body||{};if(action==='vapid')return json(res,200,{publicKey:process.env.VAPID_PUBLIC_KEY||''});const sb=getSupabase();const {user,profile}=await getUser(req);requireActive(profile);
 if(action==='subscribe'){if(!subscription?.endpoint)return json(res,400,{error:'Bad subscription'});await sb.from('push_subscriptions').upsert({user_id:user.id,endpoint:subscription.endpoint,subscription,active:true,last_used_at:new Date().toISOString()},{onConflict:'endpoint'});return json(res,200,{ok:true});}
 return json(res,400,{error:'Unknown action'});
}catch(e){json(res,500,{error:e.message})}}
