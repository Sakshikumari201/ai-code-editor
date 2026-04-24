import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Send, Zap, BookOpen, Clock, Check, X, Code2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [code, setCode] = useState('// Type your code here...\nfunction hello() {\n  console.log("hello world");\n}');
  const [intent, setIntent] = useState('');
  const [activeTab, setActiveTab] = useState('intent');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [suggestedChange, setSuggestedChange] = useState(null);
  const [decisions, setDecisions] = useState([]);

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/decisions`);
      setDecisions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessIntent = async () => {
    if (!intent.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/intent/process`, { code, intent });
      setSuggestedChange(res.data);
      setActiveTab('intent');
    } catch (err) {
      alert('Error processing intent');
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/explain/code`, { code });
      setExplanation(res.data.explanation);
      setActiveTab('explain');
    } catch (err) {
      alert('Error explaining code');
    } finally {
      setLoading(false);
    }
  };

  const applyChange = async () => {
    if (!suggestedChange) return;
    const oldCode = code;
    setCode(suggestedChange.updatedCode);
    
    // Save to decision store
    await axios.post(`${API_BASE}/decisions`, {
      intent,
      oldCode,
      newCode: suggestedChange.updatedCode,
      reasoning: suggestedChange.reasoning,
      status: 'applied'
    });
    
    setSuggestedChange(null);
    setIntent('');
    fetchDecisions();
  };

  return (
    <div className="app-container">
      {/* Code Editor Section */}
      <div className="glass-panel editor-section">
        <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>main.js</span>
          <button onClick={handleExplain} style={{ padding: '4px 12px', fontSize: '0.8rem' }} disabled={loading}>
            <BookOpen size={14} style={{ marginRight: 6 }} /> Explain
          </button>
        </div>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val)}
          options={{
            fontSize: 14,
            padding: { top: 20 },
            minimap: { enabled: false },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            lineNumbersMinChars: 3
          }}
        />
      </div>

      {/* Sidebar Section */}
      <div className="sidebar-section">
        <div className="glass-panel" style={{ flex: 1 }}>
          <div className="tab-header">
            <button 
              className={`tab-btn ${activeTab === 'intent' ? 'active' : ''}`}
              onClick={() => setActiveTab('intent')}
            >
              <Zap size={16} /> Intent
            </button>
            <button 
              className={`tab-btn ${activeTab === 'explain' ? 'active' : ''}`}
              onClick={() => setActiveTab('explain')}
            >
              <BookOpen size={16} /> Explain
            </button>
            <button 
              className={`tab-btn ${activeTab === 'decisions' ? 'active' : ''}`}
              onClick={() => setActiveTab('decisions')}
            >
              <Clock size={16} /> History
            </button>
          </div>

          <div className="scroll-area">
            {activeTab === 'intent' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="input-container">
                  <textarea
                    placeholder="Tell AI what to do (e.g., 'convert this to an arrow function', 'add error handling')"
                    rows={4}
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                  />
                  <button onClick={handleProcessIntent} disabled={loading}>
                    {loading ? 'Processing...' : 'Generate Changes'}
                  </button>
                </div>

                {suggestedChange && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="message" 
                    style={{ borderLeft: '4px solid var(--accent-color)', marginTop: '20px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Code2 size={18} color="var(--accent-color)" />
                      <h4 style={{ margin: 0 }}>Proposed Changes</h4>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      {suggestedChange.summary}
                    </p>

                    {suggestedChange.plan && (
                      <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', marginBottom: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>
                           ENGINEERING PLAN
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{suggestedChange.plan}</div>
                      </div>
                    )}
                    
                    <div className="code-diff" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                       {suggestedChange.diff.split('\n').map((line, i) => {
                         let className = '';
                         if (line.startsWith('+')) className = 'diff-added';
                         if (line.startsWith('-')) className = 'diff-removed';
                         return (
                           <div key={i} className={className} style={{ padding: '0 4px' }}>
                             {line}
                           </div>
                         );
                       })}
                    </div>

                    <div style={{ padding: '12px', background: 'rgba(255,165,0,0.1)', borderRadius: '8px', margin: '12px 0', border: '1px solid rgba(255,165,0,0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffa500', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>
                        <AlertTriangle size={14} /> TECHNICAL REASONING
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{suggestedChange.reasoning}</p>
                      
                      {suggestedChange.warnings && (
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,165,0,0.2)', fontSize: '0.75rem', color: '#ffb3ba' }}>
                           <strong>⚠️ CONSTRAINTS:</strong> {suggestedChange.warnings}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                      <button onClick={applyChange} style={{ flex: 1, backgroundColor: 'var(--success)' }}>
                        <Check size={16} style={{ marginRight: 6 }} /> Apply Changes
                      </button>
                      <button onClick={() => setSuggestedChange(null)} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                        <X size={16} style={{ marginRight: 6 }} /> Discard
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'explain' && (
              <div className="markdown-content">
                {explanation ? (
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>
                    Click 'Explain' above the editor to analyze your code.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'decisions' && (
              <div>
                {decisions.map((d, i) => (
                  <div key={i} className="message" style={{ fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{d.intent}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {new Date(d.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
                {decisions.length === 0 && (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>
                    No decision history yet.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
