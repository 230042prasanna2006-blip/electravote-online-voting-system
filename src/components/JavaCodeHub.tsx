import React, { useState } from 'react';
import { 
  FileCode2, 
  FolderGit2, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Layers, 
  Terminal, 
  CheckCircle2, 
  ShieldCheck, 
  Database,
  ExternalLink,
  Code
} from 'lucide-react';
import { JAVA_PROJECT_FILES } from '../services/javaCodeData';
import { JavaFile } from '../types';

export const JavaCodeHub: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<JavaFile>(JAVA_PROJECT_FILES[1]); // Default to DBConnection.java or VoteDAO.java
  const [copied, setCopied] = useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (file: JavaFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/50 to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 mb-8 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-bold">
                <FolderGit2 className="h-3.5 w-3.5" />
                JAVA + MYSQL + JDBC + GITHUB ARCHITECTURE
              </span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                JDK 17 • Jakarta EE • MySQL 8.0
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Backend Java Source Code & Architecture Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Inspect the production-ready Java DAOs, JDBC Connection Pool, Jakarta Servlets, and MySQL DDL schemas designed for your GitHub repository.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyCode(selectedFile.content)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Active File'}</span>
            </button>
            <button
              onClick={() => downloadFile(selectedFile)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Download {selectedFile.name}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main IDE Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Repository Explorer */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-emerald-400" />
                <span>GitHub Repository Files</span>
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                7 Files
              </span>
            </div>

            <div className="space-y-2">
              {JAVA_PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.name === file.name;
                return (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all text-xs flex items-center justify-between group ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCode2 className={`h-4 w-4 ${
                        file.type === 'java' ? 'text-cyan-400' : file.type === 'sql' ? 'text-amber-400' : 'text-slate-400'
                      }`} />
                      <div>
                        <div className="font-mono font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {file.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{file.path}</div>
                      </div>
                    </div>

                    <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-bold ${
                      file.type === 'java' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {file.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Architecture Highlights Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 text-xs">
            <h4 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Core Technology Checklist</span>
            </h4>
            <div className="space-y-2 text-slate-300 text-[11px]">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong>Java 17 / Jakarta EE:</strong> Handles secure HTTP requests and session authentication.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong>JDBC PreparedStatements:</strong> Protects against SQL injection attacks with parameter binding.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong>ACID Transactions:</strong> <code>setAutoCommit(false)</code> ensures duplicate votes are rolled back atomically.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong>MySQL Constraints:</strong> Enforces <code>UNIQUE(voter_id, election_id)</code> to ensure only 1 vote per voter.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Code Viewer */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Code Window Header */}
            <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80"></div>
                  <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <span className="font-mono text-xs text-slate-300 font-bold">
                  {selectedFile.path}
                </span>
              </div>

              <span className="text-[11px] text-slate-400">
                {selectedFile.description}
              </span>
            </div>

            {/* Code Content */}
            <div className="p-5 overflow-x-auto max-h-[600px] overflow-y-auto">
              <pre className="font-mono text-xs text-slate-200 leading-relaxed">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
