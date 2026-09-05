export interface HelpCategory {
  id: string;
  icon: string;
  name: string;
  description: string;
}

export interface LocalizedContent {
  question: string;
  answer: string;
  tags: string[];
  actionLabel?: string;
}

export interface HelpQuestion {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  tags: string[];
  actionLink?: {
    label: string;
    url: string;
  };
  locales?: {
    hi?: LocalizedContent;
    bn?: LocalizedContent;
    ta?: LocalizedContent;
    te?: LocalizedContent;
  };
}

export const CATEGORY_TRANSLATIONS: Record<string, Record<string, { name: string; description: string }>> = {
  roadmaps: {
    en: { name: 'Roadmaps & Milestones', description: 'Career progression DAGs, milestones, statuses, and technology branches.' },
    hi: { name: 'रोडमैप और माइलस्टोन', description: 'करियर प्रगति DAG, माइलस्टोन, स्थिति और तकनीकी शाखाएँ।' },
    bn: { name: 'রোডম্যাপ ও মাইলফলক', description: 'ক্যারিয়ার অগ্রগতি DAG, মাইলফলক এবং প্রযুক্তিগত শাখা।' },
    ta: { name: 'வழிகாட்டி வரைபடம் & மைல்கற்கள்', description: 'தொழில் முன்னேற்ற DAG, மைல்கற்கள் மற்றும் தொழில்நுட்ப கிளைகள்.' },
    te: { name: 'రోడ్‌మ్యాప్‌లు & మైలురాళ్ళు', description: 'కెరీర్ పురోగతి DAG, మైలురాళ్ళు మరియు సాంకేతిక విభాగాలు.' }
  },
  assessments: {
    en: { name: 'Skill Assessments & Scoring', description: 'Proficiency evaluation, retakes, accuracy metrics, and difficulty tiers.' },
    hi: { name: 'कौशल मूल्यांकन और स्कोरिंग', description: 'दक्षता मूल्यांकन, पुनः प्रयास, सटीकता मेट्रिक्स और कठिनाई स्तर।' },
    bn: { name: 'দক্ষতা মূল্যায়ন ও স্কোরিং', description: 'দক্ষতা মূল্যায়ন, পুনরায় পরীক্ষা, নির্ভুলতা এবং স্তরের বিবরণ।' },
    ta: { name: 'திறன் மதிப்பீடு & மதிப்பெண்', description: 'தேர்ச்சி மதிப்பீடு, மறுபரிசீலனை மற்றும் துல்லிய அளவீடுகள்.' },
    te: { name: 'నైపుణ్య మూల్యాంకనం & స్కోరింగ్', description: 'ప్రావీణ్యత అంచనా, పునఃప్రయత్నం మరియు ఖచ్చితత్వ కొలమానాలు.' }
  },
  opportunities: {
    en: { name: 'Opportunity Matching & Scores', description: 'Compatibility scoring formula, Readiness segments, and AI match explanations.' },
    hi: { name: 'अवसर मिलान और स्कोर', description: 'अनुकूलता स्कोर फॉर्मूला, तत्परता श्रेणियाँ और एआई मैच व्याख्या।' },
    bn: { name: 'সুযোগ ম্যাচিং ও স্কোর', description: 'সামঞ্জস্য স্কোর সূত্র, প্রস্তুতি বিভাগ এবং এআই বিশ্লেষণ।' },
    ta: { name: 'வாய்ப்பு பொருத்தம் & மதிப்பெண்கள்', description: 'பொருத்தம் மதிப்பெண் சூத்திரம், தயார்நிலை பிரிவுகள் மற்றும் AI விளக்கம்.' },
    te: { name: 'అవకాశ సరిపోలిక & స్కోర్లు', description: 'అనుకూలత స్కోరింగ్ సూత్రం, సంసిద్ధత విభాగాలు మరియు AI వివరణలు.' }
  },
  resources: {
    en: { name: 'Learning Resources & Courses', description: 'Free accredited courses, NPTEL, SWAYAM, MIT OCW, and skill gap priorities.' },
    hi: { name: 'अध्ययन संसाधन और पाठ्यक्रम', description: 'निःशुल्क मान्यता प्राप्त पाठ्यक्रम, NPTEL, SWAYAM, MIT OCW, और कौशल अंतराल प्राथमिकताएँ।' },
    bn: { name: 'অধ্যয়ন সংস্থান ও কোর্স', description: 'বিনামূল্যে অনুমোদিত কোর্স, NPTEL, SWAYAM, MIT OCW এবং প্রয়োজনীয় সংস্থান।' },
    ta: { name: 'கற்றல் ஆதாரங்கள் & படிப்புகள்', description: 'இலவச அங்கீகரிக்கப்பட்ட படிப்புகள், NPTEL, SWAYAM, MIT OCW.' },
    te: { name: 'అభ్యాస వనరులు & కోర్సులు', description: 'ఉచిత గుర్తింపు పొందిన కోర్సులు, NPTEL, SWAYAM, MIT OCW.' }
  },
  institutions: {
    en: { name: 'Universities & Industry Talent', description: 'Talent pool discovery, institutional dashboards, and verified digital portfolios.' },
    hi: { name: 'विश्वविद्यालय और उद्योग प्रतिभा', description: 'टैलेंट पूल खोज, संस्थागत डैशबोर्ड और सत्यापित डिजिटल पोर्टफोलियो।' },
    bn: { name: 'বিশ্ববিদ্যালয় ও শিল্প প্রতিভা', description: 'ট্যালেন্ট পুল আবিষ্কার, প্রাতিষ্ঠানিক ড্যাশবোর্ড এবং ডিজিটাল পোর্টফোলিও।' },
    ta: { name: 'பல்கலைக்கழகங்கள் & தொழில் திறமை', description: 'திறமை தொகுப்பு கண்டறிதல், நிறுவன டாஷ்போர்டு மற்றும் போர்ட்ஃபோலியோ.' },
    te: { name: 'విశ్వవిద్యాలయాలు & పరిశ్రమ ప్రతిభ', description: 'టాలెంట్ పూల్ అన్వేషణ, సంస్థాగత డ్యాష్‌బోర్డ్ మరియు పోర్ట్‌ఫోలియో.' }
  },
  account: {
    en: { name: 'Account, Profile & Navigation', description: 'Changing study details, switching career tracks, and session troubleshooting.' },
    hi: { name: 'खाता, प्रोफ़ाइल और नेविगेशन', description: 'अध्ययन विवरण बदलना, करियर ट्रैक बदलना और समस्या निवारण।' },
    bn: { name: 'অ্যাকাউন্ট, প্রোফাইল ও নেভিগেশন', description: 'অধ্যয়নের বিবরণ পরিবর্তন, ট্র্যাক পরিবর্তন এবং সমস্যা সমাধান।' },
    ta: { name: 'கணக்கு, சுயவிவரம் & வழிகாட்டல்', description: 'படிப்பு விவரங்களை மாற்றுதல், தடங்களை மாற்றுதல் மற்றும் உதவி.' },
    te: { name: 'ఖాతా, ప్రొఫైల్ & నావిగేషన్', description: 'అధ్యయన వివరాల మార్పు, కెరీర్ ట్రాక్‌ల మార్పు మరియు పరిష్కారాలు.' }
  }
};

export const HELP_CATEGORIES: HelpCategory[] = [
  { id: 'roadmaps', name: 'Roadmaps & Milestones', icon: '🗺️', description: 'Career progression DAGs, milestones, statuses, and technology branches.' },
  { id: 'assessments', name: 'Skill Assessments & Scoring', icon: '📝', description: 'Proficiency evaluation, retakes, accuracy metrics, and difficulty tiers.' },
  { id: 'opportunities', name: 'Opportunity Matching & Scores', icon: '🎯', description: 'Compatibility scoring formula, Readiness segments, and AI match explanations.' },
  { id: 'resources', name: 'Learning Resources & Courses', icon: '📚', description: 'Free accredited courses, NPTEL, SWAYAM, MIT OCW, and skill gap priorities.' },
  { id: 'institutions', name: 'Universities & Industry Talent', icon: '🏛️', description: 'Talent pool discovery, institutional dashboards, and verified digital portfolios.' },
  { id: 'account', name: 'Account, Profile & Navigation', icon: '⚙️', description: 'Changing study details, switching career tracks, and session troubleshooting.' },
];

