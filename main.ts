import fs from'node:fs';
import path from'node:path';
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
for(const id of fs.readdirSync(I).sort()){
 const d=path.join(I,id),p=fs.readFileSync(path.join(d,'program.bin')),n=fs.readFileSync(path.join(d,'input.bin'));
 const s=new Int32Array(256),c=new Int32Array(64),m=new Int32Array(256),o=new Uint8Array(65536);
 let pc=0,sp=0,cp=0,ip=0,used=0,steps=0,exit=0,done=false;
 while(!done){
  if(steps>=1e6){exit=10;break}
  if(pc<0||pc>=p.length){exit=9;break}
  const op=p[pc];
  if(!(op<=7||op>=16&&op<=30||op>=32&&op<=34||op>=48&&op<=52||op===64||op===65||op>=80&&op<=83)){exit=5;break}
  pc++;
  const size=op===1?1:op===2?4:op>=48&&op<=51?2:0;
  if(pc+size>p.length){exit=9;break}
  const need=op===3||op===4||op===23||op===27||op===49||op===50||op===64||op===80||op===81||op===83?1:
   op===5||op===6||op>=16&&op<=22||op>=24&&op<=26||op>=28&&op<=30||op>=32&&op<=34||op===65?2:op===7?3:0;
  if(sp<need){exit=2;break}
  if((op===1||op===2||op===4||op===6||op===82)&&sp===256){exit=3;break}
  const imm=op===1?p[pc]:op===2?p.readInt32LE(pc):op>=48&&op<=50?p.readInt16LE(pc):op===51?p[pc]|p[pc+1]<<8:0;
  const a=sp>1?s[sp-2]:0,b=sp?s[sp-1]:0;
  if(op>=19&&op<=22&&b===0){exit=4;break}
  if(op===51&&cp===64||op===52&&cp===0){exit=op===51?7:8;break}
  if((op===64||op===65)&&(b<0||b>255)){exit=6;break}
  if(op===80||op===81){
   const t=op===80?String(b):'',len=op===80?t.length:1;
   if(used+len>o.length){exit=11;break}
   if(op===80){for(let i=0;i<len;i++)o[used++]=t.charCodeAt(i)}else o[used++]=b&255;
  }
  steps++;
  const next=pc+size;pc=next;
  switch(op){
   case 0:done=true;break;
   case 1:s[sp++]=(imm<<24)>>24;break;
   case 2:s[sp++]=imm;break;
   case 3:sp--;break;
   case 4:s[sp]=s[sp-1];sp++;break;
   case 5:s[sp-2]=b;s[sp-1]=a;break;
   case 6:s[sp++]=a;break;
   case 7:{const x=s[sp-3];s[sp-3]=a;s[sp-2]=b;s[sp-1]=x;break}
   case 16:sp-=2;s[sp++]=a+b;break;
   case 17:sp-=2;s[sp++]=a-b;break;
   case 18:sp-=2;s[sp++]=Math.imul(a,b);break;
   case 19:sp-=2;s[sp++]=a===-2147483648&&b===-1?-2147483648:Math.trunc(a/b);break;
   case 20:sp-=2;s[sp++]=a===-2147483648&&b===-1?0:a%b;break;
   case 21:sp-=2;s[sp++]=((a>>>0)/(b>>>0))|0;break;
   case 22:sp-=2;s[sp++]=((a>>>0)%(b>>>0))|0;break;
   case 23:s[sp-1]=-b;break;
   case 24:sp-=2;s[sp++]=a&b;break;
   case 25:sp-=2;s[sp++]=a|b;break;
   case 26:sp-=2;s[sp++]=a^b;break;
   case 27:s[sp-1]=~b;break;
   case 28:sp-=2;s[sp++]=a<<(b&31);break;
   case 29:sp-=2;s[sp++]=a>>(b&31);break;
   case 30:sp-=2;s[sp++]=a>>>(b&31);break;
   case 32:sp-=2;s[sp++]=a===b?1:0;break;
   case 33:sp-=2;s[sp++]=a<b?1:0;break;
   case 34:sp-=2;s[sp++]=(a>>>0)<(b>>>0)?1:0;break;
   case 48:pc=next+imm;break;
   case 49:sp--;if(b===0)pc=next+imm;break;
   case 50:sp--;if(b!==0)pc=next+imm;break;
   case 51:c[cp++]=next;pc=imm;break;
   case 52:pc=c[--cp];break;
   case 64:s[sp-1]=m[b];break;
   case 65:m[b]=a;sp-=2;break;
   case 80:case 81:sp--;break;
   case 82:s[sp++]=ip<n.length?n[ip++]:-1;break;
   case 83:exit=b&255;done=true;break;
  }
 }
 const dest=path.join(O,id);fs.mkdirSync(dest,{recursive:true});
 fs.writeFileSync(path.join(dest,'stdout.bin'),o.subarray(0,used));
 fs.writeFileSync(path.join(dest,'exit.txt'),String(exit)+'\n');
}
