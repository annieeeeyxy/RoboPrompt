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

## 2026-07-09 (overnight batch, self-tested while Annie slept)

- Fixed the select-dropdown dark-mode contrast bug and added an "Other (type my own)" option to every select field so users aren't limited to the given options.
- Added a password gate (SITE_PASSWORD env var, /api/auth, middleware, /login page) protecting /try and every token-spending API route; fails closed in production if the env var isn't set.
- Deepened the system prompt: brand-first SDK detection now applies to small kits too (uArm, Hiwonder, Braccio), and Category B's question flow gained a second, deeper group (payload/torque limits, network topology, MoveIt2/ros2_control status, simulation environment) so the final plan can include real integration code.
- Added reference-file upload at intake: users can attach URDF/xacro, datasheets, existing code, or a zip of their project alongside the photo, each with an optional description.
- Found and fixed a real crash: a race where the SSE stream controller gets closed by the runtime on client disconnect - hardened lib/sse.ts against it.
- Added a "Download code (.zip)" option on the confirmed plan, packaging the generated files into a real zip; verified by unzipping real output - working Arduino firmware, a Web Serial control panel, a Python bridge, and an honest SETUP.md.
- Full regression pass (typecheck, lint, build, local end-to-end smoke test) all clean; production held on SITE_PASSWORD being set in Vercel.
- Annie set SITE_PASSWORD in Vercel and redeployed - confirmed working end-to-end in production.
- Self-tested the full flow in production with a real photo of a LeArm-style hobby-servo kit: brand-first detection correctly named the LewanSoul/Hiwonder LeArm family, walked through the interview, reached a confirmed plan, and generated a real code zip with working Arduino firmware and a Web Serial control panel. Fixed one real bug found in the process: a literal backslash-n in the generated SETUP.md.
- Had an independent agent (Fable) run an adversarial security review; fixed the real findings - a zip-bomb DoS in reference-file upload, unsanitized paths in generated-code zips, non-constant-time credential comparisons on the password gate, and an unvalidated-tool-output crash in /api/generate. Also migrated middleware.ts to proxy.ts for Next.js 16.
- Added real photo thumbnails to the upload/interview screens (previously just a text count) so users can see exactly what they uploaded, with a per-photo remove button.
- Dora Ai pushed a full multilingual feature (English/Spanish/French/Chinese with an AI language policy) directly to main - the first real parallel teammate contribution on this repo. Merged the two branches via rebase, resolving one real conflict in favor of the new thumbnails, and fixed a lint error the merge exposed in the language context.
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

## 2026-07-09 (lote nocturno, autoprobado mientras Annie dormia)

