import os
import re

file_path = r'd:\sem 6\Fullstacks\CareerForge\CareerForge\frontend\src\pages\student\ResumeAnalysis.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add import
if 'resumeService' not in text:
    text = text.replace("import api from '../../services/api';", "import api from '../../services/api';\nimport { resumeService } from '../../services/api/resumeService';")

# 2. State & Handlers
state_code = """  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Target Role Match State
  const [targetRole, setTargetRole] = useState('');
  const [resumeTextForMatch, setResumeTextForMatch] = useState('');
  const [isMatchingRole, setIsMatchingRole] = useState(false);
  const [roleMatchResult, setRoleMatchResult] = useState<any>(null);

  const handleTargetRoleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim() || (!resume && !resumeTextForMatch.trim())) {
      toast.error('Please either have an uploaded resume or paste your resume text');
      return;
    }

    try {
      setIsMatchingRole(true);
      let result;
      if (!resume || resumeTextForMatch.trim().length > 0) {
        result = await resumeService.matchTextWithJD(resumeTextForMatch, targetRole);
      } else {
        result = await resumeService.matchWithJD(resume._id, targetRole);
      }
      setRoleMatchResult(result);
      toast.success(`Successfully matched against ${targetRole}`);
    } catch (error) {
      console.error('Error matching role:', error);
      toast.error('Failed to match against target role.');
    } finally {
      setIsMatchingRole(false);
    }
  };
"""

text = re.sub(
    r'  const \[expandedSections, setExpandedSections\] = useState<Record<string, boolean>>\(\{\}\);\n?',
    state_code,
    text
)

# 3. Create renderAnalysisContent method
# Find `  if (loading) {` up to the final return 
start_idx = text.find('  if (loading) {')
end_idx = text.rfind('  );\\n};')

# We'll isolate the body from start_idx to the end of component
body_extract = text[start_idx:text.rfind('};')] 

# In body_extract, replace `  if (loading) {` with `  const renderAnalysisContent = () => {\n    if (loading) {`
body_extract = body_extract.replace('  if (loading) {', '  const renderAnalysisContent = () => {\n    if (loading) {', 1)

# we need to close `renderAnalysisContent` before the final `}`
# Wait, the end of `body_extract` is `  );\n`
# We will replace the final `  );\n` inside body_extract with `  );\n  };`? No.
# `body_extract` contains the rest of the file except `export default ResumeAnalysis;`
# Actually, let's use a simpler string replacement.

text = text.replace('  if (loading) {', '  const renderAnalysisContent = () => {\n    if (loading) {', 1)

