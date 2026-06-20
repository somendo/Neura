const {json,getSupabase,getUser,requireActive,geminiVisionJSON,usage}=require('./_lib');
module.exports=async(req,res)=>{try{const sb=getSupabase();const {user,profile}=await getUser(req);requireActive(profile);const {action}=req.body||{};
 if(action==='list'){const {data}=await sb.from('reports').select('*').eq('user_id',user.id).order('created_at',{ascending:false});return json(res,200,{ok:true,reports:data||[]});}
 if(action==='analyze'){
  const {dataUrl,mimeType,fileName,kind='prescription'}=req.body;if(!dataUrl)return json(res,400,{error:'File data required'});
  const prompt=`You are Neura document extraction for Bangladesh healthcare companion. Read the visible prescription/report image. Do not invent text. If handwriting is unclear mark needsManualConfirmation true. Never prescribe or change medication. Output strict JSON with fields: summary, documentType, doctorName, date, followUpDate, medicines[{name,dose,frequency,timesOfDay,mealInstruction,duration,confidence}], labs[{name,value,unit,referenceRange,flag,confidence}], warnings[], suggestedSpecialist, needsManualConfirmation. timesOfDay should be array like ["08:00","21:00"] only if clearly inferable, otherwise empty.`;
  const extracted=await geminiVisionJSON(prompt,dataUrl,mimeType);
  const {data:rep,error}=await sb.from('reports').insert({user_id:user.id,file_name:fileName,file_type:mimeType,kind,summary:extracted.summary||'',extracted}).select('*').single();if(error)return json(res,400,{error:error.message});
  const meds=[];for(const m of (extracted.medicines||[])){if(m.name){const {data:med}=await sb.from('medications').insert({user_id:user.id,report_id:rep.id,name:m.name,dose:m.dose||'',instruction:[m.frequency,m.mealInstruction,m.duration].filter(Boolean).join(' • '),doctor_name:extracted.doctorName||'',confirmed_by_user:false}).select('*').single();meds.push({...med,suggestedTimes:m.timesOfDay||[]});}}
  await usage(sb,user.id,'report_scan',{kind,medicines:meds.length});return json(res,200,{ok:true,report:rep,extracted,medications:meds});
 }
 return json(res,400,{error:'Unknown action'});
}catch(e){json(res,e.message.includes('SUBSCRIPTION')?402:500,{error:e.message})}}
