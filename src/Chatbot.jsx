import {useEffect,useId,useRef,useState} from 'react';
import './Chatbot.css';

/** The Gemini four-pointed sparkle (concave star) with the blue-to-purple gradient. */
function GeminiLogo({className=''}){
  const id=useId();
  return <svg className={'gemini-logo '+className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <defs><linearGradient id={id} x1="3" y1="20" x2="21" y2="4" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="var(--gem-1)"/><stop offset=".52" stopColor="var(--gem-2)"/><stop offset="1" stopColor="var(--gem-3)"/></linearGradient></defs>
    <path fill={`url(#${id})`} d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"/>
  </svg>;
}
const suggestions=['Where is the Taj Mahal?','Who built the Qutub Minar?','What is the Red Fort made of?'];

export default function Chatbot(){
  const [open,setOpen]=useState(false);
  const [input,setInput]=useState('');
  const [messages,setMessages]=useState([{role:'assistant',text:'Welcome to the museum! Ask me about the Taj Mahal, Qutub Minar, or Red Fort.',id:'welcome'}]);
  const [messageNumber,setMessageNumber]=useState(0);
  const [isSending,setIsSending]=useState(false);
  const [error,setError]=useState('');
  const endRef=useRef(null);

  useEffect(()=>{if(open)endRef.current?.scrollIntoView({behavior:'smooth',block:'end'});},[open,messages,error,isSending]);

  async function sendQuestion(question){
    const text=question.trim();
    if(!text||isSending)return;
    const userMessageNumber=messageNumber+1;
    const history=messages.filter(message=>message.id!=='welcome').map(({role,text})=>({role,text})).slice(-11);
    while(history[0]?.role==='assistant')history.shift();
    const conversation=[...history,{role:'user',text}];
    setMessages(current=>[...current,{role:'user',text,id:userMessageNumber}]);
    setMessageNumber(userMessageNumber);
    setError('');
    setIsSending(true);
    setInput('');
    try{
      const response=await fetch('/api/chat',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({messages:conversation}),
      });
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||`Chat request failed (${response.status}).`);
      if(typeof data.reply!=='string'||!data.reply.trim())throw new Error('The museum guide returned an empty answer. Please try again.');
      setMessages(current=>[...current,{role:'assistant',text:data.reply,id:userMessageNumber}]);
    }catch(requestError){
      setError(requestError instanceof Error?requestError.message:'Unable to reach the museum guide. Please try again.');
    }finally{
      setIsSending(false);
    }
  }

  return <div className="museum-chat">
    {open&&<section className="chat-panel" aria-label="Museum guide chatbot">
      <header className="chat-header"><div><span className="chat-eyebrow"><GeminiLogo className="chat-eyebrow-logo"/><span className="chat-eyebrow-rest">Kaal Darpan · Ask about the monuments</span></span><h2>Museum Guide</h2></div><button type="button" className="chat-close" aria-label="Close museum guide" onClick={()=>setOpen(false)}>×</button></header>
      <div className="chat-messages" aria-live="polite">
        {messages.map((message,index)=><p key={`${message.role}-${message.id??index}`} className={`chat-message ${message.role}`}>{message.text}</p>)}
        {messages.length===1&&<div className="chat-suggestions">{suggestions.map(question=><button type="button" key={question} disabled={isSending} onClick={()=>sendQuestion(question)}>{question}</button>)}</div>}
        {isSending&&<p className="chat-typing" role="status"><span className="typing-dots" aria-hidden="true"><i/><i/><i/></span><span className="sr-only">The museum guide is thinking…</span></p>}
        {error&&<p className="chat-error" role="alert">{error}</p>}
        <div ref={endRef}/>
      </div>
      <form className="chat-form" onSubmit={event=>{event.preventDefault();sendQuestion(input);}}>
        <label className="sr-only" htmlFor="museum-chat-input">Ask the museum guide</label>
        <input id="museum-chat-input" value={input} onChange={event=>setInput(event.target.value)} placeholder="Ask a question…" autoComplete="off" maxLength={2000} disabled={isSending}/>
        <button type="submit" aria-label="Send question" disabled={!input.trim()||isSending}>{isSending?'…':'Send'}</button>
      </form>
      <p className="chat-footnote">AI museum guide · Answers grounded in this museum’s exhibit notes.</p>
    </section>}
    <button type="button" className="chat-launcher" aria-expanded={open} aria-label={open?'Close museum guide':'Open museum guide'} onClick={()=>setOpen(value=>!value)}>
      <span className="launcher-ring" aria-hidden="true"/><span className="launcher-icon" aria-hidden="true">{open?<span className="launcher-close">×</span>:<GeminiLogo className="launcher-logo"/>}</span>
    </button>
  </div>;
}
