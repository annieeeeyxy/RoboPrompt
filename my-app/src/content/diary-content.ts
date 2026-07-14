import type { Language } from "@/context/LanguageContext";

export const DIARY_CONTENT: Record<Language, string> = {
  en: `# Project Diary

A running log of what happened on RoboPrompt, day by day.

## 2026-07-02 - Project kickoff

- Set up the initial Next.js project and the first README.

## 2026-07-06

- Small README tweak.

## 2026-07-08 - Found the real product, rebuilt it

- Cleaned up the README and clarified what RoboPrompt actually is: an AI assistant that turns a photo of a robotic arm into a working control plan.
- Rebuilt the whole app from scratch - a proper agent system prompt, streaming classify/chat API routes, image upload, an interview UI, and a rendered plan view.
- Turned the single chat page into a full site (Home, About, Members, Try it), added member profile pages, and deployed to Vercel.
- Fixed a production photo-upload crash (a native-binary packaging issue with pnpm and sharp).
- Reworked the interview from free-text chat into real structured forms, and fixed loading-state gaps so nothing looks frozen while waiting.

## 2026-07-09 - Overnight hardening and code generation, then merged with multilingual support

- Fixed a dark-mode UI bug, added a password gate protecting the whole tool so token usage can't be abused, and deepened the agent's questions so it gathers everything needed for a real build, not just a rough idea.
- Added the ability to attach reference files (datasheets, existing code, CAD/URDF) alongside the photo.
- Added a "Download code (.zip)" option that generates a real, working project (firmware, control panel, README) from the confirmed plan.
- Ran a full regression pass and a live production self-test end-to-end with a real robot arm photo - confirmed everything works.
- Had an independent security review done and fixed everything it found (a zip-bomb vulnerability, unsafe file paths, insecure comparisons).
- Added photo thumbnails so users can see what they uploaded.
- Merged in a teammate's (Dora Ai) multilingual feature (English/Spanish/French/Chinese) that landed on main in parallel - resolved the overlap and backfilled the diary translations.
- Rebranded the site to a fixed black-and-pink theme with a new robot logo.
- Made the tool feel like a real product: CI now checks every push, an interview survives a page refresh, and a finished plan can be revised with feedback (e.g. "switch to ESP32") instead of starting over.

## 2026-07-10 - Faster, cheaper, and two production bugs squashed

- Fixed the intermittent 504 when downloading code: generation regularly runs past two minutes, but the serverless function was capped at exactly that — raised the limit and added a friendly timeout message.
- Switched the interview to a faster model (Haiku): photo analysis and questions now respond in 2-5 seconds instead of 8-11, at a tenth of the cost, while code generation stays on Sonnet for quality. Live-testing the switch surfaced three protocol weaknesses (prose drift, a fenced plan marker breaking detection, endless follow-up questions after confirmation) — all fixed for every model.
- Fixed a crash on "Download code" ("e.forEach is not a function"): the model occasionally double-encodes its file list as a JSON string — output is now normalized and recovered, covered by unit tests and a real-browser click test.
- Added a clear start-over path, refined the interview button hierarchy, and rebuilt the waiting indicator around the robot logo.
- Hardened the product with safe redirects, API rate limits, broader tests and documentation, stronger CI, and a corrected pnpm setup for reliable Vercel deploys.
- Replaced the finished plan's text wall with themed section cards and expanded the Members page with the rest of the team.

## 2026-07-11 - More natural multilingual conversations

- Improved adaptive language matching so replies follow the user's actual message while still respecting the selected interface language.

## 2026-07-13 - Friendlier onboarding for beginners

- Reworked the upload, interview, and plan flow into three clearly labeled steps, with photo tips, plain-language guidance, a privacy note, and complete copy in all four supported languages.
`,
  es: `# Diario del Proyecto

Un registro continuo de lo que paso en RoboPrompt, dia por dia.

## 2026-07-02 - Inicio del proyecto

- Se creo el proyecto inicial en Next.js y el primer README.

## 2026-07-06

- Pequeno ajuste del README.

## 2026-07-08 - Se encontro el producto real y se reconstruyo

- Se limpio el README y se aclaro que es realmente RoboPrompt: un asistente de IA que convierte una foto de un brazo robotico en un plan de control funcional.
- Se reconstruyo toda la aplicacion desde cero: un system prompt de agente propio, rutas de streaming classify/chat, carga de imagenes, interfaz de entrevista y vista de plan renderizada.
- Se transformo la pagina de chat unica en un sitio completo (Home, About, Members, Try it), se agregaron paginas de perfil de los miembros, y se desplego en Vercel.
- Se corrigio un fallo de subida de fotos en produccion (un problema de empaquetado nativo con pnpm y sharp).
- Se rehizo la entrevista de chat libre a formularios estructurados reales, y se corrigieron los huecos de carga para que nada se vea congelado durante la espera.

## 2026-07-09 - Refuerzo nocturno y generacion de codigo, luego fusion con soporte multilingue

- Se corrigio un bug de UI en modo oscuro, se agrego una barrera de contrasena que protege toda la herramienta para evitar abuso del consumo de tokens, y se profundizaron las preguntas del agente para que reuna todo lo necesario para una construccion real, no solo una idea aproximada.
- Se agrego la posibilidad de adjuntar archivos de referencia (hojas de datos, codigo existente, CAD/URDF) junto con la foto.
- Se agrego la opcion "Download code (.zip)" que genera un proyecto real y funcional (firmware, panel de control, README) a partir del plan confirmado.
- Se hizo un pase de regresion completo y una autoprueba en produccion de extremo a extremo con una foto real de un brazo robotico - todo funciono.
- Se realizo una revision de seguridad independiente y se corrigio todo lo que encontro (una vulnerabilidad de zip bomb, rutas de archivo inseguras, comparaciones inseguras).
- Se agregaron miniaturas de fotos para que los usuarios vean lo que subieron.
- Se fusiono la funcion multilingue de una companera de equipo (Dora Ai, ingles/espanol/frances/chino) que llego a main en paralelo - se resolvio el solape y se completaron las traducciones del diario.
- Se cambio la imagen del sitio a un tema fijo negro y rosa con un nuevo logo de robot.
- La herramienta ahora se siente como un producto real: CI verifica cada push, una entrevista sobrevive a un refresco de pagina, y un plan terminado se puede revisar con comentarios (p. ej. "cambia a ESP32") en lugar de empezar de cero.

## 2026-07-10 - Mas rapido, mas barato, y dos bugs de produccion resueltos

- Se corrigio el 504 intermitente al descargar codigo: la generacion suele superar los dos minutos, pero la funcion serverless estaba limitada exactamente a eso — se elevo el limite y se agrego un mensaje de timeout amigable.
- La entrevista ahora usa un modelo mas rapido (Haiku): el analisis de fotos y las preguntas responden en 2-5 segundos en lugar de 8-11, a una decima parte del costo, mientras la generacion de codigo sigue en Sonnet por calidad. Las pruebas en vivo revelaron tres debilidades del protocolo — todas corregidas para cualquier modelo.
- Se corrigio un fallo en "Descargar codigo" ("e.forEach is not a function"): el modelo a veces codifica doblemente su lista de archivos como cadena JSON — la salida ahora se normaliza y recupera, con pruebas unitarias y una prueba de clic en navegador real.
- Se agrego una forma clara de empezar de nuevo, se refino la jerarquia de botones de la entrevista y se rediseño el indicador de espera alrededor del logo del robot.
- Se reforzo el producto con redirecciones seguras, limites de uso en las API, mas pruebas y documentacion, una CI mas solida y una configuracion de pnpm corregida para despliegues fiables en Vercel.
- Se reemplazo el muro de texto del plan final por tarjetas tematicas y se amplio la pagina de miembros con el resto del equipo.

## 2026-07-11 - Conversaciones multilingues mas naturales

- Se mejoro la adaptacion automatica del idioma para que las respuestas sigan el mensaje real del usuario sin dejar de respetar el idioma elegido para la interfaz.

## 2026-07-13 - Una introduccion mas sencilla para principiantes

- Se reorganizo el flujo de carga, entrevista y plan en tres pasos claramente identificados, con consejos para las fotos, instrucciones sencillas, una nota de privacidad y textos completos en los cuatro idiomas compatibles.
`,
  fr: `# Journal du Projet

Journal continu de ce qui s'est passe sur RoboPrompt, jour par jour.

## 2026-07-02 - Lancement du projet

- Mise en place du projet Next.js initial et du premier README.

## 2026-07-06

- Petite modification du README.

## 2026-07-08 - Le vrai produit a ete trouve, puis reconstruit

- Nettoyage du README et clarification de ce qu'est vraiment RoboPrompt : un assistant IA qui transforme une photo de bras robotique en plan de controle fonctionnel.
- Reconstruction complete de l'application : nouveau prompt systeme de l'agent, routes streaming classify/chat, upload d'images, UI d'entretien et vue de plan rendue.
- Transformation de la simple page de chat en site complet (Home, About, Members, Try it), ajout de pages de profil pour les membres, et deploiement sur Vercel.
- Correction d'un plantage de l'upload photo en production (probleme de packaging natif avec pnpm et sharp).
- Passage de l'entretien en chat libre a de vrais formulaires structures, et correction des trous de chargement pour que rien ne semble fige pendant l'attente.

## 2026-07-09 - Renforcement de nuit et generation de code, puis fusion avec le support multilingue

- Correction d'un bug d'UI en mode sombre, ajout d'une barriere de mot de passe protegeant tout l'outil pour eviter les abus de consommation de tokens, et approfondissement des questions de l'agent pour qu'il recueille tout ce qu'il faut pour une vraie realisation, pas juste une idee approximative.
- Ajout de la possibilite de joindre des fichiers de reference (fiches techniques, code existant, CAD/URDF) avec la photo.
- Ajout d'une option "Download code (.zip)" qui genere un vrai projet fonctionnel (firmware, panneau de controle, README) a partir du plan confirme.
- Passage de regression complet et auto-test de bout en bout en production avec une vraie photo de bras robotique - tout a fonctionne.
- Revue de securite independante realisee, et tout ce qu'elle a trouve a ete corrige (une vulnerabilite de type zip bomb, des chemins de fichiers non securises, des comparaisons non securisees).
- Ajout de miniatures des photos pour que les utilisateurs voient ce qu'ils ont televerse.
- Fusion de la fonctionnalite multilingue d'une coequipiere (Dora Ai, anglais/espagnol/francais/chinois) arrivee sur main en parallele - chevauchement resolu et traductions du journal completees.
- Nouvelle identite visuelle : theme fixe noir et rose avec un nouveau logo robot.
- L'outil ressemble maintenant a un vrai produit : la CI verifie chaque push, un entretien survit a un rafraichissement de page, et un plan termine peut etre revise avec des retours (p. ex. "passer a l'ESP32") au lieu de tout recommencer.

## 2026-07-10 - Plus rapide, moins cher, et deux bugs de production corriges

- Correction du 504 intermittent au telechargement du code : la generation depasse souvent deux minutes, mais la fonction serverless etait plafonnee exactement a cela — limite relevee et message de timeout convivial ajoute.
- L'entretien passe sur un modele plus rapide (Haiku) : l'analyse photo et les questions repondent en 2-5 secondes au lieu de 8-11, pour un dixieme du cout, tandis que la generation de code reste sur Sonnet pour la qualite. Les tests en direct ont revele trois faiblesses du protocole — toutes corrigees pour tous les modeles.
- Correction d'un plantage sur "Telecharger le code" ("e.forEach is not a function") : le modele encode parfois doublement sa liste de fichiers en chaine JSON — la sortie est desormais normalisee et recuperee, couverte par des tests unitaires et un test de clic en navigateur reel.
- Ajout d'un moyen clair de recommencer, amelioration de la hierarchie des boutons de l'entretien et refonte de l'indicateur d'attente autour du logo robot.
- Renforcement du produit avec des redirections sures, des limites de requetes API, davantage de tests et de documentation, une CI plus robuste et une configuration pnpm corrigee pour des deploiements Vercel fiables.
- Remplacement du bloc de texte du plan final par des cartes thematiques et ajout du reste de l'equipe a la page Membres.

## 2026-07-11 - Des conversations multilingues plus naturelles

- Amelioration de l'adaptation automatique de la langue pour que les reponses suivent le message reel de l'utilisateur tout en respectant la langue choisie pour l'interface.

## 2026-07-13 - Un accueil plus simple pour les debutants

- Reorganisation du parcours d'upload, d'entretien et de plan en trois etapes clairement indiquees, avec conseils photo, instructions simples, note de confidentialite et textes complets dans les quatre langues prises en charge.
`,
  zh: `# 项目日志

按天记录 RoboPrompt 的开发进展。

## 2026-07-02 —— 项目启动

- 搭建了初始 Next.js 项目，写了第一版 README。

## 2026-07-06

- 对 README 做了小幅修改。

## 2026-07-08 —— 找准了真正的产品方向，并重建

- 清理了 README，明确了 RoboPrompt 究竟是什么：一个把机械臂照片转成可执行控制方案的 AI 助手。
- 从零重建了整个应用：全新的代理系统提示词、流式 classify/chat 接口、图片上传、访谈界面和方案渲染视图。
- 把单一聊天页面改造成完整网站（首页、关于、团队成员、试用页），为团队成员加了个人主页，并部署到 Vercel。
- 修复了生产环境的照片上传崩溃问题（pnpm 与 sharp 的打包问题）。
- 把访谈从自由文本聊天改成了真正的结构化表单，并修复了等待过程中的卡顿/黑屏问题。

## 2026-07-09 —— 通宵加固与代码生成，随后合并多语言功能

- 修复了深色模式的界面 bug，加了密码门禁保护整个工具（防止 token 被滥用），并深化了代理的提问逻辑，让它能收集到真正开工所需的全部信息，而不只是一个大概方向。
- 支持在上传照片时一并附带参考文件（数据手册、现有代码、CAD/URDF）。
- 新增"下载代码（.zip）"功能，能根据确认后的方案生成真实可用的项目（固件、控制面板、README）。
- 做了完整回归测试，并在生产环境用一张真实机械臂照片跑通了全流程自测。
- 找人做了一次独立安全审查，并修复了发现的所有问题（zip 炸弹漏洞、不安全的文件路径、不安全的比较逻辑）。
- 新增了照片缩略图，方便用户看清自己上传了什么。
- 合并了队友 Dora Ai 并行开发的多语言功能（英/西/法/中）——处理了冲突，并补全了日志的翻译内容。
- 网站换上固定的黑粉配色主题和全新的机器人 logo。
- 工具向真正的产品迈进：每次 push 都有 CI 自动检查，访谈进度刷新页面不再丢失，生成的方案可以直接提修改意见（比如"改用 ESP32"）迭代，无需重头再来。

## 2026-07-10 —— 更快、更省，修掉两个生产 bug

- 修复了下载代码偶发的 504：代码生成经常超过两分钟，而 serverless 函数的时限恰好卡在两分钟——上调了时限，并加了友好的超时提示。
- 访谈切换到更快的模型（Haiku）：照片分析和提问的响应从 8-11 秒降到 2-5 秒，成本降到十分之一；代码生成仍用 Sonnet 保证质量。切换时的实测暴露了三个协议弱点（偏离表单协议、方案标记被代码围栏包裹导致检测失败、确认后无限追问）——已全部修复，对任何模型都生效。
- 修复了"下载代码"的崩溃（"e.forEach is not a function"）：模型偶尔会把文件列表双重编码成 JSON 字符串——现在会自动归一化恢复，并配有单元测试和真实浏览器点击测试。
- 增加了清晰的重新开始入口，优化了访谈按钮的层级，并围绕机器人 logo 重新设计了等待动画。
- 进一步加固产品：加入安全重定向、API 限流、更全面的测试和文档、更可靠的 CI，并修正 pnpm 配置以保证 Vercel 稳定部署。
- 把最终方案从大段文字改成主题卡片，并在成员页面补充了其余团队成员。

## 2026-07-11 —— 更自然的多语言对话

- 改进了自适应语言匹配，让回复能跟随用户实际输入的语言，同时仍尊重所选的界面语言。

## 2026-07-13 —— 对新手更友好的引导流程

- 把上传、访谈和方案整理成三个清晰标注的步骤，加入拍照建议、通俗说明、隐私提示，并为四种支持语言补齐全部文案。
`,
};
