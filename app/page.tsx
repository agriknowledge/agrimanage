"use client";

import { useEffect, useMemo, useState } from "react";

type ExpenseCategory =
  | "Seeds/Plants"
  | "Soil/Fertilizer"
  | "Pest/Disease Control"
  | "Fuel"
  | "Utilities"
  | "Labor"
  | "Repairs"
  | "Packaging"
  | "Market Fees"
  | "Insurance"
  | "Equipment"
  | "Advertising"
  | "Mileage"
  | "Other";

type TaxCategory =
  | "Supplies"
  | "Utilities"
  | "Fuel"
  | "Repairs & Maintenance"
  | "Labor"
  | "Advertising"
  | "Insurance"
  | "Equipment"
  | "Mileage"
  | "Fees"
  | "Other";

type ScheduleFCategory =
  | "Car and truck expenses"
  | "Chemicals"
  | "Conservation expenses"
  | "Custom hire"
  | "Depreciation"
  | "Employee benefit programs"
  | "Feed"
  | "Fertilizers and lime"
  | "Freight and trucking"
  | "Gasoline, fuel, and oil"
  | "Insurance"
  | "Interest"
  | "Labor hired"
  | "Pension and profit-sharing plans"
  | "Rent or lease"
  | "Repairs and maintenance"
  | "Seeds and plants"
  | "Storage and warehousing"
  | "Supplies"
  | "Taxes"
  | "Utilities"
  | "Veterinary, breeding, and medicine"
  | "Other expenses";

type IncomeCategory =
  | "Market Sales"
  | "Wholesale"
  | "Agritourism"
  | "Workshops"
  | "Subscriptions"
  | "Other";

type Project = {
  id: string;
  name: string;
  description: string;
};

type ExpenseRecord = {
  id: string;
  projectId: string;
  date: string;
  vendor: string;
  item: string;
  amount: number;
  category: ExpenseCategory;
  taxCategory: TaxCategory;
  scheduleFCategory: ScheduleFCategory;
  notes: string;
};

type IncomeRecord = {
  id: string;
  projectId: string;
  date: string;
  source: string;
  description: string;
  amount: number;
  category: IncomeCategory;
  scheduleFCategory: ScheduleFCategory;
  notes: string;
};

type RecurringCost = {
  id: string;
  projectId: string;
  name: string;
  amount: number;
  frequency: "Weekly" | "Monthly" | "Quarterly" | "Yearly";
  category: ExpenseCategory;
  taxCategory: TaxCategory;
  scheduleFCategory: ScheduleFCategory;
  nextDue: string;
  notes: string;
};

