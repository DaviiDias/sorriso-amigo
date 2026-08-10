// Porta em que a API roda quando o front e servido por outro servidor (ex.: Live Server).
const API_PORT = "4000";

function resolveApiBase() {
	// Permite forcar a URL da API pelo console: localStorage.sorriso_api_base = "http://192.168.0.10:4000/api"
	const override = localStorage.getItem("sorriso_api_base");
	if (override) {
		return override.replace(/\/$/, "");
	}

	if (window.location.protocol === "file:") {
		return `http://localhost:${API_PORT}/api`;
	}

	// Front aberto em outra porta (Live Server, Vite, etc.): aponta para a API
	// no mesmo host, trocando so a porta. Assim funciona tambem pelo IP da rede,
	// o que permite testar pelo celular.
	if (window.location.port && window.location.port !== API_PORT) {
		return `${window.location.protocol}//${window.location.hostname}:${API_PORT}/api`;
	}

	return `${window.location.origin}/api`;
}

const API_BASE = resolveApiBase();

const state = {
	token: localStorage.getItem("sorriso_token") || "",
	user: null,
	quizQuestions: [],
	guideModalStep: null,
	guideCarouselIndex: 0,
	reminderTimer: null,
	lastNotificationKey: "",
	currentQuestionIndex: 0,
	selectedOptionId: null,
	quizAnswers: [],
	quizState: "start",
	offlineMode: false,
	completedGuideStepIds: new Set()
};

const runtimeConfig = {
	publicAccessMode: false
};

// Modo temporario para demonstracao sem backend ativo.
const QUICK_ACCESS_MODE = false;
const QUICK_ACCESS_TOKEN = "quick-access-demo-token";
const demoStore = createDemoStore();
const OFFLINE_STORE_KEY = "sorriso_offline_store";

const dom = {
	landing: document.querySelector("#landing"),
	appShell: document.querySelector("#appShell"),
	authHero: document.querySelector("#authHero"),
	authColumn: document.querySelector(".auth-column"),
	authSwitch: document.querySelector(".auth-switch"),
	showAboutBtn: document.querySelector("#showAboutBtn"),
	showLoginBtn: document.querySelector("#showLoginBtn"),
	showRegisterBtn: document.querySelector("#showRegisterBtn"),
	loginForm: document.querySelector("#loginForm"),
	registerForm: document.querySelector("#registerForm"),
	verifyPhoneForm: document.querySelector("#verifyPhoneForm"),
	verifyPhoneTarget: document.querySelector("#verifyPhoneTarget"),
	verifyPhoneCode: document.querySelector("#verifyPhoneCode"),
	resendVerifyCodeBtn: document.querySelector("#resendVerifyCodeBtn"),
	forgotPasswordBtn: document.querySelector("#forgotPasswordBtn"),
	forgotPasswordForm: document.querySelector("#forgotPasswordForm"),
	forgotPhone: document.querySelector("#forgotPhone"),
	resetCodeForm: document.querySelector("#resetCodeForm"),
	resetCodeTarget: document.querySelector("#resetCodeTarget"),
	resetCodeInput: document.querySelector("#resetCodeInput"),
	resendResetCodeBtn: document.querySelector("#resendResetCodeBtn"),
	newPasswordForm: document.querySelector("#newPasswordForm"),
	logoutBtn: document.querySelector("#logoutBtn"),
	statusBar: document.querySelector("#statusBar"),
	landingInstitutionLogosGrid: document.querySelector("#landingInstitutionLogosGrid"),
	tabButtons: Array.from(document.querySelectorAll(".tab-btn")),
	sections: Array.from(document.querySelectorAll(".app-section")),
	monthInput: document.querySelector("#monthInput"),
	adherenceValue: document.querySelector("#adherenceValue"),
	completedValue: document.querySelector("#completedValue"),
	brushingsGoalHint: document.querySelector("#brushingsGoalHint"),
	trackedDaysValue: document.querySelector("#trackedDaysValue"),
	resistanceHint: document.querySelector("#resistanceHint"),
	dashboardChart: document.querySelector("#dashboardChart"),
	dashboardChartPanel: document.querySelector(".dashboard-chart-panel"),
	dashboardChartPanelTitle: document.querySelector(".dashboard-chart-panel h3"),
	dashboardChartPanelSubtitle: document.querySelector(".dashboard-chart-panel .dashboard-panel-subtitle"),
	dashboardMonthHeatmap: document.querySelector("#dashboardMonthHeatmap"),
	dashboardHeatmapLegend: document.querySelector(".dashboard-heatmap-legend"),
	dashboardPeriodBars: document.querySelector("#dashboardPeriodBars"),
	dashboardAttentionList: document.querySelector("#dashboardAttentionList"),
	dashboardAttentionPagination: document.querySelector("#dashboardAttentionPagination"),
	dashboardQuizSummary: document.querySelector("#dashboardQuizSummary"),
	dashboardRecentQuiz: document.querySelector("#dashboardRecentQuiz"),
	dashboardChartToggleButtons: Array.from(document.querySelectorAll("[data-chart-range]")),
	checklistForm: document.querySelector("#checklistForm"),
	checklistDate: document.querySelector("#checklistDate"),
	guideContainer: document.querySelector("#guideContainer"),
	guideProgressSummary: document.querySelector("#guideProgressSummary"),
	guideStepModal: document.querySelector("#guideStepModal"),
	guideStepModalBackdrop: document.querySelector("#guideStepModalBackdrop"),
	guideCarouselPrev: document.querySelector("#guideCarouselPrev"),
	guideCarouselNext: document.querySelector("#guideCarouselNext"),
	guideCarouselTrack: document.querySelector("#guideCarouselTrack"),
	guideCarouselCounter: document.querySelector("#guideCarouselCounter"),
	guideModalKicker: document.querySelector("#guideModalKicker"),
	guideStepModalTitle: document.querySelector("#guideStepModalTitle"),
	guideStepModalDescription: document.querySelector("#guideStepModalDescription"),
	guideStepModalDetails: document.querySelector("#guideStepModalDetails"),
	guideStepModalConclude: document.querySelector("#guideStepModalConclude"),
	institutionLogosGrid: document.querySelector("#institutionLogosGrid"),
	institutionModal: document.querySelector("#institutionModal"),
	institutionModalBackdrop: document.querySelector("#institutionModalBackdrop"),
	institutionModalPreview: document.querySelector("#institutionModalPreview"),
	institutionModalKicker: document.querySelector("#institutionModalKicker"),
	institutionModalTitle: document.querySelector("#institutionModalTitle"),
	institutionModalContent: document.querySelector("#institutionModalContent"),
	institutionModalClose: document.querySelector("#institutionModalClose"),
	quizContainerBox: document.querySelector("#quizContainerBox"),
	quizStateStart: document.querySelector("#quizStateStart"),
	quizStateActive: document.querySelector("#quizStateActive"),
	quizStateResults: document.querySelector("#quizStateResults"),
	quizStartBtn: document.querySelector("#quizStartBtn"),
	quizExitHeaderBtn: document.querySelector("#quizExitHeaderBtn"),
	quizExitFooterBtn: document.querySelector("#quizExitFooterBtn"),
	quizProgressBar: document.querySelector("#quizProgressBar"),
	quizQuestionCategory: document.querySelector("#quizQuestionCategory"),
	quizQuestionContainer: document.querySelector(".quiz-question-container"),
	quizQuestionText: document.querySelector("#quizQuestionText"),
	quizOptionsGrid: document.querySelector("#quizOptionsGrid"),
	quizFeedbackContainer: document.querySelector("#quizFeedbackContainer"),
	quizFeedbackIcon: document.querySelector("#quizFeedbackIcon"),
	quizFeedbackTitle: document.querySelector("#quizFeedbackTitle"),
	quizFeedbackExplanation: document.querySelector("#quizFeedbackExplanation"),
	quizActionBtn: document.querySelector("#quizActionBtn"),
	quizResultsScore: document.querySelector("#quizResultsScore"),
	quizResultsPercentage: document.querySelector("#quizResultsPercentage"),
	quizResultsFeedbackList: document.querySelector("#quizResultsFeedbackList"),
	quizRestartBtn: document.querySelector("#quizRestartBtn"),
	videoContainer: document.querySelector("#videoContainer"),
	preferencesForm: document.querySelector("#preferencesForm"),
	dashboardDayDetailModal: document.querySelector("#dashboardDayDetailModal"),
	dashboardDayDetailModalBackdrop: document.querySelector("#dashboardDayDetailModalBackdrop"),
	dashboardDayDetailModalClose: document.querySelector("#dashboardDayDetailModalClose"),
	dashboardDayDetailModalTitle: document.querySelector("#dashboardDayDetailModalTitle"),
	dashboardDayDetailModalSubtitle: document.querySelector("#dashboardDayDetailModalSubtitle"),
	dashboardDayDetailRowMorning: document.querySelector("#dashboardDayDetailRowMorning"),
	dashboardDayDetailRowAfternoon: document.querySelector("#dashboardDayDetailRowAfternoon"),
	dashboardDayDetailRowNight: document.querySelector("#dashboardDayDetailRowNight"),
	dashboardDayDetailMorningPeriodIcon: document.querySelector("#dashboardDayDetailMorningPeriodIcon"),
	dashboardDayDetailMorningResistanceIcon: document.querySelector("#dashboardDayDetailMorningResistanceIcon"),
	dashboardDayDetailMorningNote: document.querySelector("#dashboardDayDetailMorningNote"),
	dashboardDayDetailAfternoonPeriodIcon: document.querySelector("#dashboardDayDetailAfternoonPeriodIcon"),
	dashboardDayDetailAfternoonResistanceIcon: document.querySelector("#dashboardDayDetailAfternoonResistanceIcon"),
	dashboardDayDetailAfternoonNote: document.querySelector("#dashboardDayDetailAfternoonNote"),
	dashboardDayDetailNightPeriodIcon: document.querySelector("#dashboardDayDetailNightPeriodIcon"),
	dashboardDayDetailNightResistanceIcon: document.querySelector("#dashboardDayDetailNightResistanceIcon"),
	dashboardDayDetailNightNote: document.querySelector("#dashboardDayDetailNightNote"),
	reminderEnabled: document.querySelector("#reminderEnabled"),
	reminderTimes: document.querySelector("#reminderTimes"),
	accessibilityMode: document.querySelector("#accessibilityMode"),
	themeMode: document.querySelector("#themeMode"),
	confirmModal: document.querySelector("#confirmModal"),
	confirmModalBackdrop: document.querySelector("#confirmModalBackdrop"),
	confirmModalIcon: document.querySelector("#confirmModalIcon"),
	confirmModalTitle: document.querySelector("#confirmModalTitle"),
	confirmModalMessage: document.querySelector("#confirmModalMessage"),
	confirmModalCancel: document.querySelector("#confirmModalCancel"),
	confirmModalConfirm: document.querySelector("#confirmModalConfirm")
};

let confirmModalResolver = null;

const dashboardCache = {
	month: "",
	monthItems: [],
	recentItems: [],
	attempts: [],
	chartRange: "month",
	attentionPage: 1
};

const institutionCards = [
	{
		id: "unesp",
		title: "UNESP",
		kicker: "Universidade parceira",
		logoUrl: "./assets/instituições_logos/Logo - Unesp.png",
		previewType: "image",
		accent: "#119be0",
		content: [
			{
				headline: "Sobre a UNESP",
				text: 'Universidade Estadual Paulista "Júlio de Mesquita Filho" (Unesp) é uma universidade pública brasileira, com atuação no ensino, na pesquisa e na extensão de serviços à comunidade. A instituição é uma das quatro universidades mantidas pelo governo do estado de São Paulo, ao lado da Universidade de São Paulo (USP), Universidade Estadual de Campinas (Unicamp) e da Universidade Virtual do Estado de São Paulo (Univesp). Em 2024, a Unesp foi eleita a quinta melhor universidade da América Latina pela revista Times Higher Education.'
			},
			{
				headline: "História e Estrutura",
				text: 'Criada em 1976 a partir de institutos isolados de ensino superior que existiam em várias regiões do estado, a Unesp possui cerca de 40 mil estudantes e 3 mil professores espalhados por 32 faculdades e institutos, que oferecem 168 cursos de graduação e 114 cursos de pós-graduação, em 64 profissões de nível superior.'
			},
			{
				headline: "Reconhecimento Internacional",
				text: 'A instituição é considerada uma das melhores universidades do Brasil, da América Latina, dos BRICS, dos países emergentes e uma das 100 melhores universidades jovens do mundo por diferentes classificações internacionais. Além disso, a UNESCO apontou a Unesp como a segunda universidade brasileira em números de artigos científicos de nível internacional, sendo responsável por 8% da produção científica nacional, ao lado da Unicamp e atrás apenas da USP.'
			}
		]
	},
	{
		id: "saude-coletiva",
		title: "Saúde Coletiva",
		kicker: "Programa de pós-graduação",
		logoUrl: "./assets/instituições_logos/Logo - Saúde Coletiva.png",
		previewType: "image",
		accent: "#0f9f6e",
		content: [
			{
				headline: "Avaliação CAPES",
				text: "4"
			},
			{
				headline: "Descrição do Programa",
				text: 'A estrutura do Programa de Pós-Graduação em Saúde Coletiva em Odontologia da Faculdade de Odontologia de Araçatuba FOA/UNESP objetiva a formação de um profissional de saúde capaz de produzir mudanças positivas na problemática de saúde da comunidade, gerando e aplicando conhecimentos e tecnologia capazes de interferir positivamente no ambiente em que atua. Essa estrutura é embasada nos conhecimentos das matérias básicas e complementares e, instrumentada pelas experiências de aprendizagem capazes de produzir, ao fim do curso, um profissional apto a interferir eficazmente no binômio saúde-doença, na área da Odontologia e Saúde Coletiva.'
			},
			{
				headline: "Missão do Programa",
				text: 'A missão do Programa de Pós-graduação em Saúde Coletiva em Odontologia é formar mestres e doutores, com experiência em saúde pública, capazes de atuar nas universidades, nos serviços públicos e privados de saúde e em instituições relacionadas à área da saúde, desenvolvendo atividades de ensino, pesquisa, extensão e gestão na área da saúde coletiva, com vistas à melhoria das condições de saúde e ao desenvolvimento social da população.'
			},
			{
				headline: "Objetivos do Programa",
				text: 'O Programa de Pós-Graduação em Saúde Coletiva em Odontologia tem por finalidade formar um profissional de saúde polivalente, apto a desempenhar funções de ensino, pesquisa, extensão e administração, com prática de atuação comunitária, capacitado para analisar, planejar, executar e avaliar, em nível administrativo e operacional, projetos para a promoção de saúde e resolução dos problemas de Odontologia e Saúde da comunidade.'
			},
			{
				headline: "Mestrado",
				text: 'No curso de Mestrado, os objetivos estão centrados na formação do docente-pesquisador na área da saúde coletiva, com habilidades e competências para atuar como agente multiplicador e formar recursos humanos para a área da saúde, em instituições de ensino e serviços de saúde, na lógica da educação permanente, devendo ser capaz de analisar, planejar, executar e avaliar programas de saúde, em nível administrativo e operacional.'
			},
			{
				headline: "Doutorado",
				text: 'No curso de Doutorado, os objetivos são direcionados à formação do pesquisador qualificado na área de saúde coletiva, com competências e habilidades para gerar novos conhecimentos, atuar na gestão da saúde em suas diferentes dimensões, com capacidade de analisar criticamente a realidade do meio onde atua. O aluno do curso de Doutorado deverá ser capaz de identificar os problemas relacionados à saúde, no seu conceito amplo, levantando hipóteses que gerem pesquisas, inovação e desenvolvimento tecnológico, com vistas à transformação social.'
			}
		]
	},
	{
		id: "capes",
		title: "CAPES",
		kicker: "Portal institucional",
		logoUrl: "./assets/instituições_logos/Logo - CAPES.png",
		previewType: "image",
		accent: "#1a8ed8",
		content: [
			{
				headline: "Acesso oficial",
				text: "O acesso será direcionado para o portal institucional da CAPES."
			},
			{
				headline: "Link de destino",
				text: "https://www.gov.br/capes/pt-br"
			}
		],
		linkUrl: "https://www.gov.br/capes/pt-br"
	},
	{
		id: "nepesco",
		title: "NEPESCO",
		kicker: "NEPESCO",
		logoUrl: "./assets/instituições_logos/Logo - NEPESCO.png",
		previewType: "image",
		accent: "#1c73d1",
		content: [
			{
				headline: "Sobre o NEPESCO",
				text: 'O NEPESCO surgiu na década de 90 na FOA pela necessidade de se promover o desenvolvimento de pesquisas e estudos nas áreas de Educação para a Saúde, Epidemiologia, Cariologia, Métodos e Técnicas em Odontologia Preventiva e Administração em Saúde Coletiva.'
			},
			{
				headline: "Missão",
				text: 'Além do mais, a valorização da formação do profissional de saúde com competências e habilidades generalistas e voltadas para a lógica do sistema de saúde brasileiro, conforme regem as diretrizes curriculares, embute na Odontologia Preventiva e Social um importante papel articulador dessa formação. O NEPESCO existe justamente inserido nessa abordagem inovadora de produção de conhecimento e prestação de serviço.'
			},
			{
				headline: "Áreas de Atuação",
				text: 'Educação para a Saúde, Epidemiologia, Cariologia, Métodos e Técnicas em Odontologia Preventiva, Administração em Saúde Coletiva.'
			}
		]
	}
];