- Se corrigio el error de contraste del menu desplegable en modo oscuro y se agrego una opcion "Other (type my own)" a cada campo select para que los usuarios no esten limitados a las opciones dadas.
- Se agrego una barrera de contrasena (variable SITE_PASSWORD, /api/auth, middleware, pagina /login) que protege /try y cada ruta de API que consume tokens; se bloquea por defecto en produccion si la variable no esta configurada.
- Se profundizo el system prompt: la deteccion de marca/SDK ahora aplica tambien a kits pequenos (uArm, Hiwonder, Braccio), y el flujo de preguntas de la Categoria B gano un segundo grupo mas profundo (limites de carga/torque, topologia de red, estado de MoveIt2/ros2_control, entorno de simulacion) para que el plan final pueda incluir codigo de integracion real.
- Se agrego la carga de archivos de referencia en la entrada: los usuarios pueden adjuntar URDF/xacro, hojas de datos, codigo existente o un zip de su proyecto junto con la foto, cada uno con una descripcion opcional.
- Se encontro y corrigio un fallo real: una condicion de carrera donde el controlador del stream SSE se cerraba por el runtime al desconectarse el cliente - se reforzo lib/sse.ts contra esto.
- Se agrego una opcion "Download code (.zip)" en el plan confirmado, empaquetando los archivos generados en un zip real; verificado descomprimiendo la salida real - firmware Arduino funcional, un panel de control Web Serial, un puente en Python y un SETUP.md honesto.
- Pase de regresion completo (typecheck, lint, build, prueba local de extremo a extremo) todo limpio; verificacion en produccion en espera de que SITE_PASSWORD se configure en Vercel.
- Annie configuro SITE_PASSWORD en Vercel y volvio a desplegar - confirmado funcionando de extremo a extremo en produccion.
- Se autoproblo el flujo completo en produccion con una foto real de un kit tipo LeArm con servos de hobby: la deteccion de marca identifico correctamente la familia LewanSoul/Hiwonder LeArm, se completo la entrevista, se llego a un plan confirmado y se genero un zip de codigo real con firmware Arduino funcional y un panel Web Serial. Se corrigio un error real encontrado en el proceso: un backslash-n literal en el SETUP.md generado.
- Un agente independiente (Fable) realizo una revision de seguridad adversarial; se corrigieron los hallazgos reales - un DoS de zip bomb en la carga de archivos de referencia, rutas sin sanitizar en los zips de codigo generado, comparaciones de credenciales sin tiempo constante en la barrera de contrasena, y un fallo por salida de herramienta sin validar en /api/generate. Tambien se migro middleware.ts a proxy.ts para Next.js 16.
- Se agregaron miniaturas reales de las fotos en las pantallas de carga/entrevista (antes solo un conteo de texto) para que los usuarios vean exactamente lo que subieron, con un boton para eliminar cada foto.
- Dora Ai subio una funcion multilingue completa (ingles/espanol/frances/chino con una politica de idioma para la IA) directamente a main - la primera contribucion real de una companera de equipo en paralelo en este repositorio. Se fusionaron ambas ramas mediante rebase, resolviendo un conflicto real a favor de las nuevas miniaturas, y se corrigio un error de lint que la fusion expuso en el contexto de idioma.
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

## 2026-07-09 (lot de nuit, auto-teste pendant qu'Annie dormait)