# Now we need to insert the top-level return before `const renderAnalysisContent`
top_level_return = """
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-light">Resume Analysis</h1>
            <p className="text-light-400 mt-1">AI-powered resume insights & role matching</p>
          </div>
          <div className="flex items-center gap-2">
            {resume && (
              <button
                onClick={handleReanalyze}
                disabled={reanalyzing}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 ${reanalyzing ? 'animate-spin' : ''}`} />
                {reanalyzing ? 'Analyzing...' : 'Re-analyze'}
              </button>
            )}
            <button onClick={() => navigate('/student/resume/upload')} className="btn-secondary flex items-center gap-2">
              <ArrowUpIcon className="w-4 h-4" />
              Upload New
            </button>
          </div>
        </div>
      </motion.div>

      {/* Target Role Matcher */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-dark">
        <h3 className="text-light font-semibold mb-4 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-accent" />
          Target Role Matcher
        </h3>
        <p className="text-light-400 text-sm mb-4">
          Test your resume against a specific role. {!resume && "Paste your resume text and enter a target role below."}
        </p>

        <form onSubmit={handleTargetRoleMatch} className="space-y-4">
          {(!resume || resumeTextForMatch.length > 0) && (
            <div>
              <label className="block text-light-400 text-sm mb-1">Paste Resume Text {resume && "(Overrides uploaded resume)"}</label>
              <textarea
                className="w-full bg-charcoal-300/30 border border-white/10 rounded-lg p-3 text-light focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all min-h-[100px]"
                placeholder="Paste the plain text of your resume here..."
                value={resumeTextForMatch}
                onChange={(e) => setResumeTextForMatch(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-light-400 text-sm mb-1">Target Role / Job Title</label>
              <input
                type="text"
                className="w-full bg-charcoal-300/30 border border-white/10 rounded-lg p-3 text-light focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                placeholder="e.g. Full Stack Developer, Data Scientist..."
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={!targetRole.trim() || isMatchingRole}
              className="btn-primary py-3 px-6 h-[50px] flex items-center justify-center min-w-[140px]"
            >
              {isMatchingRole ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                'Test Match'
              )}
            </button>
          </div>
        </form>

        {/* Role Match Results */}
        {roleMatchResult && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-charcoal-300/30 rounded-lg p-4 border border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-light-400 text-sm mb-1">Role Fit Score</span>
                <div className={`text-4xl font-bold ${roleMatchResult.matchScore >= 80 ? 'text-success' : roleMatchResult.matchScore >= 60 ? 'text-warning' : 'text-error'}`}>
                  {roleMatchResult.matchScore}<span className="text-base text-light-400">/100</span>
                </div>
              </div>

              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-success flex items-center gap-2 mb-2">
                    <CheckCircleIcon className="w-4 h-4" /> Matched Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {roleMatchResult.matchedSkills?.length > 0 ? roleMatchResult.matchedSkills.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-success/10 text-success rounded text-xs">
                        {skill}
                      </span>
                    )) : <span className="text-xs text-light-400">None</span>}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-error flex items-center gap-2 mb-2">
                    <ExclamationCircleIcon className="w-4 h-4" /> Missing Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {roleMatchResult.missingSkills?.length > 0 ? roleMatchResult.missingSkills.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-error/10 text-error rounded text-xs">
                        {skill}
                      </span>
                    )) : <span className="text-xs text-light-400">None</span>}
                  </div>
                </div>
              </div>
            </div>

            {roleMatchResult.recommendations?.length > 0 && (
              <div className="mt-4 bg-accent/10 border border-accent/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-accent flex items-center gap-2 mb-2">
                  <LightBulbIcon className="w-4 h-4" /> Role Recommendations
                </h4>
                <ul className="space-y-1">
                  {roleMatchResult.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-light-300 flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Analysis Content */}
      {renderAnalysisContent()}
    </div>
  );

  const renderAnalysisContent = () => {
    if (loading) {"""

text = text.replace('  const renderAnalysisContent = () => {\n    if (loading) {', top_level_return, 1)

# Now we need to fix the end of renderAnalysisContent and remove the old Header
# The old Header was in the old `return` statement:
original_return = """  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-light">Resume Analysis</h1>
            <p className="text-light-400 mt-1">AI-powered resume insights</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing || !resume}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${reanalyzing ? 'animate-spin' : ''}`} />
              {reanalyzing ? 'Analyzing...' : 'Re-analyze'}
            </button>
            <button onClick={() => navigate('/student/resume/upload')} className="btn-secondary flex items-center gap-2">
              <ArrowUpIcon className="w-4 h-4" />
              Upload New
            </button>
          </div>
        </div>
      </motion.div>

      {/* Score Cards */}"""

new_inner_return = """  return (
    <>
      {/* Score Cards */}"""

text = text.replace(original_return, new_inner_return, 1)

# Modify the end of the file. It currently ends with:
#     </div >
#   );
# };
# export default ResumeAnalysis;

text = text.replace("    </div >\n  );\n};\n\nexport default ResumeAnalysis;", "    </>\n  );\n  };\n};\n\nexport default ResumeAnalysis;")
# Wait, ResumeAnalysis's end tag is `}` and then `export default ResumeAnalysis;`

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("Done editing ResumeAnalysis.tsx")
