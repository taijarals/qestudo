const fs = require('fs');
let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');
code = code.replace(
  "import { ArrowLeft, ChevronDown, ChevronRight, FileText, Target, BookOpen, FileQuestion, Sparkles, Loader2, Play } from 'lucide-react';",
  "import { ArrowLeft, ChevronDown, ChevronUp, ChevronRight, FileText, Target, BookOpen, FileQuestion, Sparkles, Loader2, Play } from 'lucide-react';"
);
fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
