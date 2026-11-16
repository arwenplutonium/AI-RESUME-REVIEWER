/*
  MochiCV — Grading rubric
  ---------------------------------------------------------------
  Based on the "AI Resume & Cover Letter Reviewer — Resume Best
  Practices & Grading Rubric" (Harvard FAS Mignone Center for
  Career Success guidance).

  Edit this file to change category names, point values, the
  "why it matters" explanations or the score bands. app.js reads
  everything from here, so you do not need to touch the scoring
  code to update wording.
*/

export const RUBRIC = {
  resume: {
    label: "Resume / CV",
    categories: [
      {
        id: "contact",
        name: "Contact information",
        max: 10,
        checks: "Name, professional email, phone, LinkedIn/portfolio, appropriate location.",
        why: "Recruiters need to reach you quickly. Unnecessary personal details take up space and can expose private information."
      },
      {
        id: "formatting",
        name: "Formatting and readability",
        max: 15,
        checks: "Clean layout, clear headings, consistent spacing, easy scanning.",
        why: "Recruiters often scan a CV in seconds. Clear headings and short bullet points make your strengths easy to find."
      },
      {
        id: "sections",
        name: "Required sections",
        max: 10,
        checks: "Contact, education, experience/projects and skills, logically ordered, with dates.",
        why: "Missing sections or dates leave gaps that make it harder for an employer to understand your background."
      },
      {
        id: "experience",
        name: "Experience quality",
        max: 25,
        checks: "Strong action verbs, specific tasks, measurable results where possible, relevance to the role.",
        why: "Harvard guidance recommends specific, active, fact-based language. Phrases like “responsible for” do not show what you actually did or achieved."
      },
      {
        id: "skills",
        name: "Skills and keywords",
        max: 15,
        checks: "Relevant technical, language, leadership and transferable skills aligned to the job.",
        why: "Employers and applicant-tracking systems look for skills that match the vacancy. Relevant, supported keywords help your CV get noticed."
      },
      {
        id: "education",
        name: "Education and achievements",
        max: 10,
        checks: "Degree, institution, graduation date, relevant coursework, honours, projects, certifications.",
        why: "Education is especially important for students and graduates, and relevant coursework or projects can show skills you have not used at work yet."
      },
      {
        id: "accuracy",
        name: "Accuracy and professionalism",
        max: 15,
        checks: "No spelling errors, consistent dates, honest claims, professional wording.",
        why: "Small errors and exaggerated claims can reduce trust in an otherwise strong application."
      },
      {
        id: "ats",
        name: "ATS and document readiness",
        max: 10,
        checks: "Simple structure, standard headings, readable text, no confusing tables or graphics.",
        why: "Applicant-tracking systems can misread tables, text boxes, symbols and unusual headings, which may hide your information."
      }
    ]
  },

  cover: {
    label: "Cover letter",
    categories: [
      {
        id: "format",
        name: "Format and length",
        max: 15,
        checks: "One page, professional greeting, clear paragraphs, consistent style.",
        why: "A focused one-page letter respects the reader’s time and looks professional."
      },
      {
        id: "opening",
        name: "Opening and purpose",
        max: 15,
        checks: "States the role, organisation, reason for applying and how you found the opportunity.",
        why: "The first paragraph tells the reader what you are applying for and why they should keep reading."
      },
      {
        id: "tailoring",
        name: "Tailoring",
        max: 25,
        checks: "References the employer, role and job-description requirements; shows research and genuine interest.",
        why: "A generic letter that could be sent to any employer is far less persuasive than one written for this specific role."
      },
      {
        id: "evidence",
        name: "Evidence and examples",
        max: 25,
        checks: "Two or three specific experiences, projects, courses or achievements that show relevant skills.",
        why: "Claims about your skills are much more convincing when backed by a concrete example."
      },
      {
        id: "value",
        name: "Value added",
        max: 10,
        checks: "Explains what you can contribute, not only what you want from the role.",
        why: "Employers want to know how you will help them, not only what you hope to gain."
      },
      {
        id: "tone",
        name: "Tone and mechanics",
        max: 10,
        checks: "Professional, confident, concise and error-free; appropriate use of “I”.",
        why: "Clear, confident and error-free writing is itself evidence of your communication skills."
      },
      {
        id: "closing",
        name: "Closing",
        max: 10,
        checks: "Restates interest, invites further discussion, professional sign-off.",
        why: "A strong closing leaves a good final impression and makes the next step clear."
      }
    ]
  },

  bands: [
    { min: 90, label: "Excellent", resume: "Well organised, targeted and polished. Only minor refinements are needed.", cover: "Tailored, specific, persuasive and polished." },
    { min: 75, label: "Good", resume: "Solid, but needs targeted improvements in wording, evidence, formatting or tailoring.", cover: "Effective, but needs stronger examples, tailoring or wording." },
    { min: 60, label: "Developing", resume: "Several important improvements are needed, especially in achievement statements, relevance and clarity.", cover: "Needs a clearer purpose, better evidence and a stronger connection to the role." },
    { min: 0,  label: "Needs major revision", resume: "Needs restructuring, stronger evidence, clearer formatting and more relevant content.", cover: "Too generic, unclear, unsupported or poorly organised." }
  ],

  proofreadingChecklist: [
    "Check spelling and grammar (read it aloud once).",
    "Confirm your email and phone number are correct.",
    "Use one date format throughout (e.g. Jan 2024 – May 2025).",
    "Make sure every claim and number is true and something you can explain in an interview.",
    "Save as a PDF with a professional filename, e.g. Firstname-Lastname-CV.pdf."
  ]
};

