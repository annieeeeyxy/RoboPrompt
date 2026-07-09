import type { Language } from "@/context/LanguageContext";

export const DIARY_CONTENT: Record<Language, string> = {
  en: `# Project Diary

A running log of what happened on RoboPrompt, day by day.

## 2026-07-02

- Set up the initial Next.js project skeleton and added the first README.

## 2026-07-06

- Small README tweak.

## 2026-07-08

- Committed early design docs - an architecture doc, a project pitch, a draft agent system prompt, and initial data types for a robot-arm classification system. (These were later replaced - see below.)
- Cleaned up the README's naming and team-project leftovers.
- Clarified RoboPrompt's actual scope: an AI assistant that turns a photo of a robotic arm into a working control plan - unrelated to the earlier FTC/robotics-coaching framing some of the old docs implied.
- Rebuilt from scratch on a clean slate: a fresh system prompt for the agent, streaming /api/classify and /api/chat routes, an image upload + compression pipeline, a chat interview UI, and a rendered plan view.
- Restructured the site into a proper multi-page project site - Home, About, Members, and Try it (the tool) - instead of a bare chat box.
- Enriched the About page with content pulled from the original pitch deck: the problem statement, the pipeline diagram, a worked example table, and research references.
- Added a profile photo to the Members page.
- Deployed to Vercel at robo-prompt.vercel.app.
- Added this project diary page, seeded from git history.
- Added Dora Ai to the Members page.
- Added a commit-activity chart to the diary page.
- Turned each Members card into its own profile page (/members/[slug]) with GitHub and email links and a WeChat QR code.
- Redesigned the home page: bigger hero with a background glow, icon-based step cards, a "Built for any robot arm" section, and a closing CTA.
- Fixed a 500 error on photo upload in production - sharp's native binary wasn't bundled correctly for Vercel; fixed via serverExternalPackages.
- Added support for uploading multiple photos of the same arm at once.
- Removed the WeChat QR code from Annie's Members profile page.
- Tracked down the real cause of the upload 500: pnpm's default symlinked node_modules layout broke Vercel's deployment packaging, and a version mismatch between our sharp and Next's own internal sharp created a libvips conflict. Fixed by switching to nodeLinker: hoisted and aligning our sharp version to Next's (0.34.5) - upload works in production now.
- Reworked the /try interview flow from a free-text chat into an actual form: the agent now calls a structured ask_form tool (short prompt + typed fields - text/select/textarea) instead of writing prose questions, and the frontend renders real form fields instead of chat bubbles. Kept the final plan as a streamed markdown document. Verified the full classify -> gap-fill form -> summary form -> plan flow via the live API.
- Fixed two blank/black-screen gaps during waits (upload analysis and form submission) by adding a proper loading indicator, and made the final plan stream in live instead of staying hidden behind the spinner.
`,
  es: `# Diario del Proyecto

Un registro continuo de lo que paso en RoboPrompt, dia por dia.

## 2026-07-02

- Se creo la estructura inicial del proyecto Next.js y se anadio el primer README.

## 2026-07-06

- Pequeno ajuste del README.

## 2026-07-08

- Se subieron documentos de diseno tempranos: documento de arquitectura, presentacion del proyecto, borrador del system prompt del agente y tipos de datos iniciales para un sistema de clasificacion de brazos roboticos. (Luego se reemplazaron - ver abajo.)
- Se limpio el README de nombres antiguos y restos de proyecto en equipo.
- Se aclaro el alcance real de RoboPrompt: un asistente de IA que convierte una foto de un brazo robotico en un plan de control funcional, sin relacion con el enfoque anterior de FTC/entrenamiento de robotica que sugerian algunos documentos antiguos.
- Se reconstruyo desde cero: nuevo system prompt del agente, rutas en streaming /api/classify y /api/chat, pipeline de carga + compresion de imagenes, interfaz de entrevista por chat y vista del plan renderizada.
- Se reestructuro el sitio como un proyecto multipagina real - Home, About, Members y Try it (la herramienta) - en lugar de una caja de chat basica.
- Se enriquecio la pagina About con contenido del pitch deck original: planteamiento del problema, diagrama del pipeline, tabla de ejemplo y referencias de investigacion.
- Se agrego una foto de perfil en la pagina Members.
- Se desplego en Vercel: robo-prompt.vercel.app.
- Se agrego esta pagina de diario del proyecto usando el historial de git.
- Se agrego Dora Ai a la pagina Members.
- Se agrego un grafico de actividad de commits en la pagina Diary.
- Cada tarjeta de Members paso a tener su propia pagina de perfil (/members/[slug]) con enlaces de GitHub y correo, y codigo QR de WeChat.
- Se redisenio la pagina principal: hero mas grande con brillo de fondo, tarjetas de pasos con iconos, seccion "Built for any robot arm" y CTA final.
- Se corrigio un error 500 al subir fotos en produccion: el binario nativo de sharp no se empaquetaba bien para Vercel; se resolvio con serverExternalPackages.
- Se anadio soporte para subir varias fotos del mismo brazo a la vez.
- Se elimino el codigo QR de WeChat del perfil de Annie en Members.
- Se encontro la causa real del error 500 de subida: el layout de node_modules con enlaces simbolicos de pnpm rompia el empaquetado de despliegue de Vercel, y un desajuste de versiones entre sharp y el sharp interno de Next provocaba conflicto de libvips. Se resolvio cambiando a nodeLinker: hoisted y alineando nuestra version de sharp con la de Next (0.34.5): la subida ya funciona en produccion.
- Se rehizo el flujo de entrevista de /try: de chat libre a formulario real. El agente ahora llama la herramienta estructurada ask_form (prompt corto + campos tipados - text/select/textarea) en lugar de escribir preguntas en prosa, y el frontend renderiza campos reales en vez de burbujas de chat. Se mantuvo el plan final como documento markdown en streaming. Se verifico el flujo completo classify -> formulario de brechas -> formulario resumen -> plan con la API en vivo.
- Se corrigieron dos huecos de pantalla en blanco/negra durante las esperas (analisis de subida y envio de formulario) anadiendo un indicador de carga correcto, y se habilito el stream en vivo del plan final en lugar de ocultarlo tras el spinner.
`,
  fr: `# Journal du Projet

Journal continu de ce qui s'est passe sur RoboPrompt, jour par jour.

## 2026-07-02

- Mise en place de la structure initiale du projet Next.js et ajout du premier README.

## 2026-07-06

- Petite modification du README.

## 2026-07-08

- Commit des premiers documents de conception : document d'architecture, presentation du projet, brouillon du prompt systeme de l'agent et premiers types de donnees pour un systeme de classification de bras robotiques. (Ils ont ensuite ete remplaces - voir ci-dessous.)
- Nettoyage du README (noms et restes d'ancien projet d'equipe).
- Clarification du vrai perimetre de RoboPrompt : un assistant IA qui transforme une photo de bras robotique en plan de controle fonctionnel, sans lien avec l'ancien angle FTC/coaching robotique visible dans certains anciens documents.
- Reconstruction complete sur une base propre : nouveau prompt systeme, routes streaming /api/classify et /api/chat, pipeline d'upload + compression d'images, UI d'entretien chat et vue de plan rendue.
- Restructuration du site en vrai projet multi-pages - Home, About, Members et Try it (l'outil) - au lieu d'une simple fenetre de chat.
- Enrichissement de la page About avec des contenus du pitch deck d'origine : probleme, schema du pipeline, tableau d'exemple et references de recherche.
- Ajout d'une photo de profil sur la page Members.
- Deploiement sur Vercel : robo-prompt.vercel.app.
- Ajout de cette page journal, initialisee depuis l'historique git.
- Ajout de Dora Ai sur la page Members.
- Ajout d'un graphique d'activite des commits sur la page Diary.
- Chaque carte Members a ete transformee en page profil dediee (/members/[slug]) avec liens GitHub/email et QR code WeChat.
- Refonte de la page d'accueil : hero plus grand avec halo de fond, cartes d'etapes avec icones, section "Built for any robot arm" et CTA final.
- Correction d'une erreur 500 d'upload photo en production : le binaire natif de sharp n'etait pas correctement bundle pour Vercel ; corrige via serverExternalPackages.
- Ajout du support de televersement de plusieurs photos du meme bras.
- Suppression du QR code WeChat du profil Members d'Annie.
- Identification de la cause reelle du 500 d'upload : le layout node_modules symlink par defaut de pnpm cassait le packaging de deploiement Vercel, et un decalage de version entre notre sharp et le sharp interne de Next provoquait un conflit libvips. Correction : passage a nodeLinker: hoisted et alignement de sharp sur la version Next (0.34.5) - l'upload fonctionne maintenant en production.
- Refonte du flux d'entretien /try : passage d'un chat libre a un vrai formulaire. L'agent appelle maintenant un outil ask_form structure (prompt court + champs types - text/select/textarea) au lieu d'ecrire des questions en prose, et le frontend affiche de vrais champs plutot que des bulles de chat. Le plan final reste un document markdown en streaming. Flux complet verifie via l'API live : classify -> formulaire de manques -> formulaire de synthese -> plan.
- Correction de deux zones d'ecran vide/noir pendant l'attente (analyse upload et soumission formulaire) avec un vrai indicateur de chargement, et affichage en streaming du plan final au lieu de le masquer derriere le spinner.
`,
  zh: `# 项目日志

按天记录 RoboPrompt 的开发进展。

## 2026-07-02

- 搭建了初始 Next.js 项目骨架，并添加了第一版 README。

## 2026-07-06

- 对 README 做了小幅修改。

## 2026-07-08

- 提交了早期设计文档：架构文档、项目阐述、代理系统提示词草稿，以及机械臂分类系统的初始数据类型。（这些内容后来被替换，见下文。）
- 清理了 README 中的命名问题和团队项目残留内容。
- 明确了 RoboPrompt 的真实范围：它是一个将机械臂照片转为可执行控制方案的 AI 助手，与旧文档中暗示的 FTC/机器人辅导方向无关。
- 基于干净状态完成重建：全新系统提示词、流式 /api/classify 与 /api/chat 路由、图像上传与压缩流程、聊天访谈界面，以及计划渲染视图。
- 将网站重构为完整多页面项目站点：Home、About、Members、Try it（工具页），而不是单一聊天框。
- 用原始路演材料补充了 About 页面：问题陈述、流程图、示例表格和研究参考。
- 在 Members 页面添加了头像。
- 部署到 Vercel：robo-prompt.vercel.app。
- 新增项目日志页面，并基于 git 历史填充初始内容。
- 在 Members 页面添加 Dora Ai。
- 在 Diary 页面添加提交活跃度图表。
- 将每个 Members 卡片升级为独立资料页（/members/[slug]），含 GitHub/邮箱链接和微信二维码。
- 重做首页设计：更大的 Hero 与背景光晕、图标步骤卡片、“Built for any robot arm”区块和底部 CTA。
- 修复生产环境照片上传 500：sharp 原生二进制在 Vercel 打包不正确；通过 serverExternalPackages 修复。
- 支持一次上传同一机械臂的多张照片。
- 从 Annie 的 Members 资料页移除微信二维码。
- 定位上传 500 的真实原因：pnpm 默认符号链接 node_modules 布局破坏了 Vercel 打包，同时我们的 sharp 与 Next 内部 sharp 版本不一致引发 libvips 冲突。通过改为 nodeLinker: hoisted 并将 sharp 对齐至 Next 的 0.34.5 解决；生产上传恢复正常。
- 将 /try 访谈流程从自由文本聊天改为真实表单：代理改为调用结构化 ask_form 工具（短提示 + 类型化字段：text/select/textarea），前端也改为渲染真实表单字段而非聊天气泡。最终计划仍保持流式 markdown 输出。已通过线上 API 验证 classify -> 补缺表单 -> 汇总表单 -> 计划 全流程。
- 修复等待阶段两处黑屏/空白（上传分析与表单提交）：加入规范加载指示器，并让最终计划实时流式显示，而不是被 spinner 遮挡。
`,
};
