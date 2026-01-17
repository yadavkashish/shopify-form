import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Settings, Eye, Code, Save, ChevronLeft, Layout, 
  Type, Mail, Hash, AlignLeft, CheckSquare, List, BarChart3, 
  X, ListPlus, ExternalLink, Loader, Check, GripVertical,
  AlignCenter, AlignRight
} from 'lucide-react';

/* --- API HELPERS --- */
const API_URL = "/api/forms";

async function apiFetchForms() {
  const res = await fetch(API_URL);
  if (res.ok) return res.json();
  throw new Error("Failed to load forms");
}

async function apiSaveForm(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.ok) return res.json();
  const err = await res.json();
  throw new Error(err.error || "Failed to save form");
}

/* --- Constants --- */
const FIELD_TYPES = [
  { type: 'short', label: 'Short Text', icon: <Type size={16} /> },
  { type: 'paragraph', label: 'Long Text', icon: <AlignLeft size={16} /> },
  { type: 'email', label: 'Email Address', icon: <Mail size={16} /> },
  { type: 'number', label: 'Number', icon: <Hash size={16} /> },
  { type: 'select', label: 'Dropdown', icon: <List size={16} />, hasOptions: true },
  { type: 'checkboxes', label: 'Checkboxes', icon: <CheckSquare size={16} />, hasOptions: true },
];

const DEFAULT_SETTINGS = {
  description: 'Please fill out the form below.',
  successMessage: 'Thank you! Your response has been recorded.',
  buttonText: 'Submit',
  buttonColor: '#15803d',
  buttonTextColor: '#ffffff',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  textAlign: 'left',
  borderRadius: '8',
  maxWidth: '500',
  fontSize: '16',
  fontFamily: 'Inter',
  padding: '40',
};

