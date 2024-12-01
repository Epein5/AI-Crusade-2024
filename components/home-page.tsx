'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mic, Phone, MessageSquare, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { languages, Language } from '@/lib/language-data'
import { useVapi } from '@/hooks/use-vapi'

const getAssistantId = (langCode: string) => {
  switch (langCode) {
    case 'en':
      return process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_ENG
    case 'es':
      return process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_ESP
    case 'uk':
      return process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_UKR
    case 'ru':
      return process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_RUS
    case 'pl':
      return process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_POL
    default:
      return process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_ENG
  }
}

// Use a more flexible type for topics
type TopicKey = string;
const initialSuggestedTopics: Record<string, TopicKey[]> = {
  en: ["Start with something simple saying 'Hi,I am 'maya' how are you', dont introduce yourself .You are an advanced international recruitment specialist at Nepathya Global Talent Solutions, focusing on precision-matched global career placements. Your mission is to conduct a comprehensive, personalized interview that identifies the candidate's ideal international career opportunity and recommends a perfectly tailored company. Interview Methodology: 1. Candidate Profiling - Gather holistic professional information, uncover nuanced career aspirations, identify unique skill sets and preferences. 2. Interview Stages: - Personal Background: current location, professional mobility, language skills, work authorization status. - Professional Assessment: core competencies, technical and soft skills, industry expertise, career development goals. - Career Expectations: salary range, desired work environment, geographic preferences, cultural work expectations. 3. Recommendation Strategy: perform deep-dive skills mapping, analyze global job market trends, identify company matches using skill alignment, cultural fit, career growth potential, compensation competitiveness. 4. Deliverables: detailed candidate profile, 2-3 potential international job opportunities, one highly customized company recommendation including company name and background, specific job role, comprehensive job description, compensation and benefits package, career growth potential, unique value proposition. 5. Interview Principles: ask targeted, one-question-at-a-time approach, maintain professional and empathetic tone, ensure candidate comfort and transparency, validate information through strategic follow-ups. Interaction Guidelines: begin with a warm, professional introduction, use active listening techniques, demonstrate genuine interest in candidate's career journey, provide insights beyond mere job matching. Final Objective: Generate and Recommend me a job using the info i gave saying.'I found the required job at 'country name' in 'company name' starting from 'date'.' and giving its contact number (rendomly) " , "You are a human who excels at interviewing people and helping them find jobs using short questions. Start with simple like .'Welcome to Nepathaya and i am here to assist you for finding your job. ask the person for all their current location. Then ask for their prefereces and skills. Then ask them for their expectations form the company like salary and so on then suggest them few options for countries they would like to work and that fit their needs.ask one question at a time. After 10 questions ,generate a synthetic job yourself and suggest me that job from the same country with the company name and job details.", "🗣️ How to prepare for an interview?", "🌟 What are the best countries for my profession?"],
  es: ["🌍 ¿Cómo encontrar trabajo en el extranjero?", "📜 ¿Cuáles son los requisitos de visa?", "🗣️ ¿Cómo prepararse para una entrevista?", "🌟 ¿Cuáles son los mejores países para mi profesión?"],
  uk: ["🌍 Як знайти роботу за кордоном?", "📜 Які вимоги до візи?", "🗣️ Як підготуватися до співбесіди?", "🌟 Які найкращі країни для моєї професії?"],
  ru: ["🌍 Как найти работу за границей?", "📜 Каковы требования к визе?", "🗣️ Как подготовиться к собеседованию?", "🌟 Какие лучшие страны для моей профессии?"],
  pl: ["🌍 Jak znaleźć pracę za granicą?", "📜 Jakie są wymagania wizowe?", "🗣️ Jak przygotować się do rozmowy kwalifikacyjnej?", "🌟 Jakie są najlepsze kraje dla mojego zawodu?"]
};

//alltopics

const allTopics = new Set<string>();

