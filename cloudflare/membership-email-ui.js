(()=>{
 const states=new WeakMap(),normalize=v=>String(v??'').trim().toLowerCase();
 function ready(form,state){return !!state.verified&&state.email===normalize(form.querySelector('[name="email"]')?.value)}
 window.lumeovaEmailVerification={challengeFor(form){const state=states.get(form);return state&&ready(form,state)?state.challengeId:null}};
 function setup(form){
  if(states.has(form)){
   const existing=states.get(form);
   if(existing.pane&&!existing.pane.isConnected)form.querySelector('[type="submit"]')?.before(existing.pane);
   return;
  }
  const email=form.querySelector('[name="email"]'),label=email?.closest('label');if(!email||!label)return;
  const state={email:'',challengeId:null,verified:false,pending:false,nextSend:0};states.set(form,state);
  const pane=document.createElement('section');pane.dataset.membershipEmailVerification='true';pane.className='sm:col-span-2 rounded-sm border border-border p-4 space-y-3';pane.setAttribute('aria-label','정회원 이메일 인증');
  state.pane=pane;
  const title=document.createElement('p');title.textContent='이메일 인증 후 신청서 제출';title.className='font-semibold text-navy';
  const notice=document.createElement('p');notice.textContent='입력 내용 확인 → 위 개인정보 동의·스팸 방지 인증 → 인증번호 받기 → 6자리 번호 확인 → 신청서 제출 순서로 진행해 주세요.';notice.className='text-sm text-muted';
  const send=document.createElement('button');send.type='button';send.textContent='이메일 인증번호 받기';send.className='rounded-sm border border-navy px-4 py-2 text-sm text-navy';
  const codeRow=document.createElement('div');codeRow.hidden=true;
  const codeLabel=document.createElement('label');codeLabel.textContent='이메일 인증번호 (6자리)';codeLabel.className='block text-sm text-navy';
  const code=document.createElement('input');code.type='text';code.inputMode='numeric';code.autocomplete='one-time-code';code.maxLength=6;code.name='membershipEmailCode';code.pattern='[0-9]*';code.className='mt-2 w-full rounded-sm border border-border px-3 py-2';codeLabel.append(code);
  const confirm=document.createElement('button');confirm.type='button';confirm.textContent='인증번호 확인';confirm.className='mt-2 rounded-sm border border-navy px-4 py-2 text-sm text-navy';
  const message=document.createElement('p');message.setAttribute('role','status');message.setAttribute('aria-live','polite');message.tabIndex=-1;message.className='text-sm text-navy';
  codeRow.append(codeLabel,confirm);pane.append(title,notice,send,codeRow,message);const submit=form.querySelector('[type="submit"]');if(submit)submit.before(pane);else label.after(pane);
  const tell=(text,error=false)=>{message.textContent=text;message.setAttribute('role',error?'alert':'status');if(error){try{message.focus({preventScroll:true});message.scrollIntoView({block:'center'})}catch{message.focus()}}};
  function sync(){
   const regular=form.querySelector('[name="membershipTypeRadio"]:checked')?.value==='regular';pane.hidden=!regular;
   const same=state.email===normalize(email.value);
   if(!same){state.verified=false;state.challengeId=null;codeRow.hidden=true;code.value='';if(state.email)tell('이메일 주소가 변경되었습니다. 다시 인증해 주세요.');state.email=normalize(email.value)}
   const button=form.querySelector('[type="submit"]');
   if(button){if(regular&&!ready(form,state)){if(!button.disabled){button.disabled=true;button.dataset.emailGateDisabled='true'}}else if(button.dataset.emailGateDisabled){delete button.dataset.emailGateDisabled;button.disabled=false}}
   send.disabled=state.pending||Date.now()<state.nextSend;confirm.disabled=state.pending||state.verified;
   send.textContent=state.pending?'인증 처리 중...':state.nextSend>Date.now()?`재발송까지 ${Math.ceil((state.nextSend-Date.now())/1000)}초`:state.failed?'인증번호 다시 요청':state.verified?'인증번호 다시 받기':'이메일 인증번호 받기';
  }
  async function request(path,body,method='POST'){
   const controller=typeof AbortController==='function'?new AbortController():null;
   let timer;
   try{
    return await Promise.race([
     (async()=>{
      const response=await fetch('/api/membership/email/'+path,{method,credentials:'same-origin',cache:'no-store',
       ...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{}),...(controller?{signal:controller.signal}:{})});
      let data;try{data=await response.json()}catch{throw Error('서버 응답을 확인하지 못했습니다. 잠시 후 다시 요청해 주세요.')}
      if(!response.ok){const error=Error(typeof data?.error==='string'?data.error:'이메일 인증을 진행하지 못했습니다.');error.status=response.status;throw error}
      if(!data||data.ok!==true)throw Error('인증 처리 결과를 확인하지 못했습니다. 다시 요청해 주세요.');
      return data;
     })(),
     new Promise((resolve,reject)=>{timer=setTimeout(()=>{const error=Error('연결이 지연되고 있습니다. 메일함을 확인한 뒤 다시 요청해 주세요.');error.timedOut=true;reject(error);controller?.abort()},20000)})
    ]);
   }finally{clearTimeout(timer)}
  }
  let session;
  function ensureSession(){if(!session)session=request('session',null,'GET').catch(error=>{session=null;throw error});return session}
  send.addEventListener('click',async()=>{
   sync();if(state.pending||Date.now()<state.nextSend)return;
   if(!email.value.trim()||!email.validity.valid){tell('이메일 주소를 확인해 주세요.',true);email.focus();return}
   if(!form.querySelector('[name="privacyConsent"]')?.checked){tell('위 개인정보 수집 및 이용에 동의한 뒤 요청해 주세요.',true);form.querySelector('[name="privacyConsent"]')?.focus();return}
   const token=form.querySelector('[name="cf-turnstile-response"]')?.value??'';if(!token){tell('위 스팸 방지 인증이 완료될 때까지 기다린 뒤 다시 요청해 주세요. 카카오톡에서 인증이 계속 실패하면 Chrome 또는 Safari에서 같은 주소를 열어 주세요.',true);return}
   state.pending=true;state.failed=false;state.verified=false;sync();tell('인증번호를 요청하고 있습니다.');const submittedEmail=normalize(email.value);
   let submitted=false;
   try{await ensureSession();submitted=true;const result=await request('send',{email:submittedEmail,privacyConsent:true,turnstileToken:token});
    if(typeof result.challengeId!=='string'||!result.challengeId.trim())throw Error('인증 요청 정보를 받지 못했습니다. 다시 요청해 주세요.');
    if(normalize(email.value)!==submittedEmail){tell('이메일 주소가 변경되었습니다. 다시 인증해 주세요.');return}
    state.email=submittedEmail;state.challengeId=result.challengeId;state.nextSend=Date.now()+(Number.isFinite(result.resendAfter)?Math.max(1,result.resendAfter):60)*1000;codeRow.hidden=false;code.value='';
    tell(result.delivery==='uncertain'?'발송 결과 확인이 지연되고 있습니다. 메일함·스팸함을 확인해 번호가 도착했다면 입력하고, 미수신이면 60초 후 다시 요청해 주세요.':'인증 메일을 요청했습니다. 받은편지함과 스팸함을 확인하고 10분 안에 번호를 입력해 주세요.');code.focus();
   }catch(error){state.failed=true;if(error.status===409)session=null;if(error.timedOut&&submitted)state.nextSend=Date.now()+60000;tell(error.message||'연결 상태를 확인한 뒤 다시 요청해 주세요.',true)}finally{state.pending=false;try{window.turnstile?.reset()}catch{}sync()}
  });
  confirm.addEventListener('click',async()=>{
   sync();if(state.pending||!state.challengeId)return;if(!/^\d{6}$/.test(code.value.trim())){tell('6자리 인증번호를 입력해 주세요.');code.focus();return}
   state.pending=true;sync();const submittedEmail=normalize(email.value),challengeId=state.challengeId;
   try{const result=await request('confirm',{email:submittedEmail,challengeId,code:code.value.trim()});if(result.verified!==true)throw Error('인증 완료 응답을 확인하지 못했습니다. 다시 확인해 주세요.');
    if(normalize(email.value)!==submittedEmail||state.challengeId!==challengeId){tell('이메일 주소가 변경되었습니다. 다시 인증해 주세요.');return}
    state.verified=true;tell('이메일 인증이 완료되었습니다. 신청 내용을 확인한 뒤 정회원 가입 신청을 제출해 주세요.');
   }catch(error){state.verified=false;tell(error.message,true)}finally{state.pending=false;sync()}
  });
  code.addEventListener('input',()=>{code.value=code.value.replace(/[^0-9]/g,'').slice(0,6)});
  form.addEventListener('input',sync);form.addEventListener('change',sync);sync();
  const timer=setInterval(()=>{if(!form.isConnected){clearInterval(timer);return}sync()},1000);
 }
 function scan(){document.querySelectorAll('form').forEach(form=>{if(form.querySelector('[name="membershipTypeRadio"]'))setup(form)})}
 function boot(){scan();let queued=false;new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;scan()})}}).observe(document.documentElement,{childList:true,subtree:true})}
 const idle=()=>{if(window.requestIdleCallback)window.requestIdleCallback(boot,{timeout:2000});else setTimeout(boot,50)};
 if(document.readyState==='complete')idle();else window.addEventListener('load',idle,{once:true});
})();