// Word lists used by the demo scoring engine in app.js
export const WORDS = {
  actionVerbs: ["achieved","analysed","analyzed","built","coordinated","created","delivered","designed","developed","directed","drafted","established","facilitated","generated","implemented","improved","increased","initiated","launched","led","managed","mentored","negotiated","organised","organized","oversaw","planned","presented","produced","programmed","reduced","researched","resolved","restructured","streamlined","supervised","taught","trained","wrote","conducted","collaborated","compiled","evaluated","identified","maintained","prepared","processed","recruited","scheduled","served","supported","tested","tracked","volunteered","won","awarded","automated","configured","crafted","edited","hosted","interviewed","mobilised","mobilized","monitored","promoted","raised","redesigned","secured","translated","updated"],
  weakPhrases: ["responsible for","helped with","helped to","worked on","was involved in","were involved in","involved in","duties included","duties include","assisted with","tasked with","in charge of"],
  exaggerations: ["world-class","world class","best in the world","guru","ninja","rockstar","rock star","perfect","flawless","expert in everything","visionary","genius","unparalleled","exceptional at everything"],
  flowery: ["passionate beyond","dream company","deeply honoured","utmost","humbly","esteemed","extremely passionate","absolutely thrilled","since i was a child"],
  casual: ["hey","hi there","gonna","wanna","super excited","awesome","cool","stuff","things like that","lol","btw"],
  misspellings: {
    "recieve":"receive","recieved":"received","acheive":"achieve","acheived":"achieved","managment":"management","responsable":"responsible","experiance":"experience","comunication":"communication","communcation":"communication","excelent":"excellent","proffesional":"professional","profesional":"professional","succesful":"successful","sucessful":"successful","definately":"definitely","seperate":"separate","occured":"occurred","untill":"until","begining":"beginning","beleive":"believe","calender":"calendar","enviroment":"environment","goverment":"government","independant":"independent","knowlege":"knowledge","liase":"liaise","maintainance":"maintenance","oppurtunity":"opportunity","oportunity":"opportunity","organisaton":"organisation","persue":"pursue","referance":"reference","relevent":"relevant","sincerly":"sincerely","skils":"skills","teh":"the","univeristy":"university","wich":"which","writting":"writing","adress":"address","accomodate":"accommodate","commited":"committed","dependant":"dependent","grammer":"grammar","publically":"publicly","truely":"truly","acheivement":"achievement","acheivements":"achievements"
  },
  unprofessionalEmail: ["sexy","cute","baby","babe","princess","hottie","kinky","420","69","lover","killer","swag","boss","queen","king","angel","sweet","party"],
  stopWords: ["with","that","this","from","your","will","have","role","work","team","they","their","about","must","able","what","when","where","which","while","would","should","could","also","into","more","most","such","than","then","them","these","those","been","being","were","very","each","other","only","over","some","well","year","years","including","include","includes","strong","ability","skills","experience","candidate","applicants","position","job","please","apply","company","based","within","across","using","make","ensure","provide","support","good","knowledge","understanding","preferred","required","requirements","responsibilities","opportunity","looking","join","help","you","our","are","the","and","for","need","needs","seeking","intern","interns","internship","we're","hire","hiring","someone","person","ideal","people","day","new"]
};