const GUIDE_STEPS_CATALOG = [
	{
		id: 1,
		step_order: 1,
		title: "Preparação do Ambiente",
		description: "Organize o espaço e deixe os materiais visíveis antes de iniciar.",
		coverImage: "./assets/etapas_guia/Etapa 1/Capa - 1 foto.jpg",
		bannerImages: [
			"./assets/etapas_guia/Etapa 1/Capa - 1 foto.jpg",
			"./assets/etapas_guia/Etapa 1/2 foto_.jpg",
			"./assets/etapas_guia/Etapa 1/3 foto_.jpg"
		],
		instructions: [
			"Dirija-se ao local onde será realizada a escovação.",
			"Separe todos os materiais.",
			"Coloque a escova e a pasta de dente à frente.",
			"Separe o fio dental e deixe visível."
		],
		adaptations: {
			n1: "O responsável nomeia os objetos. O indivíduo com TEA organiza de forma autônoma.",
			n2: "O responsável organiza e aponta cada item. O indivíduo com TEA confirma olhando ou tocando em cada objeto.",
			n3: "O responsável realiza a organização completa com apoio de pictogramas para mostrar cada etapa."
		},
		clinicalAttention:
			"Um ambiente silencioso, organizado e com poucos estímulos visuais ajuda a tornar a escovação mais tranquila."
	},
	{
		id: 2,
		step_order: 2,
		title: "Aplicação",
		description: "Aplique a quantidade de dentifrício correta para cada faixa etária.",
		coverImage: "./assets/etapas_guia/Etapa 2/Capa - 1 foto.jpg",
		bannerImages: [
			"./assets/etapas_guia/Etapa 2/Capa - 1 foto.jpg",
			"./assets/etapas_guia/Etapa 2/2 foto.jpg",
			"./assets/etapas_guia/Etapa 2/3 foto.jpg"
		],
		instructions: [
			"Segure a escova com firmeza na mão dominante.",
			"Abra a tampa da pasta de dente.",
			"Aplique a quantidade indicada para a idade.",
			"Feche a tampa da pasta e recoloque no lugar."
		],
		referenceVisual: {
			title: "Referência visual - quantidade da pasta por idade",
			items: [
				{
					label: "0 - 3 anos",
					subtitle: "1/2 grão de arroz",
					image: "./assets/etapas_guia/Etapa 2 - Pasta de dente/Pasta - 0 - 3 anos - 01 foto.jpg"
				},
				{
					label: "3 - 6 anos",
					subtitle: "1 grão de arroz",
					image: "./assets/etapas_guia/Etapa 2 - Pasta de dente/Pasta - 3- 6 anos - 02 foto.png"
				},
				{
					label: "Acima de 6 anos",
					subtitle: "1 grão de feijão",
					image: "./assets/etapas_guia/Etapa 2 - Pasta de dente/Pasta - Acima de 6 anos - 03 foto.jpg"
				}
			]
		},
		adaptations: {
			n1: "O indivíduo aplica de forma autônoma após ver a referência visual.",
			n2: "O responsável aponta a quantidade certa e o indivíduo realiza com supervisão.",
			n3: "O responsável realiza a aplicação, verbalizando cada ação."
		},
		clinicalAttention:
			"Utilize dentifrício fluoretado com concentração mínima de 1.100 ppm de flúor para prevenção contra cárie dentária."
	},
	{
		id: 3,
		step_order: 3,
		title: "Escovação",
		description: "Escove a parte externa e superfície de mastigação com ritmo e contagem.",
		coverImage: "./assets/etapas_guia/Etapa 3/Capa.jpg",
		bannerImages: [
			"./assets/etapas_guia/Etapa 3/Capa.jpg",
			"./assets/etapas_guia/Etapa 3/02 foto.jpg",
			"./assets/etapas_guia/Etapa 3/03 foto.jpg"
		],
		instructions: [
			"Posicione as cerdas sobre os dentes da frente em ângulo de 45° em relação à gengiva.",
			"Inicie sempre pelo mesmo lado (esquerda).",
			"Realize movimentos circulares suaves, contando de 1 a 10 em cada região.",
			"Avance para o centro e repita a contagem.",
			"Avance para o lado oposto (direita).",
			"Posicione as cerdas sobre a superfície de mastigação.",
			"Realize movimentos de vai e vem contando de 1 a 10 repetições.",
			"Avance para o lado oposto e finalize."
		],
		adaptations: {
			n1: "O indivíduo escova de forma autônoma e o responsável auxilia na contagem.",
			n2: "O responsável guia o movimento do pulso para escovação com apoio parcial.",
			n3: "O responsável realiza a escovação, verbalizando cada passo."
		},
		clinicalAttention:
			"Evite movimentos com muita força. A pressão excessiva pode causar desgaste do esmalte dentário e recessão gengival a longo prazo."
	},
	{
		id: 4,
		step_order: 4,
		title: "Escovação Interna",
		description: "Escove a parte interna da arcada, céu da boca e língua com movimentos suaves.",
		coverImage: "./assets/etapas_guia/Etapa 4/Capa - 01 foto.jpg",
		bannerImages: [
			"./assets/etapas_guia/Etapa 4/Capa - 01 foto.jpg",
			"./assets/etapas_guia/Etapa 4/02 foto.jpg",
			"./assets/etapas_guia/Etapa 4/03 foto.jpg"
		],
		instructions: [
			"Abra a boca.",
			"Vire a escova para o interior da arcada (céu da boca e língua).",
			"Posicione as cerdas junto à gengiva em ângulo de 45°.",
			"Realize movimentos suaves até a ponta da língua."
		],
		adaptations: {
			n1: "O indivíduo realiza com espelho como referência visual.",
			n2: "O responsável conduz a abertura da boca com apoio verbal e aponta visualmente.",
			n3: "O responsável realiza a escovação, com pausas para regulação sensorial."
		},
		clinicalAttention:
			"Se houver sensibilidade ou vontade de vomitar, inicie com escova de dedo ou gaze e avance progressivamente para a escova convencional."
	},
	{
		id: 5,
		step_order: 5,
		title: "Fio Dental",
		description: "Use o fio dental em todos os espaços com movimento suave e controlado.",
		coverImage: "./assets/etapas_guia/Etapa 5/Capa - 01 foto.jpg",
		bannerImages: [
			"./assets/etapas_guia/Etapa 5/Capa - 01 foto.jpg",
			"./assets/etapas_guia/Etapa 5/02 foto.jpg",
			"./assets/etapas_guia/Etapa 5/03 foto.jpg"
		],
		instructions: [
			"Pegue o fio dental.",
			"Introduza o fio suavemente entre os dentes em movimento de vai e vem.",
			"Passe o fio de cima para baixo (superiores) e de baixo para cima (inferiores).",
			"Utilize porção limpa do fio a cada novo espaço entre os dentes."
		],
		adaptations: {
			n1: "O indivíduo usa fio dental de forma autônoma com supervisão visual.",
			n2: "O responsável indica cada espaço verbalmente e o indivíduo executa.",
			n3: "O responsável executa de forma independente enquanto o indivíduo mantém a boca aberta."
		},
		clinicalAttention:
			"Para indivíduos com hipersensibilidade tátil, inicie com gaze úmida entre os dentes como etapa de dessensibilização antes de introduzir o fio dental."
	},
	{
		id: 6,
		step_order: 6,
		title: "Enxágue",
		description: "Faça bochecho guiado e descarte a água sem engolir.",
		coverImage: "./assets/etapas_guia/Etapa 6/Capa - 01 foto.jpg",
		bannerImages: [
			"./assets/etapas_guia/Etapa 6/Capa - 01 foto.jpg",
			"./assets/etapas_guia/Etapa 6/02 foto.jpg",
			"./assets/etapas_guia/Etapa 6/03 foto.jpg"
		],
		instructions: [
			"Pegue um copo e coloque água.",
			"Coloque água na boca, sem engolir.",
			"Faça bochecho contando até 10.",
			"Ponha a água para fora."
		],
		adaptations: {
			n1: "O indivíduo realiza o bochecho de forma autônoma.",
			n2: "O responsável demonstra o movimento e o indivíduo executa.",
			n3: "O responsável auxilia no enxágue e, se necessário, utiliza gaze."
		},
		clinicalAttention:
			"O reforço positivo, com elogio imediato e específico à ação concluída, é uma estratégia importante no TEA."
	},
	{
		id: 7,
		step_order: 7,
		title: "Organização",
		description: "Guarde todos os materiais no lugar para encerrar a rotina.",
		coverImage: "./assets/etapas_guia/Etapa 7/Capa - 01 foto.jpg",
		bannerImages: [
			"./assets/etapas_guia/Etapa 7/Capa - 01 foto.jpg",
			"./assets/etapas_guia/Etapa 7/02 foto.jpg",
			"./assets/etapas_guia/Etapa 7/03 foto.jpg"
		],
		instructions: [
			"Lave a escova de dentes em água corrente.",
			"Posicione a escova no suporte com as cerdas para cima.",
			"Feche a tampa da pasta e devolva ao local habitual.",
			"Guarde o fio dental e o copo em seus respectivos locais."
		],
		adaptations: {
			n1: "O indivíduo organiza os materiais de forma autônoma.",
			n2: "O responsável nomeia cada item a ser guardado e o indivíduo executa.",
			n3: "O responsável realiza a organização junto com o indivíduo."
		},
		clinicalAttention:
			"O reforço positivo, com elogio imediato e específico à ação concluída, é um dos pilares das estratégias comportamentais para o TEA."
	}
];

document.addEventListener("DOMContentLoaded", init);

async function init() {
	bindEvents();
	applyDefaultDates();
	await loadInstitutionLogos();

	await loadRuntimeConfig();

	if (runtimeConfig.publicAccessMode) {
		enterGuestSession("public");
		return;
	}

	if (state.token) {
		await bootstrapSession();
		return;
	}

	showAuthLanding();
}

function enterGuestSession(scope) {
	activateSession(QUICK_ACCESS_TOKEN, {
		id: 1,
		full_name: scope === "public" ? "Visitante" : "Visitante (Local)",
		username: scope === "public" ? "visitante" : "visitante-local",
		email: null,
		role: "caregiver"
	});
	setStatus(
		"Acesso liberado. Entrando direto no Dashboard.",
		"success"
	);
}

function showAuthLanding() {
	if (dom.landing) {
		dom.landing.classList.remove("hidden");
	}
	if (dom.appShell) {
		dom.appShell.classList.add("hidden");
	}
}

function showAppShell() {
	if (dom.landing) {
		dom.landing.classList.add("hidden");
	}
	if (dom.appShell) {
		dom.appShell.classList.remove("hidden");
	}
}

function bindEvents() {
	dom.showAboutBtn.addEventListener("click", () => setAuthMode("about"));
	dom.showLoginBtn.addEventListener("click", () => setAuthMode("login"));
	dom.showRegisterBtn.addEventListener("click", () => setAuthMode("register"));

	syncAuthHeroPlacement();
	window.addEventListener("resize", syncAuthHeroPlacement);

	dom.loginForm.addEventListener("submit", onLoginSubmit);
	dom.registerForm.addEventListener("submit", onRegisterSubmit);
	dom.verifyPhoneForm.addEventListener("submit", onVerifyPhoneSubmit);
	dom.forgotPasswordForm.addEventListener("submit", onForgotPasswordSubmit);
	dom.resetCodeForm.addEventListener("submit", onResetCodeSubmit);
	dom.newPasswordForm.addEventListener("submit", onNewPasswordSubmit);
	dom.resendVerifyCodeBtn.addEventListener("click", onResendVerifyCode);
	dom.resendResetCodeBtn.addEventListener("click", onResendResetCode);

	dom.forgotPasswordBtn.addEventListener("click", () => {
		dom.forgotPhone.value = dom.loginForm.querySelector('input[name="phone"]').value;
		setAuthMode("forgot");
	});

	document.querySelectorAll("[data-auth-back]").forEach((button) => {
		button.addEventListener("click", () => setAuthMode(button.dataset.authBack));
	});
	dom.logoutBtn.addEventListener("click", () => logout(false));

	dom.tabButtons.forEach((button) => {
		button.addEventListener("click", () => setActiveSection(button.dataset.section));
	});

	dom.dashboardChartToggleButtons.forEach((button) => {
		button.addEventListener("click", () => {
			setDashboardChartRange(button.dataset.chartRange);
		});
	});

	dom.checklistDate.addEventListener("change", () => {
		loadChecklistForDate(dom.checklistDate.value);
	});

	dom.checklistForm.addEventListener("submit", onChecklistSubmit);

	if (dom.dashboardMonthHeatmap) {
		dom.dashboardMonthHeatmap.addEventListener("click", handleDashboardHeatmapClick);
	}
	
	// Ouvintes do Quiz Interativo (estilo Duolingo)
	if (dom.quizStartBtn) {
		dom.quizStartBtn.addEventListener("click", startQuiz);
		dom.quizExitHeaderBtn.addEventListener("click", exitQuiz);
		dom.quizExitFooterBtn.addEventListener("click", exitQuiz);
		dom.quizActionBtn.addEventListener("click", handleQuizAction);
		dom.quizRestartBtn.addEventListener("click", showQuizStartScreen);
	}

	dom.preferencesForm.addEventListener("submit", onPreferencesSubmit);

	bindConfirmModalEvents();
	bindInstitutionModalEvents();
	bindGuideModalEvents();
	bindDayDetailModalEvents();
	bindPasswordToggleEvents();
	bindPhoneMask();

	// Custom Checklist UI events
	const timeBtns = document.querySelectorAll(".time-btn");
	timeBtns.forEach(btn => {
		btn.addEventListener("click", () => {
			btn.classList.toggle("active");
			const time = btn.dataset.time;
			const input = document.getElementById(`input-${time}`);
			if (input) input.checked = btn.classList.contains("active");
		});
	});

	const resBtns = document.querySelectorAll(".res-btn");
	const resInput = document.getElementById("input-resistance");
	resBtns.forEach(btn => {
		btn.addEventListener("click", () => {
			resBtns.forEach(b => b.classList.remove("active"));
			btn.classList.add("active");
			if (resInput) resInput.value = btn.dataset.level;
		});
	});

	initDatepicker();
	initDashboardMonthPicker();
}

function applyDefaultDates() {
	const now = new Date();
	const today = now.toISOString().slice(0, 10);
	const month = now.toISOString().slice(0, 7);
	dom.checklistDate.value = today;
	dom.monthInput.value = month;
}