export const HELP_QUESTIONS: HelpQuestion[] = [
  // =========================================================================
  // ROADMAPS & MILESTONES
  // =========================================================================
  {
    id: 'rm-1',
    categoryId: 'roadmaps',
    question: 'How is my personalized career roadmap generated?',
    answer:
      'Your roadmap is dynamically generated from your target career role (such as Backend Developer or Machine Learning Engineer) and your initial skill assessment. Vidyut\'s Directed Acyclic Graph (DAG) evaluates your assessed proficiency, determines prerequisite dependencies, and sequences your learning milestones so foundational skills are acquired before advanced architectures.',
    tags: ['roadmap', 'dag', 'milestones', 'prerequisites', 'role', 'generation'],
    actionLink: { label: 'View Your Roadmap', url: '/roadmap' },
    locales: {
      hi: {
        question: 'मेरा व्यक्तिगत करियर रोडमैप कैसे तैयार किया जाता है?',
        answer: 'आपका रोडमैप आपकी लक्षित करियर भूमिका (जैसे बैकएंड डेवलपर या मशीन लर्निंग इंजीनियर) और आपके प्रारंभिक कौशल मूल्यांकन से गतिशील रूप से तैयार किया जाता है। विद्युत का डायरेक्टेड एसाइक्लिक ग्राफ (DAG) आपकी दक्षता का मूल्यांकन करता है, पूर्व-आवश्यकताओं को निर्धारित करता है, और आपके अध्ययन मील के पत्थरों को क्रमबद्ध करता है ताकि बुनियादी कौशल उन्नत आर्किटेक्चर से पहले सीखे जा सकें।',
        tags: ['रोडमैप', 'माइलस्टोन', 'करियर', 'कौशल'],
        actionLabel: 'अपना रोडमैप देखें'
      },
      bn: {
        question: 'আমার ব্যক্তিগতকৃত ক্যারিয়ার রোডম্যাপ কীভাবে তৈরি হয়?',
        answer: 'আপনার রোডম্যাপটি আপনার লক্ষ্য ক্যারিয়ার ভূমিকা (যেমন ব্যাকএন্ড ডেভেলপার বা মেশিন লার্নিং ইঞ্জিনিয়ার) এবং প্রাথমিক মূল্যায়ন থেকে তৈরি হয়। বিদ্যুৎ-এর ডিরেক্টেড অ্যাসাইক্লিক গ্রাফ (DAG) আপনার দক্ষতা বিশ্লেষণ করে পূর্বশর্ত নির্ধারণ করে এবং ধারাবাহিক মাইলফলক সাজায় যাতে মৌলিক দক্ষতা আগে অর্জিত হয়।',
        tags: ['রোডম্যাপ', 'মাইলফলক', 'ক্যারিয়ার', 'দক্ষতা'],
        actionLabel: 'আপনার রোডম্যাপ দেখুন'
      },
      ta: {
        question: 'எனது தனிப்பயனாக்கப்பட்ட தொழில் வரைபடம் எவ்வாறு உருவாக்கப்படுகிறது?',
        answer: 'உங்கள் வரைபடம் உங்கள் இலக்கு தொழில் பாத்திரம் மற்றும் ஆரம்ப திறன் மதிப்பீட்டிலிருந்து உருவாக்கப்படுகிறது. வித்யுத்தின் DAG உங்கள் திறனை மதிப்பிட்டு, முன்நிபந்தனைகளைத் தீர்மானித்து மைல்கற்களை வரிசைப்படுத்துகிறது, இதனால் மேம்பட்ட தலைப்புகளுக்கு முன் அடிப்படைத் திறன்கள் பெறப்படுகின்றன.',
        tags: ['வரைபடம்', 'மைல்கற்கள்', 'தொழில்', 'திறன்'],
        actionLabel: 'உங்கள் வரைபடத்தைக் காண்க'
      },
      te: {
        question: 'నా వ్యక్తిగతీకరించిన కెరీర్ రోడ్‌మ్యాప్ ఎలా రూపొందించబడుతుంది?',
        answer: 'మీ లక్ష్య కెరీర్ పాత్ర మరియు ప్రారంభ నైపుణ్య అంచనా ఆధారంగా మీ రోడ్‌మ్యాప్ రూపొందించబడుతుంది. విద్యుత్ యొక్క DAG మీ నైపుణ్యాన్ని అంచనా వేసి మైలురాళ్లను క్రమపద్ధతిలో అమర్చుతుంది, తద్వారా అధునాతన ఆర్కిటెక్చర్‌లకు ముందే పునాది నైపుణ్యాలు లభిస్తాయి.',
        tags: ['రోడ్‌మ్యాప్', 'మైలురాళ్ళు', 'కెరీర్', 'నైపుణ్యం'],
        actionLabel: 'మీ రోడ్‌మ్యాప్‌ను చూడండి'
      }
    }
  },
  {
    id: 'rm-2',
    categoryId: 'roadmaps',
    question: 'What do the milestone statuses mean (Not Started, In Progress, Completed)?',
    answer:
      '• NOT_STARTED: Upcoming milestones in your career progression that unlock as prerequisite skills are satisfied.\n• IN_PROGRESS: The current active milestone you are studying or preparing to assess.\n• COMPLETED: Milestones where you have successfully demonstrated the required proficiency level through verified assessments.',
    tags: ['status', 'milestones', 'progress', 'completed', 'in progress', 'not started'],
    actionLink: { label: 'Check Milestone Statuses', url: '/roadmap' },
    locales: {
      hi: {
        question: 'मील के पत्थर की स्थितियों (Not Started, In Progress, Completed) का क्या अर्थ है?',
        answer: '• NOT_STARTED: आपकी करियर प्रगति में आने वाले आगामी मील के पत्थर जो आवश्यक पूर्व-कौशल पूरे होने पर अनलॉक होते हैं।\n• IN_PROGRESS: वर्तमान सक्रिय मील का पत्थर जिसका आप अध्ययन कर रहे हैं या परीक्षण की तैयारी कर रहे हैं।\n• COMPLETED: वे मील के पत्थर जहाँ आपने सत्यापित आकलनों के माध्यम से आवश्यक प्रवीणता सफलतापूर्वक साबित कर दी है।',
        tags: ['स्थिति', 'माइलस्टोन', 'प्रगति', 'पूर्ण'],
        actionLabel: 'माइलस्टोन स्थिति जाँचें'
      },
      bn: {
        question: 'মাইলফলকের স্ট্যাটাসগুলির (Not Started, In Progress, Completed) অর্থ কী?',
        answer: '• NOT_STARTED: আসন্ন মাইলফলক যা পূর্বশর্তের দক্ষতা পূরণ হলে আনলক হয়।\n• IN_PROGRESS: বর্তমান সক্রিয় মাইলফলক যা আপনি অধ্যয়ন করছেন বা মূল্যায়নের প্রস্তুতি নিচ্ছেন।\n• COMPLETED: সফলভাবে যাচাইকৃত মূল্যায়নের মাধ্যমে প্রয়োজনীয় দক্ষতা অর্জিত মাইলফলক।',
        tags: ['স্ট্যাটাস', 'মাইলফলক', 'অগ্রগতি', 'সম্পূর্ণ'],
        actionLabel: 'মাইলফলক স্ট্যাটাস দেখুন'
      },
      ta: {
        question: 'மைல்கல் நிலைகளின் (Not Started, In Progress, Completed) அர்த்தம் என்ன?',
        answer: '• NOT_STARTED: முன்நிபந்தனைத் திறன்கள் பூர்த்தியடையும் போது திறக்கப்படும் வரவிருக்கும் மைல்கற்கள்.\n• IN_PROGRESS: நீங்கள் தற்போது படித்து வரும் அல்லது தேர்வுக்குத் தயாராகும் மைல்கல்.\n• COMPLETED: சரிபார்க்கப்பட்ட மதிப்பீடுகள் மூலம் வெற்றிகரமாகத் தேர்ச்சி பெற்ற மைல்கற்கள்.',
        tags: ['நிலை', 'மைல்கல்', 'முன்னேற்றம்', 'முடிந்தது'],
        actionLabel: 'மைல்கல் நிலைகளைச் சரிபார்க்கவும்'
      },
      te: {
        question: 'మైలురాయి స్థితిగతుల (Not Started, In Progress, Completed) అర్థం ఏమిటి?',
        answer: '• NOT_STARTED: ముందస్తు నైపుణ్యాలు పూర్తయినప్పుడు అన్‌లాక్ అయ్యే రాబోయే మైలురాళ్ళు.\n• IN_PROGRESS: మీరు ప్రస్తుతం చదువుతున్న లేదా పరీక్షకు సిద్ధమవుతున్న క్రియాశీల మైలురాయి.\n• COMPLETED: ధృవీకరించబడిన మూల్యాంకనాల ద్వారా అవసరమైన ప్రావీణ్యతను విజయవంతంగా నిరూపించిన మైలురాళ్ళు.',
        tags: ['స్థితి', 'మైలురాళ్ళు', 'పురోగతి', 'పూర్తయింది'],
        actionLabel: 'మైలురాయి స్థితులను తనిఖీ చేయండి'
      }
    }
  },
  {
    id: 'rm-3',
    categoryId: 'roadmaps',
    question: 'How do technology branches and decision points work?',
    answer:
      'Certain career roles feature alternative technical paths called Technology Branches (for example, choosing FastAPI vs Django in Backend Engineering, or PyTorch vs TensorFlow in Machine Learning). When your roadmap reaches a Decision Point milestone, you can choose your preferred framework branch, which tailors all subsequent milestones and learning resources accordingly.',
    tags: ['branch', 'technology branch', 'decision point', 'fastapi', 'django', 'pytorch', 'tensorflow'],
    actionLink: { label: 'Explore Roadmap Decisions', url: '/roadmap' },
    locales: {
      hi: {
        question: 'तकनीकी शाखाएँ (Technology Branches) और निर्णय बिंदु कैसे कार्य करते हैं?',
        answer: 'कुछ करियर भूमिकाओं में वैकल्पिक तकनीकी मार्ग होते हैं जिन्हें टेक्नोलॉजी ब्रांच कहा जाता है (उदाहरण के लिए, बैकएंड में FastAPI बनाम Django, या मशीन लर्निंग में PyTorch बनाम TensorFlow)। जब आपका रोडमैप किसी निर्णय बिंदु पर पहुँचता है, तो आप अपनी पसंदीदा शाखा चुन सकते हैं, जो बाद के सभी मील के पत्थरों और अध्ययन संसाधनों को तदनुसार ढालती है।',
        tags: ['ब्रांच', 'तकनीकी शाखा', 'निर्णय बिंदु', 'फास्टएपीआई', 'जैंगो'],
        actionLabel: 'रोडमैप निर्णय देखें'
      },
      bn: {
        question: 'প্রযুক্তিগত শাখা এবং সিদ্ধান্ত বিন্দুগুলি কীভাবে কাজ করে?',
        answer: 'কিছু ক্যারিয়ার ভূমিকায় বিকল্প প্রযুক্তিগত পথ থাকে যাকে প্রযুক্তি শাখা বলা হয় (যেমন ব্যাকএন্ডে FastAPI বনাম Django, বা মেশিন লার্নিংয়ে PyTorch বনাম TensorFlow)। সিদ্ধান্ত বিন্দুতে পৌঁছালে আপনি আপনার পছন্দের ফ্রেমওয়ার্ক বেছে নিতে পারেন, যা পরবর্তী সমস্ত মাইলফলককে সাজিয়ে তোলে।',
        tags: ['শাখা', 'প্রযুক্তি শাখা', 'সিদ্ধান্ত বিন্দু', 'পাইটর্চ'],
        actionLabel: 'রোডম্যাপ সিদ্ধান্ত অন্বেষণ করুন'
      },
      ta: {
        question: 'தொழில்நுட்ப கிளைகள் மற்றும் முடிவு புள்ளிகள் எவ்வாறு செயல்படுகின்றன?',
        answer: 'சில தொழில் பாத்திரங்கள் தொழில்நுட்ப கிளைகள் எனப்படும் மாற்றுப் பாதைகளைக் கொண்டுள்ளன (எ.கா. FastAPI vs Django அல்லது PyTorch vs TensorFlow). ஒரு முடிவுப் புள்ளியை அடையும் போது, உங்கள் விருப்பமான கட்டமைப்பைத் தேர்வுசெய்யலாம், இது அடுத்தடுத்த மைல்கற்களை அதற்கேற்ப அமைக்கிறது.',
        tags: ['கிளை', 'தொழில்நுட்ப கிளை', 'முடிவு புள்ளி'],
        actionLabel: 'வரைபட முடிவுகளை ஆராயுங்கள்'
      },
      te: {
        question: 'టెక్నాలజీ బ్రాంచ్‌లు మరియు నిర్ణయ బిందువులు ఎలా పనిచేస్తాయి?',
        answer: 'కొన్ని కెరీర్ పాత్రలు టెక్నాలజీ బ్రాంచెస్ అని పిలువబడే ప్రత్యామ్నాయ మార్గాలను కలిగి ఉంటాయి (ఉదాహరణకు FastAPI vs Django లేదా PyTorch vs TensorFlow). రోడ్‌మ్యాప్ నిర్ణయ బిందువుకు చేరినప్పుడు, మీరు ఇష్టపడే ఫ్రేమ్‌వర్క్‌ను ఎంచుకోవచ్చు, ఇది తదుపరి అన్ని మైలురాళ్లను అనుకూలీకరిస్తుంది.',
        tags: ['బ్రాంచ్', 'సాంకేతిక విభాగం', 'నిర్ణయ బిందువు'],
        actionLabel: 'రోడ్‌మ్యాప్ నిర్ణయాలను అన్వేషించండి'
      }
    }
  },
  {
    id: 'rm-4',
    categoryId: 'roadmaps',
    question: 'Can I switch my career track or regenerate my roadmap?',
    answer:
      'Yes! You can explore and switch career domains at any time by visiting "Explore Domains". When you switch roles or complete a new assessment, Vidyut updates your active roadmap milestones while preserving all your previously completed skill assessments and credentials.',
    tags: ['switch role', 'change track', 'regenerate', 'reset roadmap', 'explore'],
    actionLink: { label: 'Explore Other Domains', url: '/explore' },
    locales: {
      hi: {
        question: 'क्या मैं अपना करियर ट्रैक बदल सकता हूँ या रोडमैप दोबारा बना सकता हूँ?',
        answer: 'हाँ! आप "डोमेन देखें" पर जाकर किसी भी समय करियर डोमेन बदल सकते हैं। जब आप भूमिका बदलते हैं या नया मूल्यांकन पूरा करते हैं, तो विद्युत आपके पिछले सभी सत्यापित कौशलों को सुरक्षित रखते हुए आपके सक्रिय रोडमैप को अपडेट करता है।',
        tags: ['ट्रैक बदलें', 'रोडमैप रीसेट', 'डोमेन'],
        actionLabel: 'अन्य डोमेन देखें'
      },
      bn: {
        question: 'আমি কি আমার ক্যারিয়ার ট্র্যাক পরিবর্তন করতে বা রোডম্যাপ পুনর্নবীকরণ করতে পারি?',
        answer: 'হ্যাঁ! আপনি "ডোমেন এক্সপ্লোর করুন" এ গিয়ে যে কোনো সময় ক্যারিয়ার ডোমেন পরিবর্তন করতে পারেন। ভূমিকা পরিবর্তন বা নতুন মূল্যায়ন সম্পন্ন হলে বিদ্যুৎ আপনার পূর্ববর্তী সমস্ত দক্ষতা সংরক্ষণ করে নতুন রোডম্যাপ আপডেট করে।',
        tags: ['ট্র্যাক পরিবর্তন', 'রিসেট রোডম্যাপ', 'ডোমেন'],
        actionLabel: 'অন্যান্য ডোমেন দেখুন'
      },
      ta: {
        question: 'நான் எனது தொழில் பாதையை மாற்ற முடியுமா அல்லது வரைபடத்தை மீண்டும் உருவாக்க முடியுமா?',
        answer: 'ஆம்! "Explore Domains" பக்கத்திற்குச் சென்று எப்போது வேண்டுமானாலும் தொழில் களங்களை மாற்றலாம். புதிய பாத்திரத்தை மாற்றும்போது உங்கள் முந்தைய திறன்கள் பாதுகாக்கப்பட்டு புதிய வரைபடம் புதுப்பிக்கப்படும்.',
        tags: ['பாதை மாற்றம்', 'வரைபட மாற்றம்', 'களங்கள்'],
        actionLabel: 'பிற களங்களை ஆராயுங்கள்'
      },
      te: {
        question: 'నేను నా కెరీర్ ట్రాక్‌ని మార్చవచ్చా లేదా రోడ్‌మ్యాప్‌ను తిరిగి రూపొందించవచ్చా?',
        answer: 'అవును! మీరు "Explore Domains" ని సందర్శించి ఎప్పుడైనా కెరీర్ డొమైన్‌ను మార్చవచ్చు. మీరు పాత్రను మార్చినప్పుడు మీ మునుపటి నైపుణ్యాలు భద్రపరచబడి నూతన రోడ్‌మ్యాప్ అప్‌డేట్ చేయబడుతుంది.',
        tags: ['ట్రాక్ మార్పు', 'రీసెట్ రోడ్‌మ్యాప్', 'డొమైన్లు'],
        actionLabel: 'ఇతర డొమైన్‌లను అన్వేషించండి'
      }
    }
  },

  // =========================================================================
  // SKILL ASSESSMENTS & SCORING
  // =========================================================================
  {
    id: 'as-1',
    categoryId: 'assessments',
    question: 'How does the assessment engine calculate my proficiency level?',
    answer:
      'Vidyut\'s adaptive assessment engine evaluates your responses across multiple difficulty tiers (Easy, Medium, Hard). Based on your answer accuracy, timing, and question complexity weights, your skill state is calculated on a standardized 6-level scale: UNASSESSED, AWARENESS, BEGINNER, INTERMEDIATE, PROFICIENT, and EXPERT.',
    tags: ['assessment', 'scoring', 'proficiency', 'accuracy', 'evaluation', 'tiers'],
    actionLink: { label: 'Take an Assessment', url: '/assessment/self' },
    locales: {
      hi: {
        question: 'मूल्यांकन इंजन मेरी प्रवीणता के स्तर की गणना कैसे करता है?',
        answer: 'विद्युत का अनुकूलनशील मूल्यांकन इंजन कई कठिनाई स्तरों (आसान, मध्यम, कठिन) पर आपकी प्रतिक्रियाओं का मूल्यांकन करता है। उत्तर सटीकता, समय और जटिलता के आधार पर आपके कौशल की गणना 6 स्तरों पर की जाती है: UNASSESSED, AWARENESS, BEGINNER, INTERMEDIATE, PROFICIENT और EXPERT।',
        tags: ['मूल्यांकन', 'प्रवीणता', 'सटीकता', 'स्कोरिंग'],
        actionLabel: 'मूल्यांकन दें'
      },
      bn: {
        question: 'মূল্যায়ন ইঞ্জিন কীভাবে আমার দক্ষতার স্তর গণনা করে?',
        answer: 'বিদ্যুৎ-এর অভিযোজিত মূল্যায়ন ইঞ্জিন একাধিক স্তরে (সহজ, মাঝারি, কঠিন) আপনার উত্তর বিশ্লেষণ করে। উত্তরের নির্ভুলতা ও সময়কাল বিবেচনা করে দক্ষতা ৬টি স্তরে নির্ধারিত হয়: UNASSESSED, AWARENESS, BEGINNER, INTERMEDIATE, PROFICIENT এবং EXPERT।',
        tags: ['মূল্যায়ন', 'দক্ষতা', 'নির্ভুলতা', 'স্কোরিং'],
        actionLabel: 'মূল্যায়ন পরীক্ষা দিন'
      },
      ta: {
        question: 'மதிப்பீட்டு அமைப்பு எனது தேர்ச்சி நிலையை எவ்வாறு கணக்கிடுகிறது?',
        answer: 'வித்யுத்தின் தகவமைப்பு மதிப்பீட்டு அமைப்பு பல சிரம நிலைகளில் உங்கள் பதில்களை மதிப்பிடுகிறது. பதிலின் துல்லியம் மற்றும் நேரத்தின் அடிப்படையில், உங்கள் திறன் 6 நிலைகளில் கணக்கிடப்படுகிறது: UNASSESSED, AWARENESS, BEGINNER, INTERMEDIATE, PROFICIENT மற்றும் EXPERT.',
        tags: ['மதிப்பீடு', 'தேர்ச்சி', 'துல்லியம்', 'மதிப்பெண்'],
        actionLabel: 'மதிப்பீடு எடுக்கவும்'
      },
      te: {
        question: 'మూల్యాంకన ఇంజిన్ నా ప్రావీణ్యత స్థాయిని ఎలా లెక్కిస్తుంది?',
        answer: 'విద్యుత్ యొక్క అనుకూల మూల్యాంకన ఇంజిన్ బహుళ కష్ట స్థాయిలలో మీ సమాధానాలను అంచనా వేస్తుంది. సమాధాన ఖచ్చితత్వం మరియు సమయం ఆధారంగా మీ నైపుణ్యం 6 స్థాయిలలో లెక్కించబడుతుంది: UNASSESSED, AWARENESS, BEGINNER, INTERMEDIATE, PROFICIENT మరియు EXPERT.',
        tags: ['మూల్యాంకనం', 'ప్రావీణ్యత', 'ఖచ్చితత్వం', 'స్కోరింగ్'],
        actionLabel: 'మూల్యాంకనం తీసుకోండి'
      }
    }
  },
  {
    id: 'as-2',
    categoryId: 'assessments',
    question: 'Can I retake an assessment if I score poorly?',
    answer:
      'Yes, absolutely. Skill assessments are not one-time barriers. You can study the recommended learning resources and retake the skill test whenever you feel ready. Your student profile, accuracy metrics, and roadmap milestones immediately update with your improved score.',
    tags: ['retake', 'try again', 're-eval', 'low score', 'improvement'],
    actionLink: { label: 'Go to Self-Assessment', url: '/assessment/self' },
    locales: {
      hi: {
        question: 'यदि मेरा स्कोर कम आता है तो क्या मैं दोबारा मूल्यांकन दे सकता हूँ?',
        answer: 'हाँ, बिल्कुल। कौशल मूल्यांकन कोई एक बार की बाधा नहीं है। आप अनुशंसित अध्ययन संसाधनों से तैयारी कर सकते हैं और जब भी तैयार हों, पुनः परीक्षा दे सकते हैं। आपका प्रोफ़ाइल और रोडमैप आपके बेहतर स्कोर के साथ तुरंत अपडेट हो जाएगा।',
        tags: ['दोबारा प्रयास', 'सुधार', 'स्कोर'],
        actionLabel: 'स्व-मूल्यांकन पर जाएँ'
      },
      bn: {
        question: 'কম স্কোর পেলে আমি কি পুনরায় মূল্যায়ন পরীক্ষা দিতে পারি?',
        answer: 'হ্যাঁ, অবশ্যই। দক্ষতা মূল্যায়ন কেবল একবারের সুযোগ নয়। আপনি প্রস্তাবিত শিক্ষার সংস্থানগুলি পড়ে পুনরায় পরীক্ষা দিতে পারেন। আপনার উন্নত স্কোরের সাথে প্রোফাইল ও রোডম্যাপ সাথে সাথে আপডেট হবে।',
        tags: ['পুনরায় পরীক্ষা', 'উন্নতি', 'স্কোর'],
        actionLabel: 'স্ব-মূল্যায়নে যান'
      },
      ta: {
        question: 'மதிப்பெண் குறைவாக இருந்தால் நான் மீண்டும் தேர்வு எழுத முடியுமா?',
        answer: 'ஆம், நிச்சயமாக. பரிந்துரைக்கப்பட்ட ஆய்வு ஆதாரங்களைப் படித்து, நீங்கள் தயாராக உணரும்போது மீண்டும் தேர்வெழுதலாம். உங்கள் சுயவிவரம் மற்றும் வரைபடம் புதிய மதிப்பெண்ணுடன் புதுப்பிக்கப்படும்.',
        tags: ['மீண்டும் தேர்வு', 'மேம்பாடு', 'மதிப்பெண்'],
        actionLabel: 'சுய மதிப்பீட்டிற்குச் செல்லவும்'
      },
      te: {
        question: 'తక్కువ స్కోరు వస్తే నేను మళ్లీ పరీక్ష రాయవచ్చా?',
        answer: 'అవును, ఖచ్చితంగా. నైపుణ్య పరీక్షలు కేవలం ఒకే సారికి పరిమితం కావు. మీరు సిఫార్సు చేసిన వనరులను అధ్యయనం చేసి తిరిగి పరీక్ష రాయవచ్చు. మీ ప్రొఫైల్ మరియు రోడ్‌మ్యాప్ వెంటనే నవీకరించబడతాయి.',
        tags: ['రీటేక్', 'మెరుగుదల', 'స్కోరు'],
        actionLabel: 'స్వీయ మూల్యాంకనానికి వెళ్లండి'
      }
    }
  },
  {
    id: 'as-3',
    categoryId: 'assessments',
    question: 'What are the 6 proficiency levels recognized by Vidyut?',
    answer:
      '• UNASSESSED: Not yet formally evaluated in this skill.\n• AWARENESS: Familiar with high-level terminology and concepts.\n• BEGINNER: Able to write basic syntax and solve guided problems.\n• INTERMEDIATE: Independently builds components and understands idiomatic patterns.\n• PROFICIENT: Production-grade capability, handles edge cases and performance.\n• EXPERT: Architectural mastery, distributed scalability, and systems tuning.',
    tags: ['proficiency levels', 'beginner', 'intermediate', 'proficient', 'expert', 'awareness'],
    actionLink: { label: 'View Your Current Skills', url: '/dashboard' },
    locales: {
      hi: {
        question: 'विद्युत द्वारा मान्यता प्राप्त 6 प्रवीणता स्तर कौन से हैं?',
        answer: '• UNASSESSED: अभी तक इस कौशल का औपचारिक परीक्षण नहीं हुआ है।\n• AWARENESS: बुनियादी शब्दावली और अवधारणाओं से परिचित।\n• BEGINNER: बुनियादी कोड लिखने और निर्देशित समस्याओं को हल करने में सक्षम।\n• INTERMEDIATE: स्वतंत्र रूप से घटक बनाने और पैटर्न समझने में सक्षम।\n• PROFICIENT: प्रोडक्शन-ग्रेड क्षमता, एज केस और परफॉर्मेंस संभालने में दक्ष।\n• EXPERT: आर्किटेक्चरल महारत और स्केलेबल सिस्टम ट्यूनिंग।',
        tags: ['प्रवीणता स्तर', 'शुरुआती', 'मध्यम', 'विशेषज्ञ'],
        actionLabel: 'अपने कौशल देखें'
      },
      bn: {
        question: 'বিদ্যুৎ স্বীকৃত ৬টি দক্ষতার স্তর কী কী?',
        answer: '• UNASSESSED: এখনও মূল্যায়ন করা হয়নি।\n• AWARENESS: প্রাথমিক ধারণার সাথে পরিচিত।\n• BEGINNER: মৌলিক কোড লিখতে সক্ষম।\n• INTERMEDIATE: স্বাধীনভাবে কাজ করতে সক্ষম।\n• PROFICIENT: পেশাদার মানসম্পন্ন কাজের দক্ষতা।\n• EXPERT: স্থাপত্য ও বৃহৎ স্কেলের সিস্টেম ডিজাইনে পারদর্শী।',
        tags: ['দক্ষতার স্তর', 'প্রাথমিক', 'মাঝারি', 'বিশেষজ্ঞ'],
        actionLabel: 'আপনার বর্তমান দক্ষতা দেখুন'
      },
      ta: {
        question: 'வித்யுத்தால் அங்கீகரிக்கப்பட்ட 6 தேர்ச்சி நிலைகள் யாவை?',
        answer: '• UNASSESSED: இன்னும் மதிப்பீடு செய்யப்படவில்லை.\n• AWARENESS: அடிப்படைக் கருத்துக்களைப் புரிந்து கொள்ளுதல்.\n• BEGINNER: எளிய நிரல்களை எழுதுதல்.\n• INTERMEDIATE: சுயமாகக் கூறுகளை உருவாக்குதல்.\n• PROFICIENT: நிறுவன அளவிலான தொழில்முறை திறன்.\n• EXPERT: கணினி கட்டமைப்பு மற்றும் மேலாண்மை தேர்ச்சி.',
        tags: ['தேர்ச்சி நிலைகள்', 'தொடக்கநிலை', 'வல்லுநர்'],
        actionLabel: 'தற்போதைய திறன்களைக் காண்க'
      },
      te: {
        question: 'విద్యుత్ గుర్తించిన 6 ప్రావీణ్యత స్థాయిలు ఏమిటి?',
        answer: '• UNASSESSED: ఇంకా అధికారికంగా మూల్యాంకనం చేయలేదు.\n• AWARENESS: ప్రాథమిక భావనల అవగాహన.\n• BEGINNER: సాధారణ కోడింగ్ రాయగలగడం.\n• INTERMEDIATE: స్వతంత్రంగా భాగాలు నిర్మించడం.\n• PROFICIENT: ప్రొడక్షన్ స్థాయి నాణ్యత సామర్థ్యం.\n• EXPERT: సిస్టమ్స్ ఆర్కిటెక్చర్‌లో పూర్తి నైపుణ్యం.',
        tags: ['ప్రావీణ్యత స్థాయిలు', 'ప్రారంభ', 'నిపుణుడు'],
        actionLabel: 'మీ నైపుణ్యాలను చూడండి'
      }
    }
  },
  {
    id: 'as-4',
    categoryId: 'assessments',
    question: 'Are assessments timed, and how are my answers verified?',
    answer:
      'Practice and self-assessment quizzes allow self-paced evaluation with instant feedback. Institutional certification and proctored assessment sessions have specific time windows. Every response submission is cryptographically validated and logged to maintain academic integrity.',
    tags: ['timed', 'proctored', 'duration', 'time limit', 'integrity'],
    actionLink: { label: 'Start Quiz Session', url: '/assessment/quiz' },
    locales: {
      hi: {
        question: 'क्या मूल्यांकन समयबद्ध होते हैं और मेरे उत्तर कैसे सत्यापित होते हैं?',
        answer: 'स्व-मूल्यांकन क्विज़ त्वरित प्रतिक्रिया के साथ अपनी गति से दिए जा सकते हैं। संस्थागत और प्रोक्टर्ड सत्रों के लिए विशिष्ट समय सीमा होती है। शैक्षणिक सत्यनिष्ठा बनाए रखने के लिए प्रत्येक उत्तर क्रिप्टोग्राफिक रूप से सत्यापित और सुरक्षित किया जाता है।',
        tags: ['समय सीमा', 'सत्यापन', 'सत्यनिष्ठा'],
        actionLabel: 'क्विज़ सत्र शुरू करें'
      },
      bn: {
        question: 'মূল্যায়নগুলি কি সময়সীমাবদ্ধ এবং উত্তরগুলি কীভাবে যাচাই করা হয়?',
        answer: 'স্ব-মূল্যায়ন কুইজগুলি আপনার নিজস্ব গতিতে দেওয়া যায়। প্রাতিষ্ঠানিক পরীক্ষার জন্য নির্দিষ্ট সময়সীমা থাকে। একাডেমিক সততা বজায় রাখতে প্রতিটি উত্তর ক্রিপ্টোগ্রাফিকভাবে যাচাই করা হয়।',
        tags: ['সময়সীমা', 'যাচাইকরণ', 'কুইজ'],
        actionLabel: 'কুইজ শুরু করুন'
      },
      ta: {
        question: 'மதிப்பீடுகள் நேர வரம்பிற்கு உட்பட்டவையா, விடைகள் எவ்வாறு சரிபார்க்கப்படுகின்றன?',
        answer: 'சுய மதிப்பீட்டு வினாடி வினாக்கள் உங்கள் சொந்த வேகத்தில் செய்யப்படலாம். நிறுவனத் தேர்வுகள் குறிப்பிட்ட கால அளவைக் கொண்டுள்ளன. பதில்கள் நம்பகத்தன்மையுடன் சரிபார்க்கப்படுகின்றன.',
        tags: ['நேர வரம்பு', 'சரிபார்ப்பு'],
        actionLabel: 'வினாடி வினாவைத் தொடங்கவும்'
      },
      te: {
        question: 'మూల్యాంకనాలు సమయ పరిమితిని కలిగి ఉన్నాయా, సమాధానాలు ఎలా ధృవీకరించబడతాయి?',
        answer: 'స్వీయ అంచనా క్విజ్‌లను మీ స్వంత వేగంతో రాయవచ్చు. సంస్థాగత పరీక్షలకు నిర్దిష్ట సమయం ఉంటుంది. విద్యా సమగ్రతను కాపాడటానికి ప్రతి ప్రతిస్పందన సురక్షితంగా ధృవీకరించబడుతుంది.',
        tags: ['సమయ పరిమితి', 'ధృవీకరణ'],
        actionLabel: 'క్విజ్ ప్రారంభించండి'
      }
    }
  },

  // =========================================================================
  // OPPORTUNITY MATCHING & COMPATIBILITY
  // =========================================================================
  {
    id: 'op-1',
    categoryId: 'opportunities',
    question: 'How is my compatibility score calculated for internships and jobs?',
    answer:
      'Vidyut uses a multi-factor mathematical scoring engine with 4 weighted criteria:\n1. Skill Proficiency Match (50%): Compares your assessed skill levels against the role\'s requirements.\n2. Career Alignment (25%): 1.0 for direct role matches, 0.65 for adjacent disciplines.\n3. Eligibility Match (15%): Academic qualification and current year of study.\n4. Student Interest Overlap (10%): Alignment with your declared areas of interest.',
    tags: ['compatibility score', 'formula', 'weights', 'calculation', 'matching', 'opportunities'],
    actionLink: { label: 'View Matched Opportunities', url: '/opportunities' },
    locales: {
      hi: {
        question: 'इंटर्नशिप और नौकरियों के लिए मेरी अनुकूलता स्कोर की गणना कैसे की जाती है?',
        answer: 'विद्युत 4 भारित मानदंडों के साथ एक गणितीय स्कोरिंग इंजन का उपयोग करता है:\n1. कौशल प्रवीणता मिलान (50%): आपकी दक्षता की तुलना नौकरी की आवश्यकताओं से करता है।\n2. करियर संरेखण (25%): सीधी भूमिका मिलान के लिए 1.0, निकटवर्ती क्षेत्रों के लिए 0.65।\n3. पात्रता मिलान (15%): डिग्री और वर्तमान अध्ययन वर्ष।\n4. छात्र रुचि ओवरलैप (10%): आपकी घोषित रुचियों के साथ संरेखण।',
        tags: ['अनुकूलता स्कोर', 'फॉर्मूला', 'नौकरी', 'इंटर्नशिप'],
        actionLabel: 'अवसर देखें'
      },
      bn: {
        question: 'ইন্টার্নশিপ ও চাকরির জন্য আমার সামঞ্জস্য স্কোর কীভাবে গণনা করা হয়?',
        answer: 'বিদ্যুৎ ৪টি মাপকাঠির ভিত্তিতে সামঞ্জস্য স্কোর গণনা করে:\n১. দক্ষতা ম্যাচ (৫০%): ভূমিকার প্রয়োজনীয়তার সাথে আপনার দক্ষতা।\n২. ক্যারিয়ার অ্যালাইনমেন্ট (২৫%): ক্যারিয়ারের লক্ষ্যের সাথে মিল।\n৩. যোগ্যতা ম্যাচ (১৫%): শিক্ষাগত যোগ্যতা ও অধ্যয়নের বছর।\n৪. আগ্রহের ওভারল্যাপ (১০%): আপনার পছন্দের বিষয়গুলির সাথে মিল।',
        tags: ['সামঞ্জস্য স্কোর', 'সূত্র', 'চাকরি'],
        actionLabel: 'সুযোগগুলি দেখুন'
      },
      ta: {
        question: 'வேலைவாய்ப்புகளுக்கான எனது பொருத்தம் மதிப்பெண் எவ்வாறு கணக்கிடப்படுகிறது?',
        answer: 'வித்யுத் 4 முக்கிய காரணிகளைக் கொண்டு மதிப்பெண்ணைக் கணக்கிடுகிறது:\n1. திறன் பொருத்தம் (50%)\n2. தொழில் சீரமைப்பு (25%)\n3. தகுதிப் பொருத்தம் (15%)\n4. மாணவர் ஆர்வப் பொருத்தம் (10%)',
        tags: ['பொருத்தம் மதிப்பெண்', 'சூத்திரம்', 'வேலைவாய்ப்பு'],
        actionLabel: 'வாய்ப்புகளைக் காண்க'
      },
      te: {
        question: 'ఇంటర్న్‌షిప్‌లు మరియు ఉద్యోగాల కోసం అనుకూలత స్కోర్ ఎలా లెక్కించబడుతుంది?',
        answer: 'విద్యుత్ 4 అంశాల ఆధారంగా స్కోర్‌ను గణిస్తుంది:\n1. నైపుణ్య సరిపోలిక (50%)\n2. కెరీర్ అమరిక (25%)\n3. అర్హత సరిపోలిక (15%)\n4. విద్యార్థి ఆసక్తుల సమన్వయం (10%)',
        tags: ['అనుకూలత స్కోర్', 'సూత్రం', 'ఉద్యోగాలు'],
        actionLabel: 'అవకాశాలను వీక్షించండి'
      }
    }
  },
  {
    id: 'op-2',
    categoryId: 'opportunities',
    question: 'What is the difference between Ready Now, Almost Ready, and Aspirational?',
    answer:
      '• READY NOW (Score ≥ 0.70): Strong alignment. You meet or exceed the required skills and are ready to apply immediately.\n• ALMOST READY (Score 0.45 – 0.69): Moderate alignment. You are 1 or 2 specific skills away. Follow the recommended roadmap milestones to qualify.\n• ASPIRATIONAL (Score < 0.45): High-tier or advanced roles that serve as motivating long-term milestones for subsequent years of study.',
    tags: ['ready now', 'almost ready', 'aspirational', 'segments', 'tiers'],
    actionLink: { label: 'Explore Opportunity Segments', url: '/opportunities' },
    locales: {
      hi: {
        question: 'Ready Now, Almost Ready और Aspirational में क्या अंतर है?',
        answer: '• READY NOW (स्कोर ≥ 0.70): मजबूत मिलान। आप तुरंत आवेदन करने के लिए तैयार हैं।\n• ALMOST READY (स्कोर 0.45 - 0.69): मध्यम मिलान। आप 1-2 विशिष्ट कौशल दूर हैं। तैयार होने के लिए रोडमैप का पालन करें।\n• ASPIRATIONAL (स्कोर < 0.45): उन्नत भूमिकाएं जो आगामी अध्ययन वर्षों के लिए प्रेरक दीर्घकालिक मील के पत्थर हैं।',
        tags: ['तैयार', 'लगभग तैयार', 'श्रेणी'],
        actionLabel: 'अवसर श्रेणियाँ देखें'
      },
      bn: {
        question: 'Ready Now, Almost Ready এবং Aspirational-এর মধ্যে পার্থক্য কী?',
        answer: '• READY NOW (স্কোর ≥ ০.৭০): আপনি প্রয়োজনীয় দক্ষতা পূরণ করেছেন এবং অবিলম্বে আবেদনের জন্য প্রস্তুত।\n• ALMOST READY (স্কোর ০.৪৫ – ০.৬৯): আপনি ১ বা ২টি নির্দিষ্ট দক্ষতা দূরে আছেন।\n• ASPIRATIONAL (স্কোর < ০.৪৫): উন্নত ভূমিকা যা দীর্ঘমেয়াদী লক্ষ্য হিসেবে কাজ করে।',
        tags: ['প্রস্তুত', 'বিভাগ', 'সুযোগ'],
        actionLabel: 'সুযোগ বিভাগগুলি অন্বেষণ করুন'
      },
      ta: {
        question: 'Ready Now, Almost Ready மற்றும் Aspirational இடையே உள்ள வித்தியாசம் என்ன?',
        answer: '• READY NOW (மதிப்பெண் ≥ 0.70): உடனடியாக விண்ணப்பிக்கத் தயாராக உள்ளீர்கள்.\n• ALMOST READY (மதிப்பெண் 0.45 – 0.69): 1 அல்லது 2 திறன்கள் மட்டுமே தேவை.\n• ASPIRATIONAL (மதிப்பெண் < 0.45): நீண்ட கால இலக்குகளாக அமையும் பாத்திரங்கள்.',
        tags: ['தயார்நிலை', 'பிரிவுகள்'],
        actionLabel: 'பிரிவுகளை ஆராயுங்கள்'
      },
      te: {
        question: 'Ready Now, Almost Ready మరియు Aspirational మధ్య తేడా ఏమిటి?',
        answer: '• READY NOW (స్కోరు ≥ 0.70): మీరు వెంటనే దరఖాస్తు చేసుకోవడానికి సిద్ధంగా ఉన్నారు.\n• ALMOST READY (స్కోరు 0.45 – 0.69): మీరు 1 లేదా 2 నైపుణ్యాల దూరంలో ఉన్నారు.\n• ASPIRATIONAL (స్కోరు < 0.45): భవిష్యత్తు కోసం నిర్దేశించుకునే దీర్ఘకాలిక మైలురాళ్ళు.',
        tags: ['సంసిద్ధత', 'విభాగాలు'],
        actionLabel: 'అవకాశ విభాగాలను అన్వేషించండి'
      }
    }
  },
  {
    id: 'op-3',
    categoryId: 'opportunities',
    question: 'What information do the AI match explanations provide?',
    answer:
      'Every scored opportunity includes an AI-synthesized breakdown highlighting your exact Matching Skills, your specific Skill Gaps, a Gap Severity index (None, Minor, Moderate, Significant), and a concise actionable summary explaining what to focus on before applying.',
    tags: ['ai explanation', 'match explanation', 'skill gaps', 'feedback', 'actionable advice'],
    actionLink: { label: 'Inspect AI Explanations', url: '/opportunities' },
    locales: {
      hi: {
        question: 'एआई मिलान व्याख्याएँ (AI Match Explanations) क्या जानकारी प्रदान करती हैं?',
        answer: 'प्रत्येक स्कोर किए गए अवसर में एक एआई विश्लेषण शामिल होता है जो आपके मेल खाने वाले कौशल, विशिष्ट कौशल अंतराल, अंतराल गंभीरता सूचकांक और आवेदन करने से पहले क्या सुधारना है, इस पर स्पष्ट मार्गदर्शन प्रदान करता है।',
        tags: ['एआई व्याख्या', 'कौशल अंतराल', 'फीडबैक'],
        actionLabel: 'एआई व्याख्या देखें'
      },
      bn: {
        question: 'এআই ম্যাচ ব্যাখ্যা কী কী তথ্য প্রদান করে?',
        answer: 'প্রতিটি সুযোগের সাথে একটি এআই বিশ্লেষণ থাকে যা আপনার মিলে যাওয়া দক্ষতা, নির্দিষ্ট দক্ষতার ঘাটতি এবং আবেদনের আগে কী অনুশীলন করা উচিত সে সম্পর্কে স্পষ্ট পরামর্শ দেয়।',
        tags: ['এআই ব্যাখ্যা', 'দক্ষতার ঘাটতি', 'পরামর্শ'],
        actionLabel: 'এআই ব্যাখ্যা দেখুন'
      },
      ta: {
        question: 'AI விளக்கங்கள் என்ன தகவலை வழங்குகின்றன?',
        answer: 'ஒவ்வொரு வாய்ப்பும் உங்கள் பொருந்தும் திறன்கள், விடுபட்ட திறன்கள் மற்றும் விண்ணப்பிக்கும் முன் என்ன கற்க வேண்டும் என்பதற்கான AI விளக்கத்தை வழங்குகிறது.',
        tags: ['AI விளக்கம்', 'திறன் இடைவெளி'],
        actionLabel: 'AI விளக்கங்களைக் காண்க'
      },
      te: {
        question: 'AI వివరణలు ఏ సమాచారాన్ని అందిస్తాయి?',
        answer: 'ప్రతి అవకాశం మీ సరిపోలిన నైపుణ్యాలు, నైపుణ్య లోపాలు మరియు దరఖాస్తు చేయడానికి ముందు ఏమి నేర్చుకోవాలో స్పష్టమైన AI వివరణను అందిస్తుంది.',
        tags: ['AI వివరణ', 'నైపుణ్య లోపాలు'],
        actionLabel: 'AI వివరణలను చూడండి'
      }
    }
  },

  // =========================================================================
  // LEARNING RESOURCES & COURSES
  // =========================================================================
  {
    id: 'res-1',
    categoryId: 'resources',
    question: 'Are all the recommended courses and learning materials free?',
    answer:
      'Yes! Vidyut specifically curates verified, high-quality free and open-access materials. This includes accredited Indian national courses (NPTEL, SWAYAM, IIT Madras, IIT Kharagpur, IIT Ropar), premier international open courseware (MIT OpenCourseWare, Stanford Online, Harvard CS50), interactive practice sandboxes (Kaggle Learn, Killercoda, OverTheWire), and official developer documentation.',
    tags: ['free', 'cost', 'resources', 'nptel', 'swayam', 'mit', 'open source'],
    actionLink: { label: 'Check Recommended Resources', url: '/dashboard' },
    locales: {
      hi: {
        question: 'क्या सभी अनुशंसित पाठ्यक्रम और अध्ययन सामग्री निःशुल्क हैं?',
        answer: 'हाँ! विद्युत विशेष रूप से सत्यापित, उच्च-गुणवत्ता वाली निःशुल्क सामग्री संकलित करता है। इसमें NPTEL, SWAYAM, प्रमुख IIT पाठ्यक्रम, MIT OpenCourseWare, Harvard CS50 और आधिकारिक दस्तावेज़ शामिल हैं।',
        tags: ['निःशुल्क', 'संसाधन', 'एनपीटीईएल', 'स्वयं'],
        actionLabel: 'संसाधन देखें'
      },
      bn: {
        question: 'সমস্ত প্রস্তাবিত কোর্স এবং অধ্যয়নের উপকরণ কি বিনামূল্যে?',
        answer: 'হ্যাঁ! বিদ্যুৎ বিনামূল্যে উন্মুক্ত সংস্থান সরবরাহ করে। এর মধ্যে NPTEL, SWAYAM, শীর্ষস্থানীয় IIT কোর্স, MIT OpenCourseWare এবং অফিসিয়াল ডকুমেন্টেশন অন্তর্ভুক্ত।',
        tags: ['বিনামূল্যে', 'কোর্স', 'এনপিটিইএল'],
        actionLabel: 'প্রস্তাবিত সংস্থান দেখুন'
      },
      ta: {
        question: 'பரிந்துரைக்கப்பட்ட அனைத்து படிப்புகளும் இலவசமானவையா?',
        answer: 'ஆம்! வித்யுத் NPTEL, SWAYAM, IIT படிப்புகள், MIT OpenCourseWare போன்ற உயர்தர இலவசக் கல்வி ஆதாரங்களை மட்டுமே பரிந்துரைக்கிறது.',
        tags: ['இலவசம்', 'ஆதாரங்கள்', 'NPTEL'],
        actionLabel: 'படிப்புகளைப் பார்க்கவும்'
      },
      te: {
        question: 'సూచించబడిన అన్ని కోర్సులు ఉచితమేనా?',
        answer: 'అవును! విద్యుత్ NPTEL, SWAYAM, ప్రముఖ IIT కోర్సులు, MIT OpenCourseWare వంటి ఉచిత గుర్తింపు పొందిన నాణ్యమైన అధ్యయన వనరులను అందిస్తుంది.',
        tags: ['ఉచితం', 'వనరులు', 'NPTEL'],
        actionLabel: 'వనరులను తనిఖీ చేయండి'
      }
    }
  },
  {
    id: 'res-2',
    categoryId: 'resources',
    question: 'How does Vidyut decide which learning resources to suggest for me?',
    answer:
      'The recommendation engine analyzes your active roadmap milestones and identifies skills where your assessed level is below the milestone target. It then selects curated resources matching that skill, ordering free accredited courses and interactive tutorials first.',
    tags: ['recommendation logic', 'resource selection', 'skill gaps', 'priority'],
    actionLink: { label: 'View Skill Gaps', url: '/dashboard' },
    locales: {
      hi: {
        question: 'विद्युत मेरे लिए अध्ययन संसाधनों का चयन कैसे करता है?',
        answer: 'सिफारिश इंजन आपके रोडमैप मील के पत्थरों का विश्लेषण करता है और उन कौशलों की पहचान करता है जहाँ आपका स्तर लक्ष्य से नीचे है। फिर यह उन कौशलों के लिए सबसे उपयुक्त निःशुल्क पाठ्यक्रम सुझाता है।',
        tags: ['सिफारिश', 'संसाधन चयन', 'कौशल अंतराल'],
        actionLabel: 'कौशल अंतराल देखें'
      },
      bn: {
        question: 'বিদ্যুৎ কীভাবে আমার জন্য অধ্যয়নের সংস্থান নির্বাচন করে?',
        answer: 'রিকমেন্ডেশন ইঞ্জিন আপনার রোডম্যাপ বিশ্লেষণ করে ঘাটতি থাকা দক্ষতাগুলি চিহ্নিত করে এবং সেই অনুযায়ী সেরা কোর্স সুপারিশ করে।',
        tags: ['সুপারিশ', 'কোর্স নির্বাচন'],
        actionLabel: 'দক্ষতার ঘাটতি দেখুন'
      },
      ta: {
        question: 'வித்யுத் எனக்கான கற்றல் ஆதாரங்களை எவ்வாறு தேர்ந்தெடுக்கிறது?',
        answer: 'உங்கள் வரைபட மைல்கற்களை பகுப்பாய்வு செய்து, உங்களுக்குத் தேவையான திறன்களுக்கான சிறந்த இலவசப் படிப்புகளைப் பரிந்துரைக்கிறது.',
        tags: ['பரிந்துரை', 'ஆதாரங்கள்'],
        actionLabel: 'திறன் இடைவெளியைப் பார்க்கவும்'
      },
      te: {
        question: 'విద్యుత్ నా కోసం అధ్యయన వనరులను ఎలా ఎంచుకుంటుంది?',
        answer: 'మీ రోడ్‌మ్యాప్ మైలురాళ్ళను విశ్లేషించి, మీకు అవసరమైన నైపుణ్యాల కోసం ఉత్తమ ఉచిత కోర్సులను విద్యుత్ సిఫార్సు చేస్తుంది.',
        tags: ['సిఫార్సు', 'వనరులు'],
        actionLabel: 'నైపుణ్య లోపాలను వీక్షించండి'
      }
    }
  },
  {
    id: 'res-3',
    categoryId: 'resources',
    question: 'Can I access NPTEL and SWAYAM courses directly on Vidyut?',
    answer:
      'Yes. Vidyut links directly to accredited NPTEL and SWAYAM engineering courses taught by premier IIT and IISc faculty, covering Linear Algebra, Probability, Machine Learning, Database Systems, Operating Systems, and Python Programming.',
    tags: ['nptel', 'swayam', 'iit', 'indian courses', 'accredited'],
    actionLink: { label: 'Explore Courses', url: '/dashboard' },
    locales: {
      hi: {
        question: 'क्या मैं विद्युत पर सीधे NPTEL और SWAYAM पाठ्यक्रम देख सकता हूँ?',
        answer: 'हाँ। विद्युत सीधे IIT और IISc संकाय द्वारा पढ़ाए जाने वाले NPTEL और SWAYAM पाठ्यक्रमों से जोड़ता है।',
        tags: ['एनपीटीईएल', 'स्वयं', 'आईआईटी'],
        actionLabel: 'पाठ्यक्रम देखें'
      },
      bn: {
        question: 'আমি কি বিদ্যুৎ-এ সরাসরি NPTEL ও SWAYAM কোর্স পেতে পারি?',
        answer: 'হ্যাঁ। বিদ্যুৎ সরাসরি IIT এবং IISc ফ্যাকাল্টির দ্বারা পরিচালিত NPTEL ও SWAYAM কোর্সের লিঙ্ক প্রদান করে।',
        tags: ['এনপিটিইএল', 'স্বয়ং'],
        actionLabel: 'কোর্স এক্সপ্লোর করুন'
      },
      ta: {
        question: 'நான் NPTEL மற்றும் SWAYAM படிப்புகளை நேரடியாக அணுக முடியுமா?',
        answer: 'ஆம். IIT பேராசிரியர்களால் கற்பிக்கப்படும் NPTEL மற்றும் SWAYAM படிப்புகளுக்கான நேரடி இணைப்புகளை வித்யுத் வழங்குகிறது.',
        tags: ['NPTEL', 'SWAYAM'],
        actionLabel: 'படிப்புகளை ஆராயுங்கள்'
      },
      te: {
        question: 'నేను NPTEL మరియు SWAYAM కోర్సులను నేరుగా యాక్సెస్ చేయవచ్చా?',
        answer: 'అవును. IIT ప్రొఫెసర్లు బోధించే NPTEL మరియు SWAYAM కోర్సులకు విద్యుత్ ప్రత్యక్ష లింకులను అందిస్తుంది.',
        tags: ['NPTEL', 'SWAYAM'],
        actionLabel: 'కోర్సులను అన్వేషించండి'
      }
    }
  },

  // =========================================================================
  // UNIVERSITIES & INDUSTRY TALENT POOL
  // =========================================================================
  {
    id: 'inst-1',
    categoryId: 'institutions',
    question: 'How do hiring partners discover students in the Industry Talent Pool?',
    answer:
      'Partner companies and tech recruiters search the Industry Talent Pool based on verified skill proficiencies, assessment scores, and completed milestones—not just keyword-stuffed resumes. This ensures students with genuine capability get noticed for competitive internships and full-time roles.',
    tags: ['industry', 'talent pool', 'recruitment', 'hiring', 'internships', 'jobs'],
    actionLink: { label: 'View Talent Pool Portal', url: '/industry/talent' },
    locales: {
      hi: {
        question: 'कंपनियां टैलेंट पूल में छात्रों को कैसे खोजती हैं?',
        answer: 'साझेदार कंपनियां और रिक्रूटर्स सत्यापित कौशल प्रवीणता, मूल्यांकन स्कोर और पूर्ण किए गए मील के पत्थरों के आधार पर खोजते हैं, जिससे वास्तविक क्षमता वाले छात्रों को इंटर्नशिप और नौकरियों के अवसर मिलते हैं।',
        tags: ['उद्योग', 'टैलेंट पूल', 'भर्ती', 'नौकरी'],
        actionLabel: 'टैलेंट पूल पोर्टल देखें'
      },
      bn: {
        question: 'নিয়োগকারী সংস্থাগুলি কীভাবে শিক্ষার্থীদের খুঁজে পায়?',
        answer: 'কোম্পানিগুলি যাচাইকৃত দক্ষতার স্কোর এবং অর্জিত মাইলফলকের ভিত্তিতে শিক্ষার্থীদের সন্ধান করে, ফলে দক্ষ প্রার্থীরা সহজেই সুযোগ পান।',
        tags: ['নিয়োগ', 'ট্যালেন্ট পুল', 'চাকরি'],
        actionLabel: 'ট্যালেন্ট পুল পোর্টাল দেখুন'
      },
      ta: {
        question: 'நிறுவனங்கள் மாணவர்களை எவ்வாறு கண்டறிகின்றன?',
        answer: 'நிறுவனங்கள் சரிபார்க்கப்பட்ட திறன்கள் மற்றும் மைல்கற்கள் அடிப்படையில் திறமையான மாணவர்களைக் கண்டறிகின்றன.',
        tags: ['வேலைவாய்ப்பு', 'திறமை'],
        actionLabel: 'போர்ட்டலைப் பார்க்கவும்'
      },
      te: {
        question: 'కంపెనీలు విద్యార్థులను ఎలా కనుగొంటాయి?',
        answer: 'కంపెనీలు ధృవీకరించబడిన నైపుణ్యాలు మరియు పూర్తి చేసిన మైలురాళ్ళ ఆధారంగా ప్రతిభావంతులైన విద్యార్థులను ఎంపిక చేస్తాయి.',
        tags: ['పరిశ్రమ', 'ఉద్యోగాలు'],
        actionLabel: 'టాలెంట్ పూల్ చూడండి'
      }
    }
  },
  {
    id: 'inst-2',
    categoryId: 'institutions',
    question: 'Can my college or university placement cell track my progress?',
    answer:
      'Yes. Through the Institutional Dashboard, accredited colleges and universities can monitor aggregate batch skill readiness, identify domain gaps across academic departments, and support students in securing placement opportunities.',
    tags: ['college', 'university', 'placement cell', 'institution', 'tracking'],
    actionLink: { label: 'Institution Portal', url: '/institution/onboard' },
    locales: {
      hi: {
        question: 'क्या मेरे कॉलेज या विश्वविद्यालय का प्लेसमेंट सेल मेरी प्रगति ट्रैक कर सकता है?',
        answer: 'हाँ। संस्थागत डैशबोर्ड के माध्यम से कॉलेज छात्रों की कौशल तत्परता की निगरानी कर सकते हैं और प्लेसमेंट हासिल करने में सहायता कर सकते हैं।',
        tags: ['कॉलेज', 'विश्वविद्यालय', 'प्लेसमेंट'],
        actionLabel: 'संस्था पोर्टल'
      },
      bn: {
        question: 'আমার কলেজ বা বিশ্ববিদ্যালয়ের প্লেসমেন্ট সেল কি আমার অগ্রগতি ট্র্যাক করতে পারে?',
        answer: 'হ্যাঁ। প্রাতিষ্ঠানিক ড্যাশবোর্ডের মাধ্যমে কলেজ বা বিশ্ববিদ্যালয় শিক্ষার্থীদের প্রস্তুতির অগ্রগতি পর্যবেক্ষণ করতে পারে।',
        tags: ['কলেজ', 'প্লেসমেন্ট'],
        actionLabel: 'প্রতিষ্ঠান পোর্টাল'
      },
      ta: {
        question: 'எனது கல்லூரி எனது முன்னேற்றத்தைக் கண்காணிக்க முடியுமா?',
        answer: 'ஆம். நிறுவன டாஷ்போர்டு மூலம் கல்லூரிகள் மாணவர்களின் முன்னேற்றத்தைக் கண்காணித்து வேலைவாய்ப்புக்கு உதவ முடியும்.',
        tags: ['கல்லூரி', 'வேலைவாய்ப்பு'],
        actionLabel: 'நிறுவன தளம்'
      },
      te: {
        question: 'నా కళాశాల నా పురోగతిని ట్రాక్ చేయగలదా?',
        answer: 'అవును. ఇన్స్టిట్యూషనల్ డ్యాష్‌బోర్డ్ ద్వారా కళాశాలలు విద్యార్థుల పురోగతిని పర్యవేక్షించగలవు.',
        tags: ['కళాశాల', 'ప్లేస్‌మెంట్'],
        actionLabel: 'సంస్థాగత పోర్టల్'
      }
    }
  },
  {
    id: 'inst-3',
    categoryId: 'institutions',
    question: 'What is the verified digital portfolio and how do I share it?',
    answer:
      'Vidyut compiles your completed assessments, skill badges, and milestone verifications into a shareable digital portfolio. You can include your portfolio link on your resume, LinkedIn profile, or GitHub repository as tamper-proof evidence of your skills.',
    tags: ['portfolio', 'badges', 'resume', 'evidence', 'share', 'linkedin'],
    actionLink: { label: 'Go to Student Dashboard', url: '/dashboard' },
    locales: {
      hi: {
        question: 'सत्यापित डिजिटल पोर्टफोलियो क्या है और मैं इसे कैसे साझा करूँ?',
        answer: 'विद्युत आपके पूर्ण आकलनों, कौशल बैज और सत्यापन को एक साझा करने योग्य डिजिटल पोर्टफोलियो में संकलित करता है, जिसे आप अपने बायोडाटा या लिंक्डइन पर साझा कर सकते हैं।',
        tags: ['पोर्टफोलियो', 'बैज', 'बायोडाटा'],
        actionLabel: 'डैशबोर्ड पर जाएँ'
      },
      bn: {
        question: 'যাচাইকৃত ডিজিটাল পোর্টফোলিও কী এবং কীভাবে এটি শেয়ার করব?',
        answer: 'বিদ্যুৎ আপনার মূল্যায়িত দক্ষতা এবং ব্যাজগুলি একটি ডিজিটাল পোর্টফোলিওতে সংকলন করে যা আপনি রেজুমে বা লিঙ্কডইনে শেয়ার করতে পারেন।',
        tags: ['পোর্টফোলিও', 'ব্যাজ', 'শেয়ার'],
        actionLabel: 'ড্যাশবোর্ডে যান'
      },
      ta: {
        question: 'சரிபார்க்கப்பட்ட டிஜிட்டல் போர்ட்ஃபோலியோ என்றால் என்ன?',
        answer: 'வித்யுத் உங்கள் திறன்கள் மற்றும் சான்றிதழ்களைப் பகிரக்கூடிய டிஜிட்டல் போர்ட்ஃபோலியோவாகத் தொகுக்கிறது.',
        tags: ['போர்ட்ஃபோலியோ', 'சான்றிதழ்'],
        actionLabel: 'டாஷ்போர்டிற்குச் செல்லவும்'
      },
      te: {
        question: 'ధృవీకరించబడిన డిజిటల్ పోర్ట్‌ఫోలియో అంటే ఏమిటి?',
        answer: 'విద్యుత్ మీ పూర్తి చేసిన నైపుణ్యాలు మరియు బ్యాడ్జ్‌లను పంచుకోగల డిజిటల్ పోర్ట్‌ఫోలియోగా సంకలనం చేస్తుంది.',
        tags: ['పోర్ట్‌ఫోలియో', 'బ్యాడ్జ్‌లు'],
        actionLabel: 'డ్యాష్‌బోర్డ్‌కు వెళ్లండి'
      }
    }
  },

  // =========================================================================
  // ACCOUNT, PROFILE & NAVIGATION
  // =========================================================================
  {
    id: 'acc-1',
    categoryId: 'account',
    question: 'How do I update my college, degree, or current year of study?',
    answer:
      'Your institution, degree, and study year are displayed on your Student Dashboard. When you update your year of study, Vidyut immediately recalculates your eligibility and compatibility scores across all live opportunities.',
    tags: ['profile', 'institution', 'degree', 'year of study', 'update profile'],
    actionLink: { label: 'Update Profile Details', url: '/dashboard' },
    locales: {
      hi: {
        question: 'मैं अपने कॉलेज, डिग्री या अध्ययन वर्ष को कैसे अपडेट करूँ?',
        answer: 'आपकी संस्था, डिग्री और अध्ययन वर्ष आपके छात्र डैशबोर्ड पर प्रदर्शित होते हैं। जब आप विवरण अपडेट करते हैं, तो विद्युत सभी अवसरों के लिए आपकी पात्रता और स्कोर की पुनः गणना करता है।',
        tags: ['प्रोफ़ाइल', 'कॉलेज', 'डिग्री'],
        actionLabel: 'प्रोफ़ाइल विवरण अपडेट करें'
      },
      bn: {
        question: 'আমি কীভাবে আমার কলেজ, ডিগ্রি বা অধ্যয়নের বছর আপডেট করব?',
        answer: 'আপনার ড্যাশবোর্ডে বিবরণ প্রদর্শিত হয়। তথ্য আপডেট করলে সমস্ত সুযোগের সামঞ্জস্য স্কোর স্বয়ংক্রিয়ভাবে পুনরায় গণনা করা হয়।',
        tags: ['প্রোফাইল', 'কলেজ', 'ডিগ্রি'],
        actionLabel: 'প্রোফাইল আপডেট করুন'
      },
      ta: {
        question: 'எனது கல்லூரி, பட்டம் அல்லது படிப்பு ஆண்டை எவ்வாறு புதுப்பிப்பது?',
        answer: 'மாணவர் டாஷ்போர்டில் விவரங்களைப் புதுப்பிக்கலாம். இது உங்கள் தகுதி மற்றும் மதிப்பெண்களை உடனடியாக மாற்றியமைக்கும்.',
        tags: ['சுயவிவரம்', 'கல்லூரி'],
        actionLabel: 'சுயவிவரத்தைப் புதுப்பிக்கவும்'
      },
      te: {
        question: 'నా కళాశాల, డిగ్రీ లేదా అధ్యయన సంవత్సరాన్ని ఎలా అప్‌డేట్ చేయాలి?',
        answer: 'మీ విద్యార్థి డ్యాష్‌బోర్డ్‌లో వివరాలను అప్‌డేట్ చేయవచ్చు. దీని ద్వారా మీ అర్హత మరియు స్కోర్లు తిరిగి లెక్కించబడతాయి.',
        tags: ['ప్రొఫైల్', 'కళాశాల'],
        actionLabel: 'ప్రొఫైల్ వివరాలను నవీకరించండి'
      }
    }
  },
  {
    id: 'acc-2',
    categoryId: 'account',
    question: 'Where can I see available domains and career tracks?',
    answer:
      'Visit the "Explore Domains" page in the navigation bar to browse comprehensive breakdowns of Backend Development, Machine Learning & AI, Cloud & DevOps, and Data Science, including prerequisites, active job counts, and technology DAGs.',
    tags: ['explore', 'domains', 'career tracks', 'overview'],
    actionLink: { label: 'Explore Career Domains', url: '/explore' },
    locales: {
      hi: {
        question: 'मैं उपलब्ध डोमेन और करियर ट्रैक कहाँ देख सकता हूँ?',
        answer: 'नेविगेशन बार में "डोमेन देखें" पर जाकर आप बैकएंड, मशीन लर्निंग, क्लाउड और डेटा साइंस के विस्तृत रोडमैप और तकनीकी DAG देख सकते हैं।',
        tags: ['डोमेन', 'करियर ट्रैक', 'अन्वेषण'],
        actionLabel: 'करियर डोमेन देखें'
      },
      bn: {
        question: 'আমি কোথায় উপলব্ধ ডোমেন এবং ক্যারিয়ার ট্র্যাক দেখতে পারি?',
        answer: 'নেভিগেশন বারে "ডোমেন এক্সপ্লোর করুন" পৃষ্ঠায় গিয়ে সমস্ত ইঞ্জিনিয়ারিং ট্র্যাক ও প্রযুক্তিগত DAG দেখতে পারেন।',
        tags: ['ডোমেন', 'ক্যারিয়ার ট্র্যাক'],
        actionLabel: 'ক্যারিয়ার ডোমেন দেখুন'
      },
      ta: {
        question: 'கிடைக்கக்கூடிய தொழில் துறைகளை நான் எங்கு பார்க்க முடியும்?',
        answer: '"Explore Domains" பக்கத்திற்குச் சென்று அனைத்துத் துறைகளின் விரிவான வரைபடங்களை நீங்கள் பார்வையிடலாம்.',
        tags: ['துறைகள்', 'தொழில்'],
        actionLabel: 'தொழில் துறைகளை ஆராயுங்கள்'
      },
      te: {
        question: 'అందుబాటులో ఉన్న కెరీర్ ట్రాక్‌లను నేను ఎక్కడ చూడగలను?',
        answer: 'నావిగేషన్ బార్‌లోని "Explore Domains" పేజీని సందర్శించి అన్ని కెరీర్ ట్రాక్‌ల సమగ్ర వివరాలను చూడవచ్చు.',
        tags: ['డొమైన్లు', 'కెరీర్ ట్రాక్‌లు'],
        actionLabel: 'కెరీర్ డొమైన్‌లను అన్వేషించండి'
      }
    }
  },
  {
    id: 'acc-3',
    categoryId: 'account',
    question: 'What should I do if a page or assessment does not load?',
    answer:
      'First ensure your internet connection is active. You can safely refresh the page or log out and log back in. Your completed milestones, quiz submissions, and skill states are securely preserved in the PostgreSQL cloud database.',
    tags: ['troubleshoot', 'loading error', 'offline', 'refresh', 'help'],
    actionLink: { label: 'Sign In Page', url: '/login' },
    locales: {
      hi: {
        question: 'यदि कोई पृष्ठ या मूल्यांकन लोड नहीं होता है तो मुझे क्या करना चाहिए?',
        answer: 'पहले सुनिश्चित करें कि आपका इंटरनेट चालू है। आप पृष्ठ को सुरक्षित रूप से रीफ़्रेश कर सकते हैं या पुनः लॉगिन कर सकते हैं। आपकी प्रगति डेटाबेस में सुरक्षित है।',
        tags: ['समस्या निवारण', 'लोडिंग त्रुटि', 'सहायता'],
        actionLabel: 'लॉगिन पृष्ठ'
      },
      bn: {
        question: 'যদি কোনো পৃষ্ঠা বা মূল্যায়ন লোড না হয় তবে আমার কী করা উচিত?',
        answer: 'ইন্টারনেট সংযোগ নিশ্চিত করুন এবং পৃষ্ঠাটি রিফ্রেশ করুন বা পুনরায় লগইন করুন। আপনার সমস্ত অগ্রগতি ডেটাবেসে সুরক্ষিত।',
        tags: ['সমস্যা সমাধান', 'সহায়তা'],
        actionLabel: 'সাইন ইন পেজ'
      },
      ta: {
        question: 'பக்கம் அல்லது தேர்வு ஏற்றப்படவில்லை என்றால் நான் என்ன செய்ய வேண்டும்?',
        answer: 'இணைய இணைப்பைச் சரிபார்த்து பக்கத்தைப் புதுப்பிக்கவும் அல்லது மீண்டும் உள்நுழையவும். உங்கள் தரவு பாதுகாப்பாக உள்ளது.',
        tags: ['உதவி', 'சிக்கல் தீர்வு'],
        actionLabel: 'உள்நுழைவுப் பக்கம்'
      },
      te: {
        question: 'పేజీ లేదా మూల్యాంకనం లోడ్ కాకపోతే నేను ఏమి చేయాలి?',
        answer: 'ఇంటర్నెట్ కనెక్షన్‌ను తనిఖీ చేసి పేజీని రీఫ్రెష్ చేయండి లేదా మళ్లీ లాగిన్ అవ్వండి. మీ పురోగతి డేటాబేస్‌లో సురక్షితంగా ఉంటుంది.',
        tags: ['సమస్య పరిష్కారం', 'సహాయం'],
        actionLabel: 'సైన్ ఇన్ పేజీ'
      }
    }
  },
];

