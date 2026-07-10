import type { Language } from "@/context/LanguageContext";

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    home: "Home",
    about: "About",
    members: "Members",
    diary: "Diary",
    tryIt: "Try it",
    language: "Language",
    
    // Home page
    uploadPhoto: "Upload a photo",
    answerQuestions: "Answer a few questions",
    getPlan: "Get your plan",
    uploadPhotoDesc:
      "Snap or find a photo of your robotic arm — hobby kit, custom build, or industrial arm.",
    answerQuestionsDesc:
      "RoboPrompt figures out what it can from the photo, and only asks about what it can't.",
    getPlanDesc:
      "A concrete architecture, build plan, and test plan for controlling your arm's end-effector.",
    smallServo: "Small & servo-driven",
    smallServoDesc:
      "Hobby kits and custom builds — Arduino, ESP32, or similar microcontrollers.",
    largeIndustrial: "Large & industrial",
    largeIndustrialDesc:
      "Brushless motors and reducers, usually paired with Jetson or ROS2.",
    aiRoboticsAssistant: "AI-powered robotics assistant",
    builtForAny: "Built for any robot arm",
    buildsRightQuestions:
      "RoboPrompt asks the right questions for your hardware and generates a plan you can actually build from — no matter the scale.",
    readyToSee: "Ready to see your plan?",
    uploadGetStarted: "Upload a photo and get started in minutes.",
    tryNow: "Try it now",
    howItWorks: "How it works",
    turnPhoto: "Turn a photo of a robotic arm into a working control plan.",
    
    // About page
    aboutRoboPrompt: "About RoboPrompt",
    aboutDesc:
      "RoboPrompt is an AI assistant for designing robotic arm control systems. Most people who build or buy a robot arm can get the hardware working, but turning that into a real control system — firmware, drivers, a web panel — is where things stall. RoboPrompt closes that gap: upload a photo, answer a short set of targeted questions, and get an architecture, build plan, and test plan specific to your hardware.",
    problem: "The problem",
    problemDesc:
      "Robot programming is hard because the mechanical structure, hardware information, communication protocol, and code are usually disconnected. A photo alone isn't enough to generate reliable code — different robots use different motors, servos, controllers, SDKs, or ROS packages, and beginners often don't know what information is even needed before they can start coding. Generic AI coding tools can write code, but they don't have robotics context: they guess instead of asking.",
    coreRule: "Core rule",
    coreRuleDesc:
      "Never let the AI guess robot code directly. Identify the hardware first, then ask for whatever is still missing — in that order, every time.",
    howItWorks2: "How it works",
    visionAnalysis: "1. Vision analysis",
    visionAnalysisDesc:
      "Read the photo for logo/brand/model, joint count and DOF, motor or servo clues, controller board, and overall size and structure.",
    knownModel: "2. Known model, or not?",
    knownModelDesc:
      "If the hardware matches a known product or open-source design, go straight to its official docs, SDK, or ROS/MoveIt package. If not, ask the user directly — motor type, controller, protocol, wiring, joint limits, control goal.",
    classifyPath: "3. Classify & choose a control path",
    classifyPathDesc:
      "Arduino servo arm, ESP32 web robot, ROS/open-source arm, or industrial robot arm — each maps to a different control path: Arduino/ESP32 firmware, a vendor SDK, or ROS/MoveIt over serial or CAN.",
    finalOutput: "4. Final output",
    finalOutputDesc:
      "Runnable control code, wiring and setup steps, and a calibration + test plan — not just a code snippet.",
    twoCategoriesOnePipeline: "Two categories, one pipeline",
    categoryA: "Category A — Small, servo/microcontroller-driven",
    categoryADesc:
      "Plastic or 3D-printed arms driven by hobby servos, smart bus servos, steppers, or small DC motors, controlled through a microcontroller (Arduino, ESP32, STM32, Pico). RoboPrompt's target deliverable here is a browser-based control panel over Web Serial or Web Bluetooth — no native host app required.",
    categoryB: "Category B — Large, brushless motors + reducers",
    categoryBDesc:
      "Metal-bodied arms with harmonic-drive or planetary-gearbox joints, usually paired with a Jetson or industrial PC running ROS2. RoboPrompt tries to identify the brand/model first and points you at the matching vendor SDK or ROS2 driver before falling back to a full custom-build question flow.",
    examples: "A few examples",
    robotType: "Robot type",
    whatWeAsk: "What we ask",
    whatWeGenerate: "What we generate",
    arduinoServoArm: "Arduino servo arm",
    servoPinsAngle: "Servo pins, angle range, zero position",
    arduinoControlCode: "Arduino control code",
    esp32RoboticArm: "ESP32 robotic arm",
    wiFiServo: "Wi-Fi, servo pins, control mode",
    webControlInterface: "Web control interface",
    rosRobotArm: "ROS robot arm",
    jointsURDF: "Joints, URDF, MoveIt support",
    rosNodeMotion: "ROS node / motion planning",
    industrialArm: "Industrial arm",
    brandSDKProtocol: "Brand, SDK, protocol",
    officialSDKCode: "Official SDK-based code",
    unknownCustom: "Unknown / custom robot",
    motorTypeController: "Motor type, controller, connection",
    diagnosisTemplate: "Diagnosis + template code",
    
    // Members page
    membersTitle: "Members",
    thePeopleBehind: "The people behind RoboPrompt.",
    member_annie_ye_role: "Creator & Developer",
    member_annie_ye_bio: "Building RoboPrompt end to end — product, system prompt design, and the web app.",
    member_dora_ai_role: "Team Member",
    member_matt_beitler_role: "Team Member",
    member_pearson_wu_role: "Team Member",
    member_james_yang_role: "Team Member",
    member_dora_ai_bio: "A high school student and a huge gamer who loves combining creativity with technology.",
    
    // Diary page
    diaryTitle: "Diary",
    
    // Try page
    uploadYourArm: "Upload your robot arm",
    analyzeAskPhoto: "We'll analyze it and ask what we can't tell from the photo.",
    analyzingPhoto: "Analyzing your photo…",
    generatePlanNow: "Generate my plan now",
    replyLabel: "Your reply",
    selectPlaceholder: "Select…",
    otherTypeMyOwn: "Other (type my own)",
    chooseFromList: "Choose from list",
    typeYourOwnAnswer: "Type your own answer",
    continue: "Continue",
    startOverWithNewArm: "Start over with a new arm",
    preparingPhotos: "Preparing photos…",
    dropPhotosHere: "Drop photos of your robot arm here",
    chooseFilesHint: "or click to choose one or more files — JPEG, PNG, or WebP (up to {count})",
    thinking: "Thinking…",
    loading: "Loading",
    changeLanguage: "Change language",
    backToMembers: "Back to Members",
    github: "GitHub",
    email: "Email",
    wechat: "WeChat",
    commitActivity: "Commit activity",
    herePhotoOfArm: "Here is a photo of my robotic arm. Please analyze it and help me figure out how to control it.",
    herePhotosOfArm: "Here are photos of my robotic arm. Please analyze them and help me figure out how to control it.",
    photosReady: "{count} photo{s} ready.",
    analyze: "Analyze",
    downloadCode: "Download code (.zip)",
    generatingCode: "Generating code…",
    requestChanges: "Want something different?",
    requestChangesPlaceholder:
      "e.g. Use an ESP32 instead of the Arduino Uno, or skip Web Serial and use a Python bridge",
    revisePlan: "Revise plan",
    revisingPlan: "Revising plan…",
    generateTimeout:
      "Code generation took too long and timed out. Try again — a second attempt usually completes.",
  },
  es: {
    // Navigation
    home: "Inicio",
    about: "Acerca de",
    members: "Miembros",
    diary: "Diario",
    tryIt: "Pruébalo",
    language: "Idioma",
    
    // Home page
    uploadPhoto: "Sube una foto",
    answerQuestions: "Responde algunas preguntas",
    getPlan: "Obtén tu plan",
    uploadPhotoDesc:
      "Toma o encuentra una foto de tu brazo robótico — kit de afición, construcción personalizada o brazo industrial.",
    answerQuestionsDesc:
      "RoboPrompt descubre lo que puede de la foto, y solo pregunta lo que no puede.",
    getPlanDesc:
      "Una arquitectura concreta, plan de construcción y plan de prueba para controlar el efector final de tu brazo.",
    smallServo: "Pequeño y accionado por servos",
    smallServoDesc:
      "Kits de afición y construcciones personalizadas — Arduino, ESP32 o microcontroladores similares.",
    largeIndustrial: "Grande e industrial",
    largeIndustrialDesc:
      "Motores sin escobillas y reductores, generalmente emparejados con Jetson o ROS2.",
    aiRoboticsAssistant: "Asistente de robótica impulsado por IA",
    builtForAny: "Construido para cualquier brazo robótico",
    buildsRightQuestions:
      "RoboPrompt hace las preguntas correctas para tu hardware y genera un plan que realmente puedas construir — sin importar la escala.",
    readyToSee: "¿Listo para ver tu plan?",
    uploadGetStarted: "Sube una foto y comienza en minutos.",
    tryNow: "Pruébalo ahora",
    howItWorks: "Cómo funciona",
    turnPhoto: "Convierte una foto de un brazo robótico en un plan de control funcional.",
    
    // About page
    aboutRoboPrompt: "Acerca de RoboPrompt",
    aboutDesc:
      "RoboPrompt es un asistente de IA para diseñar sistemas de control de brazos robóticos. La mayoría de las personas que construyen o compran un brazo robótico pueden hacer que el hardware funcione, pero convertir eso en un sistema de control real — firmware, controladores, un panel web — es donde las cosas se detienen. RoboPrompt cierra esa brecha: sube una foto, responde un conjunto breve de preguntas dirigidas y obtén una arquitectura, plan de construcción y plan de prueba específicos para tu hardware.",
    problem: "El problema",
    problemDesc:
      "La programación de robots es difícil porque la estructura mecánica, la información del hardware, el protocolo de comunicación y el código generalmente están desconectados. Una foto por sí sola no es suficiente para generar código confiable — diferentes robots usan diferentes motores, servos, controladores, SDK o paquetes ROS, y los principiantes a menudo no saben qué información se necesita antes de poder comenzar a codificar. Las herramientas de codificación genéricas de IA pueden escribir código, pero no tienen contexto de robótica: adivinan en lugar de preguntar.",
    coreRule: "Regla central",
    coreRuleDesc:
      "Nunca dejes que la IA adivine código de robot directamente. Identifica primero el hardware, luego pregunta por lo que aún falta — en ese orden, siempre.",
    howItWorks2: "Cómo funciona",
    visionAnalysis: "1. Análisis de visión",
    visionAnalysisDesc:
      "Lee la foto para obtener logotipo/marca/modelo, conteo de articulaciones y GDL, pistas de motor o servo, placa de control y tamaño y estructura general.",
    knownModel: "2. ¿Modelo conocido o no?",
    knownModelDesc:
      "Si el hardware coincide con un producto conocido o un diseño de código abierto, ve directamente a su documentación oficial, SDK o paquete ROS/MoveIt. Si no, pregunta al usuario directamente — tipo de motor, controlador, protocolo, cableado, límites de articulación, objetivo de control.",
    classifyPath: "3. Clasificar y elegir una ruta de control",
    classifyPathDesc:
      "Brazo servo Arduino, robot web ESP32, brazo ROS/código abierto o brazo de robot industrial — cada uno se asigna a una ruta de control diferente: firmware Arduino/ESP32, SDK de proveedor o ROS/MoveIt sobre serie o CAN.",
    finalOutput: "4. Salida final",
    finalOutputDesc:
      "Código de control ejecutable, pasos de cableado y configuración, y un plan de calibración + prueba — no solo un fragmento de código.",
    twoCategoriesOnePipeline: "Dos categorías, una tubería",
    categoryA: "Categoría A — Pequeño, accionado por servo/microcontrolador",
    categoryADesc:
      "Brazos de plástico o impresión 3D accionados por servos de afición, servos de bus inteligente, steppers o pequeños motores de CC, controlados a través de un microcontrolador (Arduino, ESP32, STM32, Pico). El entregable objetivo de RoboPrompt aquí es un panel de control basado en navegador sobre Web Serial o Web Bluetooth — sin aplicación host nativa requerida.",
    categoryB: "Categoría B — Grande, motores sin escobillas + reductores",
    categoryBDesc:
      "Brazos de cuerpo metálico con articulaciones de unidad armónica o caja de engranajes planetaria, generalmente emparejados con una PC Jetson o industrial que ejecuta ROS2. RoboPrompt intenta identificar primero la marca/modelo y te señala el SDK de proveedor coincidente o el controlador ROS2 antes de recurrir a un flujo de preguntas de construcción personalizada completa.",
    examples: "Algunos ejemplos",
    robotType: "Tipo de robot",
    whatWeAsk: "Lo que preguntamos",
    whatWeGenerate: "Lo que generamos",
    arduinoServoArm: "Brazo servo Arduino",
    servoPinsAngle: "Pines servo, rango de ángulo, posición cero",
    arduinoControlCode: "Código de control Arduino",
    esp32RoboticArm: "Brazo robótico ESP32",
    wiFiServo: "Wi-Fi, pines servo, modo de control",
    webControlInterface: "Interfaz de control web",
    rosRobotArm: "Brazo robot ROS",
    jointsURDF: "Articulaciones, URDF, soporte MoveIt",
    rosNodeMotion: "Nodo ROS / planificación de movimiento",
    industrialArm: "Brazo industrial",
    brandSDKProtocol: "Marca, SDK, protocolo",
    officialSDKCode: "Código basado en SDK oficial",
    unknownCustom: "Robot desconocido / personalizado",
    motorTypeController: "Tipo de motor, controlador, conexión",
    diagnosisTemplate: "Diagnóstico + código de plantilla",
    
    // Members page
    membersTitle: "Miembros",
    thePeopleBehind: "Las personas detrás de RoboPrompt.",
    member_annie_ye_role: "Creadora y Desarrolladora",
    member_annie_ye_bio: "Construyendo RoboPrompt de extremo a extremo: producto, diseño del prompt del sistema y aplicación web.",
    member_dora_ai_role: "Miembro del equipo",
    member_matt_beitler_role: "Miembro del equipo",
    member_pearson_wu_role: "Miembro del equipo",
    member_james_yang_role: "Miembro del equipo",
    
    // Diary page
    diaryTitle: "Diario",
    
    // Try page
    uploadYourArm: "Sube tu brazo robótico",
    analyzeAskPhoto: "Lo analizaremos y preguntaremos lo que no podemos decir de la foto.",
    analyzingPhoto: "Analizando tu foto…",
    generatePlanNow: "Generar mi plan ahora",
    replyLabel: "Tu respuesta",
    selectPlaceholder: "Seleccionar…",
    otherTypeMyOwn: "Otro (escribir mi propia respuesta)",
    chooseFromList: "Elegir de la lista",
    typeYourOwnAnswer: "Escribe tu propia respuesta",
    continue: "Continuar",
    startOverWithNewArm: "Empezar de nuevo con un nuevo brazo",
    preparingPhotos: "Preparando fotos…",
    dropPhotosHere: "Suelta aquí fotos de tu brazo robótico",
    chooseFilesHint: "o haz clic para elegir uno o más archivos — JPEG, PNG o WebP (hasta {count})",
    thinking: "Pensando…",
    loading: "Cargando",
    changeLanguage: "Cambiar idioma",
    backToMembers: "Volver a Miembros",
    github: "GitHub",
    email: "Correo",
    wechat: "WeChat",
    commitActivity: "Actividad de commits",
    herePhotoOfArm: "Aquí hay una foto de mi brazo robótico. Por favor, analízala y ayúdame a descubrir cómo controlarlo.",
    herePhotosOfArm: "Aquí hay fotos de mi brazo robótico. Por favor, analízalas y ayúdame a descubrir cómo controlarlo.",
    photosReady: "{count} foto{s} lista{s}.",
    analyze: "Analizar",
    downloadCode: "Descargar código (.zip)",
    generatingCode: "Generando código…",
    requestChanges: "¿Quieres algo diferente?",
    requestChangesPlaceholder:
      "p. ej. Usa un ESP32 en lugar del Arduino Uno, o evita Web Serial y usa un puente en Python",
    revisePlan: "Revisar plan",
    revisingPlan: "Revisando el plan…",
    generateTimeout:
      "La generación de código tardó demasiado y se agotó el tiempo. Inténtalo de nuevo — un segundo intento suele completarse.",
  },
  fr: {
    // Navigation
    home: "Accueil",
    about: "À propos",
    members: "Membres",
    diary: "Journal",
    tryIt: "Essayer",
    language: "Langue",
    
    // Home page
    uploadPhoto: "Télécharger une photo",
    answerQuestions: "Répondre à quelques questions",
    getPlan: "Obtenez votre plan",
    uploadPhotoDesc:
      "Prenez ou trouvez une photo de votre bras robotique — kit de loisir, construction personnalisée ou bras industriel.",
    answerQuestionsDesc:
      "RoboPrompt découvre ce qu'il peut de la photo et ne pose que les questions qu'il ne peut pas.",
    getPlanDesc:
      "Une architecture concrète, un plan de construction et un plan de test pour contrôler l'effecteur final de votre bras.",
    smallServo: "Petit et entraîné par servomoteur",
    smallServoDesc:
      "Kits de loisirs et constructions personnalisées — Arduino, ESP32 ou microcontrôleurs similaires.",
    largeIndustrial: "Grand et industriel",
    largeIndustrialDesc:
      "Moteurs sans balais et réducteurs, généralement associés à Jetson ou ROS2.",
    aiRoboticsAssistant: "Assistant de robotique alimenté par l'IA",
    builtForAny: "Construit pour n'importe quel bras robotique",
    buildsRightQuestions:
      "RoboPrompt pose les bonnes questions pour votre matériel et génère un plan que vous pouvez réellement construire — quelle que soit l'échelle.",
    readyToSee: "Prêt à voir votre plan ?",
    uploadGetStarted: "Téléchargez une photo et commencez en quelques minutes.",
    tryNow: "Essayez maintenant",
    howItWorks: "Comment ça marche",
    turnPhoto: "Transformez une photo d'un bras robotique en un plan de contrôle fonctionnel.",
    
    // About page
    aboutRoboPrompt: "À propos de RoboPrompt",
    aboutDesc:
      "RoboPrompt est un assistant IA pour concevoir des systèmes de contrôle de bras robotiques. La plupart des gens qui construisent ou achètent un bras robotique peuvent faire fonctionner le matériel, mais transformer cela en un vrai système de contrôle — micrologiciel, pilotes, panneau web — c'est là que ça bloque. RoboPrompt comble cette lacune : téléchargez une photo, répondez à un ensemble court de questions ciblées et obtenez une architecture, un plan de construction et un plan de test spécifiques à votre matériel.",
    problem: "Le problème",
    problemDesc:
      "La programmation robotique est difficile car la structure mécanique, les informations matérielles, le protocole de communication et le code sont généralement déconnectés. Une photo seule ne suffit pas pour générer du code fiable — différents robots utilisent différents moteurs, servomoteurs, contrôleurs, SDK ou packages ROS, et les débutants ne savent souvent pas quelles informations sont nécessaires avant de pouvoir commencer à coder. Les outils de codage IA génériques peuvent écrire du code, mais ils n'ont pas de contexte robotique : ils devinent au lieu de demander.",
    coreRule: "Règle centrale",
    coreRuleDesc:
      "Ne laissez jamais l'IA deviner directement le code du robot. Identifiez d'abord le matériel, puis demandez ce qui manque toujours — dans cet ordre, chaque fois.",
    howItWorks2: "Comment ça marche",
    visionAnalysis: "1. Analyse de vision",
    visionAnalysisDesc:
      "Lisez la photo pour le logo/marque/modèle, le décompte des articulations et le DDL, les indices de moteur ou servomoteur, la carte de contrôle et la taille et la structure globales.",
    knownModel: "2. Modèle connu ou non ?",
    knownModelDesc:
      "Si le matériel correspond à un produit connu ou à une conception open-source, allez directement à sa documentation officielle, SDK ou package ROS/MoveIt. Sinon, demandez directement à l'utilisateur — type de moteur, contrôleur, protocole, câblage, limites d'articulation, objectif de contrôle.",
    classifyPath: "3. Classifier et choisir un chemin de contrôle",
    classifyPathDesc:
      "Bras servo Arduino, robot web ESP32, bras ROS/open-source ou bras robot industriel — chacun correspond à un chemin de contrôle différent : micrologiciel Arduino/ESP32, SDK fournisseur ou ROS/MoveIt sur série ou CAN.",
    finalOutput: "4. Résultat final",
    finalOutputDesc:
      "Code de contrôle exécutable, étapes de câblage et de configuration, et un plan de calibrage + test — pas seulement un extrait de code.",
    twoCategoriesOnePipeline: "Deux catégories, un pipeline",
    categoryA: "Catégorie A — Petit, entraîné par servo/microcontrôleur",
    categoryADesc:
      "Bras en plastique ou imprimés en 3D entraînés par des servomoteurs de loisir, des servomoteurs de bus intelligents, des moteurs pas à pas ou de petits moteurs CC, contrôlés via un microcontrôleur (Arduino, ESP32, STM32, Pico). L'objectif livrable de RoboPrompt ici est un panneau de commande basé sur un navigateur sur Web Serial ou Web Bluetooth — aucune application hôte native requise.",
    categoryB: "Catégorie B — Grand, moteurs sans balais + réducteurs",
    categoryBDesc:
      "Bras à corps métallique avec articulations à lecteur harmonique ou boîte de vitesses planétaire, généralement associés à un PC Jetson ou industriel exécutant ROS2. RoboPrompt essaie d'identifier d'abord la marque/le modèle et vous pointe vers le SDK de fournisseur correspondant ou le pilote ROS2 avant de revenir à un flux de questions de construction personnalisée complète.",
    examples: "Quelques exemples",
    robotType: "Type de robot",
    whatWeAsk: "Ce que nous demandons",
    whatWeGenerate: "Ce que nous générons",
    arduinoServoArm: "Bras servo Arduino",
    servoPinsAngle: "Broches servo, plage d'angle, position zéro",
    arduinoControlCode: "Code de contrôle Arduino",
    esp32RoboticArm: "Bras robotique ESP32",
    wiFiServo: "Wi-Fi, broches servo, mode de contrôle",
    webControlInterface: "Interface de contrôle Web",
    rosRobotArm: "Bras robot ROS",
    jointsURDF: "Articulations, URDF, support MoveIt",
    rosNodeMotion: "Nœud ROS / planification de mouvement",
    industrialArm: "Bras industriel",
    brandSDKProtocol: "Marque, SDK, protocole",
    officialSDKCode: "Code basé sur le SDK officiel",
    unknownCustom: "Robot inconnu/personnalisé",
    motorTypeController: "Type de moteur, contrôleur, connexion",
    diagnosisTemplate: "Diagnostic + code de modèle",
    
    // Members page
    membersTitle: "Membres",
    thePeopleBehind: "Les gens derrière RoboPrompt.",
    member_annie_ye_role: "Créatrice et Développeuse",
    member_annie_ye_bio: "Création de RoboPrompt de bout en bout : produit, conception du prompt système et application web.",
    member_dora_ai_role: "Membre de l'équipe",
    member_matt_beitler_role: "Membre de l'équipe",
    member_pearson_wu_role: "Membre de l'équipe",
    member_james_yang_role: "Membre de l'équipe",
    
    // Diary page
    diaryTitle: "Journal",
    
    // Try page
    uploadYourArm: "Téléchargez votre bras robotique",
    analyzeAskPhoto: "Nous l'analyserons et poserons les questions que nous ne pouvons pas dire à partir de la photo.",
    analyzingPhoto: "Analyse de votre photo…",
    generatePlanNow: "Générez mon plan maintenant",
    replyLabel: "Votre réponse",
    selectPlaceholder: "Sélectionner…",
    otherTypeMyOwn: "Autre (saisir ma propre réponse)",
    chooseFromList: "Choisir dans la liste",
    typeYourOwnAnswer: "Saisissez votre propre réponse",
    continue: "Continuer",
    startOverWithNewArm: "Recommencer avec un nouveau bras",
    preparingPhotos: "Préparation des photos…",
    dropPhotosHere: "Déposez ici des photos de votre bras robotique",
    chooseFilesHint: "ou cliquez pour choisir un ou plusieurs fichiers — JPEG, PNG ou WebP (jusqu'à {count})",
    thinking: "Réflexion…",
    loading: "Chargement",
    changeLanguage: "Changer la langue",
    backToMembers: "Retour aux membres",
    github: "GitHub",
    email: "Email",
    wechat: "WeChat",
    commitActivity: "Activité des commits",
    herePhotoOfArm: "Voici une photo de mon bras robotique. Veuillez l'analyser et m'aider à comprendre comment le contrôler.",
    herePhotosOfArm: "Voici des photos de mon bras robotique. Veuillez les analyser et m'aider à comprendre comment le contrôler.",
    photosReady: "{count} photo{s} prête{s}.",
    analyze: "Analyser",
    downloadCode: "Télécharger le code (.zip)",
    generatingCode: "Génération du code…",
    requestChanges: "Envie d'autre chose ?",
    requestChangesPlaceholder:
      "p. ex. Utiliser un ESP32 au lieu de l'Arduino Uno, ou remplacer Web Serial par un pont Python",
    revisePlan: "Réviser le plan",
    revisingPlan: "Révision du plan…",
    generateTimeout:
      "La génération du code a pris trop de temps et a expiré. Réessayez — une seconde tentative aboutit généralement.",
  },
  zh: {
    // Navigation
    home: "首页",
    about: "关于",
    members: "成员",
    diary: "日记",
    tryIt: "试试",
    language: "语言",
    
    // Home page
    uploadPhoto: "上传照片",
    answerQuestions: "回答几个问题",
    getPlan: "获取您的计划",
    uploadPhotoDesc:
      "拍摄或找到您的机械臂照片——爱好套件、自定义构建或工业臂。",
    answerQuestionsDesc:
      "RoboPrompt 从照片中找出它能够找到的内容，只询问它无法找到的内容。",
    getPlanDesc:
      "为控制您的机械臂末端执行器提供具体的架构、构建计划和测试计划。",
    smallServo: "小型和伺服驱动",
    smallServoDesc:
      "爱好套件和自定义构建——Arduino、ESP32 或类似的微控制器。",
    largeIndustrial: "大型和工业型",
    largeIndustrialDesc:
      "无刷电机和减速器，通常与 Jetson 或 ROS2 配对。",
    aiRoboticsAssistant: "由人工智能驱动的机器人助手",
    builtForAny: "为任何机械臂构建",
    buildsRightQuestions:
      "RoboPrompt 为您的硬件提出正确的问题，并生成您实际上可以构建的计划——无论规模如何。",
    readyToSee: "准备好查看您的计划了吗？",
    uploadGetStarted: "上传照片并在几分钟内开始。",
    tryNow: "立即试试",
    howItWorks: "它如何工作",
    turnPhoto: "将机械臂照片转变为可工作的控制计划。",
    
    // About page
    aboutRoboPrompt: "关于 RoboPrompt",
    aboutDesc:
      "RoboPrompt 是一个用于设计机械臂控制系统的人工智能助手。大多数构建或购买机械臂的人可以使硬件正常工作，但将其转变为真正的控制系统——固件、驱动程序、网络面板——是事情停滞的地方。RoboPrompt 弥补了这一差距：上传照片，回答一系列有针对性的问题，并获得特定于您的硬件的架构、构建计划和测试计划。",
    problem: "问题",
    problemDesc:
      "机器人编程很困难，因为机械结构、硬件信息、通信协议和代码通常是断开的。仅靠照片不足以生成可靠的代码——不同的机器人使用不同的电机、伺服、控制器、SDK 或 ROS 软件包，初学者通常不知道在开始编码之前需要什么信息。通用的人工智能编码工具可以编写代码，但它们没有机器人背景：它们猜测而不是提问。",
    coreRule: "核心规则",
    coreRuleDesc:
      "永远不要让人工智能直接猜测机器人代码。首先识别硬件，然后询问仍然缺少的任何内容——每次都按照这个顺序。",
    howItWorks2: "它如何工作",
    visionAnalysis: "1. 视觉分析",
    visionAnalysisDesc:
      "读取照片中的徽标/品牌/型号、关节计数和自由度、电动机或伺服线索、控制器板以及整体大小和结构。",
    knownModel: "2. 已知模型还是未知模型？",
    knownModelDesc:
      "如果硬件与已知产品或开源设计相匹配，请直接转到其官方文档、SDK 或 ROS/MoveIt 软件包。如果没有，请直接询问用户——电动机类型、控制器、协议、接线、关节限制、控制目标。",
    classifyPath: "3. 分类并选择控制路径",
    classifyPathDesc:
      "Arduino 伺服臂、ESP32 网络机器人、ROS/开源臂或工业机器人臂——每个都映射到不同的控制路径：Arduino/ESP32 固件、供应商 SDK 或 ROS/MoveIt over serial 或 CAN。",
    finalOutput: "4. 最终输出",
    finalOutputDesc:
      "可运行的控制代码、接线和设置步骤以及校准 + 测试计划——不仅仅是一个代码片段。",
    twoCategoriesOnePipeline: "两个类别，一个管道",
    categoryA: "类别 A — 小型、伺服/微控制器驱动",
    categoryADesc:
      "由爱好伺服、智能总线伺服、步进器或小型直流电机驱动的塑料或 3D 打印臂，通过微控制器 (Arduino, ESP32, STM32, Pico) 控制。RoboPrompt 在这里的目标可交付成果是基于浏览器的控制面板，通过 Web Serial 或 Web Bluetooth——无需本机主机应用程序。",
    categoryB: "类别 B — 大型、无刷电机 + 减速器",
    categoryBDesc:
      "具有谐波驱动或行星齿轮箱关节的金属机身臂，通常与运行 ROS2 的 Jetson 或工业 PC 配对。RoboPrompt 首先尝试识别品牌/型号，并指向匹配的供应商 SDK 或 ROS2 驱动程序，然后回退到完整的自定义构建问题流程。",
    examples: "一些示例",
    robotType: "机器人类型",
    whatWeAsk: "我们询问的内容",
    whatWeGenerate: "我们生成的内容",
    arduinoServoArm: "Arduino 伺服臂",
    servoPinsAngle: "伺服管脚、角度范围、零位置",
    arduinoControlCode: "Arduino 控制代码",
    esp32RoboticArm: "ESP32 机械臂",
    wiFiServo: "Wi-Fi、伺服管脚、控制模式",
    webControlInterface: "Web 控制界面",
    rosRobotArm: "ROS 机器人臂",
    jointsURDF: "关节、URDF、MoveIt 支持",
    rosNodeMotion: "ROS 节点/运动规划",
    industrialArm: "工业臂",
    brandSDKProtocol: "品牌、SDK、协议",
    officialSDKCode: "官方基于 SDK 的代码",
    unknownCustom: "未知/自定义机器人",
    motorTypeController: "电机类型、控制器、连接",
    diagnosisTemplate: "诊断 + 模板代码",
    
    // Members page
    membersTitle: "成员",
    thePeopleBehind: "RoboPrompt 背后的人物。",
    member_annie_ye_role: "创建者与开发者",
    member_annie_ye_bio: "从产品、系统提示词设计到网页应用，端到端构建 RoboPrompt。",
    member_dora_ai_role: "团队成员",
    member_matt_beitler_role: "团队成员",
    member_pearson_wu_role: "团队成员",
    member_james_yang_role: "团队成员",
    
    // Diary page
    diaryTitle: "日记",
    
    // Try page
    uploadYourArm: "上传您的机械臂",
    analyzeAskPhoto: "我们将分析它并提出从照片中无法看出的问题。",
    analyzingPhoto: "正在分析您的照片…",
    generatePlanNow: "立即生成我的计划",
    replyLabel: "你的回复",
    selectPlaceholder: "请选择…",
    otherTypeMyOwn: "其他（自行输入）",
    chooseFromList: "从列表中选择",
    typeYourOwnAnswer: "输入你自己的回答",
    continue: "继续",
    startOverWithNewArm: "使用新机械臂重新开始",
    preparingPhotos: "正在准备照片…",
    dropPhotosHere: "将你的机械臂照片拖到这里",
    chooseFilesHint: "或点击选择一个或多个文件 — JPEG、PNG 或 WebP（最多 {count} 个）",
    thinking: "思考中…",
    loading: "加载中",
    changeLanguage: "切换语言",
    backToMembers: "返回成员页",
    github: "GitHub",
    email: "邮箱",
    wechat: "微信",
    commitActivity: "提交活动",
    herePhorosOfArm: "这是我的机械臂的照片。请分析它们并帮助我了解如何控制它。",
    herePhotoOfArm: "这是我的机械臂的照片。请分析它并帮助我了解如何控制它。",
    photosReady: "已准备好 {count} 张照片。",
    analyze: "分析",
    downloadCode: "下载代码（.zip）",
    generatingCode: "正在生成代码…",
    requestChanges: "想改点什么？",
    requestChangesPlaceholder: "例如：改用 ESP32 而不是 Arduino Uno，或者不用 Web Serial、改用 Python 桥接",
    revisePlan: "修改方案",
    revisingPlan: "正在修改方案…",
    generateTimeout: "代码生成耗时过长已超时。请再试一次——第二次通常能成功。",
  },
};

export function getTranslation(
  language: Language,
  key: string
): string {
  return translations[language][key] || translations.en[key] || key;
}