const STYLES = {
  sidebar: { width: '260px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', height: '100vh', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column', zIndex: 10 },
  navItem: (active) => ({ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '10px 16px', border: 'none', backgroundColor: active ? '#f3f4f6' : 'transparent', color: active ? '#15803d' : '#4b5563', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: active ? '700' : '400' }),
  btnPrimary: { backgroundColor: '#15803d', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  editorSidebar: { width: '320px', borderRight: '1px solid #e5e7eb', backgroundColor: '#fff', height: '100%', overflowY: 'auto' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  label: { fontSize: '11px', fontWeight: '700', color: '#9ca3af', marginBottom: '6px', display: 'block', textTransform: 'uppercase' },
  configBox: { padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', marginBottom: '16px' },
  card: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }
};

/* --- Editor View --- */
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

  const removeQuestion = (id) => {
    setCurrentForm(prev => ({ 
        ...prev, 
        questions: prev.questions.filter(q => q.id !== id) 
    }));
  };

  const updateSettings = (key, value) => {
    setCurrentForm(prev => ({ 
        ...prev, 
        settings: { ...prev.settings, [key]: value } 
    }));
  };

  // Option Helpers
  const updateOption = (qId, optIdx, newValue) => {
    const question = currentForm.questions.find(q => q.id === qId);
    const newOptions = [...question.options];
    newOptions[optIdx] = newValue;
    updateQuestion(qId, { options: newOptions });
  };

  const addOption = (qId) => {
    const question = currentForm.questions.find(q => q.id === qId);
    updateQuestion(qId, { options: [...question.options, `Option ${question.options.length + 1}`] });
  };

  const removeOption = (qId, optIdx) => {
    const question = currentForm.questions.find(q => q.id === qId);
    updateQuestion(qId, { options: question.options.filter((_, i) => i !== optIdx) });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Top Header */}
      <div style={{ height: '60px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setView('dashboard')} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><ChevronLeft /></button>
          <input 
            style={{ fontWeight: '700', fontSize: '18px', border: 'none', outline: 'none', background: 'transparent' }} 
            value={currentForm.title} 
            onChange={(e) => setCurrentForm({...currentForm, title: e.target.value})} 
          />
        </div>
        <button onClick={onSave} disabled={isSaving} style={STYLES.btnPrimary}>
          {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} Save Form
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Editor Sidebar */}
        <div style={STYLES.editorSidebar}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <button onClick={() => setActiveTab('fields')} style={{ flex: 1, padding: '12px', border: 'none', borderBottom: activeTab === 'fields' ? '2px solid #15803d' : 'none', background: 'none', fontWeight: 'bold', fontSize: '12px', color: activeTab === 'fields' ? '#15803d' : '#9ca3af' }}>FIELDS</button>
            <button onClick={() => setActiveTab('settings')} style={{ flex: 1, padding: '12px', border: 'none', borderBottom: activeTab === 'settings' ? '2px solid #15803d' : 'none', background: 'none', fontWeight: 'bold', fontSize: '12px', color: activeTab === 'settings' ? '#15803d' : '#9ca3af' }}>SETTINGS</button>
          </div>

          <div style={{ padding: '20px' }}>
            {activeTab === 'fields' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <span style={STYLES.label}>Add Elements</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {FIELD_TYPES.map(ft => (
                    <button key={ft.type} onClick={() => addQuestion(ft.type)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', cursor: 'pointer' }}>
                      {ft.icon} <span style={{ fontSize: '10px', marginTop: '5px' }}>{ft.label}</span>
                    </button>
                  ))}
                </div>

                <span style={{ ...STYLES.label, marginTop: '20px' }}>Field Config</span>
                {currentForm.questions.map((q, i) => (
                  <div key={q.id} style={STYLES.configBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#9ca3af' }}>#{i+1} {q.type.toUpperCase()}</span>
                      <button onClick={() => removeQuestion(q.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                    <input style={{ ...STYLES.input, marginBottom: '8px' }} value={q.text} onChange={(e) => updateQuestion(q.id, { text: e.target.value })} />
                    
                    {/* Choices Editor for Checkbox/Dropdown */}
                    {['select', 'checkboxes'].includes(q.type) && (
                      <div style={{ marginBottom: '10px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>CHOICES</span>
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                            <input 
                              style={{ ...STYLES.input, padding: '4px 8px', fontSize: '12px' }} 
                              value={opt} 
                              onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                            />
                            <button onClick={() => removeOption(q.id, optIdx)} style={{ border: 'none', background: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={14} /></button>
                          </div>
                        ))}
                        <button onClick={() => addOption(q.id)} style={{ border: 'none', background: 'none', color: '#15803d', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>+ Add Choice</button>
                      </div>
                    )}

                    <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(q.id, { required: e.target.checked })} /> Required
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              /* Shopify-style Settings Tab */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={STYLES.label}>Content</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input style={STYLES.input} placeholder="Button Text" value={currentForm.settings.buttonText} onChange={e => updateSettings('buttonText', e.target.value)} />
                    <textarea style={{ ...STYLES.input, height: '70px' }} placeholder="Description" value={currentForm.settings.description} onChange={e => updateSettings('description', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label style={STYLES.label}>Typography & Alignment</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <select style={STYLES.input} value={currentForm.settings.fontFamily} onChange={e => updateSettings('fontFamily', e.target.value)}>
                      <option value="Inter, sans-serif">Inter (Sans)</option>
                      <option value="Georgia, serif">Georgia (Serif)</option>
                      <option value="'Courier New', monospace">Monospace</option>
                    </select>
                    
                    <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
                      {['left', 'center', 'right'].map(align => (
                        <button 
                          key={align}
                          onClick={() => updateSettings('textAlign', align)}
                          style={{ 
                            flex: 1, padding: '6px', border: 'none', borderRadius: '6px', 
                            background: currentForm.settings.textAlign === align ? '#fff' : 'transparent',
                            boxShadow: currentForm.settings.textAlign === align ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {align === 'left' && <AlignLeft size={16} />}
                          {align === 'center' && <AlignCenter size={16} />}
                          {align === 'right' && <AlignRight size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={STYLES.label}>Layout & Style</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}><span>Width</span><span>{currentForm.settings.maxWidth}px</span></div>
                      <input type="range" min="300" max="800" style={{ width: '100%' }} value={currentForm.settings.maxWidth} onChange={e => updateSettings('maxWidth', e.target.value)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div><span style={{ fontSize: '11px' }}>Bg</span><input type="color" style={{ width: '100%', height: '30px', border: '1px solid #ddd' }} value={currentForm.settings.backgroundColor} onChange={e => updateSettings('backgroundColor', e.target.value)} /></div>
                      <div><span style={{ fontSize: '11px' }}>Btn</span><input type="color" style={{ width: '100%', height: '30px', border: '1px solid #ddd' }} value={currentForm.settings.buttonColor} onChange={e => updateSettings('buttonColor', e.target.value)} /></div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}><span>Border Radius</span><span>{currentForm.settings.borderRadius}px</span></div>
                      <input type="range" min="0" max="40" style={{ width: '100%' }} value={currentForm.settings.borderRadius} onChange={e => updateSettings('borderRadius', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Area */}
        <div style={{ flex: 1, padding: '40px', background: '#f0f2f5', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
              maxWidth: `${currentForm.settings.maxWidth}px`, 
              width: '100%', 
              background: currentForm.settings.backgroundColor, 
              padding: `${currentForm.settings.padding}px`, 
              borderRadius: `${currentForm.settings.borderRadius}px`, 
              textAlign: currentForm.settings.textAlign, 
              color: currentForm.settings.textColor, 
              fontFamily: currentForm.settings.fontFamily,
              height: 'fit-content',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ marginBottom: '8px' }}>{currentForm.title}</h2>
            <p style={{ opacity: 0.7, marginBottom: '30px' }}>{currentForm.settings.description}</p>

            {currentForm.questions.map(q => (
              <div key={q.id} style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: currentForm.settings.textColor }}>
                    {q.text} {q.required && <span style={{color: '#ef4444'}}>*</span>}
                </label>
                
                {q.type === 'select' ? (
                  <select style={{ ...STYLES.input, borderRadius: `${currentForm.settings.borderRadius / 2}px` }} disabled>
                    {q.options.map((opt, idx) => <option key={idx}>{opt}</option>)}
                  </select>
                ) : q.type === 'checkboxes' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt, idx) => (
                      <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input type="checkbox" disabled /> {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input 
                    style={{ ...STYLES.input, borderRadius: `${currentForm.settings.borderRadius / 2}px` }} 
                    placeholder={q.placeholder} 
                    disabled 
                  />
                )}
              </div>
            ))}

            <button style={{ 
                ...STYLES.btnPrimary, 
                width: '100%', 
                justifyContent: 'center', 
                background: currentForm.settings.buttonColor,
                borderRadius: `${currentForm.settings.borderRadius}px`,
                padding: '12px'
            }}>
                {currentForm.settings.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Main Dashboard Wrapper --- */
export default function App() {
  const [view, setView] = useState('dashboard');
  const [forms, setForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [shop, setShop] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    setShop(url.searchParams.get("shop") || "demo-store.myshopify.com");
    apiFetchForms().then(data => { setForms(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const savedForm = await apiSaveForm({ ...currentForm, shop });
      setForms(prev => {
        const exists = prev.find(f => f.id === savedForm.id);
        if (exists) return prev.map(f => f.id === savedForm.id ? savedForm : f);
        return [savedForm, ...prev];
      });
      setView('dashboard');
    } catch (e) { alert(e.message); } finally { setIsSaving(false); }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Inter, sans-serif' }}>
      {view !== 'editor' && (
        <div style={STYLES.sidebar}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#15803d', padding: '6px', borderRadius: '6px' }}><Layout color="white" size={20} /></div>
            <span style={{ fontWeight: '800', fontSize: '18px' }}>Formify</span>
          </div>
          <div style={{ padding: '12px', flex: 1 }}>
            <button onClick={() => setView('dashboard')} style={STYLES.navItem(view === 'dashboard')}><Layout size={18} /> My Forms</button>
          </div>
        </div>
      )}

      {view === 'dashboard' && (
        <div style={{ marginLeft: '260px', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>My Forms</h1>
                <button style={STYLES.btnPrimary} onClick={() => { 
                    setCurrentForm({ title: 'New Form', questions: [], settings: DEFAULT_SETTINGS }); 
                    setView('editor'); 
                }}>
                    <Plus size={18} /> Create New Form
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
               {/* REPLACE WITH THIS */}
{forms.map(f => (
  <div key={f.id} style={STYLES.card}>
    <h3 style={{ margin: '0 0 15px 0' }}>{f.title}</h3>
    <div style={{ display: 'flex', gap: '8px' }}>
      <button 
        onClick={() => { setCurrentForm(f); setView('editor'); }} 
        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
      >
        Edit
      </button>
      <button 
        onClick={() => {
          navigator.clipboard.writeText(f.id);
          alert("ID Copied! Paste this in the Theme Editor.");
        }} 
        style={{ flex: 1, padding: '8px', borderRadius: '6px', background: '#f3f4f6', border: '1px solid #ddd', cursor: 'pointer' }}
      >
        Copy ID
      </button>
    </div>
  </div>
))}
            </div>
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
      `}} />
    </div>
  );
}