function createCalendarPicker({ input, container, monthYear, days, prev, next, mode = "date", onSelect }) {
	if (!input || !container || !monthYear || !days || !prev || !next) return;

	const monthNames = [
		"Janeiro",
		"Fevereiro",
		"Março",
		"Abril",
		"Maio",
		"Junho",
		"Julho",
		"Agosto",
		"Setembro",
		"Outubro",
		"Novembro",
		"Dezembro"
	];
	let currentShownDate = new Date();
	currentShownDate.setHours(12, 0, 0, 0);

	function getSelectedDate() {
		if (!input.value) return null;
		const selectedValue = mode === "month" ? `${input.value}-01` : input.value;
		const parsedDate = new Date(`${selectedValue}T12:00:00`);
		return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
	}

	function renderCalendar() {
		days.innerHTML = "";
		const year = currentShownDate.getFullYear();
		const month = currentShownDate.getMonth();
		const displayMonth = String(month + 1).padStart(2, "0");
		monthYear.textContent = mode === "month" ? String(year) : `${monthNames[month]} ${year}`;
		prev.setAttribute("aria-label", mode === "month" ? "Ano anterior" : "Mês anterior");
		next.setAttribute("aria-label", mode === "month" ? "Próximo ano" : "Próximo mês");


		if (mode === "month") {
			days.classList.add("month-grid");
			days.classList.remove("days-body");
			const selectedMonthKey = input.value;
			const monthButtons = [
				"Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"
			];

			monthButtons.forEach((label, index) => {
				const monthButton = document.createElement("button");
				monthButton.type = "button";
				monthButton.className = "dp-day month-day";
				monthButton.textContent = label;
				const value = `${year}-${String(index + 1).padStart(2, "0")}`;
				if (selectedMonthKey === value) {
					monthButton.classList.add("selected");
				}
				monthButton.addEventListener("click", () => {
					input.value = value;
					container.classList.add("hidden");
					renderCalendar();
					if (typeof onSelect === "function") {
						onSelect(input.value);
					}
				});
				days.appendChild(monthButton);
			});
			return;
		}

		days.classList.remove("month-grid");
		days.classList.add("days-body");

		const firstDay = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const selectedDate = getSelectedDate();
		const selectedMonthKey = selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}` : "";

		for (let i = 0; i < firstDay; i += 1) {
			const emptyDiv = document.createElement("div");
			emptyDiv.className = "dp-day empty";
			days.appendChild(emptyDiv);
		}

		for (let day = 1; day <= daysInMonth; day += 1) {
			const dayDiv = document.createElement("div");
			dayDiv.className = "dp-day";
			dayDiv.textContent = day;

			const cellDateStr = `${year}-${displayMonth}-${String(day).padStart(2, "0")}`;
			if (mode === "date" && cellDateStr === input.value) {
				dayDiv.classList.add("selected");
			}
			if (mode === "month" && selectedMonthKey === `${year}-${displayMonth}` && day === 1) {
				dayDiv.classList.add("selected");
			}

			dayDiv.addEventListener("click", () => {
				input.value = mode === "month" ? `${year}-${displayMonth}` : cellDateStr;
				container.classList.add("hidden");
				renderCalendar();
				if (typeof onSelect === "function") {
					onSelect(input.value);
				}
			});

			days.appendChild(dayDiv);
		}
	}

	input.addEventListener("click", () => {
		container.classList.toggle("hidden");
		const selectedDate = getSelectedDate();
		if (selectedDate) {
			currentShownDate = selectedDate;
		}
		if (mode === "month" && !selectedDate && input.value) {
			currentShownDate = new Date(`${input.value}-01T12:00:00`);
		}
		renderCalendar();
	});

	prev.addEventListener("click", (event) => {
		event.stopPropagation();
		if (mode === "month") {
			currentShownDate.setFullYear(currentShownDate.getFullYear() - 1);
		} else {
			currentShownDate.setMonth(currentShownDate.getMonth() - 1);
		}
		renderCalendar();
	});

	next.addEventListener("click", (event) => {
		event.stopPropagation();
		if (mode === "month") {
			currentShownDate.setFullYear(currentShownDate.getFullYear() + 1);
		} else {
			currentShownDate.setMonth(currentShownDate.getMonth() + 1);
		}
		renderCalendar();
	});

	document.addEventListener("click", (event) => {
		const path = event.composedPath();
		if (!path.includes(input) && !path.includes(container)) {
			container.classList.add("hidden");
		}
	});

	renderCalendar();
}

function initDatepicker() {
	createCalendarPicker({
		input: document.getElementById("checklistDate"),
		container: document.getElementById("customDatePicker"),
		monthYear: document.getElementById("dpMonthYear"),
		days: document.getElementById("dpDays"),
		prev: document.getElementById("dpPrev"),
		next: document.getElementById("dpNext"),
		mode: "date",
		onSelect: (dateValue) => loadChecklistForDate(dateValue)
	});
}

function initDashboardMonthPicker() {
	createCalendarPicker({
		input: dom.monthInput,
		container: document.getElementById("dashboardMonthPicker"),
		monthYear: document.getElementById("dashboardMonthYear"),
		days: document.getElementById("dashboardMonthDays"),
		prev: document.getElementById("dashboardMonthPrev"),
		next: document.getElementById("dashboardMonthNext"),
		mode: "month",
		onSelect: (monthValue) => loadDashboard(monthValue)
	});
}

const AUTH_MOBILE_QUERY = window.matchMedia("(max-width: 980px)");
// Breakpoint em que o app interno troca a sidebar pela barra inferior.
const APP_MOBILE_QUERY = window.matchMedia("(max-width: 768px)");
let currentAuthMode = "login";

function isAuthMobile() {
	return AUTH_MOBILE_QUERY.matches;
}

function isAppMobile() {
	return APP_MOBILE_QUERY.matches;
}

/** No mobile o hero vira uma aba dentro da coluna de autenticação. */
function syncAuthHeroPlacement() {
	if (!dom.authHero || !dom.authColumn || !dom.landing) return;
	if (isAuthMobile()) {
		if (dom.authHero.parentElement !== dom.authColumn) {
			// Primeira vez no mobile: o hero "Sobre" abre selecionado.
			dom.authColumn.prepend(dom.authHero);
			dom.authColumn.prepend(dom.authSwitch);
			currentAuthMode = "about";
		}
		setAuthMode(currentAuthMode);
	} else {
		if (dom.authHero.parentElement !== dom.landing) {
			dom.landing.insertBefore(dom.authHero, dom.authColumn);
		}
		dom.authHero.classList.remove("hidden");
		if (currentAuthMode === "about") {
			setAuthMode("login");
		}
	}
}

// Telas do fluxo de autenticacao e a aba do switch que cada uma destaca.
const AUTH_SCREENS = {
	login: { form: "loginForm", tab: "login" },
	register: { form: "registerForm", tab: "register" },
	verifyPhone: { form: "verifyPhoneForm", tab: "register" },
	forgot: { form: "forgotPasswordForm", tab: "login" },
	resetCode: { form: "resetCodeForm", tab: "login" },
	newPassword: { form: "newPasswordForm", tab: "login" },
	about: { form: null, tab: "about" }
};

function setAuthMode(mode) {
	if (!AUTH_SCREENS[mode]) {
		mode = "login";
	}

	if (mode === "about" && !isAuthMobile()) {
		mode = "login";
	}
	currentAuthMode = mode;

	const activeTab = AUTH_SCREENS[mode].tab;

	dom.showAboutBtn.classList.toggle("active", activeTab === "about");
	dom.showLoginBtn.classList.toggle("active", activeTab === "login");
	dom.showRegisterBtn.classList.toggle("active", activeTab === "register");

	Object.values(AUTH_SCREENS).forEach((screen) => {
		if (!screen.form || !dom[screen.form]) return;
		dom[screen.form].classList.add("hidden");
	});

	const activeForm = AUTH_SCREENS[mode].form;
	if (activeForm && dom[activeForm]) {
		dom[activeForm].classList.remove("hidden");
	}

	if (dom.authHero && isAuthMobile()) {
		dom.authHero.classList.toggle("hidden", mode !== "about");
	}
}

function bindPasswordToggleEvents() {
	document.querySelectorAll(".btn-toggle-password").forEach((btn) => {
		btn.addEventListener("click", (event) => {
			event.preventDefault();
			const container = btn.closest(".password-field-group");
			if (!container) return;
			const input = container.querySelector("input");
			const icon = btn.querySelector("i");
			if (!input || !icon) return;

			if (input.type === "password") {
				input.type = "text";
				icon.className = "ph ph-eye-slash";
				btn.setAttribute("aria-label", "Ocultar senha");
			} else {
				input.type = "password";
				icon.className = "ph ph-eye";
				btn.setAttribute("aria-label", "Mostrar senha");
			}
		});
	});
}

function formatBrazilianPhone(value) {
	const digits = value.replace(/\D/g, "").slice(0, 11);
	if (!digits) return "";
	if (digits.length <= 2) {
		return `(${digits}`;
	}
	if (digits.length <= 6) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
	}
	if (digits.length <= 10) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
	}
	return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function bindPhoneMask() {
	document.querySelectorAll('input[name="phone"]').forEach((phoneInput) => {
		phoneInput.addEventListener("input", (event) => {
			const cursorPosition = phoneInput.selectionStart;
			const oldLength = phoneInput.value.length;
			phoneInput.value = formatBrazilianPhone(phoneInput.value);
			const newLength = phoneInput.value.length;

			if (cursorPosition !== null && event.inputType !== "deleteContentBackward") {
				const diff = newLength - oldLength;
				const newPos = Math.max(0, cursorPosition + diff);
				phoneInput.setSelectionRange(newPos, newPos);
			}
		});
	});

	// Codigos de verificacao aceitam apenas digitos.
	document.querySelectorAll(".code-input").forEach((input) => {
		input.addEventListener("input", () => {
			input.value = input.value.replace(/\D/g, "").slice(0, 6);
		});
	});
}

function resetCompletedGuideSteps() {
	state.completedGuideStepIds = new Set();
	try {
		const key = getGuideCompletionStorageKey();
		localStorage.removeItem(key);
	} catch (e) {}
}

function setActiveSection(sectionName) {
	if (sectionName !== "guide") {
		resetCompletedGuideSteps();
	} else {
		loadGuideSteps();
	}

	dom.tabButtons.forEach((button) => {
		button.classList.toggle("active", button.dataset.section === sectionName);
	});

	dom.sections.forEach((section) => {
		section.classList.toggle("active", section.id === `section-${sectionName}`);
	});

	if (sectionName === "dashboard") {
		loadDashboard(dom.monthInput.value);
	}
}

function createOfflineStore() {
	return {
		token: "",
		user: null,
		password: "",
		checklists: [],
		preferences: {
			reminder_enabled: true,
			reminder_times: ["08:00", "13:00", "20:00"],
			accessibility_mode: "default",
			theme_mode: "light"
		},
		quizAttempts: []
	};
}

function loadOfflineStore() {
	try {
		const raw = localStorage.getItem(OFFLINE_STORE_KEY);
		if (!raw) return createOfflineStore();

		const parsed = JSON.parse(raw);
		return {
			...createOfflineStore(),
			...parsed,
			checklists: Array.isArray(parsed?.checklists) ? parsed.checklists : [],
			quizAttempts: Array.isArray(parsed?.quizAttempts) ? parsed.quizAttempts : []
		};
	} catch (error) {
		return createOfflineStore();
	}
}

function saveOfflineStore(store) {
	localStorage.setItem(OFFLINE_STORE_KEY, JSON.stringify(store));
}

function getChecklistRange(checklists, start, end) {
	return checklists
		.filter((item) => item.checklist_date >= start && item.checklist_date <= end)
		.sort((a, b) => (a.checklist_date < b.checklist_date ? 1 : -1));
}

function computeChecklistStats(checklists, month) {
	const [yearText, monthText] = month.split("-");
	const monthStart = `${month}-01`;
	const monthLastDay = new Date(Number(yearText), Number(monthText), 0).getDate();
	const monthEnd = `${month}-${String(monthLastDay).padStart(2, "0")}`;
	const entries = getChecklistRange(checklists, monthStart, monthEnd);

	const resistance = {
		none: 0,
		light: 0,
		moderate: 0,
		severe: 0
	};

	let completedBrushings = 0;

	entries.forEach((item) => {
		completedBrushings += Number(item.brushing_morning);
		completedBrushings += Number(item.brushing_afternoon);
		completedBrushings += Number(item.brushing_night);
		resistance[item.resistance_level] += 1;
	});

	const now = new Date();
	const isCurrentMonth =
		Number(yearText) === now.getFullYear() && Number(monthText) - 1 === now.getMonth();
	const trackedDays = isCurrentMonth ? now.getDate() : monthLastDay;
	const expectedBrushings = trackedDays * 3;
	const adherenceRate = expectedBrushings
		? Math.round((completedBrushings / expectedBrushings) * 100)
		: 0;

	return {
		month,
		completedBrushings,
		expectedBrushings,
		adherenceRate,
		resistance,
		entries: entries.length
	};
}

function upsertChecklist(checklists, date, payload) {
	const nextItem = {
		checklist_date: date,
		brushing_morning: Boolean(payload.morning),
		brushing_afternoon: Boolean(payload.afternoon),
		brushing_night: Boolean(payload.night),
		resistance_level: payload.resistanceLevel || "none",
		notes: String(payload.notes || "").trim(),
		updated_at: new Date().toISOString()
	};

	const existingIndex = checklists.findIndex((item) => item.checklist_date === date);

	if (existingIndex >= 0) {
		checklists[existingIndex] = nextItem;
	} else {
		checklists.push(nextItem);
	}

	return nextItem;
}

async function api(path, options = {}) {
	if (QUICK_ACCESS_MODE) {
		return mockApi(path, options);
	}

	const { method = "GET", body, auth = true } = options;
	const headers = {};

	if (body !== undefined) {
		headers["Content-Type"] = "application/json";
	}

	if (auth && state.token) {
		headers.Authorization = `Bearer ${state.token}`;
	}

	if (state.offlineMode) {
		return offlineApi(path, options);
	}

	let response;

	try {
		response = await fetch(`${API_BASE}${path}`, {
			method,
			headers,
			body: body !== undefined ? JSON.stringify(body) : undefined
		});
	} catch (error) {
		if (path.startsWith("/auth/") || path.startsWith("/checklists")) {
			if (!state.offlineMode) {
				state.offlineMode = true;
				console.warn(`[sorriso] API inacessivel em ${API_BASE}. Ativando modo offline simulado.`);
				setStatus(`Servidor nao encontrado em ${API_BASE}. Modo offline simulado ativo.`, "warning");
			}

			return offlineApi(path, options);
		}

		throw error;
	}

	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		if (response.status === 401 && auth) {
			logout(true);
		}

		throw new Error(data.message || "Falha na comunicacao com o servidor.");
	}

	return data;
}

window.showToast = function(type, message) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "ph-info";
    if (type === "success") icon = "ph-check-circle";
    if (type === "error") icon = "ph-warning-circle";
    if (type === "warning") icon = "ph-warning";
    
    toast.innerHTML = `<i class="ph ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add("hiding");
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }, 4000);
};

function setStatus(message, type = "info") {
	// Fallback for old status bar element if it exists
	if (dom.statusBar) {
		dom.statusBar.textContent = message;
		dom.statusBar.className = `status-bar ${type}`;
	}
	// Trigger the new global Toast System
	showToast(type, message);
}

// Guarda o telefone em validacao e o token temporario de troca de senha.
const authFlow = {
	pendingRegisterPhone: "",
	resetPhone: "",
	resetToken: ""
};

function onlyDigits(value) {
	return String(value || "").replace(/\D/g, "");
}

function isValidPhoneDigits(digits) {
	return /^[1-9]{2}9?\d{8}$/.test(digits);
}

