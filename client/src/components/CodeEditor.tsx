import React from 'react'
import Editor from '@monaco-editor/react'
import type { SubmissionLanguage } from '../types'

interface CodeEditorProps {
  code: string
  language: SubmissionLanguage
  onChange: (value: string) => void
  readOnly?: boolean
  height?: string
}

const LANGUAGE_MAP: Record<SubmissionLanguage, string> = {
  CPP: 'cpp',
  JAVA: 'java',
  PYTHON: 'python',
}

const CODE_TEMPLATES: Record<SubmissionLanguage, string> = {
  CPP: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Viết code của bạn ở đây
    
    return 0;
}`,
  JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Viết code của bạn ở đây
        
    }
}`,
  PYTHON: `import sys
input = sys.stdin.readline

# Viết code của bạn ở đây
`,
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onChange,
  readOnly = false,
  height = '500px',
}) => {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700">
      {/* Editor header */}
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-3 text-slate-400 text-sm font-mono">
            {language === 'CPP' ? 'solution.cpp' :
             language === 'JAVA' ? 'Solution.java' : 'solution.py'}
          </span>
        </div>
        <span className="text-xs text-slate-500">{language}</span>
      </div>

      {/* Monaco Editor */}
      <Editor
        height={height}
        language={LANGUAGE_MAP[language]}
        value={code || CODE_TEMPLATES[language]}
        theme="vs-dark"
        onChange={(value) => onChange(value || '')}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          fontLigatures: true,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          formatOnPaste: true,
          padding: { top: 12, bottom: 12 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
        }}
      />
    </div>
  )
}

export { CODE_TEMPLATES }
