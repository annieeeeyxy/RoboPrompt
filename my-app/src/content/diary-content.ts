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
`,
};