async function onRegisterSubmit(event) {
	event.preventDefault();

	const formData = new FormData(dom.registerForm);
	const payload = {
		username: String(formData.get("username") || "").trim(),
		password: String(formData.get("password") || ""),
		confirmPassword: String(formData.get("confirmPassword") || ""),
		phone: onlyDigits(formData.get("phone"))
	};

	if (!payload.username || !payload.password || !payload.confirmPassword || !payload.phone) {
		setStatus("Preencha todos os campos do cadastro.", "error");
		return;
	}

	if (payload.password !== payload.confirmPassword) {
		setStatus("As senhas precisam ser iguais.", "error");
		return;
	}

	if (payload.password.length < 8) {
		setStatus("A senha precisa ter no mínimo 8 caracteres.", "error");
		return;
	}

	if (!isValidPhoneDigits(payload.phone)) {
		setStatus("Informe um número de telefone válido com DDD.", "error");
		return;
	}

	try {
		setStatus("Enviando código de confirmação...", "info");
		const result = await api("/auth/register/start", {
			method: "POST",
			auth: false,
			body: payload
		});

		authFlow.pendingRegisterPhone = result.phone || payload.phone;
		dom.verifyPhoneTarget.textContent = formatBrazilianPhone(authFlow.pendingRegisterPhone);
		dom.verifyPhoneCode.value = "";
		setAuthMode("verifyPhone");
		dom.verifyPhoneCode.focus();
		setStatus(result.message || "Código enviado por SMS.", "success");
		announceDevCode(result.devCode);
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function onVerifyPhoneSubmit(event) {
	event.preventDefault();

	const code = onlyDigits(new FormData(dom.verifyPhoneForm).get("code"));

	if (code.length !== 6) {
		setStatus("Digite os 6 dígitos do código recebido.", "error");
		return;
	}

	try {
		setStatus("Validando código...", "info");
		const result = await api("/auth/register/verify", {
			method: "POST",
			auth: false,
			body: { phone: authFlow.pendingRegisterPhone, code }
		});

		authFlow.pendingRegisterPhone = "";
		dom.registerForm.reset();
		dom.verifyPhoneForm.reset();
		activateSession(result.token, result.user);
		setStatus("Conta criada com sucesso.", "success");
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function onResendVerifyCode() {
	if (!authFlow.pendingRegisterPhone) {
		setStatus("Refaça o cadastro para receber um novo código.", "error");
		return;
	}

	try {
		const result = await api("/auth/register/resend", {
			method: "POST",
			auth: false,
			body: { phone: authFlow.pendingRegisterPhone }
		});

		setStatus(result.message || "Novo código enviado.", "success");
		announceDevCode(result.devCode);
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function onLoginSubmit(event) {
	event.preventDefault();

	const formData = new FormData(dom.loginForm);
	const payload = {
		phone: onlyDigits(formData.get("phone")),
		password: String(formData.get("password") || "")
	};

	if (!payload.phone || !payload.password) {
		setStatus("Informe seu número de telefone e senha.", "error");
		return;
	}

	if (!isValidPhoneDigits(payload.phone)) {
		setStatus("Informe um número de telefone válido com DDD.", "error");
		return;
	}

	try {
		setStatus("Validando acesso...", "info");
		const result = await api("/auth/login", {
			method: "POST",
			auth: false,
			body: payload
		});

		activateSession(result.token, result.user);
		setStatus(
			QUICK_ACCESS_MODE
				? "Modo demonstracao ativo. Voce pode navegar em todas as telas."
				: "Acesso autorizado.",
			"success"
		);
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function onForgotPasswordSubmit(event) {
	event.preventDefault();

	const phone = onlyDigits(new FormData(dom.forgotPasswordForm).get("phone"));

	if (!isValidPhoneDigits(phone)) {
		setStatus("Informe um número de telefone válido com DDD.", "error");
		return;
	}

	try {
		setStatus("Enviando SMS de recuperação...", "info");
		const result = await api("/auth/password/forgot", {
			method: "POST",
			auth: false,
			body: { phone }
		});

		authFlow.resetPhone = result.phone || phone;
		dom.resetCodeTarget.textContent = formatBrazilianPhone(authFlow.resetPhone);
		dom.resetCodeInput.value = "";
		setAuthMode("resetCode");
		dom.resetCodeInput.focus();
		setStatus(result.message || "Código enviado por SMS.", "success");
		announceDevCode(result.devCode);
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function onResetCodeSubmit(event) {
	event.preventDefault();

	const code = onlyDigits(new FormData(dom.resetCodeForm).get("code"));

	if (code.length !== 6) {
		setStatus("Digite os 6 dígitos do código recebido.", "error");
		return;
	}

	try {
		setStatus("Validando código...", "info");
		const result = await api("/auth/password/verify", {
			method: "POST",
			auth: false,
			body: { phone: authFlow.resetPhone, code }
		});

		authFlow.resetToken = result.resetToken;
		dom.newPasswordForm.reset();
		setAuthMode("newPassword");
		setStatus("Código validado. Defina sua nova senha.", "success");
	} catch (error) {
		// Codigo incorreto mantem o usuario na mesma tela.
		setStatus(error.message, "error");
	}
}

async function onResendResetCode() {
	if (!authFlow.resetPhone) {
		setStatus("Informe o telefone novamente para receber um novo código.", "error");
		return;
	}

	try {
		const result = await api("/auth/password/forgot", {
			method: "POST",
			auth: false,
			body: { phone: authFlow.resetPhone }
		});

		setStatus(result.message || "Novo código enviado.", "success");
		announceDevCode(result.devCode);
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function onNewPasswordSubmit(event) {
	event.preventDefault();

	const formData = new FormData(dom.newPasswordForm);
	const password = String(formData.get("password") || "");
	const confirmPassword = String(formData.get("confirmPassword") || "");

	if (password.length < 8) {
		setStatus("A senha precisa ter no mínimo 8 caracteres.", "error");
		return;
	}

	if (password !== confirmPassword) {
		setStatus("As senhas precisam ser iguais.", "error");
		return;
	}

	try {
		setStatus("Salvando nova senha...", "info");
		const result = await api("/auth/password/reset", {
			method: "POST",
			auth: false,
			body: {
				phone: authFlow.resetPhone,
				resetToken: authFlow.resetToken,
				password,
				confirmPassword
			}
		});

		authFlow.resetPhone = "";
		authFlow.resetToken = "";
		dom.newPasswordForm.reset();
		dom.forgotPasswordForm.reset();
		activateSession(result.token, result.user);
		setStatus("Senha atualizada com sucesso.", "success");
	} catch (error) {
		setStatus(error.message, "error");
	}
}

// Em desenvolvimento a API devolve o codigo para facilitar os testes.
function announceDevCode(devCode) {
	if (!devCode) return;
	console.info(`[dev] codigo de verificacao: ${devCode}`);
	setStatus(`Modo desenvolvimento: código ${devCode}`, "warning");
}

function activateSession(token, user) {
	state.token = token;
	state.user = user;
	localStorage.setItem("sorriso_token", token);

	showAppShell();
	setActiveSection("inicio");

	loadAllData();
}

async function bootstrapSession() {
	try {
		const result = await api("/auth/me");
		state.user = result.user;
		showAppShell();
		setActiveSection("inicio");
		await loadAllData();
	} catch (error) {
		if (runtimeConfig.publicAccessMode) {
			enterGuestSession("public");
			return;
		}

		showAuthLanding();
	}
}

function logout(silent) {
	state.token = "";
	state.user = null;
	localStorage.removeItem("sorriso_token");
	stopReminderEngine();

	if (runtimeConfig.publicAccessMode) {
		enterGuestSession("public");
		return;
	}

	showAuthLanding();

	if (!silent) {
		setStatus("Sessão encerrada. Faça login novamente.", "info");
	}
}

async function autoAuthenticate() {
	showAuthLanding();
	setStatus("Use a tela de login para entrar no sistema.", "info");
	return null;
}

async function loadRuntimeConfig() {
	try {
		const response = await fetch(`${API_BASE}/config`, {
			method: "GET"
		});

		if (!response.ok) {
			return;
		}

		const data = await response.json().catch(() => ({}));
		runtimeConfig.publicAccessMode = Boolean(data.publicAccessMode);
	} catch (error) {
		console.warn("Nao foi possivel carregar a configuracao de runtime.", error);
	}
}

async function loadAllData() {
	await Promise.allSettled([
		loadInstitutionLogos(),
		loadDashboard(dom.monthInput.value),
		loadChecklistForDate(dom.checklistDate.value),
		loadGuideSteps(),
		loadQuizQuestions(),
		loadVideos(),
		loadPreferences()
	]);
}

async function loadInstitutionLogos() {
	const containers = [dom.landingInstitutionLogosGrid, dom.institutionLogosGrid].filter(Boolean);

	containers.forEach((container) => {
		container.innerHTML = institutionCards
			.map((item) => {
				const previewMarkup = item.previewType === "pdf"
					? `<object data="${item.logoUrl}" type="application/pdf" class="institution-logo-preview" aria-label="${escapeHtml(item.title)}"></object>`
					: `<img src="${item.logoUrl}" alt="${escapeHtml(item.title)}" class="institution-logo-preview" loading="lazy" />`;

				return `
					<button type="button" class="institution-card" data-institution-id="${item.id}">
						<span class="institution-card-accent" style="--institution-accent:${item.accent};"></span>
						<div class="institution-card-logo">${previewMarkup}</div>
						<div class="institution-card-body">
							<p class="institution-card-kicker">${escapeHtml(item.kicker)}</p>
							<h4>${escapeHtml(item.title)}</h4>
							<span class="institution-card-cta">Abrir informações</span>
						</div>
					</button>
				`;
			})
			.join("");

		container.querySelectorAll(".institution-card").forEach((button) => {
			button.addEventListener("click", () => {
				const institution = institutionCards.find((item) => item.id === button.dataset.institutionId);
				if (institution) {
					openInstitutionModal(institution);
				}
			});
		});
	});
}

function openInstitutionModal(institution) {
	if (!dom.institutionModal || !institution) return;

	if (dom.institutionModalKicker) {
		dom.institutionModalKicker.textContent = institution.kicker;
	}
	if (dom.institutionModalTitle) {
		dom.institutionModalTitle.textContent = institution.title;
	}
	if (dom.institutionModalContent) {
		dom.institutionModalContent.innerHTML = institution.content.map((block) => `
			<section class="institution-content-block">
				<h4>${escapeHtml(block.headline)}</h4>
				<p>${escapeHtml(block.text)}</p>
			</section>
		`).join("");

		if (institution.linkUrl) {
			dom.institutionModalContent.insertAdjacentHTML(
				"beforeend",
				`<a class="institution-link-button" href="${escapeHtml(institution.linkUrl)}" target="_blank" rel="noreferrer">Abrir portal oficial</a>`
			);
		}
	}

	if (dom.institutionModalPreview) {
		dom.institutionModalPreview.innerHTML = institution.previewType === "pdf"
			? `<object data="${institution.logoUrl}" type="application/pdf" class="institution-modal-logo" aria-label="${escapeHtml(institution.title)}"></object>`
			: `<img src="${institution.logoUrl}" alt="${escapeHtml(institution.title)}" class="institution-modal-logo" loading="lazy" />`;
	}

	dom.institutionModal.classList.remove("hidden");
	dom.institutionModal.setAttribute("aria-hidden", "false");
	document.body.classList.add("modal-open");
	if (dom.institutionModalClose) {
		dom.institutionModalClose.focus();
	}
}

function closeInstitutionModal() {
	if (!dom.institutionModal) return;
	dom.institutionModal.classList.add("hidden");
	dom.institutionModal.setAttribute("aria-hidden", "true");
	document.body.classList.remove("modal-open");
}

function bindInstitutionModalEvents() {
	if (!dom.institutionModal) return;

	if (dom.institutionModalBackdrop) {
		dom.institutionModalBackdrop.addEventListener("click", () => closeInstitutionModal());
	}

	if (dom.institutionModalClose) {
		dom.institutionModalClose.addEventListener("click", () => closeInstitutionModal());
	}

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !dom.institutionModal.classList.contains("hidden")) {
			closeInstitutionModal();
		}
	});
}

function countBrushingsForItem(item) {
	if (!item) return 0;
	return (
		Number(Boolean(item.brushing_morning)) +
		Number(Boolean(item.brushing_afternoon)) +
		Number(Boolean(item.brushing_night))
	);
}

function computeDayAdherencePercent(item) {
	if (!item) return 0;
	return Math.round((countBrushingsForItem(item) / 3) * 100);
}

function parseMonthBounds(month) {
	const [yearText, monthText] = month.split("-");
	const year = Number(yearText);
	const monthIndex = Number(monthText);
	const lastDay = new Date(year, monthIndex, 0).getDate();

	return {
		year,
		monthIndex,
		start: `${month}-01`,
		end: `${month}-${String(lastDay).padStart(2, "0")}`,
		lastDay
	};
}

function getHeatmapLevel(brushings, hasRecord) {
	if (!hasRecord) return "level-none";
	if (brushings <= 0) return "level-none";
	if (brushings === 1) return "level-low";
	if (brushings === 2) return "level-mid";
	return "level-high";
}

function buildLast7DaysSeries(items) {
	const byDate = new Map(items.map((item) => [item.checklist_date, item]));
	const series = [];
	const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });

	for (let offset = 6; offset >= 0; offset -= 1) {
		const date = new Date();
		date.setHours(12, 0, 0, 0);
		date.setDate(date.getDate() - offset);
		const isoDate = date.toISOString().slice(0, 10);
		const item = byDate.get(isoDate);
		const brushings = countBrushingsForItem(item);

		series.push({
			label: weekdayFormatter.format(date).replace(".", ""),
			date: isoDate,
			percent: computeDayAdherencePercent(item),
			brushings,
			tooltip: item
				? `${brushings}/3 escovações · ${translateResistance(item.resistance_level)}`
				: "Sem registro"
		});
	}

	return series;
}

function buildMonthWeeklySeries(items, month) {
	const { lastDay } = parseMonthBounds(month);
	const byDate = new Map(items.map((item) => [item.checklist_date, item]));
	const series = [];

	for (let weekStart = 1; weekStart <= lastDay; weekStart += 7) {
		const weekEnd = Math.min(weekStart + 6, lastDay);
		let completedBrushings = 0;

		for (let day = weekStart; day <= weekEnd; day += 1) {
			const isoDate = `${month}-${String(day).padStart(2, "0")}`;
			const item = byDate.get(isoDate);
			completedBrushings += countBrushingsForItem(item);
		}

		const expectedBrushings = (weekEnd - weekStart + 1) * 3;
		const percent = expectedBrushings
			? Math.round((completedBrushings / expectedBrushings) * 100)
			: 0;

		series.push({
			label: `Dia ${weekStart}–${weekEnd}`,
			percent,
			brushings: completedBrushings,
			tooltip: expectedBrushings
				? `${completedBrushings}/${expectedBrushings} escovações no período`
				: "Sem registros nesta semana"
		});
	}

	return series;
}

function renderDashboardBars(series, emptyMessage) {
	if (!dom.dashboardChart) return;

	const hasData = series.some((entry) => entry.percent > 0 || entry.brushings > 0);

	if (!hasData) {
		dom.dashboardChart.innerHTML = `<p class="dashboard-chart-empty">${emptyMessage}</p>`;
		return;
	}

	dom.dashboardChart.innerHTML = series
		.map((entry) => {
			const height = Math.min(Math.max(entry.percent, 6), 100);
			return `
				<div class="chart-bar-col">
					<span class="chart-bar-value">${entry.percent}%</span>
					<div class="chart-bar-track">
						<div
							class="chart-bar-fill"
							style="--bar-height: ${height}%;"
							title="${escapeHtml(entry.tooltip || "")}"
						></div>
					</div>
					<span class="chart-bar-label">${escapeHtml(entry.label)}</span>
				</div>
			`;
		})
		.join("");
}

function renderDashboardWeekCalendar(items) {
	if (!dom.dashboardMonthHeatmap) return;

	const byDate = new Map(items.map((item) => [item.checklist_date, item]));
	const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
	const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
	const today = new Date();
	today.setHours(12, 0, 0, 0);
	const weekDates = [];

	for (let offset = 6; offset >= 0; offset -= 1) {
		const date = new Date(today);
		date.setDate(today.getDate() - offset);
		weekDates.push(date);
	}

	let html = '<div class="heatmap-weekdays">';
	weekDates.forEach((date) => {
		const weekdayLabel = weekdayFormatter.format(date).replace(".", "").toUpperCase();
		html += `<span class="heatmap-weekday" title="${escapeHtml(dateFormatter.format(date))}">${escapeHtml(weekdayLabel)}</span>`;
	});
	html += '</div><div class="heatmap-grid heatmap-week-strip">';

	weekDates.forEach((date) => {
		const isoDate = date.toISOString().slice(0, 10);
		const item = byDate.get(isoDate);
		const brushings = countBrushingsForItem(item);
		const level = getHeatmapLevel(brushings, Boolean(item));
		const label = weekdayFormatter.format(date).replace(".", "");

		html += `
			<span class="heatmap-day ${level} heatmap-week-day" data-date="${isoDate}" title="${escapeHtml(item ? `${label} · ${dateFormatter.format(date)} · ${brushings}/3 escovações` : `${label} · ${dateFormatter.format(date)} · sem registro`)}" aria-label="${escapeHtml(item ? `${label} · ${dateFormatter.format(date)} · ${brushings}/3 escovações` : `${label} · ${dateFormatter.format(date)} · sem registro`)}">${date.getDate()}</span>
		`;
	});

	html += '</div>';
	dom.dashboardMonthHeatmap.innerHTML = html;
}

function setDashboardChartPanelMode(range) {
	const isMonth = range === "month";

	if (dom.dashboardChartPanelTitle) {
		dom.dashboardChartPanelTitle.textContent = isMonth ? "Visão do mês" : "Últimos 7 dias";
	}

	if (dom.dashboardChartPanelSubtitle) {
		dom.dashboardChartPanelSubtitle.textContent = isMonth
			? "Cada quadrado = 1 dia (0 a 3 escovações). Passe o mouse para ver o detalhe."
			: "Os 7 dias mais recentes, incluindo hoje, no mesmo formato do calendário mensal.";
	}

	if (dom.dashboardHeatmapLegend) {
		dom.dashboardHeatmapLegend.classList.toggle("hidden", !isMonth);
	}

	if (dom.dashboardChart) {
		dom.dashboardChart.setAttribute(
			"aria-label",
			isMonth ? "Gráfico de adesão do mês" : "Gráfico dos últimos 7 dias"
		);
	}
}

function renderMonthHeatmap(items, month) {
	if (!dom.dashboardMonthHeatmap) return;

	const { year, monthIndex, lastDay } = parseMonthBounds(month);
	const byDate = new Map(items.map((item) => [item.checklist_date, item]));
	const weekdayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];
	const firstWeekday = new Date(year, monthIndex - 1, 1).getDay();

	let html = '<div class="heatmap-weekdays">';
	weekdayLabels.forEach((label) => {
		html += `<span class="heatmap-weekday">${label}</span>`;
	});
	html += '</div><div class="heatmap-grid">';

	for (let i = 0; i < firstWeekday; i += 1) {
		html += '<span class="heatmap-day heatmap-day-empty" aria-hidden="true"></span>';
	}

	for (let day = 1; day <= lastDay; day += 1) {
		const isoDate = `${month}-${String(day).padStart(2, "0")}`;
		const item = byDate.get(isoDate);
		const brushings = countBrushingsForItem(item);
		const hasRecord = Boolean(item);
		const level = getHeatmapLevel(brushings, hasRecord);
		const title = hasRecord
			? `${day}/${monthIndex}: ${brushings}/3 escovações`
			: `${day}/${monthIndex}: sem registro`;

		html += `
			<span
				class="heatmap-day ${level}"
				data-date="${isoDate}"
				title="${escapeHtml(title)}"
				aria-label="${escapeHtml(title)}"
			>${day}</span>
		`;
	}

	html += "</div>";
	dom.dashboardMonthHeatmap.innerHTML = html;
}

function computePeriodSummary(items) {
	const summary = {
		morning: { done: 0, label: "Manhã", icon: "ph-sun-horizon" },
		afternoon: { done: 0, label: "Tarde", icon: "ph-sun" },
		night: { done: 0, label: "Noite", icon: "ph-moon-stars" }
	};

	items.forEach((item) => {
		if (item.brushing_morning) summary.morning.done += 1;
		if (item.brushing_afternoon) summary.afternoon.done += 1;
		if (item.brushing_night) summary.night.done += 1;
	});

	const days = items.length || 1;
	return Object.values(summary).map((period) => ({
		...period,
		total: days * 1,
		percent: Math.round((period.done / days) * 100)
	}));
}

function renderPeriodBars(items) {
	if (!dom.dashboardPeriodBars) return;

	if (!items.length) {
		dom.dashboardPeriodBars.innerHTML =
			'<p class="dashboard-inline-empty">Nenhum dia registrado neste mês.</p>';
		return;
	}

	const periods = computePeriodSummary(items);
	dom.dashboardPeriodBars.innerHTML = periods
		.map(
			(period) => `
			<div class="period-bar-row">
				<div class="period-bar-label">
					<i class="ph ${period.icon}"></i>
					<span>${period.label}</span>
					<strong>${period.done}×</strong>
				</div>
				<div class="period-bar-track">
					<div class="period-bar-fill" style="width: ${period.percent}%;"></div>
				</div>
				<span class="period-bar-meta">${period.percent}% dos dias com registro</span>
			</div>
		`
		)
		.join("");
}

function getAttentionDays(items) {
	return items
		.filter((item) => {
			return item.resistance_level === "moderate" || item.resistance_level === "severe";
		})
		.sort((a, b) => (a.checklist_date < b.checklist_date ? 1 : -1));
}

function renderAttentionList(items) {
	if (!dom.dashboardAttentionList) return;

	const attentionDays = getAttentionDays(items);
	dom.dashboardAttentionList.innerHTML = "";
	
	if (dom.dashboardAttentionPagination) {
		dom.dashboardAttentionPagination.innerHTML = "";
	}

	if (!attentionDays.length) {
		dom.dashboardAttentionList.innerHTML =
			'<li class="dashboard-activity-item dashboard-activity-item-good"><span>Nenhum dia crítico no mês. Continue registrando no Checklist.</span></li>';
		return;
	}

	const itemsPerPage = 5;
	const totalItems = attentionDays.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);

	// Valida página corrente
	if (dashboardCache.attentionPage > totalPages) {
		dashboardCache.attentionPage = totalPages;
	}
	if (dashboardCache.attentionPage < 1) {
		dashboardCache.attentionPage = 1;
	}

	const startIndex = (dashboardCache.attentionPage - 1) * itemsPerPage;
	const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
	const paginatedItems = attentionDays.slice(startIndex, endIndex);

	paginatedItems.forEach((item) => {
		const brushings = countBrushingsForItem(item);
		const li = document.createElement("li");
		li.className = "dashboard-activity-item";
		li.innerHTML = `
			<strong>${escapeHtml(formatDate(item.checklist_date))}</strong>
			<span>${brushings}/3 escovações · ${escapeHtml(translateResistance(item.resistance_level))}</span>
		`;
		dom.dashboardAttentionList.appendChild(li);
	});

	// Renderiza os controles de paginação se houver mais de 1 página
	if (totalPages > 1 && dom.dashboardAttentionPagination) {
		// Botão Anterior
		const prevBtn = document.createElement("button");
		prevBtn.type = "button";
		prevBtn.className = "pagination-btn";
		prevBtn.innerHTML = '<i class="ph ph-caret-left"></i>';
		prevBtn.disabled = dashboardCache.attentionPage === 1;
		prevBtn.addEventListener("click", () => {
			dashboardCache.attentionPage -= 1;
			renderAttentionList(items);
		});
		dom.dashboardAttentionPagination.appendChild(prevBtn);

		// Botões numéricos
		for (let i = 1; i <= totalPages; i += 1) {
			const pageBtn = document.createElement("button");
			pageBtn.type = "button";
			pageBtn.className = `pagination-btn${dashboardCache.attentionPage === i ? " active" : ""}`;
			pageBtn.textContent = i;
			pageBtn.addEventListener("click", () => {
				dashboardCache.attentionPage = i;
				renderAttentionList(items);
			});
			dom.dashboardAttentionPagination.appendChild(pageBtn);
		}

		// Botão Próximo
		const nextBtn = document.createElement("button");
		nextBtn.type = "button";
		nextBtn.className = "pagination-btn";
		nextBtn.innerHTML = '<i class="ph ph-caret-right"></i>';
		nextBtn.disabled = dashboardCache.attentionPage === totalPages;
		nextBtn.addEventListener("click", () => {
			dashboardCache.attentionPage += 1;
			renderAttentionList(items);
		});
		dom.dashboardAttentionPagination.appendChild(nextBtn);
	}
}

function renderDashboardQuizBlock(attempts) {
	if (!dom.dashboardRecentQuiz) return;

	const list = attempts || [];
	dom.dashboardRecentQuiz.innerHTML = "";

	if (dom.dashboardQuizSummary) {
		if (!list.length) {
			dom.dashboardQuizSummary.textContent = "Nenhuma tentativa registrada ainda.";
		} else {
			const avg =
				list.reduce((sum, attempt) => {
					const total = Number(attempt.total_questions) || 0;
					const score = Number(attempt.score) || 0;
					return sum + (total ? (score / total) * 100 : 0);
				}, 0) / list.length;
			dom.dashboardQuizSummary.textContent = `Média das últimas ${list.length} tentativa(s): ${Math.round(avg)}% de acertos.`;
		}
	}

	if (!list.length) {
		dom.dashboardRecentQuiz.innerHTML =
			'<li class="dashboard-activity-item"><span>Vá à aba Quizz para treinar com a criança.</span></li>';
		return;
	}

	list.slice(0, 6).forEach((attempt) => {
		const total = Number(attempt.total_questions) || 0;
		const score = Number(attempt.score) || 0;
		const percent = total ? Math.round((score / total) * 100) : 0;

		const li = document.createElement("li");
		li.className = "dashboard-activity-item";
		li.innerHTML = `
			<strong>${escapeHtml(formatDateTime(attempt.created_at))}</strong>
			<span>${score}/${total} acertos (${percent}%)</span>
		`;
		dom.dashboardRecentQuiz.appendChild(li);
	});
}

function setDashboardChartRange(range) {
	dashboardCache.chartRange = range === "month" ? "month" : "week";

	dom.dashboardChartToggleButtons.forEach((button) => {
		button.classList.toggle("active", button.dataset.chartRange === dashboardCache.chartRange);
	});

	setDashboardChartPanelMode(dashboardCache.chartRange);

	if (dashboardCache.chartRange === "month") {
		renderMonthHeatmap(dashboardCache.monthItems, dashboardCache.month);
		renderDashboardBars(
			buildMonthWeeklySeries(dashboardCache.monthItems, dashboardCache.month),
			"Registre dias no mês selecionado para ver o resumo por semana."
		);
		return;
	}

	renderDashboardWeekCalendar(dashboardCache.recentItems);
	renderDashboardBars(
		buildLast7DaysSeries(dashboardCache.recentItems),
		"Registre o checklist para visualizar os últimos 7 dias."
	);
}

async function loadDashboard(month) {
	dashboardCache.attentionPage = 1;
	const monthValue = month || new Date().toISOString().slice(0, 7);
	const { start, end } = parseMonthBounds(monthValue);

	const today = new Date();
	const recentStart = new Date();
	recentStart.setDate(today.getDate() - 6);

	// Busca todos os dados em paralelo, sem deixar uma falha derubar tudo
	const results = await Promise.allSettled([
		api(`/checklists/stats?month=${encodeURIComponent(monthValue)}`),
		api(`/checklists?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`),
		api(`/checklists?start=${recentStart.toISOString().slice(0, 10)}&end=${today.toISOString().slice(0, 10)}`),
		api("/quiz/history?limit=6")
	]);

	// Extrai valores ou usa estado vazio real (sem mock)
	const statsResult = results[0].status === "fulfilled" ? results[0].value : null;
	const monthChecklists = results[1].status === "fulfilled" ? results[1].value : null;
	const recentChecklists = results[2].status === "fulfilled" ? results[2].value : null;
	const quizResult = results[3].status === "fulfilled" ? results[3].value : null;

	if (results[0].status === "rejected") {
		console.warn("Falha ao buscar estatísticas:", results[0].reason?.message);
	}

	// Estado vazio se não há dados ou se a API falhou
	const stats = statsResult || {
		adherenceRate: 0,
		completedBrushings: 0,
		expectedBrushings: 0,
		entries: 0,
		resistance: { none: 0, light: 0, moderate: 0, severe: 0 }
	};
	const monthItems = monthChecklists?.items || [];
	const recentItems = recentChecklists?.items || [];
	const attempts = quizResult?.attempts || [];

	const highResistance = (stats.resistance?.moderate || 0) + (stats.resistance?.severe || 0);

	dom.adherenceValue.textContent = `${stats.adherenceRate}%`;
	dom.completedValue.textContent = `${stats.completedBrushings}/${stats.expectedBrushings}`;

	if (dom.brushingsGoalHint) {
		dom.brushingsGoalHint.textContent = `${stats.expectedBrushings} previstas no mês (até 3 por dia)`;
	}

	if (dom.trackedDaysValue) {
		dom.trackedDaysValue.textContent = String(stats.entries || 0);
	}

	if (dom.resistanceHint) {
		dom.resistanceHint.textContent = `Resistência moderada/grave: ${highResistance} dia(s)`;
	}

	dashboardCache.month = monthValue;
	dashboardCache.monthItems = monthItems;
	dashboardCache.recentItems = recentItems;
	dashboardCache.attempts = attempts;

	renderMonthHeatmap(dashboardCache.monthItems, monthValue);
	renderPeriodBars(dashboardCache.monthItems);
	renderAttentionList(dashboardCache.monthItems);
	renderDashboardQuizBlock(dashboardCache.attempts);
	setDashboardChartRange(dashboardCache.chartRange);
}

async function loadChecklistForDate(dateValue) {
	if (!dateValue) {
		return;
	}

	let item = null;
	try {
		const result = await api(
			`/checklists?start=${encodeURIComponent(dateValue)}&end=${encodeURIComponent(dateValue)}`
		);
		item = result?.items?.[0] || null;
	} catch (error) {
		// Se a API falhar, mantém o formulário vazio (sem dados mockados)
		console.warn("Falha ao buscar checklist. O formulário ficará em branco para preenchimento.", error);
	}

	const form = dom.checklistForm;

	if (item) {
		form.morning.checked = Boolean(item.brushing_morning);
		form.afternoon.checked = Boolean(item.brushing_afternoon);
		form.night.checked = Boolean(item.brushing_night);
		form.resistanceLevel.value = item.resistance_level || "none";
		form.notes.value = item.notes || "";
	} else {
		// Sem registro: Limpa os campos e auto-seleciona o turno atual
		form.morning.checked = false;
		form.afternoon.checked = false;
		form.night.checked = false;
		form.resistanceLevel.value = "light";
		form.notes.value = "";

		const hour = new Date().getHours();
		if (hour >= 5 && hour < 12) {
			form.morning.checked = true;
		} else if (hour >= 12 && hour < 18) {
			form.afternoon.checked = true;
		} else {
			form.night.checked = true;
		}
	}

	syncChecklistUI();
}

async function onChecklistSubmit(event) {
	event.preventDefault();

	const date = dom.checklistDate.value;
	if (!date) {
		setStatus("Selecione uma data valida.", "error");
		return;
	}

	const payload = {
		morning: dom.checklistForm.morning.checked,
		afternoon: dom.checklistForm.afternoon.checked,
		night: dom.checklistForm.night.checked,
		resistanceLevel: dom.checklistForm.resistanceLevel.value === 'super-none' ? 'none' : dom.checklistForm.resistanceLevel.value,
		notes: dom.checklistForm.notes.value
	};

	try {
		await api(`/checklists/${encodeURIComponent(date)}`, {
			method: "PUT",
			body: payload
		});

		setStatus("Checklist salvo com sucesso.", "success");
		await loadDashboard(dom.monthInput.value);
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function loadGuideSteps() {
	const steps = GUIDE_STEPS_CATALOG;
	const completedStepIds = getCompletedGuideStepIds();
	dom.guideContainer.innerHTML = "";

	if (dom.guideProgressSummary) {
		dom.guideProgressSummary.textContent = `${completedStepIds.size} de ${steps.length} etapas concluídas`;
	}

	steps.forEach((step) => {
		const imageUrl = getGuideStepImageUrl(step);
		const item = document.createElement("div");
		item.className = "timeline-item";
		const badge = document.createElement("div");
		badge.className = "timeline-badge";
		badge.textContent = step.step_order;
		item.appendChild(badge);
		const card = document.createElement("button");
		card.type = "button";
		card.className = "guide-card";
		card.classList.toggle("is-completed", completedStepIds.has(String(step.id)));
		card.setAttribute("aria-label", `Abrir etapa ${step.step_order}: ${step.title}`);
		card.innerHTML = `
			${completedStepIds.has(String(step.id)) ? '<span class="guide-card-complete-badge" aria-hidden="true"><i class="ph-fill ph-check"></i></span>' : ''}
			<div class="guide-card-img-wrapper">
				<img src="${imageUrl}" alt="${escapeHtml(step.title)}" loading="lazy" />
			</div>
			<div class="inner">
				<h4>${escapeHtml(step.title)}</h4>
				<p>${escapeHtml(step.description)}</p>
			</div>
		`;
		card.addEventListener("click", () => openGuideStepModal(step));
		item.appendChild(card);
		dom.guideContainer.appendChild(item);
	});
}

function getGuideCompletionStorageKey() {
	const userId = state.user?.username || state.user?.email || state.user?.id || "guest";
	return `sorriso_guide_completed_steps_${userId}`;
}

function getCompletedGuideStepIds() {
	if (!state.completedGuideStepIds) {
		state.completedGuideStepIds = new Set();
	}
	return state.completedGuideStepIds;
}

function saveCompletedGuideStepIds(ids) {
	state.completedGuideStepIds = ids;
}

function resolveAssetUrl(path) {
	return encodeURI(String(path || ""));
}

function getGuideStepCarouselImages(step) {
	const images = Array.isArray(step?.bannerImages) && step.bannerImages.length
		? step.bannerImages
		: [step?.coverImage || step?.image_url || "./assets/illustrations/guide-1.svg"];
	return images.map(resolveAssetUrl);
}

function getGuideStepExpandedDetails(step) {
	return Array.isArray(step?.instructions) ? step.instructions : [];
}

function updateGuideCarouselPosition() {
	if (!dom.guideCarouselTrack) return;
	const totalSlides = dom.guideCarouselTrack.children.length || 1;
	const normalizedIndex = ((state.guideCarouselIndex % totalSlides) + totalSlides) % totalSlides;
	state.guideCarouselIndex = normalizedIndex;
	dom.guideCarouselTrack.style.transform = `translateX(-${normalizedIndex * 100}%)`;
	if (dom.guideCarouselCounter) {
		dom.guideCarouselCounter.textContent = `${normalizedIndex + 1}/${totalSlides}`;
	}
}

function renderGuideStepModal(step) {
	if (!dom.guideCarouselTrack || !dom.guideCarouselCounter) return;

	const slides = getGuideStepCarouselImages(step);
	dom.guideCarouselTrack.innerHTML = slides
		.map((imageUrl, index) => `
			<div class="guide-carousel-slide">
				<img src="${imageUrl}" alt="${escapeHtml(step.title)} - imagem ${index + 1}" loading="lazy" />
			</div>
		`)
		.join("");

	state.guideCarouselIndex = 0;
	updateGuideCarouselPosition();

	if (dom.guideModalKicker) {
		dom.guideModalKicker.textContent = `Etapa ${step.step_order}`;
	}
	if (dom.guideStepModalTitle) {
		dom.guideStepModalTitle.textContent = step.title;
	}
	if (dom.guideStepModalDescription) {
		dom.guideStepModalDescription.textContent = step.description;
	}
	if (dom.guideStepModalDetails) {
		const instructionItems = getGuideStepExpandedDetails(step)
			.map((instruction, index) => `
				<li class="guide-instruction-item">
					<span class="guide-instruction-index">${index + 1}</span>
					<span>${escapeHtml(instruction)}</span>
				</li>
			`)
			.join("");

		const adaptation = step.adaptations || {};
		const referenceVisual = step.referenceVisual;
		const referenceVisualMarkup = referenceVisual
			? `
				<section class="guide-detail-block">
					<h4>Referência visual</h4>
					<p class="guide-detail-caption">${escapeHtml(referenceVisual.title)}</p>
					<div class="guide-reference-grid">
						${(referenceVisual.items || []).map((item) => `
							<article class="guide-reference-card">
								<img src="${resolveAssetUrl(item.image)}" alt="${escapeHtml(item.label)}" loading="lazy" />
								<div>
									<strong>${escapeHtml(item.label)}</strong>
									<span>${escapeHtml(item.subtitle)}</span>
								</div>
							</article>
						`).join("")}
					</div>
				</section>
			`
			: "";

		dom.guideStepModalDetails.innerHTML = `
			<section class="guide-detail-block">
				<h4>Sequência de instruções</h4>
				<ul class="guide-instruction-list">${instructionItems}</ul>
			</section>
			${referenceVisualMarkup}
			<section class="guide-detail-block">
				<h4>Adaptação por nível de suporte (DSM-5)</h4>
				<div class="guide-adaptation-list">
					<article class="guide-adaptation-card n1"><strong>N1</strong><p>${escapeHtml(adaptation.n1 || "")}</p></article>
					<article class="guide-adaptation-card n2"><strong>N2</strong><p>${escapeHtml(adaptation.n2 || "")}</p></article>
					<article class="guide-adaptation-card n3"><strong>N3</strong><p>${escapeHtml(adaptation.n3 || "")}</p></article>
				</div>
			</section>
			<section class="guide-detail-block guide-attention-block">
				<h4>Atenção clínica</h4>
				<p>${escapeHtml(step.clinicalAttention || "")}</p>
			</section>
		`;
	}

	if (dom.guideStepModalConclude) {
		dom.guideStepModalConclude.textContent = isGuideStepCompleted(step.id) ? "Etapa concluída" : "Marcar como concluída";
		dom.guideStepModalConclude.disabled = isGuideStepCompleted(step.id);
	}
}

function isGuideStepCompleted(stepId) {
	return getCompletedGuideStepIds().has(String(stepId));
}

function openGuideStepModal(step) {
	if (!dom.guideStepModal || !step) return;

	state.guideModalStep = step;
	renderGuideStepModal(step);

	const modalContent = dom.guideStepModal.querySelector(".guide-modal-content");
	if (modalContent) {
		modalContent.scrollTop = 0;
	}

	dom.guideStepModal.classList.remove("hidden");
	dom.guideStepModal.setAttribute("aria-hidden", "false");
	document.body.classList.add("modal-open");

	if (modalContent) {
		modalContent.scrollTop = 0;
	}

	if (dom.guideStepModalConclude && !dom.guideStepModalConclude.disabled) {
		dom.guideStepModalConclude.focus({ preventScroll: true });
	}
}

function closeGuideStepModal() {
	if (!dom.guideStepModal) return;
	dom.guideStepModal.classList.add("hidden");
	dom.guideStepModal.setAttribute("aria-hidden", "true");
	document.body.classList.remove("modal-open");
	state.guideModalStep = null;
}

function markGuideStepAsCompleted(stepId) {
	const completedIds = getCompletedGuideStepIds();
	completedIds.add(String(stepId));
	saveCompletedGuideStepIds(completedIds);
	loadGuideSteps();
}

function bindGuideModalEvents() {
	if (!dom.guideStepModal) return;

	if (dom.guideStepModalBackdrop) {
		dom.guideStepModalBackdrop.addEventListener("click", () => closeGuideStepModal());
	}

	if (dom.guideCarouselPrev) {
		dom.guideCarouselPrev.addEventListener("click", () => {
			state.guideCarouselIndex -= 1;
			updateGuideCarouselPosition();
		});
	}

	if (dom.guideCarouselNext) {
		dom.guideCarouselNext.addEventListener("click", () => {
			state.guideCarouselIndex += 1;
			updateGuideCarouselPosition();
		});
	}

	if (dom.guideStepModalConclude) {
		dom.guideStepModalConclude.addEventListener("click", () => {
			if (!state.guideModalStep) return;
			markGuideStepAsCompleted(state.guideModalStep.id);
			closeGuideStepModal();
		});
	}

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !dom.guideStepModal.classList.contains("hidden")) {
			closeGuideStepModal();
		}
	});
}

function getGuideStepImageUrl(step) {
	const imagePath = String(step?.coverImage || step?.image_url || "./assets/illustrations/guide-1.svg").trim();
	return resolveAssetUrl(imagePath);
}

async function loadQuizQuestions() {
	let questions = [];
	try {
		const result = await api("/quiz/questions");
		questions = result?.questions || [];
	} catch (error) {
		console.warn("Falha ao buscar quiz do servidor. Usando dados estáticos de fallback.", error);
	}

	// Se retornar vazio do banco ou der erro na tabela, usa o fallback estático
	if (!questions || !questions.length) {
		questions = demoStore.quizQuestions;
	}

	state.quizQuestions = questions;
}

function startQuiz() {
	if (!state.quizQuestions || !state.quizQuestions.length) {
		setStatus("Nenhuma pergunta disponível no momento.", "error");
		return;
	}
	state.currentQuestionIndex = 0;
	state.quizAnswers = [];
	state.selectedOptionId = null;
	state.quizState = "active";

	dom.quizStateStart.classList.add("hidden");
	dom.quizStateResults.classList.add("hidden");
	dom.quizStateActive.classList.remove("hidden");

	renderCurrentQuizQuestion();
}

function resetQuizSession() {
	state.currentQuestionIndex = 0;
	state.selectedOptionId = null;
	state.quizAnswers = [];
	state.quizState = "start";

	if (dom.quizProgressBar) {
		dom.quizProgressBar.style.width = "0%";
	}
}

function showQuizStartScreen() {
	resetQuizSession();
	dom.quizStateActive.classList.add("hidden");
	dom.quizStateResults.classList.add("hidden");
	dom.quizStateStart.classList.remove("hidden");
}

function bindConfirmModalEvents() {
	if (!dom.confirmModal) return;

	dom.confirmModalCancel.addEventListener("click", () => closeConfirmModal(false));
	dom.confirmModalBackdrop.addEventListener("click", () => closeConfirmModal(false));
	dom.confirmModalConfirm.addEventListener("click", () => closeConfirmModal(true));

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !dom.confirmModal.classList.contains("hidden")) {
			closeConfirmModal(false);
		}
	});
}

function openConfirmModal({
	title,
	message,
	confirmText = "Confirmar",
	cancelText = "Cancelar",
	danger = false
}) {
	return new Promise((resolve) => {
		if (!dom.confirmModal) {
			resolve(window.confirm(message || title));
			return;
		}

		confirmModalResolver = resolve;
		dom.confirmModalTitle.textContent = title;
		dom.confirmModalMessage.textContent = message;
		dom.confirmModalConfirm.textContent = confirmText;
		dom.confirmModalCancel.textContent = cancelText;

		dom.confirmModalIcon.classList.toggle("is-danger", danger);
		dom.confirmModalConfirm.classList.toggle("is-danger", danger);

		dom.confirmModal.classList.remove("hidden");
		dom.confirmModal.setAttribute("aria-hidden", "false");
		document.body.classList.add("modal-open");
		dom.confirmModalCancel.focus();
	});
}

function closeConfirmModal(confirmed) {
	if (!dom.confirmModal) return;

	dom.confirmModal.classList.add("hidden");
	dom.confirmModal.setAttribute("aria-hidden", "true");
	document.body.classList.remove("modal-open");

	if (confirmModalResolver) {
		confirmModalResolver(Boolean(confirmed));
		confirmModalResolver = null;
	}
}

function bindDayDetailModalEvents() {
	if (!dom.dashboardDayDetailModal) return;

	if (dom.dashboardDayDetailModalBackdrop) {
		dom.dashboardDayDetailModalBackdrop.addEventListener("click", () => closeDayDetailModal());
	}

	if (dom.dashboardDayDetailModalClose) {
		dom.dashboardDayDetailModalClose.addEventListener("click", () => closeDayDetailModal());
	}

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !dom.dashboardDayDetailModal.classList.contains("hidden")) {
			closeDayDetailModal();
		}
	});
}

