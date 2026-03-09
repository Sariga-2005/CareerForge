import os

file_path = r'd:\sem 6\Fullstacks\CareerForge\CareerForge\frontend\src\pages\student\ResumeAnalysis.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update State
old_state = '''  // Target Role Match State
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
  };'''

new_state = '''  // Target Role Match State
  const [targetRole, setTargetRole] = useState('');
  const [userSkills, setUserSkills] = useState('');
  const [userInterests, setUserInterests] = useState('');
  const [isMatchingRole, setIsMatchingRole] = useState(false);
  const [roleMatchResult, setRoleMatchResult] = useState<any>(null);

  const predefinedRoles = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 
    'Full Stack Developer', 'Data Scientist', 'Machine Learning Engineer', 
    'DevOps Engineer', 'Product Manager', 'UI/UX Designer', 'Cybersecurity Analyst'
  ];

  const handleTargetRoleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      toast.error('Please select or enter a target role');
      return;
    }
    if (!resume && !userSkills.trim()) {
      toast.error('Please enter your skills to match against the role');
      return;
    }

    try {
      setIsMatchingRole(true);
      let result;
      if (!resume || userSkills.trim().length > 0) {
        const constructedText = `Skills: ${userSkills}\\nInterests: ${userInterests}`;
        result = await resumeService.matchTextWithJD(constructedText, targetRole);
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
  };'''

text = text.replace(old_state, new_state)

# 2. Update JSX Form
old_form = '''        <form onSubmit={handleTargetRoleMatch} className="space-y-4">
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
        </form>'''

new_form = '''        <form onSubmit={handleTargetRoleMatch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-light-400 text-sm mb-1">Target Role</label>
                <div className="relative">
                  <select
                    className="w-full bg-charcoal-300/30 border border-white/10 rounded-lg p-3 text-light focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all appearance-none"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  >
                    <option value="" disabled>Select a target role...</option>
                    {predefinedRoles.map(role => (
                       <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-light-400">
                    <ChevronDownIcon className="w-4 h-4" />
                  </div>
                </div>
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
            
            {(!resume || userSkills.length > 0 || userInterests.length > 0) && (
              <>
                <div className="md:col-span-2 mt-2">
                  <label className="block text-light-400 text-sm mb-1">
                    Your Skills {resume ? "(Overrides resume skills)" : "(Required without resume)"}
                  </label>
                  <textarea
                    className="w-full bg-charcoal-300/30 border border-white/10 rounded-lg p-3 text-light focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all min-h-[80px]"
                    placeholder="e.g. React, Node.js, Python, Leadership, Database Design..."
                    value={userSkills}
                    onChange={(e) => setUserSkills(e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-light-400 text-sm mb-1">
                    Your Interests & Domains (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-charcoal-300/30 border border-white/10 rounded-lg p-3 text-light focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                    placeholder="e.g. Web Development, AI, Open Source..."
                    value={userInterests}
                    onChange={(e) => setUserInterests(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </form>'''

text = text.replace(old_form, new_form)

# 3. Target Role Matcher Description
old_desc = '''        <p className="text-light-400 text-sm mb-4">
          Test your resume against a specific role. {!resume && "Paste your resume text and enter a target role below."}
        </p>'''

new_desc = '''        <p className="text-light-400 text-sm mb-4">
          Test your profile against a specific role. {!resume && "Select a role and enter your skills below to see how well you match."}
        </p>'''

text = text.replace(old_desc, new_desc)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Done')
