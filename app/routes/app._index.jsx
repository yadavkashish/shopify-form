import React, { useEffect, useState } from "react";
import { Copy, Eye, EyeOff, GripVertical, Trash2, Plus, ArrowUp, ArrowDown, ExternalLink, MoreHorizontal, X, Loader } from "lucide-react";

/* API HELPERS 
  Replace these URLs with your actual backend routes if they differ.
*/
const API_BASE = "/api"; // Adjust based on your Remix/Node routing

async function parseErrorResponse(res) {
  // Try to parse JSON error body, otherwise fallback to text
  try {
    const body = await res.json();
    return body?.details || body?.error || body?.message || JSON.stringify(body);
  } catch (e) {
    try { return await res.text(); } catch (ee) { return res.statusText || "Unknown error"; }
  }
}

async function apiFetchForms() {
  const res = await fetch(`${API_BASE}/forms`);
  if (res.ok) return res.json();
  const msg = await parseErrorResponse(res);
  throw new Error(`${res.status} ${res.statusText} - ${msg}`);
}

async function apiCreateForm(payload) {
  const res = await fetch(`${API_BASE}/forms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) return res.json();

  const msg = await parseErrorResponse(res);
  throw new Error(`${res.status} ${res.statusText} - ${msg}`);
}

/* =======================
   PUBLIC FORM (UPDATED)
   GET  /api/forms/:id     -> fetch form JSON (public)
   POST /api/forms/:id     -> submit response (public) with body { answers }
   ======================= */

async function apiFetchPublicForm(formId) {
  if (!formId) throw new Error("formId is required");
  const res = await fetch(`${API_BASE}/forms/${encodeURIComponent(formId)}`);
  if (res.ok) return res.json();
  const msg = await parseErrorResponse(res);
  throw new Error(`${res.status} ${res.statusText} - ${msg}`);
}

async function apiSubmitResponse(formId, answers) {
  if (!formId) throw new Error("formId is required");
  const res = await fetch(`${API_BASE}/forms/${encodeURIComponent(formId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (res.ok) return res.json();
  const msg = await parseErrorResponse(res);
  throw new Error(`${res.status} ${res.statusText} - ${msg}`);
}

/* admin responses fetching - keep if you have this admin route */
async function apiFetchResponses(formId) {
  const res = await fetch(`${API_BASE}/forms/${formId}/responses`);
  if (res.ok) return res.json();
  const msg = await parseErrorResponse(res);
  throw new Error(`${res.status} ${res.statusText} - ${msg}`);
}

function uid(prefix = "") { return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`; }
function isBrowser() { return typeof window !== "undefined"; }

/* ---------- Small utility components ---------- */
function IconButton({ children, title, onClick, style = {}, ariaLabel }) {
  return (
    <button type="button" title={title} aria-label={ariaLabel || title} onClick={onClick} className="btn-icon" style={style}>
      {children}
    </button>
  );
}

/* ---------- Preview Pane ---------- */
function PreviewPane({ open, onClose, title, questions, onSubmitPublic }) {
  if (!open) return null;

  const [values, setValues] = useState(() => {
    const init = {};
    (questions || []).forEach(q => init[q.id] = q.type === 'checkboxes' ? [] : '');
    return init;
  });

  useEffect(() => {
    const init = {};
    (questions || []).forEach(q => init[q.id] = q.type === 'checkboxes' ? [] : '');
    setValues(init);
  }, [questions]);

  function changeAnswer(q, val) { setValues(v => ({ ...v, [q.id]: val })); }
  function handleSubmit(e) { 
    e.preventDefault(); 
    const answers = (questions || []).map(q => ({ questionId: q.id, value: values[q.id] })); 
    if (onSubmitPublic) onSubmitPublic(answers); 
    onClose(); 
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="panel" onClick={(e)=>e.stopPropagation()}>
        <div className="panel-header">
          <div>
            <div className="muted small uppercase">Preview Mode</div>
            <h3 className="panel-title">{title || 'Untitled Form'}</h3>
          </div>
          <IconButton onClick={onClose} title="Close preview"><X size={18} /></IconButton>
        </div>
        <div className="panel-body">
          <form onSubmit={handleSubmit}>
            {(questions || []).filter(q=>q.visible!==false).length === 0 ? (
              <div className="empty">No visible questions to preview.</div>
            ) : (
              (questions || []).filter(q=>q.visible!==false).map(q => (
                <div className="q-card" key={q.id}>
                  <div className="q-title">{q.text || 'Untitled question'} {q.required && <span className="required">*</span>}</div>
                  {q.type === 'short' && <input value={values[q.id]||''} onChange={(e)=>changeAnswer(q, e.target.value)} placeholder={q.placeholder||'Your answer'} className="input" />}
                  {q.type === 'paragraph' && <textarea value={values[q.id]||''} onChange={(e)=>changeAnswer(q, e.target.value)} rows={4} placeholder={q.placeholder||'Your answer'} className="input" />}
                  {q.type === 'multiple' && (
                    <div className="stack">
                      {q.options.map((opt, idx)=>(
                        <label key={idx} className="option"><input type="radio" checked={values[q.id]===opt} onChange={()=>changeAnswer(q,opt)} /> <span>{opt}</span></label>
                      ))}
                    </div>
                  )}
                  {q.type === 'checkboxes' && (
                    <div className="stack">
                      {q.options.map((opt, idx) => {
                        const arr = values[q.id] || [];
                        const checked = arr.includes(opt);
                        return (
                          <label key={idx} className="option"><input type="checkbox" checked={checked} onChange={() => { const next = checked ? arr.filter(a=>a!==opt) : [...arr, opt]; changeAnswer(q, next); }} /> <span>{opt}</span></label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
            <div className="actions-row">
              <button type="submit" className="btn-primary">Submit Preview</button>
              <button type="button" onClick={onClose} className="btn-muted">Close</button>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        .overlay{ position:fixed; inset:0; background:rgba(0,0,0,0.35); display:flex; justify-content:flex-end; z-index:999; }
        .panel{ width:100%; max-width:480px; background:#fff; display:flex; flex-direction:column; height:100%; box-shadow:-6px 0 30px rgba(2,6,23,0.12); }
        .panel-header{ padding:16px; border-bottom:1px solid #EEF2F7; display:flex; align-items:center; justify-content:space-between; gap:12px }
        .panel-title{ margin:0; font-size:18px }
        .panel-body{ padding:16px; overflow:auto; background:#f9fafb; flex:1 }
        .muted{ color:#6B7280 }
        .small{ font-size:11px }
        .uppercase{ text-transform:uppercase; letter-spacing:.05em }
        .q-card{ margin-bottom:14px; padding:12px; border-radius:8px; background:#fff; border:1px solid #E6E9EE }
        .q-title{ margin-bottom:8px; font-weight:600 }
        .required{ color:#ef4444 }
        .input{ width:100%; padding:10px; border-radius:8px; border:1px solid #D1D5DB; font-size:14px }
        .stack{ display:flex; flex-direction:column; gap:8px }
        .option{ display:flex; gap:8px; align-items:center }
        .actions-row{ display:flex; gap:10px; margin-top:8px; flex-wrap:wrap }
        .btn-primary{ padding:10px 16px; border-radius:8px; border:none; background:#111827; color:#fff; cursor:pointer }
        .btn-muted{ padding:10px 16px; border-radius:8px; border:none; background:#F3F4F6; cursor:pointer }
        .btn-icon{ border:none; background:transparent; padding:6px; cursor:pointer; color:#6B7280 }
        .empty{ text-align:center; color:#9CA3AF; padding:24px }
        @media (max-width:600px){ .panel{ max-width:100%; } }
      `}</style>
    </div>
  );
}

/* ---------- Builder ---------- */
function ShopifyFormBuilder({ onPublish, isPublishing }) {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const emptyQuestion = (id) => ({ id, text: '', type: 'short', options: ['Option 1', 'Option 2'], required: false, visible: true, placeholder: '' });
  function addQuestion() { setQuestions(prev => [...prev, emptyQuestion(uid("q_"))]); }
  function removeQuestion(id) { setQuestions(prev => prev.filter(x=>x.id!==id)); }
  function duplicateQuestion(id) { setQuestions(prev => { const i = prev.findIndex(x=>x.id===id); if (i===-1) return prev; const copy = JSON.parse(JSON.stringify(prev[i])); copy.id = uid("q_"); const next = [...prev]; next.splice(i+1,0,copy); return next; }); }
  function updateQuestion(id, patchOrFn) { setQuestions(prev => prev.map(x => { if (x.id !== id) return x; const newVals = typeof patchOrFn === 'function' ? patchOrFn(x) : { ...x, ...patchOrFn }; return { ...x, ...newVals }; })); }
  function addOption(id) { updateQuestion(id, prev => ({ ...prev, options: [...prev.options, `Option ${prev.options.length + 1}`] })); }
  function removeOption(id, idx) { updateQuestion(id, prev => ({ ...prev, options: prev.options.filter((_,i)=>i!==idx) })); }
  function moveQuestion(id, dir) { setQuestions(prev => { const i = prev.findIndex(x=>x.id===id); if (i===-1) return prev; const ni = i + dir; if (ni<0 || ni>=prev.length) return prev; const next = [...prev]; const [item] = next.splice(i,1); next.splice(ni,0,item); return next; }); }
  function toggleVisible(id) { updateQuestion(id, prev => ({ ...prev, visible: !prev.visible })); }

  function publish() { 
    if(!title) return alert("Please add a form title");
    if(questions.length === 0) return alert("Please add at least one question");
    const payload = { title, questions }; 
    if (onPublish) onPublish(payload); 
  }

  return (
    <div className="builder">
      <div className="builder-header">
        <div><h3 className="muted uppercase small" style={{margin:0}}>Form Editor</h3></div>
        <div className="header-actions">
          <button className="btn-outline" onClick={() => setPreviewOpen(true)}><Eye size={14} /> <span className="btn-text">Preview</span></button>
          <button className="btn-cta" disabled={isPublishing} onClick={publish}>
            {isPublishing ? <Loader className="spin" size={14}/> : <Plus size={14} />} 
            <span className="btn-text">{isPublishing ? 'Saving...' : 'Publish'}</span>
          </button>
          <button className="btn-danger" onClick={() => { setTitle(''); setQuestions([]); }}>Reset</button>
        </div>
      </div>

      <div className="title-row">
        <input placeholder="Untitled Form" value={title} onChange={(e)=>setTitle(e.target.value)} className="form-title" />
        <div className="subtitle muted">Start building your form layout below.</div>
      </div>

      <div>
        {questions.length === 0 && (
          <div className="empty-drop">
            <div className="muted">No questions yet</div>
            <button className="btn-cta" onClick={addQuestion}><Plus size={14} /> Add first question</button>
          </div>
        )}
        {questions.map((q, idx) => (
          <div className={`q-block ${q.visible ? '' : 'q-hidden'}`} key={q.id}>
            <div className="q-top">
              <div className="q-left">
                <div className="q-index">{idx+1}</div>
                <div className="q-type">{q.type.charAt(0).toUpperCase() + q.type.slice(1)}</div>
              </div>
              <div className="q-toolbar">
                <IconButton onClick={()=>toggleVisible(q.id)} title={q.visible ? 'Hide' : 'Show'}>{q.visible ? <Eye size={14} /> : <EyeOff size={14} />}</IconButton>
                <div className="vsep" />
                <IconButton onClick={()=>moveQuestion(q.id,-1)} title="Move up"><ArrowUp size={14} /></IconButton>
                <IconButton onClick={()=>moveQuestion(q.id,1)} title="Move down"><ArrowDown size={14} /></IconButton>
                <IconButton onClick={()=>duplicateQuestion(q.id)} title="Duplicate"><Copy size={14} /></IconButton>
                <div className="vsep" />
                <IconButton onClick={()=>removeQuestion(q.id)} title="Remove" style={{color:'#EF4444'}}><Trash2 size={14} /></IconButton>
              </div>
            </div>
            <div className="q-body">
              <div className="col-main">
                <label className="label">Question Text</label>
                <input className="input" placeholder="e.g. What is your full name?" value={q.text} onChange={(e)=>updateQuestion(q.id, prev=>({...prev, text: e.target.value}))} />
              </div>
              <div className="col-side">
                <label className="label">Answer Type</label>
                <select value={q.type} onChange={(e)=>updateQuestion(q.id, prev=>({...prev, type: e.target.value}))} className="select">
                  <option value="short">Short answer</option>
                  <option value="paragraph">Long answer</option>
                  <option value="multiple">Multiple choice</option>
                  <option value="checkboxes">Checkboxes</option>
                </select>
              </div>
            </div>
            <div className="q-meta">
              <label className="label-inline"><input type="checkbox" checked={q.required} onChange={(e)=>updateQuestion(q.id, prev=>({...prev, required: e.target.checked}))} /> Mark as Required</label>
              <div className="vsep-vert" />
              <input placeholder="Helper text / Placeholder (optional)" value={q.placeholder} onChange={(e)=>updateQuestion(q.id, prev=>({...prev, placeholder: e.target.value}))} className="input" />
            </div>
            {(q.type === 'multiple' || q.type === 'checkboxes') && (
              <div className="options">
                <div className="opt-title">OPTIONS</div>
                {q.options.map((opt,i)=>(
                  <div className="opt-row" key={`${q.id}-opt-${i}`}>
                    <GripVertical size={16} />
                    <input value={opt} onChange={(e)=>updateQuestion(q.id, prev=>({...prev, options: prev.options.map((o,ii)=> ii===i ? e.target.value : o)}))} className="input" />
                    <IconButton onClick={()=>removeOption(q.id,i)} title="Remove option" style={{color:'#EF4444'}}><X size={14} /></IconButton>
                  </div>
                ))}
                <div className="opt-add"><button className="btn-link" onClick={()=>addOption(q.id)}><Plus size={12} /> Add another option</button></div>
              </div>
            )}
          </div>
        ))}
        {questions.length > 0 && (
          <div className="add-more"><button className="btn-outline full" onClick={addQuestion}><Plus size={16} /> Add another question</button></div>
        )}
      </div>

      <PreviewPane open={previewOpen} onClose={()=>setPreviewOpen(false)} title={title} questions={questions} onSubmitPublic={(answers) => { console.log("Preview", answers); alert("Preview submit successful!"); }} />

      <style>{`
        .builder{ background:#fff; padding:20px; border-radius:12px; margin-top:20px; box-shadow:0 8px 18px rgba(2,6,23,0.06) }
        .builder-header{ display:flex; align-items:center; justify-content:space-between; gap:12px }
        .header-actions{ display:flex; gap:8px; flex-wrap:wrap }
        .btn-outline{ background:#fff; border:1px solid #D1D5DB; padding:8px 12px; border-radius:8px; cursor:pointer; display:flex; gap:8px; align-items:center }
        .btn-cta{ background:#10b981; color:#fff; border:none; padding:8px 12px; border-radius:8px; display:flex; gap:8px; align-items:center; cursor:pointer }
        .btn-cta:disabled{ opacity: 0.7; cursor: not-allowed; }
        .btn-danger{ background:transparent; border:1px solid transparent; color:#EF4444; padding:8px 12px; border-radius:8px; cursor:pointer }
        .btn-link{ background:transparent; border:none; color:#10b981; cursor:pointer; display:inline-flex; gap:8px; align-items:center }
        .btn-text{ display:inline-block }
        .title-row{ margin:12px 0 18px }
        .form-title{ font-size:22px; font-weight:700; width:100%; padding:6px 4px; border:none; border-bottom:2px solid transparent; outline:none }
        .subtitle{ margin-top:6px }
        .empty-drop{ padding:30px; border-radius:8px; background:#F9FAFB; border:2px dashed #E5E7EB; display:flex; flex-direction:column; gap:12px; align-items:center }
        .q-block{ padding:16px; border-radius:8px; border:1px solid #EEF2F7; margin-bottom:12px; background:#fff }
        .q-hidden{ background:#FBFBFD }
        .q-top{ display:flex; justify-content:space-between; align-items:center }
        .q-left{ display:flex; gap:12px; align-items:center }
        .q-index{ width:28px; height:28px; border-radius:50%; background:#111827; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700 }
        .q-type{ font-weight:600; color:#374151 }
        .q-toolbar{ display:flex; gap:6px; align-items:center }
        .vsep{ width:1px; height:28px; background:#E6E9EE; margin:0 6px }
        .q-body{ display:grid; grid-template-columns: 1fr 220px; gap:16px; margin-top:12px }
        .col-side{ width:220px }
        .label{ display:block; margin-bottom:6px; font-size:12px; color:#6B7280; font-weight:600; text-transform:uppercase }
        .input{ padding:8px 10px; border-radius:8px; border:1px solid #E6E9EE; width:100%; font-size:14px }
        .select{ padding:8px 10px; border-radius:8px; border:1px solid #E6E9EE; width:100% }
        .q-meta{ display:flex; gap:12px; align-items:center; margin-top:12px; background:#F9FAFB; padding:10px; border-radius:8px }
        .label-inline{ display:flex; gap:8px; align-items:center }
        .vsep-vert{ width:1px; height:24px; background:#E6E9EE }
        .options{ margin-top:12px; padding-left:12px; border-left:2px solid #EAEFF3 }
        .opt-title{ font-size:13px; font-weight:700; color:#6B7280; margin-bottom:8px }
        .opt-row{ display:flex; gap:10px; align-items:center; margin-bottom:8px }
        .opt-add{ padding-left:30px }
        .add-more{ display:flex; justify-content:center; margin-top:16px }
        .full{ width:100%; justify-content:center }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @media (max-width:980px){ .q-body{ grid-template-columns: 1fr 160px } .col-side{ width:160px } }
        @media (max-width:600px){ .q-body{ grid-template-columns: 1fr; } .col-side{ width:100% } .header-actions{ width:100%; justify-content:flex-start } .btn-text{ display:none } }
      `}</style>
    </div>
  );
}

/* ---------- PublicForm (Fetching from Prisma) ---------- */
function PublicForm({ formId, onSubmitted }) {
  const [form, setForm] = useState(undefined);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetchPublicForm(formId)
      .then(f => {
        // Parse questions if they come back as a string from JSON storage
        const parsedQuestions = typeof f.questions === 'string' ? JSON.parse(f.questions) : f.questions;
        const formWithParsed = { ...f, questions: parsedQuestions };
        setForm(formWithParsed);
        const init = {}; 
        (parsedQuestions || []).forEach(q => init[q.id] = q.type === 'checkboxes' ? [] : ''); 
        setValues(init);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [formId]);

  function changeAnswer(q,val) { setValues(v => ({ ...v, [q.id]: val })); }

  function handleSubmit(e) {
    e.preventDefault();
    if(!form) return;
    
    // Validation
    for (const q of (form.questions || [])) {
      if (q.visible === false) continue;
      if (q.required) {
        const val = values[q.id];
        if (q.type === 'checkboxes') { if (!Array.isArray(val) || val.length === 0) { alert(`Please answer: ${q.text}`); return; } }
        else { if (!val || String(val).trim() === "") { alert(`Please answer: ${q.text}`); return; } }
      }
    }

    setSubmitting(true);
    const answers = (form.questions || []).map(q => ({ questionId: q.id, value: values[q.id] }));
    
    apiSubmitResponse(formId, answers)
      .then(() => {
        setSubmitting(false);
        if (onSubmitted) onSubmitted();
        alert("Thanks! Your response was recorded.");
        // Reset form
        const init = {}; (form.questions || []).forEach(q => init[q.id] = q.type === 'checkboxes' ? [] : ''); setValues(init);
      })
      .catch(err => {
        alert("Error submitting: " + err.message);
        setSubmitting(false);
      });
  }

  if (loading) return <div style={{ padding:40, textAlign:'center' }}>Loading Form...</div>;
  if (error) return <div style={{ padding:40, textAlign:'center', color:'red' }}>Error: {error}</div>;
  if (!form) return <div style={{ padding:40, textAlign:'center' }}>Form not found.</div>;

  return (
    <div style={{ padding:20, maxWidth:720, margin:'20px auto', background:'#fff', borderRadius:8 }}>
      <h2 style={{ marginTop:0 }}>{form.title}</h2>
      <form onSubmit={handleSubmit}>
        {(form.questions || []).filter(q=>q.visible!==false).map(q => (
          <div key={q.id} style={{ marginBottom:16, padding:12, borderRadius:8, border:'1px solid #E5E7EB' }}>
            <div style={{ marginBottom:8, fontWeight:600 }}>{q.text} {q.required && <span style={{ color:'#ef4444' }}>*</span>}</div>
            {q.type === 'short' && <input value={values[q.id]||''} onChange={(e)=>changeAnswer(q,e.target.value)} placeholder={q.placeholder||''} style={{ width:'100%', padding:10, borderRadius:6, border:'1px solid #D1D5DB' }} />}
            {q.type === 'paragraph' && <textarea value={values[q.id]||''} onChange={(e)=>changeAnswer(q,e.target.value)} rows={4} placeholder={q.placeholder||''} style={{ width:'100%', padding:10, borderRadius:6, border:'1px solid #D1D5DB' }} />}
            {q.type === 'multiple' && <div style={{ display:'flex', flexDirection:'column', gap:8 }}>{q.options.map((opt,idx)=>(<label key={idx} style={{ display:'flex', gap:8, alignItems:'center' }}><input type='radio' name={q.id} checked={values[q.id]===opt} onChange={()=>changeAnswer(q,opt)} /><span>{opt}</span></label>))}</div>}
            {q.type === 'checkboxes' && <div style={{ display:'flex', flexDirection:'column', gap:8 }}>{q.options.map((opt,idx)=>{ const arr = values[q.id]||[]; const checked = arr.includes(opt); return (<label key={idx} style={{ display:'flex', gap:8, alignItems:'center' }}><input type='checkbox' checked={checked} onChange={()=>{ const next = checked ? arr.filter(a=>a!==opt) : [...arr, opt]; changeAnswer(q,next); }} /><span>{opt}</span></label>) })}</div>}
          </div>
        ))}
        <div style={{ display:'flex', gap:8 }}>
          <button type="submit" disabled={submitting} style={{ padding:'10px 18px', borderRadius:8, background:'#111827', color:'#fff', border:'none', cursor:'pointer', opacity: submitting?0.7:1 }}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Main App (Dashboard + Builder) ---------- */
export default function App() {
  const [forms, setForms] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [showResponsesFor, setShowResponsesFor] = useState(null);
  const [responseRows, setResponseRows] = useState([]);
  const [loadingResp, setLoadingResp] = useState(false);
  
  const [isClient, setIsClient] = useState(false);
  const [clientHash, setClientHash] = useState("");
  const [publishing, setPublishing] = useState(false);

  useEffect(() => { 
    setIsClient(true); 
    if (isBrowser()) {
      setClientHash(window.location.hash || ""); 
      
      // Load forms from DB on mount
      apiFetchForms().then(setForms).catch(e => console.error(e));

      const onHashChange = () => setClientHash(window.location.hash || ""); 
      window.addEventListener("hashchange", onHashChange); 
      return () => window.removeEventListener("hashchange", onHashChange);
    } 
  }, []);

  const isPublicView = isClient && (clientHash || "").startsWith("#public-form-");
  const publicFormId = isPublicView ? clientHash.replace("#public-form-","") : null;

  async function handleFormPublish(payload) {
    setPublishing(true);
    try {
      const newForm = await apiCreateForm(payload);
      setForms(prev => [newForm, ...prev]);
      
      const publicUrl = isBrowser() ? `${window.location.origin}${window.location.pathname}#public-form-${newForm.id}` : `#public-form-${newForm.id}`;
      if (isBrowser() && navigator.clipboard && navigator.clipboard.writeText) { 
        await navigator.clipboard.writeText(publicUrl); 
        alert(`Form saved to Database! Public link copied to clipboard:\n${publicUrl}`); 
      } else { 
        alert(`Form saved! Public link:\n${publicUrl}`); 
      }
    } catch (e) {
      alert("Error saving form: " + e.message);
    } finally {
      setPublishing(false);
    }
  }

  function handleView(form) {
    alert("Viewing config is not implemented in this demo (check the code to see how to populate the builder with existing data).");
  }

  async function openResponses(formId) { 
    setShowResponsesFor(formId); 
    setLoadingResp(true);
    try {
      const respData = await apiFetchResponses(formId);
      // Ensure answers are parsed if they come as string
      const parsed = respData.map(r => ({
        ...r,
        answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers
      }));
      setResponseRows(parsed);
    } catch (e) {
      alert("Failed to load responses: " + e.message);
    } finally {
      setLoadingResp(false);
    }
  }

  function closeResponses() { setShowResponsesFor(null); setResponseRows([]); }

  function viewPublicLink(formId) { 
    const url = isBrowser() ? `${window.location.origin}${window.location.pathname}#public-form-${formId}` : `#public-form-${formId}`; 
    if (isBrowser() && navigator.clipboard && navigator.clipboard.writeText) { 
      navigator.clipboard.writeText(url).then(()=>alert("Public link copied to clipboard")).catch(()=>prompt("Public link:", url)); 
    } else { 
      prompt("Public link:", url); 
    } 
  }

  /* --- Render Views --- */

  if (isPublicView && publicFormId) {
    return (
      <div className="page-root">
        <div className="container">
          <div className="page-top">
            <div>
              <h2 style={{ margin:0 }}>Public Form</h2>
              <div className="muted">This form data is loaded from your Prisma backend.</div>
            </div>
            <div>
              <button className="btn-cta" onClick={() => { if (isBrowser()) { window.location.hash = ""; window.location.reload(); } }}>Open Dashboard</button>
            </div>
          </div>
          <PublicForm formId={publicFormId} onSubmitted={() => { }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-root">
      <div className="container">
        <div className="page-top">
          <div>
            <h2 style={{ fontSize:28, margin:0 }}>Form Dashboard</h2>
            <div className="muted" style={{ marginTop:6 }}>Manage your forms & responses (stored in DB).</div>
          </div>
        </div>

        <div className="table-card">
          <div className="table-grid">
            <div>Form name</div>
            <div style={{ textAlign:'center' }}>Status</div>
            <div style={{ textAlign:'center' }}>Created</div>
            <div style={{ textAlign:'right' }}>Actions</div>
          </div>

          <div>
            {forms.length === 0 && <div style={{ padding:28, textAlign:'center', color:'#9CA3AF' }}>No forms found. Create one below.</div>}

            {forms.map(f => {
              const isHovered = hovered === f.id;
              return (
                <div key={f.id} onMouseEnter={()=>setHovered(f.id)} onMouseLeave={()=>setHovered(null)} className={`table-row ${isHovered ? 'row-hover' : ''}`}>
                  <div style={{ display:'flex', flexDirection:'column' }}>
                    <div style={{ fontSize:15, fontWeight:600 }}>{f.title}</div>
                  </div>
                  <div style={{ textAlign:'center', fontSize:12 }}>{f.status}</div>
                  <div style={{ textAlign:'center', fontSize:12 }}>{new Date(f.createdAt).toLocaleDateString()}</div>
                  <div style={{ textAlign:'right', display:'flex', justifyContent:'flex-end', gap:8 }}>
                    <button className="btn-outline" onClick={()=>handleView(f)}>Edit</button>
                    <button className="btn-outline" onClick={()=>openResponses(f.id)}>Responses</button>
                    <button className="btn-outline" onClick={()=>viewPublicLink(f.id)}><ExternalLink size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <ShopifyFormBuilder onPublish={handleFormPublish} isPublishing={publishing} />

        {showResponsesFor && (
          <div className="responses-panel">
            <div className="responses-header">
              <div style={{ fontWeight:700 }}>Responses {loadingResp && '(Loading...)'}</div>
              <div><button className="btn-cta" onClick={closeResponses} style={{ marginLeft:8 }}>Close</button></div>
            </div>
            <div style={{ padding:12 }}>
              {responseRows.length === 0 && !loadingResp && <div className="muted">No responses yet.</div>}
              {responseRows.map(r => (
                <div key={r.id} className="resp-row">
                  <div className="muted small">{new Date(r.createdAt).toLocaleString()}</div>
                  <div style={{ marginTop:8 }}>
                    {r.answers.map((a,i)=>(
                      <div key={i} style={{ marginBottom:6 }}>
                        <div style={{ fontSize:13, fontWeight:600 }}>{a.questionId}</div>
                        <div style={{ fontSize:13 }}>{Array.isArray(a.value) ? a.value.join(", ") : String(a.value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .page-root{ min-height:100vh; background:#F3F4F6; padding:20px; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto }
        .container{ max-width:1000px; margin:0 auto }
        .page-top{ display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; gap:12px }
        .table-card{ background:#fff; padding:8px; border-radius:12px }
        .table-row{ display:grid; grid-template-columns: 1fr minmax(84px,120px) minmax(120px,160px) minmax(120px,220px); gap:12px; align-items:center; padding:12px; border-bottom:1px solid #F3F4F6 }
        .row-hover{ background:#FBFBFD }
        .responses-panel{ position:fixed; right:12px; top:64px; width:380px; max-height:70vh; overflow:auto; background:#fff; border-radius:8px; box-shadow:0 12px 30px rgba(2,6,23,0.12); z-index:1200 }
        .responses-header{ padding:12px; border-bottom:1px solid #E5E7EB; display:flex; justify-content:space-between; align-items:center }
        .resp-row{ padding:10px; border-radius:8px; border:1px solid #F3F4F6; margin-bottom:8px }
        .table-grid{ display:grid; grid-template-columns: 1fr minmax(84px,120px) minmax(120px,160px) minmax(120px,220px); gap:12px; align-items:center; font-size:12px; text-transform:uppercase; letter-spacing:.05em; font-weight:600; color:#6B7280; padding:12px 16px; border-bottom:1px solid #E5E7EB; background:#F9FAFB }
        @media (max-width:900px){ .table-row{ grid-template-columns: 1fr 96px 96px 140px } .responses-panel{ width:320px; right:8px } }
        @media (max-width:640px){
          .page-root{ padding:12px } .container{ width:100% } .page-top{ flex-direction:column; align-items:flex-start }
          .table-grid{ display:none } .table-row{ grid-template-columns: 1fr; gap:8px; padding:12px } .table-row > div{ width:100% }
          .responses-panel{ position:fixed; right:8px; left:8px; top:64px; width:auto }
        }
      `}</style>
    </div>
  );
}