function handleDashboardHeatmapClick(event) {
	// No mobile o heatmap e apenas visual: nao abre a modal de detalhe.
	if (isAppMobile()) return;

	const target = event.target.closest(".heatmap-day[data-date]");
	if (!target || !dom.dashboardMonthHeatmap?.contains(target)) return;

	openDayDetailModal(target.dataset.date || "");
}

function getChecklistItemForDate(date) {
	return (
		dashboardCache.monthItems.find((item) => item.checklist_date === date) ||
		dashboardCache.recentItems.find((item) => item.checklist_date === date) ||
		null
	);
}

function getPeriodIconClass(period) {
	const map = {
		morning: "ph-sun-horizon",
		afternoon: "ph-sun",
		night: "ph-moon-stars"
	};

	return map[period] || "ph-circle";
}

function getResistanceIconClass(value) {
	const map = {
		none: "ph-smiley",
		light: "ph-smiley-meh",
		moderate: "ph-smiley-sad",
		severe: "ph-smiley-angry"
	};

	return map[value] || "ph-circle";
}

function getResistanceToneClass(value) {
	const map = {
		none: "tone-positive",
		light: "tone-neutral",
		moderate: "tone-negative",
		severe: "tone-extreme-negative"
	};

	return map[value] || "tone-neutral";
}