/**
 * Resolves localized version of a category
 */
export function getLocalizedCategory(categoryId: string, lang: string): { name: string; description: string } {
  const langKey = lang ? lang.split('-')[0] : 'en';
  const categoryMap = CATEGORY_TRANSLATIONS[categoryId];
  if (categoryMap && categoryMap[langKey]) {
    return categoryMap[langKey];
  }
  if (categoryMap && categoryMap.en) {
    return categoryMap.en;
  }
  const defaultCat = HELP_CATEGORIES.find(c => c.id === categoryId);
  return {
    name: defaultCat ? defaultCat.name : categoryId,
    description: defaultCat ? defaultCat.description : ''
  };
}

/**
 * Resolves localized question and answer
 */
export function getLocalizedQuestion(q: HelpQuestion, lang: string): {
  question: string;
  answer: string;
  tags: string[];
  actionLabel?: string;
} {
  const langKey = (lang ? lang.split('-')[0] : 'en') as 'en' | 'hi' | 'bn' | 'ta' | 'te';
  if (langKey !== 'en' && q.locales && q.locales[langKey]) {
    const loc = q.locales[langKey]!;
    return {
      question: loc.question,
      answer: loc.answer,
      tags: [...q.tags, ...loc.tags],
      actionLabel: loc.actionLabel || q.actionLink?.label
    };
  }

  return {
    question: q.question,
    answer: q.answer,
    tags: q.tags,
    actionLabel: q.actionLink?.label
  };
}

