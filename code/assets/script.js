const API_BASE =
	window.location.protocol === "file:"
		? "http://localhost:4000/api"
		: `${window.location.origin}/api`;

const state = {
	token: localStorage.getItem("sorriso_token") || "",
	user: null,
	quizQuestions: [],
	reminderTimer: null,
	lastNotificationKey: ""
};

// Modo temporario para demonstracao sem backend ativo.
const QUICK_ACCESS_MODE = true;
const QUICK_ACCESS_TOKEN = "quick-access-demo-token";
const demoStore = createDemoStore();

const dom = {
	landing: document.querySelector("#landing"),
	appShell: document.querySelector("#appShell"),
	showLoginBtn: document.querySelector("#showLoginBtn"),
	showRegisterBtn: document.querySelector("#showRegisterBtn"),
	loginForm: document.querySelector("#loginForm"),
	registerForm: document.querySelector("#registerForm"),
	logoutBtn: document.querySelector("#logoutBtn"),
	welcomeName: document.querySelector("#welcomeName"),
	statusBar: document.querySelector("#statusBar"),
	tabButtons: Array.from(document.querySelectorAll(".tab-btn")),
	sections: Array.from(document.querySelectorAll(".app-section")),
	monthInput: document.querySelector("#monthInput"),
	adherenceValue: document.querySelector("#adherenceValue"),
	completedValue: document.querySelector("#completedValue"),
	resistanceValue: document.querySelector("#resistanceValue"),
	historyTableBody: document.querySelector("#historyTableBody"),
	checklistForm: document.querySelector("#checklistForm"),
	checklistDate: document.querySelector("#checklistDate"),
	guideContainer: document.querySelector("#guideContainer"),
	quizForm: document.querySelector("#quizForm"),
	quizSubmitBtn: document.querySelector("#quizSubmitBtn"),
	quizResult: document.querySelector("#quizResult"),
	quizHistoryList: document.querySelector("#quizHistoryList"),
	videoContainer: document.querySelector("#videoContainer"),
	preferencesForm: document.querySelector("#preferencesForm"),
	reminderEnabled: document.querySelector("#reminderEnabled"),
	reminderTimes: document.querySelector("#reminderTimes"),
	accessibilityMode: document.querySelector("#accessibilityMode")
};

document.addEventListener("DOMContentLoaded", init);

function init() {
	bindEvents();
	applyDefaultDates();

	if (state.token) {
		bootstrapSession();
		return;
	}

	setAuthMode("login");
}

function bindEvents() {
	dom.showLoginBtn.addEventListener("click", () => setAuthMode("login"));
	dom.showRegisterBtn.addEventListener("click", () => setAuthMode("register"));

	dom.loginForm.addEventListener("submit", onLoginSubmit);
	dom.registerForm.addEventListener("submit", onRegisterSubmit);
	dom.logoutBtn.addEventListener("click", () => logout(false));

	dom.tabButtons.forEach((button) => {
		button.addEventListener("click", () => setActiveSection(button.dataset.section));
	});

	dom.monthInput.addEventListener("change", () => {
		loadDashboardStats(dom.monthInput.value);
	});

	dom.checklistDate.addEventListener("change", () => {
		loadChecklistForDate(dom.checklistDate.value);
	});

	dom.checklistForm.addEventListener("submit", onChecklistSubmit);
	dom.quizSubmitBtn.addEventListener("click", onQuizSubmit);
	dom.preferencesForm.addEventListener("submit", onPreferencesSubmit);
}

function applyDefaultDates() {
	const now = new Date();
	const today = now.toISOString().slice(0, 10);
	const month = now.toISOString().slice(0, 7);
	dom.checklistDate.value = today;
	dom.monthInput.value = month;
}

function setAuthMode(mode) {
	const isLogin = mode === "login";
	dom.showLoginBtn.classList.toggle("active", isLogin);
	dom.showRegisterBtn.classList.toggle("active", !isLogin);
	dom.loginForm.classList.toggle("hidden", !isLogin);
	dom.registerForm.classList.toggle("hidden", isLogin);
}

function setActiveSection(sectionName) {
	dom.tabButtons.forEach((button) => {
		button.classList.toggle("active", button.dataset.section === sectionName);
	});

	dom.sections.forEach((section) => {
		section.classList.toggle("active", section.id === `section-${sectionName}`);
	});
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

	const response = await fetch(`${API_BASE}${path}`, {
		method,
		headers,
		body: body !== undefined ? JSON.stringify(body) : undefined
	});

	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		if (response.status === 401 && auth) {
			logout(true);
		}

		throw new Error(data.message || "Falha na comunicacao com o servidor.");
	}

	return data;
}