- Correction du bug de contraste du menu deroulant en mode sombre et ajout d'une option "Other (type my own)" a chaque champ select pour que les utilisateurs ne soient plus limites aux options proposees.
- Ajout d'une barriere de mot de passe (variable SITE_PASSWORD, /api/auth, middleware, page /login) protegeant /try et toutes les routes API qui consomment des tokens ; bloque par defaut en production si la variable n'est pas definie.
- Approfondissement du system prompt : la detection marque/SDK s'applique desormais aussi aux petits kits (uArm, Hiwonder, Braccio), et le flux de questions de la Categorie B a gagne un second groupe plus approfondi (limites de charge/couple, topologie reseau, etat MoveIt2/ros2_control, environnement de simulation) pour que le plan final puisse inclure du vrai code d'integration.
- Ajout du televersement de fichiers de reference a l'entree : les utilisateurs peuvent joindre URDF/xacro, fiches techniques, code existant ou un zip de leur projet avec la photo, chacun avec une description optionnelle.
- Un vrai bug a ete trouve et corrige : une condition de course ou le controleur du flux SSE etait ferme par le runtime lors d'une deconnexion client - lib/sse.ts a ete durci contre cela.
- Ajout d'une option "Download code (.zip)" sur le plan confirme, empaquetant les fichiers generes dans un vrai zip ; verifie en decompressant la sortie reelle - firmware Arduino fonctionnel, panneau de controle Web Serial, pont Python et un SETUP.md honnete.
- Passage de regression complet (typecheck, lint, build, test local de bout en bout) tout propre ; verification en production en attente de la definition de SITE_PASSWORD sur Vercel.
- Annie a defini SITE_PASSWORD sur Vercel et redeploye - confirme fonctionnel de bout en bout en production.
- Auto-test du flux complet en production avec une vraie photo d'un kit type LeArm a servos loisir : la detection de marque a correctement identifie la famille LewanSoul/Hiwonder LeArm, l'entretien s'est deroule jusqu'au plan confirme, et un vrai zip de code a ete genere avec un firmware Arduino fonctionnel et un panneau Web Serial. Un vrai bug trouve dans le processus a ete corrige : un backslash-n litteral dans le SETUP.md genere.
- Un agent independant (Fable) a mene une revue de securite adversariale ; les vraies failles ont ete corrigees - un DoS de type zip bomb dans le televersement de fichiers de reference, des chemins non assainis dans les zips de code genere, des comparaisons d'identifiants sans temps constant sur la barriere de mot de passe, et un plantage du a une sortie d'outil non validee dans /api/generate. middleware.ts a aussi ete migre vers proxy.ts pour Next.js 16.
- Ajout de vraies miniatures des photos sur les ecrans d'upload/entretien (avant, juste un compteur textuel) pour que les utilisateurs voient exactement ce qu'ils ont televerse, avec un bouton de suppression par photo.
- Dora Ai a pousse une fonctionnalite multilingue complete (anglais/espagnol/francais/chinois avec une politique de langue pour l'IA) directement sur main - la premiere vraie contribution en parallele d'une coequipiere sur ce repo. Les deux branches ont ete fusionnees par rebase, en resolvant un vrai conflit en faveur des nouvelles miniatures, et en corrigeant une erreur de lint que la fusion a revelee dans le contexte de langue.
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

## 2026-07-09（通宵批次，趁 Annie 睡觉时自测）

- 修复了下拉菜单在深色模式下对比度不足（文字看不清）的问题，并为每个下拉字段添加了"其他（自行输入）"选项，用户不再局限于给定选项。
- 新增密码门禁（SITE_PASSWORD 环境变量、/api/auth、中间件、/login 页面），保护 /try 及所有消耗 token 的 API 路由；生产环境下若未设置该变量则默认锁死。
- 深化了系统提示词：品牌优先的 SDK 识别现在也适用于小型套件（uArm、Hiwonder、Braccio），Category B 的提问流程新增了更深入的第二组问题（负载/扭矩限制、网络拓扑、MoveIt2/ros2_control 状态、仿真环境），使最终方案能包含真实的集成代码。
- 在上传阶段新增参考文件上传：用户可随照片一并上传 URDF/xacro、数据手册、现有代码或项目 zip 包，并可为每个文件添加说明。
- 发现并修复了一个真实崩溃：客户端断开连接时，SSE 流的控制器会被运行时关闭，存在竞态条件——已加固 lib/sse.ts。
- 在已确认的方案上新增"下载代码（.zip）"选项，将生成的文件打包为真实 zip；通过实际解压验证输出——可用的 Arduino 固件、配套的 Web Serial 控制面板、Python 桥接程序，以及真实的 SETUP.md。
- 完整回归测试（类型检查、lint、构建、本地端到端测试）全部通过；生产环境验证需等待 Vercel 上设置 SITE_PASSWORD。
- Annie 在 Vercel 上设置了 SITE_PASSWORD 并重新部署——确认生产环境端到端可用。
- 用 Annie 提供的真实照片（LeArm 风格的业余舵机套件）在生产环境自测了完整流程：品牌优先识别准确判断出 LewanSoul/Hiwonder LeArm 系列，完成访谈后得到确认方案，并生成了真实代码 zip，内含可用的 Arduino 固件和 Web Serial 控制面板。过程中发现并修复了一个真实 bug：生成的 SETUP.md 中出现了字面上的反斜杠 n 而非真正换行。
- 让独立的 Fable 代理进行了一次对抗性安全审查；验证并修复了真实问题——参考文件上传中的 zip 炸弹 DoS 漏洞、生成代码 zip 中未净化的路径、密码门禁中非恒定时间的凭证比较，以及 /api/generate 中未校验工具输出导致的崩溃。同时将 middleware.ts 迁移为 proxy.ts 以适配 Next.js 16。
- 在上传/访谈界面新增了真实照片缩略图（此前只有文字数量提示），用户可以清楚看到自己上传了什么，并可逐张移除。
- 队友 Dora Ai 直接向 main 推送了一个完整的多语言功能（英/西/法/中，并配有 AI 语言策略），这是本仓库首次真正的并行队友贡献。通过 rebase 合并了两条分支，解决了一处真实冲突（采用了新的缩略图方案），并修复了合并过程中暴露出的语言上下文里的一个 lint 错误。
`,
};
