const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DB = path.join(__dirname, 'data', 'store.json');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const read = () => JSON.parse(fs.readFileSync(DB, 'utf8'));
const write = data => fs.writeFileSync(DB, JSON.stringify(data, null, 2));
const nextId = rows => Math.max(0, ...rows.map(x => x.id || 0)) + 1;
const eligible = (student, job) => !!student && !!job &&
  student.cgpa >= job.minCgpa && student.backlogs <= job.maxBacklogs &&
  job.branches.includes(student.branch);
app.get('/api/overview', (req,res) => {
 const d=read(), total=d.students.length, placed=d.offers.filter(o=>o.status==='Accepted').length;
 res.json({students:total,companies:d.companies.length,jobs:d.jobs.filter(j=>j.status==='Open').length,
 applications:d.applications.length,placed,placementRate:total?Math.round(placed/total*100):0,
 shortlisted:d.applications.filter(a=>a.status==='Shortlisted').length,
 interviews:d.interviews.length,offers:d.offers.length});
});
app.get('/api/data', (req,res)=>res.json(read()));
app.get('/api/jobs', (req,res)=>res.json(read().jobs));
app.get('/api/jobs/:id/eligibility/:studentId', (req,res)=>{
 const d=read(), s=d.students.find(x=>x.id===+req.params.studentId), j=d.jobs.find(x=>x.id===+req.params.id);
 if(!s||!j) return res.status(404).json({error:'Student or job not found'});
 res.json({eligible:eligible(s,j),reasons:[...(s.cgpa<j.minCgpa?['CGPA below minimum']:[]),...(s.backlogs>j.maxBacklogs?['Too many active backlogs']:[]),...(!j.branches.includes(s.branch)?['Branch not eligible']:[])]});
});
app.post('/api/applications', (req,res)=>{
 const d=read(), {studentId,jobId}=req.body, s=d.students.find(x=>x.id===+studentId), j=d.jobs.find(x=>x.id===+jobId);
 if(!s||!j) return res.status(404).json({error:'Student or job not found'});
 if(!eligible(s,j)) return res.status(400).json({error:'You do not meet this job’s eligibility criteria.'});
 if(d.applications.some(a=>a.studentId===s.id&&a.jobId===j.id)) return res.status(409).json({error:'You have already applied to this job.'});
 const item={id:nextId(d.applications),studentId:s.id,jobId:j.id,status:'Applied',appliedAt:new Date().toISOString().slice(0,10)};
 d.applications.push(item); write(d); res.status(201).json(item);
});
app.patch('/api/applications/:id/status', (req,res)=>{
 const d=read(), a=d.applications.find(x=>x.id===+req.params.id), allowed=['Applied','Shortlisted','Rejected','Interview Scheduled','Offer Issued'];
 if(!a) return res.status(404).json({error:'Application not found'});
 if(!allowed.includes(req.body.status)) return res.status(400).json({error:'Invalid status'});
 a.status=req.body.status; write(d); res.json(a);
});
app.post('/api/interviews', (req,res)=>{
 const d=read(), {applicationId,date,time,mode}=req.body, a=d.applications.find(x=>x.id===+applicationId);
 if(!a) return res.status(404).json({error:'Application not found'});
 const item={id:nextId(d.interviews),applicationId:a.id,date,time,mode,result:'Pending'};
 d.interviews.push(item); a.status='Interview Scheduled'; write(d); res.status(201).json(item);
});
app.post('/api/offers', (req,res)=>{
 const d=read(), {applicationId,package:pkg}=req.body, a=d.applications.find(x=>x.id===+applicationId);
 if(!a) return res.status(404).json({error:'Application not found'});
 const item={id:nextId(d.offers),applicationId:a.id,package:pkg,status:'Pending'};
 d.offers.push(item); a.status='Offer Issued'; write(d); res.status(201).json(item);
});
app.patch('/api/offers/:id', (req,res)=>{
 const d=read(), o=d.offers.find(x=>x.id===+req.params.id);
 if(!o) return res.status(404).json({error:'Offer not found'});
 if(!['Accepted','Declined','Pending'].includes(req.body.status)) return res.status(400).json({error:'Invalid offer status'});
 o.status=req.body.status; write(d); res.json(o);
});
app.post('/api/jobs', (req,res)=>{
 const d=read(), j=req.body;
 if(!j.title||!j.companyId||!Number.isFinite(+j.minCgpa)||!Number.isFinite(+j.maxBacklogs)) return res.status(400).json({error:'Complete all required job fields'});
 const item={id:nextId(d.jobs),companyId:+j.companyId,title:j.title,location:j.location||'Not specified',package:j.package||'Not disclosed',minCgpa:+j.minCgpa,maxBacklogs:+j.maxBacklogs,branches:Array.isArray(j.branches)?j.branches:['CSE','IT'],description:j.description||'',type:j.type||'Full-time',status:'Open'};
 d.jobs.unshift(item); write(d); res.status(201).json(item);
});
app.listen(PORT,()=>console.log(`TalentHub running at http://localhost:${PORT}`));