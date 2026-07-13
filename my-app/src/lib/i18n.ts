import type { LanguageCode } from "@/lib/languages";

export const copy = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      members: "Members",
      diary: "Diary",
      try: "Try it",
      language: "Language",
    },
    home: {
      eyebrow: "AI-powered robotics assistant",
      tagline: "Turn a photo of a robotic arm into a working control plan.",
      primaryCta: "Try it now",
      secondaryCta: "How it works",
      steps: [
        {
          title: "Upload a photo",
          body: "Snap or find a photo of your robotic arm - hobby kit, custom build, or industrial arm.",
        },
        {
          title: "Answer a few questions",
          body: "RoboPrompt figures out what it can from the photo, and only asks about what it can't.",
        },
        {
          title: "Get your plan",
          body: "A concrete architecture, build plan, and test plan for controlling your arm's end-effector.",
        },
      ],
      robotHeading: "Built for any robot arm",
      robotBody:
        "RoboPrompt asks the right questions for your hardware and generates a plan you can actually build from - no matter the scale.",
      categories: [
        {
          name: "Small & servo-driven",
          body: "Hobby kits and custom builds - Arduino, ESP32, or similar microcontrollers.",
        },
        {
          name: "Large & industrial",
          body: "Brushless motors and reducers, usually paired with Jetson or ROS2.",
        },
      ],
      finalHeading: "Ready to see your plan?",
      finalBody: "Upload a photo and get started in minutes.",
    },
    try: {
      stepLabel: "Step 1 of 3",
      uploadHeading: "Let’s start with a photo",
      uploadBody: "No robotics experience needed. A clear phone photo is enough to begin.",
      photoTipsHeading: "For the best result",
      photoTips: [
        "Show the whole arm from base to gripper",
        "Use good light and keep labels visible",
        "Add a second angle if parts overlap",
      ],
      whatNextHeading: "What happens next?",
      whatNextBody:
        "We’ll identify the visible parts, ask a few plain-language questions, then create a step-by-step control plan.",
      privacyNote: "Your photos are only used to analyze this project.",
      choosePhotos: "Choose photos",
      interviewStep: "Step 2 of 3 · A few quick questions",
      interviewHint: "Answer in your own words. “I’m not sure” is always okay.",
      planStep: "Step 3 of 3 · Your build plan",
      uploadedSingle: "Uploaded a photo of my robot arm.",
      uploadedMultiple: (count: number) => `Uploaded ${count} photos of my robot arm.`,
      initialSingle:
        "Here is a photo of my robotic arm. Please analyze it and help me figure out how to control it.",
      initialMultiple:
        "Here are photos of my robotic arm. Please analyze them and help me figure out how to control it.",
      generatePlanNow:
        "Please generate the final architecture, build, and test plan now based on everything you know so far.",
      inputPlaceholder: "Type your answer...",
      send: "Send",
      preparing: "Preparing photos...",
      dropzoneTitle: "Drop photos of your robot arm here",
      dropzoneHint: (maxFiles: number) =>
        `or drag them here · JPEG, PNG, or WebP · up to ${maxFiles}`,
      generatePlanButton: "Use what we have and make my plan",
      startOver: "Start over with a new arm",
    },
  },
  zh: {
    nav: {
      home: "首页",
      about: "关于",
      members: "成员",
      diary: "日志",
      try: "试试看",
      language: "语言",
    },
    home: {
      eyebrow: "AI 机器人助手",
      tagline: "把机械臂照片转换成可执行的控制方案。",
      primaryCta: "立即试用",
      secondaryCta: "了解流程",
      steps: [
        {
          title: "上传照片",
          body: "拍摄或选择你的机械臂照片，可以是爱好套件、自制项目或工业机械臂。",
        },
        {
          title: "回答几个问题",
          body: "RoboPrompt 会先从照片中判断信息，只追问无法确认的部分。",
        },
        {
          title: "获得方案",
          body: "生成面向末端执行器控制的架构、搭建步骤和测试计划。",
        },
      ],
      robotHeading: "适用于各种机械臂",
      robotBody:
        "RoboPrompt 会根据你的硬件提出合适问题，并生成真正可以动手实施的方案。",
      categories: [
        {
          name: "小型舵机驱动",
          body: "适合爱好套件和自制项目，例如 Arduino、ESP32 或类似微控制器。",
        },
        {
          name: "大型工业机械臂",
          body: "通常使用无刷电机和减速器，并搭配 Jetson 或 ROS2。",
        },
      ],
      finalHeading: "准备查看你的方案了吗？",
      finalBody: "上传照片，几分钟内开始。",
    },
    try: {
      stepLabel: "第 1 步，共 3 步",
      uploadHeading: "先从一张照片开始",
      uploadBody: "不需要机器人基础，一张清晰的手机照片就可以开始。",
      photoTipsHeading: "这样拍，识别更准确",
      photoTips: [
        "拍到从底座到夹爪的完整机械臂",
        "保持光线充足，尽量让标签清晰可见",
        "零件互相遮挡时，再补充一个角度",
      ],
      whatNextHeading: "接下来会发生什么？",
      whatNextBody: "我们会识别照片中的零件，用简单的问题补全信息，再生成一步步的控制方案。",
      privacyNote: "你的照片只会用于分析当前项目。",
      choosePhotos: "选择照片",
      interviewStep: "第 2 步，共 3 步 · 回答几个小问题",
      interviewHint: "用自己的话回答就好，不知道时可以直接说“不确定”。",
      planStep: "第 3 步，共 3 步 · 你的搭建方案",
      uploadedSingle: "已上传一张机械臂照片。",
      uploadedMultiple: (count: number) => `已上传 ${count} 张机械臂照片。`,
      initialSingle: "这是一张我的机械臂照片。请分析它，并帮我弄清楚如何控制它。",
      initialMultiple: "这些是我的机械臂照片。请分析它们，并帮我弄清楚如何控制它。",
      generatePlanNow: "请根据目前已知信息，生成最终的架构、搭建和测试方案。",
      inputPlaceholder: "输入你的回答...",
      send: "发送",
      preparing: "正在处理照片...",
      dropzoneTitle: "把机械臂照片拖到这里",
      dropzoneHint: (maxFiles: number) =>
        `也可以拖到这里 · JPEG、PNG 或 WebP · 最多 ${maxFiles} 张`,
      generatePlanButton: "根据现有信息生成方案",
      startOver: "换一个机械臂重新开始",
    },
  },
  es: {
    nav: {
      home: "Inicio",
      about: "Acerca de",
      members: "Miembros",
      diary: "Diario",
      try: "Probar",
      language: "Idioma",
    },
    home: {
      eyebrow: "Asistente de robótica con IA",
      tagline: "Convierte una foto de un brazo robótico en un plan de control funcional.",
      primaryCta: "Probar ahora",
      secondaryCta: "Cómo funciona",
      steps: [
        {
          title: "Sube una foto",
          body: "Toma o elige una foto de tu brazo robótico: kit, proyecto propio o brazo industrial.",
        },
        {
          title: "Responde unas preguntas",
          body: "RoboPrompt identifica lo posible desde la foto y solo pregunta lo que falta.",
        },
        {
          title: "Recibe tu plan",
          body: "Una arquitectura, plan de construcción y plan de pruebas para controlar el efector final.",
        },
      ],
      robotHeading: "Creado para cualquier brazo robótico",
      robotBody:
        "RoboPrompt hace las preguntas correctas para tu hardware y genera un plan que puedes construir.",
      categories: [
        {
          name: "Pequeño y con servos",
          body: "Kits y proyectos propios con Arduino, ESP32 o microcontroladores similares.",
        },
        {
          name: "Grande e industrial",
          body: "Motores sin escobillas y reductores, normalmente con Jetson o ROS2.",
        },
      ],
      finalHeading: "¿Listo para ver tu plan?",
      finalBody: "Sube una foto y empieza en minutos.",
    },
    try: {
      stepLabel: "Paso 1 de 3",
      uploadHeading: "Empecemos con una foto",
      uploadBody: "No necesitas experiencia en robótica. Una foto clara del móvil es suficiente.",
      photoTipsHeading: "Para obtener el mejor resultado",
      photoTips: [
        "Muestra el brazo completo, desde la base hasta la pinza",
        "Usa buena luz y deja visibles las etiquetas",
        "Añade otro ángulo si las piezas se superponen",
      ],
      whatNextHeading: "¿Qué pasará después?",
      whatNextBody:
        "Identificaremos las piezas visibles, haremos preguntas sencillas y crearemos un plan de control paso a paso.",
      privacyNote: "Tus fotos solo se usan para analizar este proyecto.",
      choosePhotos: "Elegir fotos",
      interviewStep: "Paso 2 de 3 · Unas preguntas rápidas",
      interviewHint: "Responde con tus palabras. Siempre puedes decir «No lo sé».",
      planStep: "Paso 3 de 3 · Tu plan de construcción",
      uploadedSingle: "Subí una foto de mi brazo robótico.",
      uploadedMultiple: (count: number) => `Subí ${count} fotos de mi brazo robótico.`,
      initialSingle:
        "Aquí hay una foto de mi brazo robótico. Analízala y ayúdame a descubrir cómo controlarlo.",
      initialMultiple:
        "Aquí hay fotos de mi brazo robótico. Analízalas y ayúdame a descubrir cómo controlarlo.",
      generatePlanNow:
        "Genera ahora el plan final de arquitectura, construcción y pruebas con todo lo que sabes.",
      inputPlaceholder: "Escribe tu respuesta...",
      send: "Enviar",
      preparing: "Preparando fotos...",
      dropzoneTitle: "Arrastra aquí fotos de tu brazo robótico",
      dropzoneHint: (maxFiles: number) =>
        `o arrástralas aquí · JPEG, PNG o WebP · hasta ${maxFiles}`,
      generatePlanButton: "Crear mi plan con lo que tenemos",
      startOver: "Empezar con otro brazo",
    },
  },
} satisfies Record<LanguageCode, unknown>;