function setStatus(message, type = "info") {
	dom.statusBar.textContent = message;
	dom.statusBar.className = `status-bar ${type}`;
}

async function onRegisterSubmit(event) {
	event.preventDefault();

	const formData = new FormData(dom.registerForm);
	const payload = {
		fullName: String(formData.get("fullName") || "").trim(),
		email: String(formData.get("email") || "").trim(),
		password: String(formData.get("password") || ""),
		role: String(formData.get("role") || "caregiver"),
		acceptTerms: formData.get("acceptTerms") === "on"
	};

	try {
		setStatus("Criando conta...", "info");
		const result = await api("/auth/register", {
			method: "POST",
			auth: false,
			body: payload
		});

		activateSession(result.token, result.user);
		setStatus(
			QUICK_ACCESS_MODE
				? "Modo demonstracao ativo. Voce pode navegar em todas as telas."
				: "Conta criada com sucesso.",
			"success"
		);
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function onLoginSubmit(event) {
	event.preventDefault();

	const formData = new FormData(dom.loginForm);
	const payload = {
		email: String(formData.get("email") || "").trim(),
		password: String(formData.get("password") || "")
	};

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

function activateSession(token, user) {
	state.token = token;
	state.user = user;
	localStorage.setItem("sorriso_token", token);

	dom.welcomeName.textContent = `Bem-vindo(a), ${user.full_name}`;
	dom.landing.classList.add("hidden");
	dom.appShell.classList.remove("hidden");

	loadAllData();
}

async function bootstrapSession() {
	try {
		const result = await api("/auth/me");
		state.user = result.user;
		dom.welcomeName.textContent = `Bem-vindo(a), ${result.user.full_name}`;
		dom.landing.classList.add("hidden");
		dom.appShell.classList.remove("hidden");
		await loadAllData();
	} catch (error) {
		logout(true);
	}
}

function logout(silent) {
	state.token = "";
	state.user = null;
	localStorage.removeItem("sorriso_token");
	stopReminderEngine();

	dom.appShell.classList.add("hidden");
	dom.landing.classList.remove("hidden");
	setAuthMode("login");

	if (!silent) {
		setStatus("Sessao encerrada.", "info");
	}
}

async function loadAllData() {
	await Promise.allSettled([
		loadDashboardStats(dom.monthInput.value),
		loadChecklistForDate(dom.checklistDate.value),
		loadChecklistHistory(),
		loadGuideSteps(),
		loadQuizQuestions(),
		loadQuizHistory(),
		loadVideos(),
		loadPreferences()
	]);
}

async function loadDashboardStats(month) {
	try {
		const result = await api(`/checklists/stats?month=${encodeURIComponent(month)}`);

		dom.adherenceValue.textContent = `${result.adherenceRate}%`;
		dom.completedValue.textContent = String(result.completedBrushings);

		const highResistance = (result.resistance.moderate || 0) + (result.resistance.severe || 0);
		dom.resistanceValue.textContent = String(highResistance);
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function loadChecklistForDate(dateValue) {
	if (!dateValue) {
		return;
	}

	try {
		const result = await api(
			`/checklists?start=${encodeURIComponent(dateValue)}&end=${encodeURIComponent(dateValue)}`
		);

		const item = result.items[0];
		const form = dom.checklistForm;

		form.morning.checked = Boolean(item?.brushing_morning);
		form.afternoon.checked = Boolean(item?.brushing_afternoon);
		form.night.checked = Boolean(item?.brushing_night);
		form.resistanceLevel.value = item?.resistance_level || "none";
		form.notes.value = item?.notes || "";
	} catch (error) {
		setStatus(error.message, "error");
	}
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
		resistanceLevel: dom.checklistForm.resistanceLevel.value,
		notes: dom.checklistForm.notes.value
	};

	try {
		await api(`/checklists/${encodeURIComponent(date)}`, {
			method: "PUT",
			body: payload
		});

		setStatus("Checklist salvo com sucesso.", "success");
		await Promise.all([loadChecklistHistory(), loadDashboardStats(dom.monthInput.value)]);
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function loadChecklistHistory() {
	try {
		const today = new Date();
		const start = new Date();
		start.setDate(today.getDate() - 14);

		const result = await api(
			`/checklists?start=${start.toISOString().slice(0, 10)}&end=${today.toISOString().slice(0, 10)}`
		);

		dom.historyTableBody.innerHTML = "";

		if (!result.items.length) {
			dom.historyTableBody.innerHTML =
				"<tr><td colspan='5'>Sem registros recentes.</td></tr>";
			return;
		}

		result.items.forEach((item) => {
			const row = document.createElement("tr");
			row.innerHTML = `
				<td>${formatDate(item.checklist_date)}</td>
				<td>${item.brushing_morning ? "Sim" : "Nao"}</td>
				<td>${item.brushing_afternoon ? "Sim" : "Nao"}</td>
				<td>${item.brushing_night ? "Sim" : "Nao"}</td>
				<td>${translateResistance(item.resistance_level)}</td>
			`;
			dom.historyTableBody.appendChild(row);
		});
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function loadGuideSteps() {
	try {
		const result = await api("/guide/steps");
		dom.guideContainer.innerHTML = "";

		if (!result.steps.length) {
			dom.guideContainer.innerHTML = "<p>Nenhuma etapa cadastrada.</p>";
			return;
		}

		result.steps.forEach((step) => {
			const article = document.createElement("article");
			article.className = "guide-card";
			article.innerHTML = `
				<img src="${step.image_url}" alt="${escapeHtml(step.title)}" loading="lazy" />
				<div class="inner">
					<span class="guide-step">Etapa ${step.step_order}</span>
					<h4>${escapeHtml(step.title)}</h4>
					<p>${escapeHtml(step.description)}</p>
				</div>
			`;
			dom.guideContainer.appendChild(article);
		});
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function loadQuizQuestions() {
	try {
		const result = await api("/quiz/questions");
		state.quizQuestions = result.questions;
		renderQuizQuestions();
	} catch (error) {
		setStatus(error.message, "error");
	}
}

function renderQuizQuestions() {
	dom.quizForm.innerHTML = "";

	if (!state.quizQuestions.length) {
		dom.quizForm.innerHTML = "<p>Sem perguntas disponiveis no momento.</p>";
		return;
	}

	state.quizQuestions.forEach((question, index) => {
		const block = document.createElement("fieldset");
		block.className = "quiz-question";
		block.innerHTML = `
			<h4>${index + 1}. ${escapeHtml(question.question)}</h4>
			${question.options
				.map(
					(option) => `
					<label class="quiz-option">
						<input type="radio" name="q_${question.id}" value="${option.id}" />
						<span>${escapeHtml(option.text)}</span>
					</label>
				`
				)
				.join("")}
		`;

		dom.quizForm.appendChild(block);
	});
}

async function onQuizSubmit() {
	if (!state.quizQuestions.length) {
		setStatus("Nao ha perguntas carregadas.", "error");
		return;
	}

	const formData = new FormData(dom.quizForm);
	const answers = state.quizQuestions
		.map((question) => ({
			questionId: question.id,
			optionId: Number(formData.get(`q_${question.id}`))
		}))
		.filter((answer) => Number.isInteger(answer.optionId));

	if (answers.length !== state.quizQuestions.length) {
		setStatus("Responda todas as perguntas antes de enviar.", "error");
		return;
	}

	try {
		const result = await api("/quiz/submit", {
			method: "POST",
			body: { answers }
		});

		const lines = result.feedback
			.map((item) => {
				const stateLabel = item.isCorrect ? "Correto" : "Rever";
				return `<li><strong>${stateLabel}:</strong> ${escapeHtml(item.explanation)}</li>`;
			})
			.join("");

		dom.quizResult.classList.remove("hidden");
		dom.quizResult.innerHTML = `
			<h4>Resultado</h4>
			<p>Pontuacao: <strong>${result.score}/${result.total}</strong> (${result.percentage}%)</p>
			<ul>${lines}</ul>
		`;

		await loadQuizHistory();
		setStatus("Quiz enviado com sucesso.", "success");
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function loadQuizHistory() {
	try {
		const result = await api("/quiz/history?limit=8");
		dom.quizHistoryList.innerHTML = "";

		if (!result.attempts.length) {
			dom.quizHistoryList.innerHTML = "<li>Nenhuma tentativa registrada.</li>";
			return;
		}

		result.attempts.forEach((attempt) => {
			const item = document.createElement("li");
			item.textContent = `${formatDateTime(attempt.created_at)} - ${attempt.score}/${attempt.total_questions}`;
			dom.quizHistoryList.appendChild(item);
		});
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function loadVideos() {
	try {
		const result = await api("/videos");
		dom.videoContainer.innerHTML = "";

		if (!result.videos.length) {
			dom.videoContainer.innerHTML = "<p>Sem videos cadastrados no momento.</p>";
			return;
		}

		result.videos.forEach((video) => {
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
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function loadPreferences() {
	try {
		const result = await api("/user/preferences");
		const preferences = result.preferences;

		dom.reminderEnabled.checked = Boolean(preferences.reminder_enabled);

		const times = Array.isArray(preferences.reminder_times)
			? preferences.reminder_times
			: [];

		dom.reminderTimes.value = times.join(",");
		dom.accessibilityMode.value = preferences.accessibility_mode || "default";

		applyAccessibility(dom.accessibilityMode.value);
		setupReminderEngine(dom.reminderEnabled.checked, times);
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function onPreferencesSubmit(event) {
	event.preventDefault();

	const reminderEnabled = dom.reminderEnabled.checked;
	const reminderTimes = dom.reminderTimes.value
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);

	const accessibilityMode = dom.accessibilityMode.value;

	try {
		await api("/user/preferences", {
			method: "PUT",
			body: {
				reminderEnabled,
				reminderTimes,
				accessibilityMode
			}
		});

		applyAccessibility(accessibilityMode);
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
	const today = now.toISOString().slice(0, 10);
	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	const twoDaysAgo = new Date(now);
	twoDaysAgo.setDate(now.getDate() - 2);

	const format = (value) => value.toISOString().slice(0, 10);

	return {
		user: {
			id: 1,
			full_name: "Visitante",
			email: "visitante@sorriso.local",
			role: "caregiver"
		},
		preferences: {
			reminder_enabled: true,
			reminder_times: ["08:00", "13:00", "20:00"],
			accessibility_mode: "default"
		},
		checklists: [
			{
				checklist_date: today,
				brushing_morning: true,
				brushing_afternoon: false,
				brushing_night: true,
				resistance_level: "light",
				notes: "Boa adesao com reforco positivo.",
				updated_at: new Date().toISOString()
			},
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
		],
		guideSteps: [
			{
				id: 1,
				step_order: 1,
				title: "Preparar a escova",
				description: "Separe escova macia e copo com agua para iniciar de forma previsivel.",
				image_url:
					"https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=800&q=80"
			},
			{
				id: 2,
				step_order: 2,
				title: "Molhar a escova",
				description: "Molhe levemente a escova para reduzir incomodo sensorial.",
				image_url:
					"https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=800&q=80"
			},
			{
				id: 3,
				step_order: 3,
				title: "Aplicar pasta dental",
				description: "Use quantidade pequena (grao de ervilha).",
				image_url:
					"https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=800&q=80"
			},
			{
				id: 4,
				step_order: 4,
				title: "Escovar com ritmo",
				description: "Movimentos suaves por cerca de 2 minutos.",
				image_url:
					"https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80"
			},
			{
				id: 5,
				step_order: 5,
				title: "Finalizar e elogiar",
				description: "Finalize com reforco positivo para manter a rotina.",
				image_url:
					"https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80"
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

function demoNameFromEmail(email) {
	const safeEmail = String(email || "visitante@sorriso.local").trim() || "visitante@sorriso.local";
	const base = safeEmail.split("@")[0].replace(/[._-]+/g, " ").trim() || "Visitante";
	return base.charAt(0).toUpperCase() + base.slice(1);
}

async function mockApi(path, options = {}) {
	const { method = "GET", body, auth = true } = options;
	const url = new URL(path, "http://demo.local");
	const pathname = url.pathname;
	const normalizedMethod = method.toUpperCase();

	if (auth && !state.token && pathname !== "/auth/login" && pathname !== "/auth/register") {
		throw new Error("Token de acesso ausente.");
	}

	if (pathname === "/auth/login" && normalizedMethod === "POST") {
		const email = String(body?.email || "visitante@sorriso.local").trim() || "visitante@sorriso.local";
		demoStore.user = {
			...demoStore.user,
			email,
			full_name: demoNameFromEmail(email)
		};

		return { token: QUICK_ACCESS_TOKEN, user: demoStore.user };
	}

	if (pathname === "/auth/register" && normalizedMethod === "POST") {
		const fullName = String(body?.fullName || "Visitante").trim() || "Visitante";
		const email = String(body?.email || "visitante@sorriso.local").trim() || "visitante@sorriso.local";
		const role = String(body?.role || "caregiver");

		demoStore.user = {
			...demoStore.user,
			full_name: fullName,
			email,
			role
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
					text: option.text
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