function getPeriodToneClass(period) {
	const map = {
		morning: "tone-morning",
		afternoon: "tone-afternoon",
		night: "tone-night"
	};

	return map[period] || "tone-morning";
}

function setRowVisibility(rowElement, visible) {
	if (!rowElement) return;
	rowElement.classList.toggle("hidden", !visible);
}

function setDayDetailRow(periodIconElement, resistanceIconElement, noteElement, shouldShowData, item, period) {
	if (!periodIconElement || !resistanceIconElement || !noteElement) return;

	const rowElement = periodIconElement.closest(".dashboard-day-detail-row");
	setRowVisibility(rowElement, shouldShowData && Boolean(item));

	if (!shouldShowData || !item) {
		periodIconElement.innerHTML = "";
		periodIconElement.className = "dashboard-detail-icon-circle";
		resistanceIconElement.innerHTML = "";
		resistanceIconElement.className = "dashboard-detail-icon-circle";
		noteElement.textContent = "";
		return;
	}

	periodIconElement.className = `dashboard-detail-icon-circle ${getPeriodToneClass(period)}`;
	resistanceIconElement.className = `dashboard-detail-icon-circle ${getResistanceToneClass(item.resistance_level)}`;
	periodIconElement.innerHTML = `<i class="ph-fill ${getPeriodIconClass(period)}"></i>`;
	resistanceIconElement.innerHTML = `<i class="ph-fill ${getResistanceIconClass(item.resistance_level)}"></i>`;
	noteElement.textContent = String(item.notes || "").trim();
}

function openDayDetailModal(date) {
	if (!dom.dashboardDayDetailModal || !date) return;

	const item = getChecklistItemForDate(date);
	const dateObject = new Date(`${date}T12:00:00`);
	const displayDate = Number.isNaN(dateObject.getTime())
		? date
		: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(dateObject);

	if (dom.dashboardDayDetailModalTitle) {
		dom.dashboardDayDetailModalTitle.textContent = displayDate;
	}

	if (dom.dashboardDayDetailModalSubtitle) {
		dom.dashboardDayDetailModalSubtitle.textContent = item
			? "Resistência e observação registradas por turno."
			: "Nenhum registro encontrado para este dia.";
	}

	setDayDetailRow(
		dom.dashboardDayDetailMorningPeriodIcon,
		dom.dashboardDayDetailMorningResistanceIcon,
		dom.dashboardDayDetailMorningNote,
		Boolean(item?.brushing_morning),
		item,
		"morning"
	);
	setDayDetailRow(
		dom.dashboardDayDetailAfternoonPeriodIcon,
		dom.dashboardDayDetailAfternoonResistanceIcon,
		dom.dashboardDayDetailAfternoonNote,
		Boolean(item?.brushing_afternoon),
		item,
		"afternoon"
	);
	setDayDetailRow(
		dom.dashboardDayDetailNightPeriodIcon,
		dom.dashboardDayDetailNightResistanceIcon,
		dom.dashboardDayDetailNightNote,
		Boolean(item?.brushing_night),
		item,
		"night"
	);

	dom.dashboardDayDetailModal.classList.remove("hidden");
	dom.dashboardDayDetailModal.setAttribute("aria-hidden", "false");
	document.body.classList.add("modal-open");
}

function closeDayDetailModal() {
	if (!dom.dashboardDayDetailModal) return;

	dom.dashboardDayDetailModal.classList.add("hidden");
	dom.dashboardDayDetailModal.setAttribute("aria-hidden", "true");
	document.body.classList.remove("modal-open");
}

async function exitQuiz() {
	if (state.quizState === "active" || state.quizState === "checked") {
		const confirmed = await openConfirmModal({
			title: "Sair do quiz?",
			message: "Todo o seu progresso nesta tentativa será perdido.",
			confirmText: "Sair",
			cancelText: "Continuar quiz",
			danger: true
		});

		if (confirmed) {
			showQuizStartScreen();
		}
		return;
	}

	showQuizStartScreen();
}