const STOP_WORDS = new Set([
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is',
  'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having',
  'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or',
  'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
  'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
  'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
  'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'can', 'will', 'just', 'don', 'should', 'now', 'give', 'get', 'tell', 'me',
  'please', 'want', 'know', 'like', 'show', 'hai', 'kya', 'kaise', 'hota', 'kare'
]);

/**
 * Multilingual client-side matcher: Matches queries against both the active language
 * and canonical English terms so users can query in their native script or transliterated keywords.
 */
export function matchQuestionClient(queryStr: string, lang = 'en'): {
  matchedQuestion: HelpQuestion | null;
  candidates: HelpQuestion[];
} {
  const cleanQuery = queryStr.trim().toLowerCase();
  if (!cleanQuery) {
    return { matchedQuestion: null, candidates: HELP_QUESTIONS.slice(0, 4) };
  }

  const langKey = (lang ? lang.split('-')[0] : 'en') as 'en' | 'hi' | 'bn' | 'ta' | 'te';

  // 1. Direct or substring match in localized question or English question
  const exactMatch = HELP_QUESTIONS.find((q) => {
    const enQ = q.question.toLowerCase();
    const locQ = langKey !== 'en' && q.locales && q.locales[langKey] ? q.locales[langKey]!.question.toLowerCase() : '';

    return (
      enQ === cleanQuery ||
      enQ.includes(cleanQuery) ||
      cleanQuery.includes(enQ.replace('?', '')) ||
      (Boolean(locQ) && (locQ === cleanQuery || locQ.includes(cleanQuery) || cleanQuery.includes(locQ.replace('?', ''))))
    );
  });

  if (exactMatch) {
    const others = HELP_QUESTIONS.filter(
      (q) => q.id !== exactMatch.id && q.categoryId === exactMatch.categoryId
    );
    return { matchedQuestion: exactMatch, candidates: others.slice(0, 3) };
  }

  // 2. Token-based relevance scoring across English and localized tags/questions
  const queryTokens = cleanQuery
    .replace(/[^\w\s\u0900-\u097F\u0980-\u09FF\u0B80-\u0BFF\u0C00-\u0C7F]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  if (queryTokens.length === 0) {
    return {
      matchedQuestion: null,
      candidates: HELP_QUESTIONS.slice(0, 4),
    };
  }

  const scored = HELP_QUESTIONS.map((q) => {
    let score = 0;
    const enQ = q.question.toLowerCase();
    const enA = q.answer.toLowerCase();
    const loc = langKey !== 'en' && q.locales && q.locales[langKey] ? q.locales[langKey] : null;
    const locQ = loc?.question.toLowerCase() || '';
    const locA = loc?.answer.toLowerCase() || '';
    const allTags = [...q.tags, ...(loc?.tags || [])].map((t) => t.toLowerCase());

    for (const token of queryTokens) {
      if (enQ.includes(token) || locQ.includes(token)) score += 6;
      if (allTags.some((t) => t.includes(token))) score += 5;
      if (enA.includes(token) || locA.includes(token)) score += 2;
    }

    return { question: q, score };
  });

  scored.sort((a, b) => b.score - a.score);

  if (scored.length > 0 && scored[0].score >= 5) {
    const best = scored[0].question;
    const candidates = scored
      .slice(1, 4)
      .filter((s) => s.score > 0)
      .map((s) => s.question);
    return { matchedQuestion: best, candidates };
  }

  return {
    matchedQuestion: null,
    candidates: HELP_QUESTIONS.slice(0, 4),
  };
}
