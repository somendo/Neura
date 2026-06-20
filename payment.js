const {json,getSupabase,getUser,isAdmin}=require('./_lib');
const PRICES={monthly:499,yearly:5990};
module.exports=async(req,res)=>{try{const sb=getSupabase();const {user,profile}=await getUser(req);const {action}=req.body||{};
 if(action==='request'){
  const {plan,method,transaction_id,sender_phone,note}=req.body; if(!PRICES[plan])return json(res,400,{error:'Invalid plan'});
  const {data,error}=await sb.from('payment_requests').insert({user_id:user.id,plan,amount_bdt:PRICES[plan],method,transaction_id,sender_phone,note,status:'pending'}).select('*').single();
  if(error)return json(res,400,{error:error.message}); await sb.from('profiles').update({subscription_status:'pending',subscription_plan:plan}).eq('id',user.id);
  return json(res,200,{ok:true,payment:data});
 }
 if(action==='my'){
  const {data}=await sb.from('payment_requests').select('*').eq('user_id',user.id).order('created_at',{ascending:false});return json(res,200,{ok:true,payments:data||[]});
 }
 if(action==='list'){
  if(!isAdmin(profile))return json(res,403,{error:'Admin only'});
  const {data}=await sb.from('payment_requests').select('*, profiles(email,full_name,phone,subscription_status)').order('created_at',{ascending:false}).limit(100);return json(res,200,{ok:true,payments:data||[]});
 }
 if(action==='approve'||action==='reject'){
  if(!isAdmin(profile))return json(res,403,{error:'Admin only'});const {id}=req.body;const {data:pay,error}=await sb.from('payment_requests').select('*').eq('id',id).single();if(error)return json(res,404,{error:'Payment not found'});
  if(action==='reject'){await sb.from('payment_requests').update({status:'rejected',approved_by:user.id,approved_at:new Date().toISOString()}).eq('id',id);await sb.from('profiles').update({subscription_status:'rejected'}).eq('id',pay.user_id);return json(res,200,{ok:true});}
  const days=pay.plan==='yearly'?365:30;const expires=new Date(Date.now()+days*86400000).toISOString();
  await sb.from('payment_requests').update({status:'approved',approved_by:user.id,approved_at:new Date().toISOString(),expires_at:expires}).eq('id',id);
  await sb.from('profiles').update({subscription_status:'active',subscription_plan:pay.plan,subscription_expires_at:expires}).eq('id',pay.user_id);
  return json(res,200,{ok:true,expires_at:expires});
 }
 return json(res,400,{error:'Unknown action'});
}catch(e){json(res,e.message.includes('TOKEN')?401:500,{error:e.message})}}