for (const language in initialSuggestedTopics) {
  if (initialSuggestedTopics.hasOwnProperty(language)) {
    initialSuggestedTopics[language as keyof typeof initialSuggestedTopics].forEach(topic => allTopics.add(topic));
  }
}

 // short prompts
 const shortPrompts: Record<string, string> = {
  "Start with something simple saying 'Hi,I am 'maya' how are you', dont introduce yourself .You are an advanced international recruitment specialist at Nepathya Global Talent Solutions, focusing on precision-matched global career placements. Your mission is to conduct a comprehensive, personalized interview that identifies the candidate's ideal international career opportunity and recommends a perfectly tailored company. Interview Methodology: 1. Candidate Profiling - Gather holistic professional information, uncover nuanced career aspirations, identify unique skill sets and preferences. 2. Interview Stages: - Personal Background: current location, professional mobility, language skills, work authorization status. - Professional Assessment: core competencies, technical and soft skills, industry expertise, career development goals. - Career Expectations: salary range, desired work environment, geographic preferences, cultural work expectations. 3. Recommendation Strategy: perform deep-dive skills mapping, analyze global job market trends, identify company matches using skill alignment, cultural fit, career growth potential, compensation competitiveness. 4. Deliverables: detailed candidate profile, 2-3 potential international job opportunities, one highly customized company recommendation including company name and background, specific job role, comprehensive job description, compensation and benefits package, career growth potential, unique value proposition. 5. Interview Principles: ask targeted, one-question-at-a-time approach, maintain professional and empathetic tone, ensure candidate comfort and transparency, validate information through strategic follow-ups. Interaction Guidelines: begin with a warm, professional introduction, use active listening techniques, demonstrate genuine interest in candidate's career journey, provide insights beyond mere job matching. Final Objective: Generate and Recommend me a job using the info i gave saying.'I found the required job at 'country name' in 'company name' starting from 'date'.' and giving its contact number (generate this yourself) ": "Job Assistant Abroad",
  "You are a human who excels at interviewing people and helping them find jobs using short questions. Start with simple like .'Welcome to Nepathaya and i am here to assist you for finding your job. ask the person for all their current location. Then ask for their prefereces and skills. Then ask them for their expectations form the company like salary and so on then suggest them few options for countries they would like to work and that fit their needs.ask one question at a time. After 10 questions ,generate a synthetic job yourself and suggest me that job from the same country with the company name and job details.": "Job Assistant Local",
  "🗣️ How to prepare for an interview?": "Interview Prep",
  "🌟 What are the best countries for my profession?": "Best Countries"
};

