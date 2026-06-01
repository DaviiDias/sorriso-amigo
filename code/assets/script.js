const API_BASE =
	window.location.protocol === "file:"
		? "http://localhost:4000/api"
		: `${window.location.origin}/api`;

const state = {
	token: localStorage.getItem("sorriso_token") || "",
	user: null,
	quizQuestions: [],
	reminderTimer: null,
	lastNotificationKey: "",
	currentQuestionIndex: 0,
	selectedOptionId: null,
	quizAnswers: [],
	quizState: "start",
	offlineMode: false
};

// Modo temporario para demonstracao sem backend ativo.
const QUICK_ACCESS_MODE = false;
const QUICK_ACCESS_TOKEN = "quick-access-demo-token";
const demoStore = createDemoStore();
const OFFLINE_STORE_KEY = "sorriso_offline_store";

const dom = {
	landing: document.querySelector("#landing"),
	appShell: document.querySelector("#appShell"),
	showLoginBtn: document.querySelector("#showLoginBtn"),
	showRegisterBtn: document.querySelector("#showRegisterBtn"),
	loginForm: document.querySelector("#loginForm"),
	registerForm: document.querySelector("#registerForm"),
	logoutBtn: document.querySelector("#logoutBtn"),
	statusBar: document.querySelector("#statusBar"),
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
	quizHistoryList: document.querySelector("#quizHistoryList"),
	videoContainer: document.querySelector("#videoContainer"),
	preferencesForm: document.querySelector("#preferencesForm"),
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

document.addEventListener("DOMContentLoaded", init);

async function init() {
	bindEvents();
	applyDefaultDates();

	if (state.token) {
		await bootstrapSession();
		return;
	}

	await autoAuthenticate();
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

	dom.dashboardChartToggleButtons.forEach((button) => {
		button.addEventListener("click", () => {
			setDashboardChartRange(button.dataset.chartRange);
		});
	});

	dom.checklistDate.addEventListener("change", () => {
		loadChecklistForDate(dom.checklistDate.value);
	});

	dom.checklistForm.addEventListener("submit", onChecklistSubmit);
	
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
			state.offlineMode = true;
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

	dom.landing.classList.add("hidden");
	dom.appShell.classList.remove("hidden");

	loadAllData();
}

async function bootstrapSession() {
	try {
		const result = await api("/auth/me");
		state.user = result.user;
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

	autoAuthenticate();

	if (!silent) {
		setStatus("Sessão reiniciada automaticamente.", "info");
	}
}

async function autoAuthenticate() {
	const defaultEmail = "visitante@sorrisoamigo.org";
	const defaultPassword = "DefaultVisitante123!";
	const defaultName = "Visitante";

	try {
		setStatus("Autenticando automaticamente...", "info");
		
		let result;
		try {
			const response = await fetch(`${API_BASE}/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: defaultEmail,
					password: defaultPassword
				})
			});
			
			if (response.ok) {
				result = await response.json();
			} else {
				// Se o login falhar (ex: usuário não existe), tenta cadastrar
				const regResponse = await fetch(`${API_BASE}/auth/register`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						fullName: defaultName,
						email: defaultEmail,
						password: defaultPassword,
						role: "caregiver",
						acceptTerms: true
					})
				});
				
				if (regResponse.ok) {
					result = await regResponse.json();
				} else {
					const data = await regResponse.json().catch(() => ({}));
					throw new Error(data.message || "Erro no cadastro automático.");
				}
			}
		} catch (err) {
			console.error("Falha no login/cadastro automático, tentando fallback local.", err);
			throw err;
		}

		if (result && result.token) {
			activateSession(result.token, result.user);
			setStatus("Autenticação automática concluída.", "success");
		}
	} catch (error) {
		console.error("Erro na autenticação automática, usando fallback mockado local:", error);
		if (QUICK_ACCESS_MODE) {
			setStatus("Servidor indisponível. Iniciando sessão local offline.", "warning");
			activateSession("quick-access-demo-token", {
				id: 1,
				full_name: "Visitante (Local)",
				email: defaultEmail,
				role: "caregiver"
			});
			return;
		}

		setStatus("Servidor indisponível. Não foi possível carregar o Dashboard real.", "error");
	}
}

async function loadAllData() {
	await Promise.allSettled([
		loadDashboard(dom.monthInput.value),
		loadChecklistForDate(dom.checklistDate.value),
		loadGuideSteps(),
		loadQuizQuestions(),
		loadQuizHistory(),
		loadVideos(),
		loadPreferences()
	]);
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
		let percentSum = 0;
		let daysWithRecord = 0;

		for (let day = weekStart; day <= weekEnd; day += 1) {
			const isoDate = `${month}-${String(day).padStart(2, "0")}`;
			const item = byDate.get(isoDate);
			if (!item) continue;
			daysWithRecord += 1;
			percentSum += computeDayAdherencePercent(item);
		}

		series.push({
			label: `Dia ${weekStart}–${weekEnd}`,
			percent: daysWithRecord ? Math.round(percentSum / daysWithRecord) : 0,
			tooltip: daysWithRecord
				? `Média da semana com ${daysWithRecord} dia(s) registrado(s)`
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
			<span class="heatmap-day ${level} heatmap-week-day" title="${escapeHtml(item ? `${label} · ${dateFormatter.format(date)} · ${brushings}/3 escovações` : `${label} · ${dateFormatter.format(date)} · sem registro`)}" aria-label="${escapeHtml(item ? `${label} · ${dateFormatter.format(date)} · ${brushings}/3 escovações` : `${label} · ${dateFormatter.format(date)} · sem registro`)}">${date.getDate()}</span>
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
			const brushings = countBrushingsForItem(item);
			const incomplete = brushings < 3;
			const highResistance = item.resistance_level === "moderate" || item.resistance_level === "severe";
			return incomplete || highResistance;
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
	let steps = [];
	try {
		const result = await api("/guide/steps");
		steps = result?.steps || [];
	} catch (error) {
		console.warn("Falha ao buscar guia do servidor. Usando dados estáticos de fallback.", error);
	}

	// Se retornar vazio do banco ou der erro na tabela, usa o fallback estático
	if (!steps || !steps.length) {
		steps = demoStore.guideSteps;
	}

	dom.guideContainer.innerHTML = "";

	steps.forEach((step) => {
		const imageUrl = getGuideStepImageUrl(step);
		const item = document.createElement("div");
		item.className = "timeline-item";
		item.innerHTML = `
			<div class="timeline-badge">${step.step_order}</div>
			<article class="guide-card">
				<div class="guide-card-img-wrapper">
					<img src="${imageUrl}" alt="${escapeHtml(step.title)}" loading="lazy" />
				</div>
				<div class="inner">
					<h4>${escapeHtml(step.title)}</h4>
					<p>${escapeHtml(step.description)}</p>
				</div>
			</article>
		`;
		dom.guideContainer.appendChild(item);
	});
}

function getGuideStepImageUrl(step) {
	const localImages = {
		1: "./assets/illustrations/guide-1.svg",
		2: "./assets/illustrations/guide-2.svg",
		3: "./assets/illustrations/guide-3.svg",
		4: "./assets/illustrations/guide-4.svg",
		5: "./assets/illustrations/guide-5.svg"
	};

	const remoteUrl = String(step?.image_url || "").trim();
	if (!remoteUrl || /^https?:\/\//i.test(remoteUrl)) {
		return localImages[Number(step?.step_order)] || localImages[Number(step?.id)] || "./assets/illustrations/guide-1.svg";
	}

	return remoteUrl;
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
	loadQuizHistory();
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

		await loadQuizHistory();
	} catch (error) {
		setStatus(error.message, "error");
	}
}

async function loadQuizHistory() {
	try {
		if (!dom.quizHistoryList) return;

		const result = await api("/quiz/history?limit=8");
		dom.quizHistoryList.innerHTML = "";

		if (!result.attempts || !result.attempts.length) {
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
			email: "visitante@sorriso.local",
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

	if (auth && pathname !== "/auth/login" && pathname !== "/auth/register") {
		if (!store.token || !store.user) {
			throw new Error("Token de acesso ausente.");
		}
	}

	if (pathname === "/auth/register" && normalizedMethod === "POST") {
		const fullName = String(body?.fullName || "Visitante").trim() || "Visitante";
		const email = String(body?.email || "visitante@sorriso.local").trim() || "visitante@sorriso.local";
		const role = String(body?.role || "caregiver");
		const token = `offline-token-${Date.now()}`;

		store.user = {
			id: store.user?.id || 1,
			full_name: fullName,
			email,
			role
		};
		store.password = String(body?.password || "");
		store.token = token;
		saveOfflineStore(store);

		return { token, user: store.user };
	}

	if (pathname === "/auth/login" && normalizedMethod === "POST") {
		const email = String(body?.email || "").trim();
		const password = String(body?.password || "");

		if (!store.user || store.user.email !== email || store.password !== password) {
			throw new Error("E-mail ou senha incorretos.");
		}

		if (!store.token) {
			store.token = `offline-token-${Date.now()}`;
			saveOfflineStore(store);
		}

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
