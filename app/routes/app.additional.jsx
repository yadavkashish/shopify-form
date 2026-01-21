import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Calendar, FileText, ChevronRight, 
  Search, ArrowLeft, MessageSquare, ClipboardList,
  Clock, Filter, MoreHorizontal, ExternalLink
} from 'lucide-react';

/* --- API Helper --- */
async function apiFetchResponses() {
  const res = await fetch("/api/responses");
  if (res.ok) return res.json();
  throw new Error("Failed to load responses");
}

const parseAnswers = (answers) => {
  try {
    return typeof answers === 'string' ? JSON.parse(answers) : answers;
  } catch (e) {
    console.error("Parse Error:", e);
    return { "Error": "Could not read response data" };
  }
};

export default function AdditionalPage() {
  const [allResponses, setAllResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState({ type: 'dashboard', data: null });

  useEffect(() => {
    apiFetchResponses()
      .then(data => {
        setAllResponses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const groupedForms = allResponses.reduce((acc, current) => {
    const id = current.formId;
    if (!acc[id]) {
      acc[id] = {
        formId: id,
        formTitle: current.formTitle,
        count: 0,
        submissions: []
      };
    }
    acc[id].count += 1;
    acc[id].submissions.push(current);
    return acc;
  }, {});

  const formList = Object.values(groupedForms).filter(f => 
    f.formTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const STYLES = {
    container: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' },
    card: { 
      backgroundColor: '#fff', 
      border: '1px solid #f1f5f9', 
      borderRadius: '16px', 
      padding: '24px', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s ease'
    },
    statCard: {
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '20px',
      border: '1px solid #f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04)'
    },
    tableHeader: { 
      textAlign: 'left', 
      fontSize: '11px', 
      fontWeight: '700', 
      color: '#64748b', 
      textTransform: 'uppercase', 
      padding: '16px', 
      letterSpacing: '0.05em',
      borderBottom: '1px solid #f1f5f9'
    },
    tableCell: { 
      padding: '18px 16px', 
      fontSize: '14px', 
      borderBottom: '1px solid #f8fafc', 
      color: '#334155' 
    },
    badge: { 
      background: '#f0fdf4', 
      color: '#166534', 
      padding: '4px 10px', 
      borderRadius: '8px', 
      fontWeight: '600', 
      fontSize: '12px', 
      border: '1px solid #dcfce7' 
    },
    backBtn: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      cursor: 'pointer', 
      border: '1px solid #e2e8f0', 
      background: '#fff', 
      color: '#475569', 
      fontWeight: '600', 
      padding: '8px 16px',
      borderRadius: '10px',
      fontSize: '14px',
      marginBottom: '24px',
      transition: 'background 0.2s'
    },
    searchBar: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px', 
      background: '#f8fafc', 
      border: '1px solid #e2e8f0', 
      padding: '10px 16px', 
      borderRadius: '12px', 
      width: '320px',
      transition: 'all 0.2s ease'
    }
  };

  // --- VIEW: Individual Responses ---
  if (view.type === 'formDetail') {
    return (
      <s-page heading={`Responses: ${view.data.formTitle}`}>
        <div style={STYLES.container}>
          <button style={STYLES.backBtn} onClick={() => setView({ type: 'dashboard', data: null })}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {view.data.submissions.map((sub, index) => {
              const answers = parseAnswers(sub.answers);
              return (
                <div key={sub.id} style={STYLES.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '8px' }}>
                          <Clock size={16} color="#64748b" />
                       </div>
                       <span style={{ fontWeight: '700', fontSize: '16px' }}>Submission #{view.data.submissions.length - index}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>
                      {new Date(sub.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                    {Object.entries(answers).map(([key, value]) => (
                      <div key={key}>
                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.025em' }}>
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500', lineHeight: '1.5' }}>
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </s-page>
    );
  }

  // --- VIEW: Dashboard ---
  return (
    <s-page heading="Analytics Overview">
      <div style={STYLES.container}>
        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div style={STYLES.statCard}>
            <div style={{ background: '#ecfdf5', color: '#10b981', padding: '10px', borderRadius: '12px', width: 'fit-content' }}><ClipboardList size={22} /></div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>{Object.keys(groupedForms).length}</div>
              <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Active Forms</div>
            </div>
          </div>
          <div style={STYLES.statCard}>
            <div style={{ background: '#eff6ff', color: '#3b82f6', padding: '10px', borderRadius: '12px', width: 'fit-content' }}><MessageSquare size={22} /></div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>{allResponses.length}</div>
              <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Total Submissions</div>
            </div>
          </div>
          <div style={STYLES.statCard}>
            <div style={{ background: '#fff7ed', color: '#f97316', padding: '10px', borderRadius: '12px', width: 'fit-content' }}><BarChart3 size={22} /></div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
                {allResponses.filter(r => new Date(r.createdAt) > new Date(Date.now() - 86400000)).length}
              </div>
              <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>New Today</div>
            </div>
          </div>
        </div>

        <s-section>
          <div style={STYLES.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Form Records</h3>
              <div style={STYLES.searchBar}>
                <Search size={18} color="#94a3b8" />
                <input 
                  type="text" 
                  placeholder="Filter by form title..." 
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', background: 'transparent' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={STYLES.tableHeader}>Form Identity</th>
                    <th style={STYLES.tableHeader}>Submission Volume</th>
                    <th style={STYLES.tableHeader}>Recent Activity</th>
                    <th style={{ ...STYLES.tableHeader, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Gathering data...</td></tr>
                  ) : formList.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>No forms found.</td></tr>
                  ) : formList.map((form) => (
                    <tr key={form.formId} className="table-row">
                      <td style={STYLES.tableCell}>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>{form.formTitle}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>ID: {form.formId.slice(-8)}</div>
                      </td>
                      <td style={STYLES.tableCell}>
                        <span style={STYLES.badge}>{form.count} Responses</span>
                      </td>
                      <td style={STYLES.tableCell}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                          <Calendar size={14} color="#94a3b8" />
                          {new Date(form.submissions[0].createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td style={{ ...STYLES.tableCell, textAlign: 'right' }}>
                        <button 
                          onClick={() => setView({ type: 'formDetail', data: form })}
                          style={{ 
                            background: '#f1f5f9', 
                            border: 'none', 
                            color: '#475569', 
                            cursor: 'pointer', 
                            padding: '8px 12px', 
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          View Reports <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </s-section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .table-row:hover {
          background-color: #f8fafc;
        }

        s-page {
          background-color: #fcfcfd;
          min-height: 100vh;
          display: block;
        }

        input::placeholder {
          color: #cbd5e1;
        }

        button:active {
          transform: scale(0.98);
        }
      `}} />
    </s-page>
  );
}