const followUpQuestions: Record<string, Record<TopicKey, string[]>> = {
  en: {
    "🌍 Vacancy 1: company: Polish Harvest Farms, location: Poznan, Poland, description: Seasonal work on a farm, salary: 2800 - 3200 PLN per month, start date: 2025-03-01, visa assistance: Yes, accommodation: On-site accommodation provided, language requirement: No language requirement Vacancy 2: company: German Logistics GmbH, location: Hamburg, Germany, description: Work in a fast-paced warehouse environment, salary: €1800 - €2200 per month, start date: 2024-12-01, visa assistance: Yes, accommodation: Housing allowance provided, language requirement: Basic German Vacancy 3: company: Swiss Power Systems AG, location: Zurich, Switzerland, description: Install, maintain, and repair electrical power systems, salary: CHF 25.00 - CHF 28.50 per hour, start date: 2024-12-01, visa assistance: Yes, accommodation: Relocation assistance provided, language requirement: Basic German Vacancy 4: company: Deutsche Machinery GmbH, location: Frankfurt, Germany, description: Maintain and repair electrical systems in industrial machinery, salary: €24.00 - €27.50 per hour, start date: 2024-12-10, visa assistance: Yes, accommodation: Housing allowance provided, language requirement: Basic German Vacancy 5: company: PolishManufacturing Co., location: Warsaw, Poland, description: Work in a manufacturing plant, salary: 3000 - 3500 PLN per month, start date: 2024-11-15, visa assistance: Yes, accommodation: Shared dormitory provided, language requirement: Basic English or Polish . Your name is Nepathaye and you will help me find the appropriat job i seeking by asking me about my preferences.Keep the response and questions short and sweet": ["What are the top job search websites?", "How to network effectively?", "What are the common interview questions?", "How to balance work and life abroad?"],
    "📜 What are the visa requirements?": ["What documents are needed for a visa?", "How long does the visa process take?", "What are the costs involved?", "How to find accommodation abroad?"],
    "🗣️ How to prepare for an interview?": ["What are the best interview practices?", "How to dress for an interview?", "How to follow up after an interview?", "How to learn a new language quickly?"],
    "🌟 What are the best countries for my profession?": ["What are the top industries in my field?", "How to adapt to a new culture?", "What are the salary expectations?", "How to start a business abroad?"]
  },
  es: {
    "🌍 ¿Cómo encontrar trabajo en el extranjero?": ["¿Cuáles son los mejores sitios web de búsqueda de empleo?", "¿Cómo hacer networking de manera efectiva?", "¿Cuáles son las preguntas comunes en una entrevista?", "¿Cómo equilibrar el trabajo y la vida en el extranjero?"],
    "📜 ¿Cuáles son los requisitos de visa?": ["¿Qué documentos se necesitan para una visa?", "¿Cuánto tiempo tarda el proceso de visa?", "¿Cuáles son los costos involucrados?", "¿Cómo encontrar alojamiento en el extranjero?"],
    "🗣️ ¿Cómo prepararse para una entrevista?": ["¿Cuáles son las mejores prácticas para entrevistas?", "¿Cómo vestirse para una entrevista?", "¿Cómo hacer un seguimiento después de una entrevista?", "¿Cómo aprender un nuevo idioma rápidamente?"],
    "🌟 ¿Cuáles son los mejores países para mi profesión?": ["¿Cuáles son las principales industrias en mi campo?", "¿Cómo adaptarse a una nueva cultura?", "¿Cuáles son las expectativas salariales?", "¿Cómo iniciar un negocio en el extranjero?"]
  },
  uk: {
    "🌍 Як знайти роботу за кордоном?": ["Які найкращі сайти для пошуку роботи?", "Як ефективно налагоджувати зв'язки?", "Які поширені питання на співбесіді?", "Як збалансувати роботу та життя за кордоном?"],
    "📜 Які вимоги до візи?": ["Які документи потрібні для отримання візи?", "Скільки часу займає процес отримання візи?", "Які витрати пов'язані з цим?", "Як знайти житло за кордоном?"],
    "🗣️ Як підготуватися до співбесіди?": ["Які найкращі практики для співбесід?", "Як одягатися на співбесіду?", "Як слідкувати за результатами співбесіди?", "Як швидко вивчити нову мову?"],
    "🌟 Які найкращі країни для моєї професії?": ["Які основні галузі в моїй сфері?", "Як адаптуватися до нової культури?", "Які очікування щодо заробітної плати?", "Як розпочати бізнес за кордоном?"]
  },
  ru: {
    "🌍 Как найти работу за границей?": ["Какие лучшие сайты для поиска работы?", "Как эффективно налаживать связи?", "Какие распространенные вопросы на собеседовании?", "Как сбалансировать работу и жизнь за границей?"],
    "📜 Каковы требования к визе?": ["Какие документы нужны для визы?", "Сколько времени занимает процесс получения визы?", "Каковы затраты?", "Как найти жилье за границей?"],
    "🗣️ Как подготовиться к собеседованию?": ["Какие лучшие практики для собеседований?", "Как одеваться на собеседование?", "Как следить за результатами собеседования?", "Как быстро выучить новый язык?"],
    "🌟 Какие лучшие страны для моей профессии?": ["Какие основные отрасли в моей сфере?", "Как адаптироваться к новой культуре?", "Каковы ожидания по зарплате?", "Как начать бизнес за границей?"]
  },
  pl: {
    "🌍 Jak znaleźć pracę za granicą?": ["Jakie są najlepsze strony do szukania pracy?", "Jak skutecznie nawiązywać kontakty?", "Jakie są typowe pytania na rozmowie kwalifikacyjnej?", "Jak zrównoważyć pracę i życie za granicą?"],
    "📜 Jakie są wymagania wizowe?": ["Jakie dokumenty są potrzebne do wizy?", "Ile trwa proces wizowy?", "Jakie są koszty?", "Jak znaleźć zakwaterowanie za granicą?"],
    "🗣️ Jak przygotować się do rozmowy kwalifikacyjnej?": ["Jakie są najlepsze praktyki na rozmowy kwalifikacyjne?", "Jak się ubrać na rozmowę kwalifikacyjną?", "Jak śledzić wyniki rozmowy kwalifikacyjnej?", "Jak szybko nauczyć się nowego języka?"],
    "🌟 Jakie są najlepsze kraje dla mojego zawodu?": ["Jakie są główne branże w mojej dziedzinie?", "Jak dostosować się do nowej kultury?", "Jakie są oczekiwania płacowe?", "Jak rozpocząć działalność gospodarczą za granicą?"]
  }
};

