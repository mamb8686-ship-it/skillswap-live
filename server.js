const express=require('express');const http=require('http');const path=require('path');const {Server}=require('socket.io');
const app=express(),server=http.createServer(app),io=new Server(server,{cors:{origin:'*'}});const PORT=process.env.PORT||10000;
app.use(express.static(path.join(__dirname,'public')));app.get('/health',(_,res)=>res.json({ok:true}));
io.on('connection',s=>{s.emit('connected',{id:s.id,online:io.engine.clientsCount});
 s.on('set-profile',d=>{s.data.name=d?.name||'مستخدم';s.data.avatar=d?.avatar||''});
 s.on('find-match',d=>{s.data.teach=String(d?.teach||'').trim();s.data.learn=String(d?.learn||'').trim();let p=null;for(const [id,x] of io.sockets.sockets){if(id===s.id||!x.data.teach||!x.data.learn)continue;let a=s.data.teach.toLowerCase(),b=s.data.learn.toLowerCase(),c=x.data.teach.toLowerCase(),dd=x.data.learn.toLowerCase();if(a.includes(dd)||dd.includes(a)||b.includes(c)||c.includes(b)){p=x;break}}if(!p){s.emit('match-waiting');return}let room=`match-${s.id}-${p.id}-${Date.now()}`;s.join(room);p.join(room);s.data.roomId=p.data.roomId=room;s.emit('matched',{roomId:room,initiator:true,partnerId:p.id,partnerName:p.data.name||'شريك التبادل'});p.emit('matched',{roomId:room,initiator:false,partnerId:s.id,partnerName:s.data.name||'شريك التبادل'})});
 for(const e of ['offer','answer','ice-candidate'])s.on(e,d=>{if(s.data.roomId)s.to(s.data.roomId).emit(e,d)});
 s.on('leave-call',()=>{if(s.data.roomId)s.to(s.data.roomId).emit('peer-left')});s.on('disconnect',()=>{if(s.data.roomId)s.to(s.data.roomId).emit('peer-left')});
});server.listen(PORT,'0.0.0.0',()=>console.log('SkillSwap Live on '+PORT));
