const {json,getSupabase,getUser,requireActive}=require('./_lib');
function bdUtc(dateStr,time){return new Date(`${dateStr}T${time}:00+06:00`).toISOString()}
function dateAdd(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)}
module.exports=async(req,res)=>{try{const sb=getSupabase();const {user,profile}=await getUser(req);requireActive(profile);const {action}=req.body||{};
 if(action==='list'){
  const {data:meds}=await sb.from('medications').select('*, medication_schedules(*), medication_events(*)').eq('user_id',user.id).order('created_at',{ascending:false});return json(res,200,{ok:true,medications:meds||[]});
 }
 if(action==='create'){
  const {name,dose,instruction,times=[],start_date,end_date}=req.body;if(!name)return json(res,400,{error:'Medicine name required'});
  const {data:med,error}=await sb.from('medications').insert({user_id:user.id,name,dose,instruction,start_date:start_date||new Date().toISOString().slice(0,10),end_date:end_date||null,confirmed_by_user:true}).select('*').single();if(error)return json(res,400,{error:error.message});
  await makeSchedules(sb,user.id,med,times);return json(res,200,{ok:true,medication:med});
 }
 if(action==='confirm'){
  const {medication_id,times=[],start_date,end_date}=req.body;const {data:med,error}=await sb.from('medications').update({confirmed_by_user:true,start_date:start_date||undefined,end_date:end_date||undefined}).eq('id',medication_id).eq('user_id',user.id).select('*').single();if(error)return json(res,400,{error:error.message});
  await sb.from('medication_schedules').delete().eq('medication_id',medication_id).eq('user_id',user.id);await sb.from('medication_events').delete().eq('medication_id',medication_id).eq('user_id',user.id).neq('status','taken');
  await makeSchedules(sb,user.id,med,times);return json(res,200,{ok:true});
 }
 if(action==='event'){
  const {event_id,status}=req.body;if(!['taken','skipped','snoozed'].includes(status))return json(res,400,{error:'Bad status'});const patch={status};if(status==='taken')patch.taken_at=new Date().toISOString();if(status==='snoozed')patch.snoozed_until=new Date(Date.now()+10*60000).toISOString();await sb.from('medication_events').update(patch).eq('id',event_id).eq('user_id',user.id);return json(res,200,{ok:true});
 }
 return json(res,400,{error:'Unknown action'});
}catch(e){json(res,e.message.includes('SUBSCRIPTION')?402:500,{error:e.message})}}
async function makeSchedules(sb,user_id,med,times){const clean=(times||[]).filter(Boolean);for(const t of clean){const {data:s}=await sb.from('medication_schedules').insert({user_id,medication_id:med.id,time_of_day:t,timezone:'Asia/Dhaka'}).select('*').single();const start=med.start_date||new Date().toISOString().slice(0,10);const end=med.end_date||dateAdd(start,30);let rows=[];for(let i=0;i<60;i++){const ds=dateAdd(start,i);if(ds>end)break;rows.push({user_id,medication_id:med.id,schedule_id:s.id,scheduled_at:bdUtc(ds,t),status:'pending'});}if(rows.length)await sb.from('medication_events').insert(rows)}}
