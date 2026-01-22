import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Settings, Eye, Save, ChevronLeft, Layout, 
  Type, Mail, Hash, AlignLeft, CheckSquare, List, 
  X, Loader, Copy, MousePointer2, AlignCenter, AlignRight,
  Maximize, Square, Paintbrush, MessageSquare
} from 'lucide-react';

/* --- SECURED API LOGIC --- */
const API_URL = "/api/forms";

// Consolidated: This version now handles the shop parameter correctly
async function apiFetchForms(shop) {
  const res = await fetch(`${API_URL}?shop=${shop}`);
  if (res.ok) return res.json();
  throw new Error("Failed to load forms");
}

// Updated: Passes shop in the URL to ensure backend authentication matches
async function apiSaveForm(payload, shop) {
  const res = await fetch(`${API_URL}?shop=${shop}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.ok) return res.json();
  const err = await res.json();
  throw new Error(err.error || "Failed to save form");
}

/* --- CONSTANTS --- */
const FIELD_TYPES = [
  { type: 'short', label: 'Short Text', icon: <Type size={16} /> },
  { type: 'paragraph', label: 'Long Text', icon: <AlignLeft size={16} /> },
  { type: 'email', label: 'Email', icon: <Mail size={16} /> },
  { type: 'number', label: 'Number', icon: <Hash size={16} /> },
  { type: 'select', label: 'Dropdown', icon: <List size={16} />, hasOptions: true },
  { type: 'checkboxes', label: 'Checkboxes', icon: <CheckSquare size={16} />, hasOptions: true },
];

const DEFAULT_SETTINGS = {
  description: 'Please fill out the form below.',
  successMessage: 'Thank you for your response!',
  buttonText: 'Submit Response',
  buttonColor: '#10b981',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  textAlign: 'left',
  borderRadius: '12',
  maxWidth: '540',
  fontFamily: 'Inter, sans-serif',
  padding: '40',
};

const STYLES = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' },
  card: { 
    backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: '16px', padding: '24px', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
  },
  input: { 
    width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box' 
  },
  label: { fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', display: 'block', marginTop: '16px' }
};

/* --- EDITOR COMPONENT --- */
function EditorView({ currentForm, setCurrentForm, setView, onSave, isSaving }) {
  const [activeTab, setActiveTab] = useState('fields');

  const addQuestion = (type) => {
    const fieldInfo = FIELD_TYPES.find(f => f.type === type);
    const newQ = { 
        id: `q_${Date.now()}`, 
        type, 
        text: fieldInfo.label, 
        placeholder: `Enter ${fieldInfo.label.toLowerCase()}...`,
        options: fieldInfo.hasOptions ? ['Option 1', 'Option 2'] : [], 
        required: false 
    };
    setCurrentForm(prev => ({ ...prev, questions: [...prev.questions, newQ] }));
  };

  const updateQuestion = (id, updates) => {
    setCurrentForm(prev => ({ 
        ...prev, 
        questions: prev.questions.map(q => q.id === id ? { ...q, ...updates } : q) 
    }));
  };

  const updateSettings = (key, value) => {
    setCurrentForm(prev => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fcfcfd' }}>
      <header style={{ height: '64px', backgroundColor: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setView('dashboard')} style={{ background: '#f3f4f6', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
            <ChevronLeft size={20} />
          </button>
          <input 
            style={{ fontWeight: '600', fontSize: '16px', border: 'none', outline: 'none', width: '250px' }} 
            value={currentForm.title} 
            onChange={(e) => setCurrentForm({...currentForm, title: e.target.value})} 
          />
        </div>
        <button onClick={onSave} disabled={isSaving} style={{ 
            backgroundColor: '#111827', color: '#fff', border: 'none', padding: '10px 20px', 
            borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
        }}>
          {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} Save Form
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside style={{ width: '360px', borderRight: '1px solid #eee', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', padding: '16px 16px 0 16px', gap: '8px' }}>
            <button onClick={() => setActiveTab('fields')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'fields' ? '#f3f4f6' : 'transparent', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Build</button>
            <button onClick={() => setActiveTab('settings')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'settings' ? '#f3f4f6' : 'transparent', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Design</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {activeTab === 'fields' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <section>
                  <span style={STYLES.label}>Elements</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {FIELD_TYPES.map(ft => (
                      <button key={ft.type} onClick={() => addQuestion(ft.type)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #f3f4f6', borderRadius: '12px', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>
                        <div style={{ color: '#10b981' }}>{ft.icon}</div> {ft.label}
                      </button>
                    ))}
                  </div>
                </section>
                {currentForm.questions.map((q) => (
                  <div key={q.id} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #eee', position: 'relative' }}>
                    <button onClick={() => setCurrentForm(prev => ({...prev, questions: prev.questions.filter(x => x.id !== q.id)}))} style={{ position: 'absolute', right: '10px', top: '10px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>{q.type}</span>
                    
                    <input style={STYLES.input} value={q.text} onChange={(e) => updateQuestion(q.id, { text: e.target.value })} placeholder="Label text" />
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '13px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(q.id, { required: e.target.checked })} />
                      Required Field
                    </label>

                    { (q.type === 'select' || q.type === 'checkboxes') && (
                      <div style={{ marginTop: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '8px' }}>OPTIONS</span>
                        {q.options.map((opt, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                            <input 
                              style={{ ...STYLES.input, padding: '6px 8px' }} 
                              value={opt} 
                              onChange={(e) => {
                                const newOpts = [...q.options];
                                newOpts[idx] = e.target.value;
                                updateQuestion(q.id, { options: newOpts });
                              }}
                            />
                            <button 
                              onClick={() => updateQuestion(q.id, { options: q.options.filter((_, i) => i !== idx) })}
                              style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => updateQuestion(q.id, { options: [...q.options, `Option ${q.options.length + 1}`] })}
                          style={{ width: '100%', padding: '6px', marginTop: '4px', background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                        >
                          + Add Option
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <section>
                  <span style={STYLES.label}>Alignment</span>
                  <div style={{ display: 'flex', background: '#f3f4f6', padding: '4px', borderRadius: '10px' }}>
                    {['left', 'center', 'right'].map(a => (
                      <button key={a} onClick={() => updateSettings('textAlign', a)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '7px', background: currentForm.settings.textAlign === a ? '#fff' : 'transparent', cursor: 'pointer' }}>
                        {a === 'left' ? <AlignLeft size={16}/> : a === 'center' ? <AlignCenter size={16}/> : <AlignRight size={16}/>}
                      </button>
                    ))}
                  </div>
                </section>

                <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={STYLES.label}>BG Color</span>
                    <input type="color" style={{ width: '100%', height: '40px', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer' }} value={currentForm.settings.backgroundColor} onChange={e => updateSettings('backgroundColor', e.target.value)} />
                  </div>
                  <div>
                    <span style={STYLES.label}>Text Color</span>
                    <input type="color" style={{ width: '100%', height: '40px', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer' }} value={currentForm.settings.textColor} onChange={e => updateSettings('textColor', e.target.value)} />
                  </div>
                </section>

                <section>
                  <span style={STYLES.label}>Form Width ({currentForm.settings.maxWidth}px)</span>
                  <input type="range" min="400" max="800" step="10" style={{ width: '100%' }} value={currentForm.settings.maxWidth} onChange={e => updateSettings('maxWidth', e.target.value)} />
                </section>

                <section>
                  <span style={STYLES.label}>Corner Roundness ({currentForm.settings.borderRadius}px)</span>
                  <input type="range" min="0" max="32" step="1" style={{ width: '100%' }} value={currentForm.settings.borderRadius} onChange={e => updateSettings('borderRadius', e.target.value)} />
                </section>

                <section>
                  <span style={STYLES.label}>Internal Padding ({currentForm.settings.padding}px)</span>
                  <input type="range" min="16" max="80" step="4" style={{ width: '100%' }} value={currentForm.settings.padding} onChange={e => updateSettings('padding', e.target.value)} />
                </section>

                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />

                <section>
                  <span style={STYLES.label}>Description</span>
                  <textarea style={{ ...STYLES.input, height: '60px', resize: 'none' }} value={currentForm.settings.description} onChange={e => updateSettings('description', e.target.value)} />
                </section>

                <section>
                  <span style={STYLES.label}>Submit Button Text</span>
                  <input style={STYLES.input} value={currentForm.settings.buttonText} onChange={e => updateSettings('buttonText', e.target.value)} />
                </section>

                <section>
                  <span style={STYLES.label}>Button Color</span>
                  <input type="color" style={{ width: '100%', height: '40px', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer' }} value={currentForm.settings.buttonColor} onChange={e => updateSettings('buttonColor', e.target.value)} />
                </section>
              </div>
            )}
          </div>
        </aside>

        <main style={{ flex: 1, background: '#f8fafc', padding: '60px', display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
          <div style={{ 
            maxWidth: `${currentForm.settings.maxWidth}px`, width: '100%', 
            background: currentForm.settings.backgroundColor, 
            color: currentForm.settings.textColor,
            padding: `${currentForm.settings.padding}px`, 
            borderRadius: `${currentForm.settings.borderRadius}px`, textAlign: currentForm.settings.textAlign,
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)', height: 'fit-content',
            transition: 'all 0.2s ease'
          }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>{currentForm.title}</h1>
            <p style={{ opacity: 0.7, marginBottom: '30px' }}>{currentForm.settings.description}</p>
            {currentForm.questions.map(q => (
              <div key={q.id} style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                  {q.text} {q.required && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                
                {q.type === 'select' ? (
                  <select style={{ ...STYLES.input, borderRadius: `${Math.min(currentForm.settings.borderRadius, 10)}px` }} disabled>
                    <option value="">Select an option...</option>
                    {q.options.map((opt, i) => <option key={i}>{opt}</option>)}
                  </select>
                ) : q.type === 'checkboxes' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt, i) => (
                      <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input type="checkbox" disabled /> {opt}
                      </label>
                    ))}
                  </div>
                ) : q.type === 'paragraph' ? (
                  <textarea style={{ ...STYLES.input, borderRadius: `${Math.min(currentForm.settings.borderRadius, 10)}px`, minHeight: '80px' }} placeholder={q.placeholder} disabled />
                ) : (
                  <input style={{ ...STYLES.input, borderRadius: `${Math.min(currentForm.settings.borderRadius, 10)}px` }} type={q.type} placeholder={q.placeholder} disabled />
                )}
              </div>
            ))}
            <button style={{ 
                background: currentForm.settings.buttonColor, 
                color: '#fff', 
                border: 'none', 
                width: '100%', 
                padding: '12px', 
                borderRadius: `${Math.min(currentForm.settings.borderRadius, 10)}px`, 
                fontWeight: '700',
                marginTop: '10px'
            }}>
              {currentForm.settings.buttonText}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

/* --- MAIN APP --- */
export default function App() {
  const [view, setView] = useState('dashboard');
  const [forms, setForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [shop, setShop] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const shopParam = url.searchParams.get("shop");

    if (!shopParam) {
      console.error("No shop domain detected. Application restricted.");
      setShop(null); 
      setLoading(false);
      return;
    }

    setShop(shopParam);
    
    // Secure fetch: passes shopParam to the consolidated API function
    apiFetchForms(shopParam)
      .then(data => { setForms(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Secure Save: includes shop both in payload and as a query parameter
      const savedForm = await apiSaveForm({ ...currentForm, shop }, shop);
      
      setForms(prev => {
        const exists = prev.find(f => f.id === savedForm.id);
        if (exists) return prev.map(f => f.id === savedForm.id ? savedForm : f);
        return [savedForm, ...prev];
      });
      setView('dashboard');
    } catch (e) { 
      alert(e.message); 
    } finally { 
      setIsSaving(false); 
    }
  };

  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><Loader className="animate-spin" /></div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fcfcfd', fontFamily: 'Inter, sans-serif' }}>
      {view === 'dashboard' && (
        <div style={STYLES.container}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' }}>My Forms</h1>
                  <p style={{ color: '#6b7280', margin: 0 }}>Create and manage customer forms for <strong>{shop}</strong></p>
                </div>
                <button style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { 
                    setCurrentForm({ title: 'New Feedback Form', questions: [], settings: DEFAULT_SETTINGS }); 
                    setView('editor'); 
                }}>
                    <Plus size={20} /> Create Form
                </button>
            </header>

            {forms.length === 0 ? (
              <div style={{ ...STYLES.card, textAlign: 'center', padding: '80px', border: '2px dashed #e5e7eb', background: 'transparent' }}>
                <MousePointer2 size={48} style={{ color: '#10b981', marginBottom: '16px' }} />
                <h3>No forms found</h3>
                <p>Get started by creating your first form above.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {forms.map(f => (
                  <div key={f.id} style={STYLES.card}>
                    <h3 style={{ margin: '0 0 16px 0' }}>{f.title}</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => { setCurrentForm(f); setView('editor'); }} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#fff', fontWeight: '600', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => { navigator.clipboard.writeText(f.id); alert("ID Copied!"); }} style={{ padding: '10px', borderRadius: '10px', border: 'none', background: '#f3f4f6', cursor: 'pointer' }}><Copy size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}

      {view === 'editor' && (
        <EditorView currentForm={currentForm} setCurrentForm={setCurrentForm} setView={setView} onSave={handleSave} isSaving={isSaving} />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body { margin: 0; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type="range"] { accent-color: #10b981; }
      `}} />
    </div>
  );
}