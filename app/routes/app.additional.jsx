import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Calendar, FileText, ChevronRight, 
  Search, Download, Trash2, ArrowLeft 
} from 'lucide-react';

/* --- API Helper for Responses --- */
async function apiFetchResponses() {
  const res = await fetch("/api/responses"); // Ensure this endpoint exists in your backend
  if (res.ok) return res.json();
  throw new Error("Failed to load responses");
}

export default function AdditionalPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    apiFetchResponses()
      .then(data => {
        setResponses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter responses based on search (Form Name or Email)
  const filteredResponses = responses.filter(r => 
    r.formTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const STYLES = {
    card: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    tableHeader: { textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', padding: '12px 16px', borderBottom: '2px solid #f3f4f6' },
    tableCell: { padding: '16px', fontSize: '14px', borderBottom: '1px solid #f3f4f6', color: '#374151' },
    badge: { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', background: '#f0fdf4', color: '#15803d' },
    searchBar: { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #d1d5db', padding: '8px 12px', borderRadius: '8px', width: '300px' }
  };

  return (
    <s-page heading="Response Dashboard">
      {/* Summary Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={STYLES.card}>
          <div style={{ color: '#15803d', marginBottom: '8px' }}><BarChart3 size={20} /></div>
          <div style={{ fontSize: '24px', fontWeight: '800' }}>{responses.length}</div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Total Submissions</div>
        </div>
        <div style={STYLES.card}>
          <div style={{ color: '#15803d', marginBottom: '8px' }}><Calendar size={20} /></div>
          <div style={{ fontSize: '24px', fontWeight: '800' }}>{responses.filter(r => new Date(r.createdAt) > new Date(Date.now() - 86400000)).length}</div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Last 24 Hours</div>
        </div>
        <div style={STYLES.card}>
          <div style={{ color: '#15803d', marginBottom: '8px' }}><FileText size={20} /></div>
          <div style={{ fontSize: '24px', fontWeight: '800' }}>{new Set(responses.map(r => r.formId)).size}</div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Active Forms</div>
        </div>
      </div>

      <s-section heading="All Submissions">
        <div style={STYLES.card}>
          {/* Table Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={STYLES.searchBar}>
              <Search size={18} color="#9ca3af" />
              <input 
                type="text" 
                placeholder="Search by form or email..." 
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button style={{ ...STYLES.btnPrimary, background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Download size={16} /> Export CSV
            </button>
          </div>

          {/* Response Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={STYLES.tableHeader}>Form Name</th>
                  <th style={STYLES.tableHeader}>Submission Date</th>
                  <th style={STYLES.tableHeader}>Status</th>
                  <th style={STYLES.tableHeader}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>Loading responses...</td></tr>
                ) : filteredResponses.map((res) => (
                  <tr key={res.id}>
                    <td style={STYLES.tableCell}>
                      <div style={{ fontWeight: '600' }}>{res.formTitle}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{res.email || 'Anonymous'}</div>
                    </td>
                    <td style={STYLES.tableCell}>{new Date(res.createdAt).toLocaleDateString()}</td>
                    <td style={STYLES.tableCell}><span style={STYLES.badge}>Success</span></td>
                    <td style={STYLES.tableCell}>
                      <button style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer' }}>
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </s-section>
    </s-page>
  );
}