function renderCurrentQuizQuestion() {
	const question = state.quizQuestions[state.currentQuestionIndex];

	// Barra de Progresso
	const progress = (state.currentQuestionIndex / state.quizQuestions.length) * 100;
	dom.quizProgressBar.style.width = `${progress}%`;

	// Categoria e Título
	dom.quizQuestionCategory.textContent = question.category || "Saúde Bucal";
	dom.quizQuestionText.textContent = question.question;

	// Renderizar Opções (altura adapta conforme quantidade)
	const optionCount = question.options.length;
	dom.quizOptionsGrid.style.setProperty("--quiz-options-count", String(optionCount));
	dom.quizOptionsGrid.innerHTML = "";
	question.options.forEach((option, index) => {
		const item = document.createElement("div");
		item.className = "quiz-option-item";
		item.dataset.id = option.id;

		item.innerHTML = `
			<span class="quiz-option-index">${index + 1}</span>
			<span class="quiz-option-text">${escapeHtml(option.text)}</span>
		`;

		item.addEventListener("click", () => selectQuizOption(option.id));
		dom.quizOptionsGrid.appendChild(item);
	});

	// Ocultar banner de feedback
	dom.quizFeedbackContainer.className = "quiz-feedback-banner hidden";

	// Resetar botão de ação
	dom.quizActionBtn.textContent = "Verificar";
	dom.quizActionBtn.disabled = true;
	dom.quizActionBtn.className = "quiz-btn-action";
}

function selectQuizOption(optionId) {
	if (state.quizState !== "active") return;

	state.selectedOptionId = optionId;

	const items = dom.quizOptionsGrid.querySelectorAll(".quiz-option-item");
	items.forEach((item) => {
		if (Number(item.dataset.id) === optionId) {
			item.classList.add("selected");
		} else {
			item.classList.remove("selected");
		}
	});

	dom.quizActionBtn.disabled = false;
	dom.quizActionBtn.classList.add("ready");
}

async function handleQuizAction() {
	if (state.quizState === "active") {
		if (state.selectedOptionId == null) {
			return;
		}

		// Verificar Resposta
		const question = state.quizQuestions[state.currentQuestionIndex];
		const selectedOption = question.options.find((opt) => opt.id === state.selectedOptionId);
		const isCorrect = selectedOption ? Boolean(selectedOption.isCorrect) : false;
		const explanation = selectedOption ? (selectedOption.explanation || "") : "";

		// Salvar resposta na lista local
		state.quizAnswers.push({
			questionId: question.id,
			optionId: state.selectedOptionId
		});

		state.quizState = "checked";

		// Destacar opções e travar interações
		const items = dom.quizOptionsGrid.querySelectorAll(".quiz-option-item");
		items.forEach((item) => {
			item.classList.add("disabled");
			const optId = Number(item.dataset.id);
			const opt = question.options.find((o) => o.id === optId);

			if (optId === state.selectedOptionId) {
				if (isCorrect) {
					item.classList.add("correct");
				} else {
					item.classList.add("incorrect");
				}
			} else if (opt && opt.isCorrect) {
				// Mostrar a resposta correta se o usuário errou
				item.classList.add("correct");
			}
		});

		// Exibir feedback
		dom.quizFeedbackContainer.classList.remove("hidden");
		const feedbackIcon = dom.quizFeedbackIcon;
		const feedbackTitle = dom.quizFeedbackTitle;
		const feedbackExplanation = dom.quizFeedbackExplanation;

		if (isCorrect) {
			dom.quizFeedbackContainer.className = "quiz-feedback-banner correct";
			feedbackIcon.className = "ph-fill ph-check-circle";
			feedbackTitle.textContent = "Excelente! Resposta Correta";
			feedbackExplanation.textContent = explanation || "Você acertou esta etapa importante!";
			dom.quizActionBtn.textContent = "Continuar";
			dom.quizActionBtn.className = "quiz-btn-action continue-correct";
		} else {
			dom.quizFeedbackContainer.className = "quiz-feedback-banner incorrect";
			feedbackIcon.className = "ph-fill ph-x-circle";
			feedbackTitle.textContent = "Rever Etapa";

			let feedbackMsg = explanation;
			if (!feedbackMsg) {
				const correctOpt = question.options.find((o) => o.isCorrect);
				feedbackMsg = correctOpt ? correctOpt.explanation : "";
			}
			feedbackExplanation.textContent = feedbackMsg || "Estude esta dica para a próxima vez.";
			dom.quizActionBtn.textContent = "Continuar";
			dom.quizActionBtn.className = "quiz-btn-action continue-incorrect";
		}

		dom.quizActionBtn.disabled = false;

	} else if (state.quizState === "checked") {
		// Avançar
		state.currentQuestionIndex++;

		if (state.currentQuestionIndex >= state.quizQuestions.length) {
			await submitQuizResults();
		} else {
			state.selectedOptionId = null;
			state.quizState = "active";
			renderCurrentQuizQuestion();
		}
	}
}