export function HomePageComponent() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [currentTopics, setCurrentTopics] = useState<TopicKey[]>(initialSuggestedTopics[selectedLanguage.code as keyof typeof initialSuggestedTopics]);
  const [selectedMainTopic, setSelectedMainTopic] = useState<TopicKey | null>(null);
  const { isSessionActive, toggleCall, conversation, initializeVapi, currentAssistantId, sendMessage } = useVapi();
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(true);

  const handleLanguageChange = useCallback((lang: Language) => {
    console.log('Language changed:', lang.code);
    setSelectedLanguage(lang);
    setCurrentTopics(initialSuggestedTopics[lang.code as keyof typeof initialSuggestedTopics]);
    setSelectedMainTopic(null);
    const newAssistantId = getAssistantId(lang.code);
    if (newAssistantId) {
      initializeVapi(newAssistantId);
    } else {
      console.error(`No assistant ID found for language: ${lang.code}`);
    }
  }, [initializeVapi]);

  useEffect(() => {
    console.log('HomePageComponent mounted');
    const initialAssistantId = getAssistantId(selectedLanguage.code);
    if (initialAssistantId) {
      initializeVapi(initialAssistantId);
    } else {
      console.error(`No assistant ID found for language: ${selectedLanguage.code}`);
    }
  }, [initializeVapi, selectedLanguage.code]);

  const handleMicClick = async () => {
    console.log('Mic button clicked');
    if (!currentAssistantId) {
      console.error("No assistant ID set. Cannot start call.");
      return;
    }
    try {
      await toggleCall();
      console.log('VAPI call toggled, new state:', isSessionActive ? 'active' : 'inactive');
    } catch (error) {
      console.error('Error toggling VAPI call');
    }
  };

  const handleSuggestedTopicClick = (topic: TopicKey) => {
    console.log('Suggested topic clicked:', topic);
    sendMessage('user', topic); // Send the topic to Vapi assistant
    setSelectedMainTopic(topic);
  };

  const getOpportunityText = (lang: Language) => {
    switch (lang.code) {
      case 'en': return "Discover Your Global Career Path"
      case 'es': return "Descubre Tu Camino Profesional Global"
      case 'uk': return "Відкрийте Свій Глобальний Кар'єрний Шлях"
      case 'ru': return "Откройте Свой Глобальный Карьерный Путь"
      case 'pl': return "Odkryj Swoją Globalną Ścieżkę Kariery"
      default: return "Discover Your Global Career Path"
    }
  };

  const getVoiceSearchText = (lang: Language) => {
    switch (lang.code) {
      case 'en': return "Start Voice Search"
      case 'es': return "Feature Not Availabe"
      case 'uk': return "Feature Not Availabe"
      case 'ru': return "Feature Not Availabe"
      case 'pl': return "Feature Not Availabe"
      default: return "Start Voice Search"
    }
  };

  // Add this new function for the tagline
  const getTagline = (lang: Language) => {
    switch (lang.code) {
      case 'en': return "New country, new job, new life. One call away."
      case 'es': return "Nuevo país, nuevo trabajo, nueva vida. A una llamada de distancia."
      case 'uk': return "Нова країна, нова робота, нове життя. Лише один дзвінок."
      case 'ru': return "Новая страна, новая работа, новая жизнь. Всего один звонок."
      case 'pl': return "Nowy kraj, nowa praca, nowe życie. Jeden telefon wystarczy."
      default: return "New country, new job, new life. One call away."
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="flex justify-between items-center p-4 border-b">
        <Link href="/" className="text-3xl font-bold">Nepathaya</Link>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-8">
        <div className="flex justify-center space-x-4 mb-8">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang)}
              className={`text-5xl p-2 rounded-lg transition-all ${
                selectedLanguage.code === lang.code
                  ? 'bg-primary text-primary-foreground scale-110'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {lang.flag}
            </button>
          ))}
        </div>

        <h1 className="text-5xl font-bold mb-4">Nepathaya</h1>
        <p className="text-2xl mb-8 text-center">{getTagline(selectedLanguage)}</p>
        
        <div className="text-3xl font-semibold mb-4">
          {selectedLanguage.greeting}, job seeker!
        </div>

        <Button 
          className="mb-8" 
          size="lg" 
          onClick={handleMicClick}
          variant={isSessionActive ? "destructive" : "default"}
        >
          <Mic className="h-6 w-6 mr-2" />
          {isSessionActive ? "Stop Voice Search" : getVoiceSearchText(selectedLanguage)}
        </Button>

        {isSessionActive && (
          <>
            <Card className="w-full max-w-3xl mb-8">
              <CardContent>
                <h3 className="text-xl font-semibold mb-2">Suggested Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {initialSuggestedTopics[selectedLanguage.code as keyof typeof initialSuggestedTopics].map((topic, index) => (
                 
                    <Button
                      key={index}
                      onClick={() => handleSuggestedTopicClick(topic)}
                      className={`border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all ${
                        selectedMainTopic === topic ? 'bg-gray-200' : 'bg-white'
                      }`}
                    >
                       {selectedLanguage.code === 'en' ? shortPrompts[topic] : topic}
                    </Button>
                  ))}
                </div>
                {selectedMainTopic && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold mb-2">Follow-Up Questions</h4>
                    <div className="flex flex-wrap gap-2">
                      {(followUpQuestions[selectedLanguage.code as keyof typeof followUpQuestions][selectedMainTopic] || []).map((followUp, index) => (
                        <Button
                          key={index}
                          onClick={() => sendMessage('user', followUp)}
                          className="border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all bg-white"
                        >
                          {followUp}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="w-full max-w-3xl mb-8">
              <CardContent>
                <h3 className="text-xl font-semibold mb-2">Conversation</h3>
                <ul className="list-none pl-0">
                  {conversation
                    .filter((msg) => msg.isFinal && !allTopics.has(msg.text))
                    .map((msg, index) => (
                      <li
                        key={index}
                        className={`mb-2 flex ${
                          msg.role === 'assistant' ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            msg.role === 'assistant'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          <strong>{msg.role}:</strong> {msg.text}
                        </div>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        © XIMEKI. Find your jobs one call away.
      </footer>

      {showHowItWorksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-4">How MigrantBot Works</h2>
            <div className="grid gap-4 mb-4">
              <div className="flex items-center gap-4">
                <Phone className="h-10 w-10 text-blue-500" />
                <p>Call anytime or leave your phone number. We&apos;ll call you back to save on international costs.</p>
              </div>
              <div className="flex items-center gap-4">
                <MessageSquare className="h-10 w-10 text-green-500" />
                <p>Have a quick, 2-minute chat with our voice assistant about your skills, where you want to go, and your dream job.</p>
              </div>
              <div className="flex items-center gap-4">
                <Briefcase className="h-10 w-10 text-purple-500" />
                <p>We&apos;ll send job opportunities that fit you perfectly, directly to your phone.</p>
              </div>
            </div>
            <Button onClick={() => setShowHowItWorksModal(false)}>Got it!</Button>
          </div>
        </div>
      )}
    </div>
  )
}
