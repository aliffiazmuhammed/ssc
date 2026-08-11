const fs = require('fs');
const files = ['CustomPractice.tsx', 'MathPractice.tsx', 'QuestionBank.tsx', 'VocabBrowser.tsx', 'VocabHome.tsx', 'VocabQuiz.tsx'];

files.forEach(file => {
  const path = 'src/pages/' + file;
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    if (!content.includes('Home,') && !content.includes('{ Home ') && !content.includes(', Home }') && !content.includes(', Home,')) {
      content = content.replace(/import \{([^}]+)\} from 'lucide-react';/, (match, p1) => {
        return `import { ${p1.trim()}, Home } from 'lucide-react';`;
      });
    }

    const backBtnRegex = /(<(?:Link|button)[^>]*>)\s*<ArrowLeft[^>]*>\s*(?:<\/(?:Link|button)>)/g;
    
    if (backBtnRegex.test(content) && !content.includes('<Home size=')) {
      let replaced = false;
      content = content.replace(backBtnRegex, (match) => {
        if (replaced) return match;
        replaced = true;
        const homeBtn = `\n              <button onClick={() => window.location.href = '/'} className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white transition-all shadow-sm flex items-center justify-center" title="Go Home">\n                <Home size={24} />\n              </button>`;
        return match + homeBtn;
      });
      fs.writeFileSync(path, content, 'utf8');
      console.log('Updated ' + file);
    }
  }
});