async function submitQuizResults() {
	try {
		dom.quizProgressBar.style.width = "100%";

		const result = await api("/quiz/submit", {
			method: "POST",
			body: { answers: state.quizAnswers }
		});

		state.quizState = "results";

		dom.quizStateActive.classList.add("hidden");
		dom.quizStateResults.classList.remove("hidden");

		dom.quizResultsScore.textContent = `${result.score}/${result.total}`;
		dom.quizResultsPercentage.textContent = `${result.percentage}%`;

		dom.quizResultsFeedbackList.innerHTML = "";
		result.feedback.forEach((item, index) => {
			const questionObj = state.quizQuestions.find((q) => q.id === item.questionId);
			const questionText = questionObj ? questionObj.question : `Pergunta ${index + 1}`;

			const li = document.createElement("li");
			li.className = `results-review-item ${item.isCorrect ? "correct" : "incorrect"}`;

			li.innerHTML = `
				<i class="ph-fill ${item.isCorrect ? "ph-check-circle" : "ph-x-circle"}"></i>
				<div class="review-details">
					<strong>${index + 1}. ${escapeHtml(questionText)}</strong>
					<p>${escapeHtml(item.explanation || "")}</p>
				</div>
			`;
			dom.quizResultsFeedbackList.appendChild(li);
		});

		await loadDashboard(dom.monthInput.value);
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function loadVideos() {
	let videos = [];
	try {
		const result = await api("/videos");
		videos = result?.videos || [];
	} catch (error) {
		console.warn("Falha ao buscar vídeos do servidor. Usando dados estáticos de fallback.", error);
	}

	// Se retornar vazio do banco ou der erro na tabela, usa o fallback estático
	if (!videos || !videos.length) {
		videos = demoStore.videos;
	}

	dom.videoContainer.innerHTML = "";

	videos.forEach((video) => {
		const card = document.createElement("article");
		card.className = "video-card";
		card.innerHTML = `
			<iframe
				src="${toEmbedUrl(video.url)}"
				title="${escapeHtml(video.title)}"
				loading="lazy"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
			></iframe>
			<div class="video-content">
				<h4>${escapeHtml(video.title)}</h4>
				<p>${escapeHtml(video.description)}</p>
			</div>
		`;
		dom.videoContainer.appendChild(card);
	});
}

async function loadPreferences() {
	let preferences = null;
	try {
		const result = await api("/user/preferences");
		preferences = result?.preferences || null;
	} catch (error) {
		console.warn("Falha ao buscar preferências do servidor. Usando fallback estático local.", error);
	}

	if (!preferences) {
		preferences = demoStore.preferences;
	}

	dom.reminderEnabled.checked = Boolean(preferences.reminder_enabled);

	const times = Array.isArray(preferences.reminder_times)
		? preferences.reminder_times
		: [];

	dom.reminderTimes.value = times.join(",");
	dom.accessibilityMode.value = preferences.accessibility_mode || "default";
	const savedTheme = localStorage.getItem("sorriso_theme") || preferences.theme_mode || "light";
	dom.themeMode.value = savedTheme;

	applyAccessibility(dom.accessibilityMode.value);
	applyTheme(savedTheme);
	setupReminderEngine(dom.reminderEnabled.checked, times);
}

async function onPreferencesSubmit(event) {
	event.preventDefault();

	const reminderEnabled = dom.reminderEnabled.checked;
	const reminderTimes = dom.reminderTimes.value
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);

	const accessibilityMode = dom.accessibilityMode.value;
	const themeMode = dom.themeMode.value;

	try {
		await api("/user/preferences", {
			method: "PUT",
			body: {
				reminderEnabled,
				reminderTimes,
				accessibilityMode,
				themeMode
			}
		});

		applyAccessibility(accessibilityMode);
		applyTheme(themeMode);
		localStorage.setItem("sorriso_theme", themeMode);
		setupReminderEngine(reminderEnabled, reminderTimes);
		setStatus("Preferencias salvas.", "success");
	} catch (error) {
		setStatus(error.message, "error");
	}
}

function applyAccessibility(mode) {
	document.body.classList.remove("mode-high-contrast", "mode-large-text");

	if (mode === "high-contrast") {
		document.body.classList.add("mode-high-contrast");
	}

	if (mode === "large-text") {
		document.body.classList.add("mode-large-text");
	}
}

function applyTheme(theme) {
	document.body.classList.remove("mode-light", "mode-blue");
	
	if (theme === "light") {
		document.body.classList.add("mode-light");
	} else if (theme === "blue") {
		document.body.classList.add("mode-light", "mode-blue");
	}
}

function setupReminderEngine(enabled, times) {
	stopReminderEngine();

	if (!enabled || !Array.isArray(times) || !times.length) {
		return;
	}

	if (!("Notification" in window)) {
		setStatus("Este navegador nao suporta notificacoes locais.", "info");
		return;
	}

	if (Notification.permission === "default") {
		Notification.requestPermission();
	}

	state.reminderTimer = window.setInterval(() => {
		if (Notification.permission !== "granted") {
			return;
		}

		const now = new Date();
		const hh = String(now.getHours()).padStart(2, "0");
		const mm = String(now.getMinutes()).padStart(2, "0");
		const nowTime = `${hh}:${mm}`;
		const key = `${now.toISOString().slice(0, 10)}-${nowTime}`;

		if (times.includes(nowTime) && state.lastNotificationKey !== key) {
			state.lastNotificationKey = key;
			const message = "Hora de cuidar do sorriso. Vamos registrar a escovacao?";
			new Notification("Sorriso Amigo", { body: message });
		}
	}, 20000);
}

function stopReminderEngine() {
	if (state.reminderTimer) {
		window.clearInterval(state.reminderTimer);
		state.reminderTimer = null;
	}
}

function toEmbedUrl(url) {
	try {
		const parsed = new URL(url);

		if (parsed.hostname.includes("youtube.com")) {
			if (parsed.pathname.startsWith("/embed/")) {
				return parsed.toString();
			}

			const id = parsed.searchParams.get("v");
			if (id) {
				return `https://www.youtube.com/embed/${id}`;
			}
		}

		if (parsed.hostname === "youtu.be") {
			const id = parsed.pathname.replace("/", "");
			return `https://www.youtube.com/embed/${id}`;
		}

		return parsed.toString();
	} catch (error) {
		return url;
	}
}

function createDemoStore() {
	const now = new Date();
	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	const twoDaysAgo = new Date(now);
	twoDaysAgo.setDate(now.getDate() - 2);

	const format = (value) => value.toISOString().slice(0, 10);

	const demoChecklists = [
		{
			checklist_date: format(yesterday),
			brushing_morning: true,
			brushing_afternoon: true,
			brushing_night: true,
			resistance_level: "none",
			notes: "Rotina completa.",
			updated_at: new Date().toISOString()
		},
		{
			checklist_date: format(twoDaysAgo),
			brushing_morning: false,
			brushing_afternoon: true,
			brushing_night: true,
			resistance_level: "moderate",
			notes: "Resistencia no periodo da manha.",
			updated_at: new Date().toISOString()
		}
	];

	const demoPatterns = [
		[true, false, true, "light"],
		[true, true, false, "none"],
		[false, false, true, "severe"],
		[true, true, true, "none"],
		[true, false, false, "moderate"],
		[false, true, true, "light"]
	];

	for (let offset = 3; offset <= 22; offset += 1) {
		const date = new Date(now);
		date.setDate(now.getDate() - offset);
		const pattern = demoPatterns[offset % demoPatterns.length];

		demoChecklists.push({
			checklist_date: format(date),
			brushing_morning: pattern[0],
			brushing_afternoon: pattern[1],
			brushing_night: pattern[2],
			resistance_level: pattern[3],
			notes: "",
			updated_at: new Date().toISOString()
		});
	}

	return {
		user: {
			id: 1,
			full_name: "Visitante",
			username: "visitante",
			email: null,
			role: "caregiver"
		},
		preferences: {
			reminder_enabled: true,
			reminder_times: ["08:00", "13:00", "20:00"],
			accessibility_mode: "default",
			theme_mode: "light"
		},
		checklists: demoChecklists,
		guideSteps: [
			{
				id: 1,
				step_order: 1,
				title: "Preparar a escova",
				description: "Separe escova macia e copo com agua para iniciar de forma previsivel.",
				image_url: "./assets/illustrations/guide-1.svg"
			},
			{
				id: 2,
				step_order: 2,
				title: "Molhar a escova",
				description: "Molhe levemente a escova para reduzir incomodo sensorial.",
				image_url: "./assets/illustrations/guide-2.svg"
			},
			{
				id: 3,
				step_order: 3,
				title: "Aplicar pasta dental",
				description: "Use quantidade pequena (grao de ervilha).",
				image_url: "./assets/illustrations/guide-3.svg"
			},
			{
				id: 4,
				step_order: 4,
				title: "Escovar com ritmo",
				description: "Movimentos suaves por cerca de 2 minutos.",
				image_url: "./assets/illustrations/guide-4.svg"
			},
			{
				id: 5,
				step_order: 5,
				title: "Finalizar e elogiar",
				description: "Finalize com reforco positivo para manter a rotina.",
				image_url: "./assets/illustrations/guide-5.svg"
			}
		],
		quizQuestions: [
			{
				id: 1,
				question: "Qual horario e mais importante para escovar os dentes?",
				category: "Escovacao",
				options: [
					{ id: 101, text: "Apenas de manha", isCorrect: false },
					{
						id: 102,
						text: "Apos as principais refeicoes e antes de dormir",
						isCorrect: true,
						explanation: "Excelente: a frequencia ao longo do dia melhora a prevencao."
					},
					{ id: 103, text: "Somente no dia da consulta", isCorrect: false }
				]
			},
			{
				id: 2,
				question: "Qual atitude ajuda quando ha resistencia durante a escovacao?",
				category: "Comportamento",
				options: [
					{ id: 201, text: "Forcar para terminar rapido", isCorrect: false },
					{
						id: 202,
						text: "Criar rotina previsivel e reforco positivo",
						isCorrect: true,
						explanation: "Rotina e reforco positivo melhoram adesao e reduzem ansiedade."
					},
					{ id: 203, text: "Pular os dias de resistencia", isCorrect: false }
				]
			},
			{
				id: 3,
				question: "Qual recurso visual ajuda pessoas com TEA na higiene oral?",
				category: "Manejo comportamental",
				options: [
					{
						id: 301,
						text: "Checklist visual com passo a passo",
						isCorrect: true,
						explanation: "Imagens e passos claros ajudam previsibilidade e autonomia."
					},
					{ id: 302, text: "Somente explicacao verbal longa", isCorrect: false },
					{ id: 303, text: "Sem rotina definida", isCorrect: false }
				]
			}
		],
		quizAttempts: [
			{
				id: 1,
				score: 2,
				total_questions: 3,
				created_at: new Date(now.getTime() - 86400000).toISOString()
			},
			{
				id: 2,
				score: 3,
				total_questions: 3,
				created_at: new Date(now.getTime() - 172800000).toISOString()
			}
		],
		videos: [
			{
				id: 1,
				title: "Escovacao adaptada para TEA",
				description: "Tecnicas de abordagem gradual para rotina de higiene oral.",
				url: "https://www.youtube.com/watch?v=JYgM9sGQqDY"
			},
			{
				id: 2,
				title: "Manejo de resistencia",
				description: "Estrategias de comunicacao e reforco positivo no dia a dia.",
				url: "https://www.youtube.com/watch?v=2f8A3f6wE8Q"
			},
			{
				id: 3,
				title: "Prevencao em saude bucal",
				description: "Conteudo para familias e profissionais de apoio.",
				url: "https://www.youtube.com/watch?v=4N8R4h3rBlM"
			},
			{
				id: 4,
				title: "Rotina visual passo a passo",
				description: "Como usar imagens e sequencias para preparar a escovacao.",
				url: "https://www.youtube.com/watch?v=JYgM9sGQqDY"
			},
			{
				id: 5,
				title: "Fio dental com paciencia",
				description: "Dicas para introduzir o fio dental sem aumentar a ansiedade.",
				url: "https://www.youtube.com/watch?v=2f8A3f6wE8Q"
			},
			{
				id: 6,
				title: "Alimentacao e dentes saudaveis",
				description: "Habitos alimentares que ajudam na prevencao de caries.",
				url: "https://www.youtube.com/watch?v=4N8R4h3rBlM"
			},
			{
				id: 7,
				title: "Primeira ida ao dentista",
				description: "O que esperar e como preparar a crianca para a consulta.",
				url: "https://www.youtube.com/watch?v=JYgM9sGQqDY"
			},
			{
				id: 8,
				title: "Reforco positivo na higiene oral",
				description: "Elogios e recompensas que fortalecem a adesao a rotina.",
				url: "https://www.youtube.com/watch?v=2f8A3f6wE8Q"
			},
			{
				id: 9,
				title: "Historia social: hora de escovar",
				description: "Narrativa lúdica para antecipar o momento da escovacao.",
				url: "https://www.youtube.com/watch?v=4N8R4h3rBlM"
			}
		],
		nextAttemptId: 3
	};
}

function getDemoChecklistRange(start, end) {
	return demoStore.checklists
		.filter((item) => item.checklist_date >= start && item.checklist_date <= end)
		.sort((a, b) => (a.checklist_date < b.checklist_date ? 1 : -1));
}

function computeDemoChecklistStats(month) {
	const [yearText, monthText] = month.split("-");
	const monthStart = `${month}-01`;
	const monthLastDay = new Date(Number(yearText), Number(monthText), 0).getDate();
	const monthEnd = `${month}-${String(monthLastDay).padStart(2, "0")}`;
	const entries = getDemoChecklistRange(monthStart, monthEnd);

	const resistance = {
		none: 0,
		light: 0,
		moderate: 0,
		severe: 0
	};

	let completedBrushings = 0;

	entries.forEach((item) => {
		completedBrushings += Number(item.brushing_morning);
		completedBrushings += Number(item.brushing_afternoon);
		completedBrushings += Number(item.brushing_night);
		resistance[item.resistance_level] += 1;
	});

	const now = new Date();
	const isCurrentMonth =
		Number(yearText) === now.getFullYear() &&
		Number(monthText) - 1 === now.getMonth();
	const trackedDays = isCurrentMonth ? now.getDate() : monthLastDay;
	const expectedBrushings = trackedDays * 3;
	const adherenceRate = expectedBrushings
		? Math.round((completedBrushings / expectedBrushings) * 100)
		: 0;

	return {
		month,
		completedBrushings,
		expectedBrushings,
		adherenceRate,
		resistance,
		entries: entries.length
	};
}

function upsertDemoChecklist(date, payload) {
	const nextItem = {
		checklist_date: date,
		brushing_morning: Boolean(payload.morning),
		brushing_afternoon: Boolean(payload.afternoon),
		brushing_night: Boolean(payload.night),
		resistance_level: payload.resistanceLevel || "none",
		notes: String(payload.notes || "").trim(),
		updated_at: new Date().toISOString()
	};

	const existingIndex = demoStore.checklists.findIndex((item) => item.checklist_date === date);

	if (existingIndex >= 0) {
		demoStore.checklists[existingIndex] = nextItem;
	} else {
		demoStore.checklists.push(nextItem);
	}

	return nextItem;
}

async function mockApi(path, options = {}) {
	const { method = "GET", body, auth = true } = options;
	const url = new URL(path, "http://demo.local");
	const pathname = url.pathname;
	const normalizedMethod = method.toUpperCase();

	if (auth && !state.token && !pathname.startsWith("/auth/")) {
		throw new Error("Token de acesso ausente.");
	}

	if (pathname === "/auth/login" && normalizedMethod === "POST") {
		demoStore.user = {
			...demoStore.user,
			phone: String(body?.phone || "").replace(/\D/g, ""),
			email: null
		};

		return { token: QUICK_ACCESS_TOKEN, user: demoStore.user };
	}

	if (pathname === "/auth/register/start" && normalizedMethod === "POST") {
		demoStore.pendingRegister = {
			username: String(body?.username || "visitante").trim() || "visitante",
			phone: String(body?.phone || "").replace(/\D/g, "")
		};

		return { message: "Modo demo: use o codigo 000000.", phone: demoStore.pendingRegister.phone, devCode: "000000" };
	}

	if (pathname === "/auth/register/resend" && normalizedMethod === "POST") {
		return { message: "Modo demo: use o codigo 000000.", devCode: "000000" };
	}

	if (pathname === "/auth/register/verify" && normalizedMethod === "POST") {
		if (String(body?.code || "") !== "000000") {
			throw new Error("Codigo incorreto.");
		}

		demoStore.user = {
			...demoStore.user,
			full_name: demoStore.pendingRegister?.username || "Visitante",
			username: demoStore.pendingRegister?.username || "visitante",
			phone: demoStore.pendingRegister?.phone || "",
			email: null,
			role: "caregiver"
		};

		return { token: QUICK_ACCESS_TOKEN, user: demoStore.user };
	}

	if (pathname === "/auth/me" && normalizedMethod === "GET") {
		return { user: demoStore.user };
	}

	if (pathname === "/checklists" && normalizedMethod === "GET") {
		const start = url.searchParams.get("start") || "1900-01-01";
		const end = url.searchParams.get("end") || "2999-12-31";
		return { items: getDemoChecklistRange(start, end) };
	}

	if (pathname === "/checklists/stats" && normalizedMethod === "GET") {
		const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
		return computeDemoChecklistStats(month);
	}

	const checklistMatch = pathname.match(/^\/checklists\/(\d{4}-\d{2}-\d{2})$/);
	if (checklistMatch && normalizedMethod === "PUT") {
		const item = upsertDemoChecklist(checklistMatch[1], body || {});
		return { item };
	}

	if (pathname === "/guide/steps" && normalizedMethod === "GET") {
		return { steps: demoStore.guideSteps };
	}

	if (pathname === "/quiz/questions" && normalizedMethod === "GET") {
		return {
			questions: demoStore.quizQuestions.map((question) => ({
				id: question.id,
				question: question.question,
				category: question.category,
				options: question.options.map((option) => ({
					id: option.id,
					text: option.text,
					isCorrect: Boolean(option.isCorrect),
					explanation: option.explanation || ""
				}))
			}))
		};
	}

	if (pathname === "/quiz/submit" && normalizedMethod === "POST") {
		const answers = Array.isArray(body?.answers) ? body.answers : [];
		let score = 0;

		const feedback = answers.map((answer) => {
			const question = demoStore.quizQuestions.find((item) => item.id === Number(answer.questionId));
			const selected = question?.options.find((item) => item.id === Number(answer.optionId));
			const correct = question?.options.find((item) => item.isCorrect);
			const isCorrect = Boolean(selected?.isCorrect);

			if (isCorrect) {
				score += 1;
			}

			return {
				questionId: Number(answer.questionId),
				selectedOptionId: Number(answer.optionId),
				correctOptionId: Number(correct?.id || 0),
				isCorrect,
				explanation:
					correct?.explanation ||
					"Revise esta pergunta para reforcar o aprendizado."
			};
		});

		const attempt = {
			id: demoStore.nextAttemptId,
			score,
			total_questions: answers.length,
			created_at: new Date().toISOString()
		};

		demoStore.nextAttemptId += 1;
		demoStore.quizAttempts.unshift(attempt);

		return {
			score,
			total: answers.length,
			percentage: answers.length ? Math.round((score / answers.length) * 100) : 0,
			feedback,
			attempt: {
				id: attempt.id,
				created_at: attempt.created_at
			}
		};
	}

	if (pathname === "/quiz/history" && normalizedMethod === "GET") {
		const limit = Math.max(1, Number(url.searchParams.get("limit") || 10));
		return {
			attempts: demoStore.quizAttempts.slice(0, limit)
		};
	}

	if (pathname === "/videos" && normalizedMethod === "GET") {
		return { videos: demoStore.videos };
	}

	if (pathname === "/user/preferences" && normalizedMethod === "GET") {
		return { preferences: demoStore.preferences };
	}

	if (pathname === "/user/preferences" && normalizedMethod === "PUT") {
		demoStore.preferences = {
			reminder_enabled: Boolean(body?.reminderEnabled),
			reminder_times: Array.isArray(body?.reminderTimes) ? body.reminderTimes : [],
			accessibility_mode: body?.accessibilityMode || "default"
		};

		return { preferences: demoStore.preferences };
	}

	throw new Error(`Endpoint nao implementado no modo demonstracao: ${pathname}`);
}

async function offlineApi(path, options = {}) {
	const { method = "GET", body, auth = true } = options;
	const url = new URL(path, "http://offline.local");
	const pathname = url.pathname;
	const normalizedMethod = method.toUpperCase();
	const store = loadOfflineStore();

	if (auth && !pathname.startsWith("/auth/")) {
		if (!store.token || !store.user) {
			throw new Error("Token de acesso ausente.");
		}
	}

	// Codigo fixo no modo offline, ja que nao ha como enviar SMS de verdade.
	const OFFLINE_CODE = "000000";

	if (pathname === "/auth/register/start" && normalizedMethod === "POST") {
		const phone = String(body?.phone || "").replace(/\D/g, "");
		store.pendingRegister = {
			username: String(body?.username || "visitante").trim() || "visitante",
			password: String(body?.password || ""),
			phone
		};
		saveOfflineStore(store);

		return { message: "Modo offline: use o codigo 000000.", phone, devCode: OFFLINE_CODE };
	}

	if (pathname === "/auth/register/resend" && normalizedMethod === "POST") {
		return { message: "Modo offline: use o codigo 000000.", devCode: OFFLINE_CODE };
	}

	if (pathname === "/auth/register/verify" && normalizedMethod === "POST") {
		if (String(body?.code || "") !== OFFLINE_CODE) {
			throw new Error("Codigo incorreto.");
		}

		const pending = store.pendingRegister || {};
		const token = `offline-token-${Date.now()}`;

		store.user = {
			id: store.user?.id || 1,
			full_name: pending.username || "Visitante",
			username: pending.username || "visitante",
			email: null,
			phone: pending.phone || "",
			role: "caregiver"
		};
		store.password = pending.password || "";
		store.token = token;
		store.pendingRegister = null;
		saveOfflineStore(store);

		return { token, user: store.user };
	}

	if (pathname === "/auth/login" && normalizedMethod === "POST") {
		const phone = String(body?.phone || "").replace(/\D/g, "");
		const password = String(body?.password || "");
		const storedPhone = String(store.user?.phone || "").replace(/\D/g, "");

		if (!store.user || storedPhone !== phone) {
			throw new Error("Telefone nao cadastrado.");
		}

		if (store.password !== password) {
			throw new Error("Senha incorreta.");
		}

		if (!store.token) {
			store.token = `offline-token-${Date.now()}`;
			saveOfflineStore(store);
		}

		return { token: store.token, user: store.user };
	}

	if (pathname === "/auth/password/forgot" && normalizedMethod === "POST") {
		const phone = String(body?.phone || "").replace(/\D/g, "");

		if (String(store.user?.phone || "").replace(/\D/g, "") !== phone) {
			throw new Error("Telefone nao cadastrado.");
		}

		return { message: "Modo offline: use o codigo 000000.", phone, devCode: OFFLINE_CODE };
	}

	if (pathname === "/auth/password/verify" && normalizedMethod === "POST") {
		if (String(body?.code || "") !== OFFLINE_CODE) {
			throw new Error("Codigo incorreto.");
		}

		return { resetToken: "offline-reset-token", phone: body?.phone };
	}

	if (pathname === "/auth/password/reset" && normalizedMethod === "POST") {
		if (body?.resetToken !== "offline-reset-token") {
			throw new Error("Sessao de recuperacao expirada.");
		}

		store.password = String(body?.password || "");
		store.token = store.token || `offline-token-${Date.now()}`;
		saveOfflineStore(store);

		return { token: store.token, user: store.user };
	}

	if (pathname === "/auth/me" && normalizedMethod === "GET") {
		if (!store.user) {
			throw new Error("Usuario nao encontrado.");
		}

		return { user: store.user };
	}

	if (pathname === "/checklists" && normalizedMethod === "GET") {
		const start = url.searchParams.get("start") || "1900-01-01";
		const end = url.searchParams.get("end") || "2999-12-31";
		return { items: getChecklistRange(store.checklists, start, end) };
	}

	if (pathname === "/checklists/stats" && normalizedMethod === "GET") {
		const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
		return computeChecklistStats(store.checklists, month);
	}

	const checklistMatch = pathname.match(/^\/checklists\/(\d{4}-\d{2}-\d{2})$/);
	if (checklistMatch && normalizedMethod === "PUT") {
		const item = upsertChecklist(store.checklists, checklistMatch[1], body || {});
		saveOfflineStore(store);
		return { item };
	}

	if (pathname === "/quiz/history" && normalizedMethod === "GET") {
		return { attempts: [] };
	}

	if (pathname === "/guide/steps" && normalizedMethod === "GET") {
		return { steps: demoStore.guideSteps };
	}

	if (pathname === "/quiz/questions" && normalizedMethod === "GET") {
		return {
			questions: demoStore.quizQuestions.map((question) => ({
				id: question.id,
				question: question.question,
				category: question.category,
				options: question.options.map((option) => ({
					id: option.id,
					text: option.text,
					isCorrect: Boolean(option.isCorrect),
					explanation: option.explanation || ""
				}))
			}))
		};
	}

	if (pathname === "/videos" && normalizedMethod === "GET") {
		return { videos: demoStore.videos };
	}

	if (pathname === "/user/preferences" && normalizedMethod === "GET") {
		return { preferences: store.preferences || createOfflineStore().preferences };
	}

	if (pathname === "/user/preferences" && normalizedMethod === "PUT") {
		store.preferences = {
			reminder_enabled: Boolean(body?.reminderEnabled),
			reminder_times: Array.isArray(body?.reminderTimes) ? body.reminderTimes : [],
			accessibility_mode: body?.accessibilityMode || "default",
			theme_mode: body?.themeMode || "light"
		};
		saveOfflineStore(store);
		return { preferences: store.preferences };
	}

	throw new Error("Falha na comunicacao com o servidor.");
}

function translateResistance(value) {
	const map = {
		none: "Nenhuma",
		light: "Leve",
		moderate: "Moderada",
		severe: "Grave"
	};

	return map[value] || "-";
}

function formatDate(value) {
	const date = new Date(value);
	return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function formatDateTime(value) {
	const date = new Date(value);
	return date.toLocaleString("pt-BR");
}

function escapeHtml(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function syncChecklistUI() {
	const form = dom.checklistForm;
	const mBtn = document.querySelector('.time-btn[data-time="morning"]');
	const aBtn = document.querySelector('.time-btn[data-time="afternoon"]');
	const nBtn = document.querySelector('.time-btn[data-time="night"]');
	
	if(mBtn) mBtn.classList.toggle('active', form.morning.checked);
	if(aBtn) aBtn.classList.toggle('active', form.afternoon.checked);
	if(nBtn) nBtn.classList.toggle('active', form.night.checked);

	let resLevel = form.resistanceLevel.value || 'none';
	document.querySelectorAll('.res-btn').forEach(btn => {
		btn.classList.remove('active');
	});
	
	if (resLevel === 'none') {
		const posBtn = document.querySelector('.res-btn.positive');
		if(posBtn) posBtn.classList.add('active');
	} else if (resLevel === 'super-none') {
		const extPosBtn = document.querySelector('.res-btn.extreme-positive');
		if(extPosBtn) extPosBtn.classList.add('active');
	} else {
		const activeBtn = document.querySelector(`.res-btn[data-level="${resLevel}"]`);
		if(activeBtn) activeBtn.classList.add('active');
	}
}