type FarmNote = {
  id: string;
  projectId: string;
  date: string;
  title: string;
  type: "Planting" | "Harvest" | "Pest/Disease" | "Weather" | "General";
  note: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const expenseCategories: ExpenseCategory[] = [
  "Seeds/Plants",
  "Soil/Fertilizer",
  "Pest/Disease Control",
  "Fuel",
  "Utilities",
  "Labor",
  "Repairs",
  "Packaging",
  "Market Fees",
  "Insurance",
  "Equipment",
  "Advertising",
  "Mileage",
  "Other",
];

const taxCategories: TaxCategory[] = [
  "Supplies",
  "Utilities",
  "Fuel",
  "Repairs & Maintenance",
  "Labor",
  "Advertising",
  "Insurance",
  "Equipment",
  "Mileage",
  "Fees",
  "Other",
];

const scheduleFCategories: ScheduleFCategory[] = [
  "Car and truck expenses",
  "Chemicals",
  "Conservation expenses",
  "Custom hire",
  "Depreciation",
  "Employee benefit programs",
  "Feed",
  "Fertilizers and lime",
  "Freight and trucking",
  "Gasoline, fuel, and oil",
  "Insurance",
  "Interest",
  "Labor hired",
  "Pension and profit-sharing plans",
  "Rent or lease",
  "Repairs and maintenance",
  "Seeds and plants",
  "Storage and warehousing",
  "Supplies",
  "Taxes",
  "Utilities",
  "Veterinary, breeding, and medicine",
  "Other expenses",
];

const incomeCategories: IncomeCategory[] = [
  "Market Sales",
  "Wholesale",
  "Agritourism",
  "Workshops",
  "Subscriptions",
  "Other",
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

function csvEscape(value: string | number) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function guessScheduleFCategory(category: ExpenseCategory): ScheduleFCategory {
  if (category === "Seeds/Plants") return "Seeds and plants";
  if (category === "Soil/Fertilizer") return "Fertilizers and lime";
  if (category === "Pest/Disease Control") return "Chemicals";
  if (category === "Fuel") return "Gasoline, fuel, and oil";
  if (category === "Utilities") return "Utilities";
  if (category === "Labor") return "Labor hired";
  if (category === "Repairs") return "Repairs and maintenance";
  if (category === "Insurance") return "Insurance";
  if (category === "Equipment") return "Depreciation";
  if (category === "Mileage") return "Car and truck expenses";
  if (category === "Packaging") return "Supplies";
  return "Other expenses";
}

function guessTaxCategory(category: ExpenseCategory): TaxCategory {
  if (category === "Seeds/Plants") return "Supplies";
  if (category === "Soil/Fertilizer") return "Supplies";
  if (category === "Pest/Disease Control") return "Supplies";
  if (category === "Fuel") return "Fuel";
  if (category === "Utilities") return "Utilities";
  if (category === "Labor") return "Labor";
  if (category === "Repairs") return "Repairs & Maintenance";
  if (category === "Insurance") return "Insurance";
  if (category === "Equipment") return "Equipment";
  if (category === "Mileage") return "Mileage";
  if (category === "Advertising") return "Advertising";
  if (category === "Market Fees") return "Fees";
  return "Other";
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<
    | "home"
    | "dashboard"
    | "projects"
    | "expenses"
    | "income"
    | "recurring"
    | "notes"
    | "ai"
  >("home");

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [recurringCosts, setRecurringCosts] = useState<RecurringCost[]>([]);
  const [farmNotes, setFarmNotes] = useState<FarmNote[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Welcome to AgriManage™. I can help summarize projects, expenses, recurring costs, Schedule F organizer categories, records, and farm notes.",
    },
  ]);

  const [question, setQuestion] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
  });

  const [expenseForm, setExpenseForm] = useState<ExpenseRecord>({
    id: "",
    projectId: "",
    date: today(),
    vendor: "",
    item: "",
    amount: 0,
    category: "Seeds/Plants",
    taxCategory: "Supplies",
    scheduleFCategory: "Seeds and plants",
    notes: "",
  });

  const [incomeForm, setIncomeForm] = useState<IncomeRecord>({
    id: "",
    projectId: "",
    date: today(),
    source: "",
    description: "",
    amount: 0,
    category: "Market Sales",
    scheduleFCategory: "Other expenses",
    notes: "",
  });

  const [recurringForm, setRecurringForm] = useState<RecurringCost>({
    id: "",
    projectId: "",
    name: "",
    amount: 0,
    frequency: "Monthly",
    category: "Utilities",
    taxCategory: "Utilities",
    scheduleFCategory: "Utilities",
    nextDue: today(),
    notes: "",
  });

  const [noteForm, setNoteForm] = useState<FarmNote>({
    id: "",
    projectId: "",
    date: today(),
    title: "",
    type: "General",
    note: "",
  });

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 820);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const storedProjects = localStorage.getItem("agrimanage_projects");
    const storedSelectedProjectId = localStorage.getItem("agrimanage_selected_project");
    const storedExpenses = localStorage.getItem("agrimanage_expenses");
    const storedIncome = localStorage.getItem("agrimanage_income");
    const storedRecurring = localStorage.getItem("agrimanage_recurring");
    const storedNotes = localStorage.getItem("agrimanage_notes");
    const storedChat = localStorage.getItem("agrimanage_chat");

    if (storedProjects) setProjects(JSON.parse(storedProjects));
    if (storedSelectedProjectId) setSelectedProjectId(storedSelectedProjectId);

    if (storedExpenses) {
      const parsed: ExpenseRecord[] = JSON.parse(storedExpenses).map(
        (item: Partial<ExpenseRecord>) => ({
          id: item.id || uid(),
          projectId: item.projectId || "",
          date: item.date || today(),
          vendor: item.vendor || "",
          item: item.item || "",
          amount: Number(item.amount || 0),
          category: item.category || "Other",
          taxCategory: item.taxCategory || guessTaxCategory(item.category || "Other"),
          scheduleFCategory:
            item.scheduleFCategory || guessScheduleFCategory(item.category || "Other"),
          notes: item.notes || "",
        })
      );
      setExpenses(parsed);
    }

    if (storedIncome) {
      const parsed: IncomeRecord[] = JSON.parse(storedIncome).map(
        (item: Partial<IncomeRecord>) => ({
          id: item.id || uid(),
          projectId: item.projectId || "",
          date: item.date || today(),
          source: item.source || "",
          description: item.description || "",
          amount: Number(item.amount || 0),
          category: item.category || "Market Sales",
          scheduleFCategory: item.scheduleFCategory || "Other expenses",
          notes: item.notes || "",
        })
      );
      setIncome(parsed);
    }

    if (storedRecurring) {
      const parsed: RecurringCost[] = JSON.parse(storedRecurring).map(
        (item: Partial<RecurringCost>) => ({
          id: item.id || uid(),
          projectId: item.projectId || "",
          name: item.name || "",
          amount: Number(item.amount || 0),
          frequency: item.frequency || "Monthly",
          category: item.category || "Other",
          taxCategory: item.taxCategory || guessTaxCategory(item.category || "Other"),
          scheduleFCategory:
            item.scheduleFCategory || guessScheduleFCategory(item.category || "Other"),
          nextDue: item.nextDue || today(),
          notes: item.notes || "",
        })
      );
      setRecurringCosts(parsed);
    }

    if (storedNotes) {
      const parsed: FarmNote[] = JSON.parse(storedNotes).map(
        (item: Partial<FarmNote>) => ({
          id: item.id || uid(),
          projectId: item.projectId || "",
          date: item.date || today(),
          title: item.title || "",
          type: item.type || "General",
          note: item.note || "",
        })
      );
      setFarmNotes(parsed);
    }

    if (storedChat) setChat(JSON.parse(storedChat));
  }, []);

  useEffect(() => {
    localStorage.setItem("agrimanage_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("agrimanage_selected_project", selectedProjectId || "all");
  }, [selectedProjectId]);

  useEffect(() => {
    localStorage.setItem("agrimanage_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("agrimanage_income", JSON.stringify(income));
  }, [income]);

  useEffect(() => {
    localStorage.setItem("agrimanage_recurring", JSON.stringify(recurringCosts));
  }, [recurringCosts]);

  useEffect(() => {
    localStorage.setItem("agrimanage_notes", JSON.stringify(farmNotes));
  }, [farmNotes]);

  useEffect(() => {
    localStorage.setItem("agrimanage_chat", JSON.stringify(chat));
  }, [chat]);

  useEffect(() => {
    const value = selectedProjectId === "all" ? "" : selectedProjectId;
    setExpenseForm((prev) => ({ ...prev, projectId: value }));
    setIncomeForm((prev) => ({ ...prev, projectId: value }));
    setRecurringForm((prev) => ({ ...prev, projectId: value }));
    setNoteForm((prev) => ({ ...prev, projectId: value }));
  }, [selectedProjectId]);

  const filteredExpenses = useMemo(() => {
    if (selectedProjectId === "all") return expenses;
    return expenses.filter((item) => item.projectId === selectedProjectId);
  }, [expenses, selectedProjectId]);

  const filteredIncome = useMemo(() => {
    if (selectedProjectId === "all") return income;
    return income.filter((item) => item.projectId === selectedProjectId);
  }, [income, selectedProjectId]);

  const filteredRecurring = useMemo(() => {
    if (selectedProjectId === "all") return recurringCosts;
    return recurringCosts.filter((item) => item.projectId === selectedProjectId);
  }, [recurringCosts, selectedProjectId]);

  const filteredNotes = useMemo(() => {
    if (selectedProjectId === "all") return farmNotes;
    return farmNotes.filter((item) => item.projectId === selectedProjectId);
  }, [farmNotes, selectedProjectId]);

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [filteredExpenses]
  );

  const totalIncome = useMemo(
    () => filteredIncome.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [filteredIncome]
  );

  const estimatedMonthlyRecurring = useMemo(() => {
    return filteredRecurring.reduce((sum, item) => {
      const amount = Number(item.amount || 0);
      if (item.frequency === "Weekly") return sum + amount * 4.33;
      if (item.frequency === "Monthly") return sum + amount;
      if (item.frequency === "Quarterly") return sum + amount / 3;
      if (item.frequency === "Yearly") return sum + amount / 12;
      return sum;
    }, 0);
  }, [filteredRecurring]);

  const net = totalIncome - totalExpenses;

  const taxSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    for (const item of filteredExpenses) {
      summary[item.taxCategory] =
        (summary[item.taxCategory] || 0) + Number(item.amount || 0);
    }
    return summary;
  }, [filteredExpenses]);

  const scheduleFSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    for (const item of filteredExpenses) {
      summary[item.scheduleFCategory] =
        (summary[item.scheduleFCategory] || 0) + Number(item.amount || 0);
    }
    return summary;
  }, [filteredExpenses]);

  function projectName(projectId: string) {
    if (!projectId) return "Unassigned";
    const match = projects.find((p) => p.id === projectId);
    return match ? match.name : "Unknown Project";
  }

  function addProject() {
    if (!projectForm.name.trim()) return;
    const newProject: Project = {
      id: uid(),
      name: projectForm.name.trim(),
      description: projectForm.description.trim(),
    };
    setProjects((prev) => [newProject, ...prev]);
    setProjectForm({ name: "", description: "" });
    setSelectedProjectId(newProject.id);
  }

  function deleteProject(projectId: string) {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setExpenses((prev) =>
      prev.map((item) =>
        item.projectId === projectId ? { ...item, projectId: "" } : item
      )
    );
    setIncome((prev) =>
      prev.map((item) =>
        item.projectId === projectId ? { ...item, projectId: "" } : item
      )
    );
    setRecurringCosts((prev) =>
      prev.map((item) =>
        item.projectId === projectId ? { ...item, projectId: "" } : item
      )
    );
    setFarmNotes((prev) =>
      prev.map((item) =>
        item.projectId === projectId ? { ...item, projectId: "" } : item
      )
    );
    if (selectedProjectId === projectId) setSelectedProjectId("all");
  }

  function addExpense() {
    if (!expenseForm.date || !expenseForm.vendor || !expenseForm.item) return;
    setExpenses((prev) => [{ ...expenseForm, id: uid() }, ...prev]);
    setExpenseForm({
      id: "",
      projectId: selectedProjectId === "all" ? "" : selectedProjectId,
      date: today(),
      vendor: "",
      item: "",
      amount: 0,
      category: "Seeds/Plants",
      taxCategory: "Supplies",
      scheduleFCategory: "Seeds and plants",
      notes: "",
    });
  }

  function addIncome() {
    if (!incomeForm.date || !incomeForm.source || !incomeForm.description) return;
    setIncome((prev) => [{ ...incomeForm, id: uid() }, ...prev]);
    setIncomeForm({
      id: "",
      projectId: selectedProjectId === "all" ? "" : selectedProjectId,
      date: today(),
      source: "",
      description: "",
      amount: 0,
      category: "Market Sales",
      scheduleFCategory: "Other expenses",
      notes: "",
    });
  }

  function addRecurring() {
    if (!recurringForm.name || !recurringForm.nextDue) return;
    setRecurringCosts((prev) => [{ ...recurringForm, id: uid() }, ...prev]);
    setRecurringForm({
      id: "",
      projectId: selectedProjectId === "all" ? "" : selectedProjectId,
      name: "",
      amount: 0,
      frequency: "Monthly",
      category: "Utilities",
      taxCategory: "Utilities",
      scheduleFCategory: "Utilities",
      nextDue: today(),
      notes: "",
    });
  }

  function addNote() {
    if (!noteForm.date || !noteForm.title || !noteForm.note) return;
    setFarmNotes((prev) => [{ ...noteForm, id: uid() }, ...prev]);
    setNoteForm({
      id: "",
      projectId: selectedProjectId === "all" ? "" : selectedProjectId,
      date: today(),
      title: "",
      type: "General",
      note: "",
    });
  }

  function exportExpensesCSV() {
    downloadCSV("agrimanage-expenses.csv", [
      [
        "Date",
        "Project",
        "Vendor",
        "Item or Description",
        "Amount",
        "Expense Category",
        "Tax Category",
        "Schedule F Category",
        "Notes",
      ],
      ...filteredExpenses.map((item) => [
        item.date,
        projectName(item.projectId),
        item.vendor,
        item.item,
        item.amount,
        item.category,
        item.taxCategory,
        item.scheduleFCategory,
        item.notes,
      ]),
    ]);
  }

  function exportIncomeCSV() {
    downloadCSV("agrimanage-income.csv", [
      [
        "Date",
        "Project",
        "Source",
        "Description",
        "Amount",
        "Income Category",
        "Schedule F Category",
        "Notes",
      ],
      ...filteredIncome.map((item) => [
        item.date,
        projectName(item.projectId),
        item.source,
        item.description,
        item.amount,
        item.category,
        item.scheduleFCategory,
        item.notes,
      ]),
    ]);
  }

  function exportScheduleFCSV() {
    downloadCSV("agrimanage-schedule-f-summary.csv", [
      ["Current Project Filter", selectedProjectId === "all" ? "All Projects" : projectName(selectedProjectId)],
      ["Total Income", totalIncome],
      ["Total Expenses", totalExpenses],
      ["Net", net],
      [],
      ["Schedule F Category", "Total"],
      ...Object.entries(scheduleFSummary).map(([category, total]) => [category, total]),
    ]);
  }

  async function askAI() {
    if (!question.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: question };
    setChat((prev) => [...prev, userMessage]);
    const currentQuestion = question;
    setQuestion("");
    setLoadingAI(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion,
          selectedProjectId,
          selectedProjectName:
            selectedProjectId === "all" ? "All Projects" : projectName(selectedProjectId),
          projects,
          expenses: filteredExpenses,
          income: filteredIncome,
          recurringCosts: filteredRecurring,
          farmNotes: filteredNotes,
          taxSummary,
          scheduleFSummary,
          chat,
        }),
      });

      const data = await res.json();

      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.answer || "I could not generate a response.",
        },
      ]);
    } catch {
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "There was an error contacting the AI route. Your records are still saved locally.",
        },
      ]);
    } finally {
      setLoadingAI(false);
    }
  }

  const navItems: Array<[typeof activeTab, string]> = [
    ["home", "Home"],
    ["dashboard", "Dashboard"],
    ["projects", "Projects"],
    ["expenses", "Expenses"],
    ["income", "Income"],
    ["recurring", "Recurring Costs"],
    ["notes", "Farm Notes"],
    ["ai", "AI Assistant"],
  ];

  return (
    <main style={isMobile ? styles.pageMobile : styles.page}>
      <style jsx global>{`
        @keyframes fadeInLanding {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.015);
          }
        }

        button {
          transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }

        button:hover {
          transform: translateY(-1px);
        }

        * {
          box-sizing: border-box;
        }
      `}</style>

      <aside style={isMobile ? styles.sidebarMobile : styles.sidebar}>
        <div style={styles.sidebarLogoBox}>
          <img
            src="/agrimanage-logo.png"
            alt="AgriManage logo"
            width={150}
            height={80}
            style={styles.sidebarLogoImage}
          />
          <div style={styles.sidebarTitle}>AgriManage™</div>
        </div>

        {navItems.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              ...(isMobile ? styles.navButtonMobile : styles.navButton),
              background: activeTab === key ? "#2f6f3e" : "#ffffff",
              color: activeTab === key ? "#ffffff" : "#17351f",
            }}
          >
            {label}
          </button>
        ))}

        <div style={styles.filterBox}>
          <div style={styles.filterLabel}>Current Project Filter</div>
          <select
            style={styles.input}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="all">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </aside>

      <section style={isMobile ? styles.contentMobile : styles.content}>
        {activeTab === "home" ? (
          <section style={isMobile ? styles.landingCardMobile : styles.landingCard}>
            <img
              src="/agrimanage-logo.png"
              alt="AgriManage logo"
              width={230}
              height={130}
              style={isMobile ? styles.landingLogoMobile : styles.landingLogo}
            />
            <h1 style={isMobile ? styles.landingTitleMobile : styles.landingTitle}>AgriManage™</h1>
            <p style={isMobile ? styles.landingStatementMobile : styles.landingStatement}>
              Built by a Veteran Farmer for other Farmers
            </p>
            <p style={isMobile ? styles.landingSubtextMobile : styles.landingSubtext}>
              Track farm projects, expenses, income, recurring costs, notes, and
              Schedule F organizer categories in one simple place.
            </p>
            <div style={styles.landingActions}>
              <button
                style={styles.landingPrimaryButton}
                onClick={() => setActiveTab("dashboard")}
              >
                Open Dashboard
              </button>
            </div>
          </section>
        ) : (
          <>
            <header style={isMobile ? styles.topHeaderMobile : styles.topHeader}>
              <div>
                <h1 style={styles.heading}>AgriManage™</h1>
                <p style={styles.subheading}>
                  Track flower farm expenses, sales, recurring costs, records,
                  notes, projects, and Schedule F organizer categories.
                </p>
              </div>

              <div style={isMobile ? styles.exportActionsMobile : styles.exportActions}>
                <button style={styles.secondaryButton} onClick={exportExpensesCSV}>
                  Export Expenses CSV
                </button>
                <button style={styles.secondaryButton} onClick={exportIncomeCSV}>
                  Export Income CSV
                </button>
                <button style={styles.secondaryButton} onClick={exportScheduleFCSV}>
                  Export Schedule F CSV
                </button>
              </div>
            </header>

            {activeTab === "dashboard" && (
              <>
                <div style={styles.panel}>
                  <h3 style={{ marginTop: 0 }}>
                    Viewing:{" "}
                    {selectedProjectId === "all"
                      ? "All Projects"
                      : projectName(selectedProjectId)}
                  </h3>
                  <p style={styles.smallNote}>
                    Schedule F categories are for organizing records only. Confirm
                    final tax treatment with a qualified tax professional.
                  </p>
                </div>

                <div style={isMobile ? styles.grid3Mobile : styles.grid3}>
                  <StatCard title="Total Income" value={money(totalIncome)} />
                  <StatCard title="Total Expenses" value={money(totalExpenses)} />
                  <StatCard title="Net" value={money(net)} />
                </div>

                <div style={isMobile ? styles.grid3Mobile : styles.grid3}>
                  <StatCard
                    title="Monthly Recurring Estimate"
                    value={money(estimatedMonthlyRecurring)}
                  />
                  <StatCard title="Projects" value={String(projects.length)} />
                  <StatCard title="Farm Notes" value={String(filteredNotes.length)} />
                </div>

                <div style={styles.panel}>
                  <h3>General Tax Summary</h3>
                  {Object.keys(taxSummary).length === 0 ? (
                    <p>No expense records yet.</p>
                  ) : (
                    Object.entries(taxSummary).map(([key, value]) => (
                      <div key={key} style={styles.rowBetween}>
                        <span>{key}</span>
                        <strong>{money(value)}</strong>
                      </div>
                    ))
                  )}
                </div>

                <div style={styles.panel}>
                  <h3>Schedule F Organizer Summary</h3>
                  {Object.keys(scheduleFSummary).length === 0 ? (
                    <p>No Schedule F organizer data yet.</p>
                  ) : (
                    Object.entries(scheduleFSummary).map(([key, value]) => (
                      <div key={key} style={styles.rowBetween}>
                        <span>{key}</span>
                        <strong>{money(value)}</strong>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === "projects" && (
              <>
                <div style={styles.panel}>
                  <h3>Add Project</h3>
                  <div style={isMobile ? styles.formGridMobile : styles.formGrid}>
                    <input
                      style={styles.input}
                      placeholder="Project name"
                      value={projectForm.name}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, name: e.target.value })
                      }
                    />
                  </div>
                  <textarea
                    style={styles.textarea}
                    placeholder="Description"
                    value={projectForm.description}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        description: e.target.value,
                      })
                    }
                  />
                  <button style={styles.actionButton} onClick={addProject}>
                    Save Project
                  </button>
                </div>

                <div style={styles.panel}>
                  <h3>Project List</h3>
                  {projects.length === 0 ? (
                    <p>No projects yet.</p>
                  ) : (
                    projects.map((project) => {
                      const projectExpenses = expenses.filter(
                        (item) => item.projectId === project.id
                      );
                      const projectIncome = income.filter(
                        (item) => item.projectId === project.id
                      );
                      const projectNotes = farmNotes.filter(
                        (item) => item.projectId === project.id
                      );
                      const expenseTotal = projectExpenses.reduce(
                        (sum, item) => sum + Number(item.amount || 0),
                        0
                      );
                      const incomeTotal = projectIncome.reduce(
                        (sum, item) => sum + Number(item.amount || 0),
                        0
                      );

                      return (
                        <div key={project.id} style={styles.recordCard}>
                          <div style={styles.rowBetween}>
                            <strong>{project.name}</strong>
                            <strong>{money(incomeTotal - expenseTotal)}</strong>
                          </div>
                          {project.description && <div>{project.description}</div>}
                          <div style={styles.projectMeta}>
                            <span>Income: {money(incomeTotal)}</span>
                            <span>Expenses: {money(expenseTotal)}</span>
                            <span>Notes: {projectNotes.length}</span>
                          </div>
                          <div style={styles.projectActions}>
                            <button
                              style={styles.secondaryButton}
                              onClick={() => setSelectedProjectId(project.id)}
                            >
                              View Project
                            </button>
                            <button
                              style={styles.deleteButton}
                              onClick={() => deleteProject(project.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {activeTab === "expenses" && (
              <>
                <div style={styles.panel}>
                  <h3>Add Expense</h3>
                  <div style={isMobile ? styles.formGridMobile : styles.formGrid}>
                    <select
                      style={styles.input}
                      value={expenseForm.projectId}
                      onChange={(e) =>
                        setExpenseForm({ ...expenseForm, projectId: e.target.value })
                      }
                    >
                      <option value="">Unassigned</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>

                    <input
                      style={styles.input}
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) =>
                        setExpenseForm({ ...expenseForm, date: e.target.value })
                      }
                    />

                    <input
                      style={styles.input}
                      placeholder="Vendor"
                      value={expenseForm.vendor}
                      onChange={(e) =>
                        setExpenseForm({ ...expenseForm, vendor: e.target.value })
                      }
                    />

                    <input
                      style={styles.input}
                      placeholder="Item or expense description"
                      value={expenseForm.item}
                      onChange={(e) =>
                        setExpenseForm({ ...expenseForm, item: e.target.value })
                      }
                    />

                    <select
                      style={styles.input}
                      value={expenseForm.scheduleFCategory}
                      onChange={(e) =>
                        setExpenseForm({
                          ...expenseForm,
                          scheduleFCategory: e.target.value as ScheduleFCategory,
                        })
                      }
                    >
                      {scheduleFCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    <input
                      style={styles.input}
                      type="number"
                      placeholder="Amount"
                      value={expenseForm.amount || ""}
                      onChange={(e) =>
                        setExpenseForm({
                          ...expenseForm,
                          amount: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <textarea
                    style={styles.textarea}
                    placeholder="Notes"
                    value={expenseForm.notes}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, notes: e.target.value })
                    }
                  />

                  <button style={styles.actionButton} onClick={addExpense}>
                    Save Expense
                  </button>
                </div>

                <div style={styles.panel}>
                  <h3>Expense Records</h3>
                  {filteredExpenses.length === 0 ? (
                    <p>No expenses yet.</p>
                  ) : (
                    filteredExpenses.map((item) => (
                      <div key={item.id} style={styles.recordCard}>
                        <div style={styles.rowBetween}>
                          <strong>{item.item}</strong>
                          <strong>{money(item.amount)}</strong>
                        </div>
                        <div>{item.date}</div>
                        <div>{item.vendor}</div>
                        <div>Project: {projectName(item.projectId)}</div>
                        <div>Schedule F: {item.scheduleFCategory}</div>
                        {item.notes && <div>Notes: {item.notes}</div>}
                        <button
                          style={styles.deleteButton}
                          onClick={() =>
                            setExpenses((prev) =>
                              prev.filter((x) => x.id !== item.id)
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === "income" && (
              <>
                <div style={styles.panel}>
                  <h3>Add Income</h3>
                  <div style={isMobile ? styles.formGridMobile : styles.formGrid}>
                    <select
                      style={styles.input}
                      value={incomeForm.projectId}
                      onChange={(e) =>
                        setIncomeForm({ ...incomeForm, projectId: e.target.value })
                      }
                    >
                      <option value="">Unassigned</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>

                    <input
                      style={styles.input}
                      type="date"
                      value={incomeForm.date}
                      onChange={(e) =>
                        setIncomeForm({ ...incomeForm, date: e.target.value })
                      }
                    />

                    <input
                      style={styles.input}
                      placeholder="Source"
                      value={incomeForm.source}
                      onChange={(e) =>
                        setIncomeForm({ ...incomeForm, source: e.target.value })
                      }
                    />

                    <input
                      style={styles.input}
                      placeholder="Income description"
                      value={incomeForm.description}
                      onChange={(e) =>
                        setIncomeForm({
                          ...incomeForm,
                          description: e.target.value,
                        })
                      }
                    />

                    <select
                      style={styles.input}
                      value={incomeForm.scheduleFCategory}
                      onChange={(e) =>
                        setIncomeForm({
                          ...incomeForm,
                          scheduleFCategory: e.target.value as ScheduleFCategory,
                        })
                      }
                    >
                      {scheduleFCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    <input
                      style={styles.input}
                      type="number"
                      placeholder="Amount"
                      value={incomeForm.amount || ""}
                      onChange={(e) =>
                        setIncomeForm({
                          ...incomeForm,
                          amount: Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <textarea
                    style={styles.textarea}
                    placeholder="Notes"
                    value={incomeForm.notes}
                    onChange={(e) =>
                      setIncomeForm({ ...incomeForm, notes: e.target.value })
                    }
                  />

                  <button style={styles.actionButton} onClick={addIncome}>
                    Save Income
                  </button>
                </div>

                <div style={styles.panel}>
                  <h3>Income Records</h3>
                  {filteredIncome.length === 0 ? (
                    <p>No income yet.</p>
                  ) : (
                    filteredIncome.map((item) => (
                      <div key={item.id} style={styles.recordCard}>
                        <div style={styles.rowBetween}>
                          <strong>{item.description}</strong>
                          <strong>{money(item.amount)}</strong>
                        </div>
                        <div>{item.date}</div>
                        <div>{item.source}</div>
                        <div>Project: {projectName(item.projectId)}</div>
                        <div>Schedule F: {item.scheduleFCategory}</div>
                        {item.notes && <div>Notes: {item.notes}</div>}
                        <button
                          style={styles.deleteButton}
                          onClick={() =>
                            setIncome((prev) => prev.filter((x) => x.id !== item.id))
                          }
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === "recurring" && (
              <>
                <div style={styles.panel}>
                  <h3>Add Recurring Cost</h3>
                  <div style={isMobile ? styles.formGridMobile : styles.formGrid}>
                    <select
                      style={styles.input}
                      value={recurringForm.projectId}
                      onChange={(e) =>
                        setRecurringForm({
                          ...recurringForm,
                          projectId: e.target.value,
                        })
                      }
                    >
                      <option value="">Unassigned</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>

                    <input
                      style={styles.input}
                      placeholder="Name"
                      value={recurringForm.name}
                      onChange={(e) =>
                        setRecurringForm({ ...recurringForm, name: e.target.value })
                      }
                    />

                    <input
                      style={styles.input}
                      type="number"
                      placeholder="Amount"
                      value={recurringForm.amount || ""}
                      onChange={(e) =>
                        setRecurringForm({
                          ...recurringForm,
                          amount: Number(e.target.value),
                        })
                      }
                    />

                    <select
                      style={styles.input}
                      value={recurringForm.frequency}
                      onChange={(e) =>
                        setRecurringForm({
                          ...recurringForm,
                          frequency: e.target.value as RecurringCost["frequency"],
                        })
                      }
                    >
                      <option>Weekly</option>
                      <option>Monthly</option>
                      <option>Quarterly</option>
                      <option>Yearly</option>
                    </select>

                    <input
                      style={styles.input}
                      type="date"
                      value={recurringForm.nextDue}
                      onChange={(e) =>
                        setRecurringForm({
                          ...recurringForm,
                          nextDue: e.target.value,
                        })
                      }
                    />

                    <select
                      style={styles.input}
                      value={recurringForm.scheduleFCategory}
                      onChange={(e) =>
                        setRecurringForm({
                          ...recurringForm,
                          scheduleFCategory: e.target.value as ScheduleFCategory,
                        })
                      }
                    >
                      {scheduleFCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    style={styles.textarea}
                    placeholder="Notes"
                    value={recurringForm.notes}
                    onChange={(e) =>
                      setRecurringForm({ ...recurringForm, notes: e.target.value })
                    }
                  />

                  <button style={styles.actionButton} onClick={addRecurring}>
                    Save Recurring Cost
                  </button>
                </div>

                <div style={styles.panel}>
                  <h3>Recurring Costs</h3>
                  {filteredRecurring.length === 0 ? (
                    <p>No recurring costs yet.</p>
                  ) : (
                    filteredRecurring.map((item) => (
                      <div key={item.id} style={styles.recordCard}>
                        <div style={styles.rowBetween}>
                          <strong>{item.name}</strong>
                          <strong>{money(item.amount)}</strong>
                        </div>
                        <div>Project: {projectName(item.projectId)}</div>
                        <div>{item.frequency}</div>
                        <div>Next Due: {item.nextDue}</div>
                        <div>Schedule F: {item.scheduleFCategory}</div>
                        {item.notes && <div>Notes: {item.notes}</div>}
                        <button
                          style={styles.deleteButton}
                          onClick={() =>
                            setRecurringCosts((prev) =>
                              prev.filter((x) => x.id !== item.id)
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === "notes" && (
              <>
                <div style={styles.panel}>
                  <h3>Add Farm Note</h3>
                  <div style={isMobile ? styles.formGridMobile : styles.formGrid}>
                    <select
                      style={styles.input}
                      value={noteForm.projectId}
                      onChange={(e) =>
                        setNoteForm({ ...noteForm, projectId: e.target.value })
                      }
                    >
                      <option value="">Unassigned</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>

                    <input
                      style={styles.input}
                      type="date"
                      value={noteForm.date}
                      onChange={(e) =>
                        setNoteForm({ ...noteForm, date: e.target.value })
                      }
                    />

                    <input
                      style={styles.input}
                      placeholder="Title"
                      value={noteForm.title}
                      onChange={(e) =>
                        setNoteForm({ ...noteForm, title: e.target.value })
                      }
                    />

                    <select
                      style={styles.input}
                      value={noteForm.type}
                      onChange={(e) =>
                        setNoteForm({
                          ...noteForm,
                          type: e.target.value as FarmNote["type"],
                        })
                      }
                    >
                      <option>Planting</option>
                      <option>Harvest</option>
                      <option>Pest/Disease</option>
                      <option>Weather</option>
                      <option>General</option>
                    </select>
                  </div>

                  <textarea
                    style={styles.textarea}
                    placeholder="Farm note"
                    value={noteForm.note}
                    onChange={(e) =>
                      setNoteForm({ ...noteForm, note: e.target.value })
                    }
                  />

                  <button style={styles.actionButton} onClick={addNote}>
                    Save Note
                  </button>
                </div>

                <div style={styles.panel}>
                  <h3>Farm Notes</h3>
                  {filteredNotes.length === 0 ? (
                    <p>No notes yet.</p>
                  ) : (
                    filteredNotes.map((item) => (
                      <div key={item.id} style={styles.recordCard}>
                        <div style={styles.rowBetween}>
                          <strong>{item.title}</strong>
                          <strong>{item.type}</strong>
                        </div>
                        <div>{item.date}</div>
                        <div>Project: {projectName(item.projectId)}</div>
                        <div>{item.note}</div>
                        <button
                          style={styles.deleteButton}
                          onClick={() =>
                            setFarmNotes((prev) =>
                              prev.filter((x) => x.id !== item.id)
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === "ai" && (
              <div style={styles.panel}>
                <h3>AI Assistant</h3>
                <p style={{ marginTop: 0, color: "#48624e" }}>
                  Current AI scope:{" "}
                  {selectedProjectId === "all"
                    ? "All Projects"
                    : projectName(selectedProjectId)}
                </p>

                <div style={styles.chatBox}>
                  {chat.map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        ...(isMobile ? styles.chatBubbleMobile : styles.chatBubble),
                        alignSelf:
                          msg.role === "user" ? "flex-end" : "flex-start",
                        background: msg.role === "user" ? "#dff1e3" : "#ffffff",
                      }}
                    >
                      <strong>{msg.role === "user" ? "You" : "AI"}:</strong>
                      <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                <textarea
                  style={styles.textarea}
                  placeholder="Ask about costs, project trends, Schedule F organizer categories, tax organization, or records..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />

                <button
                  style={styles.actionButton}
                  onClick={askAI}
                  disabled={loadingAI}
                >
                  {loadingAI ? "Thinking..." : "Ask AI"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div style={styles.card}>
      <div style={{ fontSize: 14, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{value}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "#f3f7f0",
    color: "#17351f",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },
  pageMobile: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    background: "#f3f7f0",
    color: "#17351f",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },
  sidebar: {
    width: 280,
    background: "#e4f0e4",
    padding: 20,
    borderRight: "1px solid #cfe0cf",
    flexShrink: 0,
  },
  sidebarMobile: {
    width: "100%",
    background: "#e4f0e4",
    padding: 14,
    borderRight: "none",
    borderBottom: "1px solid #cfe0cf",
    flexShrink: 0,
  },
  sidebarLogoBox: {
    textAlign: "center",
    marginBottom: 20,
  },
  sidebarLogoImage: {
    objectFit: "contain",
    margin: "0 auto 8px auto",
    display: "block",
  },
  sidebarTitle: {
    fontSize: 26,
    fontWeight: 900,
    color: "#1d5a2c",
  },
  tagline: {
    marginTop: 6,
    marginBottom: 20,
    color: "#4d6a54",
    fontSize: 14,
  },
  navButton: {
    width: "100%",
    marginBottom: 10,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #b7cdb7",
    cursor: "pointer",
    textAlign: "left",
    fontWeight: 700,
  },
  navButtonMobile: {
    width: "48%",
    marginBottom: 8,
    marginRight: "2%",
    padding: "11px 10px",
    borderRadius: 12,
    border: "1px solid #b7cdb7",
    cursor: "pointer",
    textAlign: "center",
    fontWeight: 800,
    fontSize: 13,
  },
  filterBox: {
    marginTop: 20,
    padding: 12,
    background: "#ffffff",
    border: "1px solid #d5e5d5",
    borderRadius: 14,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 8,
    color: "#48624e",
  },
  content: {
    flex: 1,
    padding: 28,
    overflow: "auto",
  },
  contentMobile: {
    flex: 1,
    padding: 12,
    overflow: "auto",
  },
  landingCard: {
    background: "linear-gradient(135deg, #ffffff 0%, #eef7ee 100%)",
    borderRadius: 28,
    padding: 56,
    border: "1px solid #d5e5d5",
    textAlign: "center",
    minHeight: "calc(100vh - 56px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 20px 50px rgba(23, 53, 31, 0.10)",
    animation: "fadeInLanding 700ms ease-out both",
  },
  landingCardMobile: {
    background: "linear-gradient(135deg, #ffffff 0%, #eef7ee 100%)",
    borderRadius: 22,
    padding: "34px 18px",
    border: "1px solid #d5e5d5",
    textAlign: "center",
    minHeight: "72vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 34px rgba(23, 53, 31, 0.10)",
    animation: "fadeInLanding 700ms ease-out both",
  },
  landingLogo: {
    width: 230,
    height: "auto",
    objectFit: "contain",
    marginBottom: 20,
    animation: "logoFloat 4.5s ease-in-out infinite",
    filter: "drop-shadow(0 10px 20px rgba(23, 53, 31, 0.14))",
  },
  landingLogoMobile: {
    width: 170,
    height: "auto",
    objectFit: "contain",
    marginBottom: 16,
    animation: "logoFloat 4.5s ease-in-out infinite",
    filter: "drop-shadow(0 8px 16px rgba(23, 53, 31, 0.12))",
  },
  landingTitle: {
    margin: 0,
    fontSize: 48,
    fontWeight: 950,
    color: "#17351f",
  },
  landingTitleMobile: {
    margin: 0,
    fontSize: 34,
    fontWeight: 950,
    color: "#17351f",
  },
  landingStatement: {
    marginTop: 14,
    marginBottom: 0,
    fontSize: 24,
    fontWeight: 850,
    color: "#2f6f3e",
  },
  landingStatementMobile: {
    marginTop: 12,
    marginBottom: 0,
    fontSize: 19,
    lineHeight: 1.3,
    fontWeight: 850,
    color: "#2f6f3e",
  },
  landingSubtext: {
    maxWidth: 720,
    marginTop: 16,
    marginBottom: 28,
    color: "#48624e",
    fontSize: 17,
    lineHeight: 1.6,
  },
  landingSubtextMobile: {
    maxWidth: 360,
    marginTop: 14,
    marginBottom: 24,
    color: "#48624e",
    fontSize: 15,
    lineHeight: 1.5,
  },
  landingActions: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  landingPrimaryButton: {
    background: "#2f6f3e",
    color: "#fff",
    border: "none",
    borderRadius: 16,
    padding: "16px 34px",
    minWidth: 240,
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 17,
    letterSpacing: "0.01em",
    boxShadow: "0 14px 28px rgba(47, 111, 62, 0.24)",
  },
  topHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  topHeaderMobile: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    marginBottom: 18,
  },
  exportActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  exportActionsMobile: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 8,
    width: "100%",
  },
  heading: {
    margin: 0,
    fontSize: 34,
    color: "#18361f",
  },
  subheading: {
    marginTop: 8,
    marginBottom: 0,
    color: "#48624e",
    maxWidth: 760,
  },
  smallNote: {
    color: "#48624e",
    fontSize: 14,
    marginBottom: 0,
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 16,
  },
  grid3Mobile: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
    marginBottom: 12,
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 18,
    border: "1px solid #d5e5d5",
    boxShadow: "0 8px 24px rgba(23, 53, 31, 0.05)",
  },
  panel: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 20,
    border: "1px solid #d5e5d5",
    marginBottom: 18,
    boxShadow: "0 8px 24px rgba(23, 53, 31, 0.05)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 12,
    marginBottom: 12,
  },
  formGridMobile: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
    marginBottom: 12,
  },
  input: {
    width: "100%",
    padding: 11,
    borderRadius: 10,
    border: "1px solid #bfd1bf",
    background: "#fff",
    color: "#17351f",
    fontSize: 14,
  },
  textarea: {
    width: "100%",
    minHeight: 100,
    padding: 11,
    borderRadius: 10,
    border: "1px solid #bfd1bf",
    marginBottom: 12,
    color: "#17351f",
    fontSize: 14,
  },
  actionButton: {
    background: "#2f6f3e",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 800,
  },
  secondaryButton: {
    background: "#ffffff",
    color: "#17351f",
    border: "1px solid #b7cdb7",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 800,
  },
  deleteButton: {
    marginTop: 10,
    background: "#8d3131",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 800,
  },
  recordCard: {
    border: "1px solid #d5e5d5",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    background: "#fbfdfb",
  },
  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 6,
  },
  projectMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 10,
    color: "#48624e",
    fontSize: 14,
  },
  projectActions: {
    display: "flex",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },
  chatBox: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 12,
    maxHeight: 420,
    overflowY: "auto",
    padding: 8,
    background: "#f7fbf7",
    borderRadius: 12,
    border: "1px solid #d5e5d5",
  },
  chatBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #d5e5d5",
  },
  chatBubbleMobile: {
    maxWidth: "96%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #d5e5d5",
  },
};
