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

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
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
  if (category === "Market Fees") return "Other expenses";
  if (category === "Packaging") return "Supplies";
  if (category === "Advertising") return "Other expenses";
  return "Other expenses";
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "projects"
    | "expenses"
    | "income"
    | "recurring"
    | "notes"
    | "ai"
  >("dashboard");

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

  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
  });

  const [expenseForm, setExpenseForm] = useState<ExpenseRecord>({
    id: "",
    projectId: "",
    date: "",
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
    date: "",
    source: "",
    description: "",
    amount: 0,
    category: "Market Sales",
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
    nextDue: "",
    notes: "",
  });

  const [noteForm, setNoteForm] = useState<FarmNote>({
    id: "",
    projectId: "",
    date: "",
    title: "",
    type: "General",
    note: "",
  });

  useEffect(() => {
    const storedProjects = localStorage.getItem("agrimanage™_projects");
    const storedSelectedProjectId = localStorage.getItem(
      "agrimanage™_selected_project"
    );
    const storedExpenses = localStorage.getItem("agrimanage™_expenses");
    const storedIncome = localStorage.getItem("agrimanage™_income");
    const storedRecurring = localStorage.getItem("agrimanage™_recurring");
    const storedNotes = localStorage.getItem("agrimanage™_notes");
    const storedChat = localStorage.getItem("agrimanage™_chat");

    if (storedProjects) setProjects(JSON.parse(storedProjects));
    if (storedSelectedProjectId) setSelectedProjectId(storedSelectedProjectId);

    if (storedExpenses) {
      const parsed: ExpenseRecord[] = JSON.parse(storedExpenses).map(
        (item: Partial<ExpenseRecord>) => ({
          ...item,
          projectId: item.projectId || "",
          scheduleFCategory:
            item.scheduleFCategory ||
            guessScheduleFCategory(item.category || "Other"),
        })
      );
      setExpenses(parsed);
    }

    if (storedIncome) {
      const parsed: IncomeRecord[] = JSON.parse(storedIncome).map(
        (item: Partial<IncomeRecord>) => ({
          ...item,
          projectId: item.projectId || "",
        })
      );
      setIncome(parsed);
    }

    if (storedRecurring) {
      const parsed: RecurringCost[] = JSON.parse(storedRecurring).map(
        (item: Partial<RecurringCost>) => ({
          ...item,
          projectId: item.projectId || "",
          scheduleFCategory:
            item.scheduleFCategory ||
            guessScheduleFCategory(item.category || "Other"),
        })
      );
      setRecurringCosts(parsed);
    }

    if (storedNotes) {
      const parsed: FarmNote[] = JSON.parse(storedNotes).map(
        (item: Partial<FarmNote>) => ({
          ...item,
          projectId: item.projectId || "",
        })
      );
      setFarmNotes(parsed);
    }

    if (storedChat) setChat(JSON.parse(storedChat));
  }, []);

  useEffect(() => {
    localStorage.setItem("agrimanage™_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(
      "agrimanage™_selected_project",
      selectedProjectId || "all"
    );
  }, [selectedProjectId]);

  useEffect(() => {
    localStorage.setItem("agrimanage™_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("agrimanage™_income", JSON.stringify(income));
  }, [income]);

  useEffect(() => {
    localStorage.setItem("agrimanage™_recurring", JSON.stringify(recurringCosts));
  }, [recurringCosts]);

  useEffect(() => {
    localStorage.setItem("agrimanage™_notes", JSON.stringify(farmNotes));
  }, [farmNotes]);

  useEffect(() => {
    localStorage.setItem("agrimanage™chat", JSON.stringify(chat));
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
    () =>
      filteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
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
      date: "",
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
      date: "",
      source: "",
      description: "",
      amount: 0,
      category: "Market Sales",
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
      nextDue: "",
      notes: "",
    });
  }

  function addNote() {
    if (!noteForm.date || !noteForm.title || !noteForm.note) return;
    setFarmNotes((prev) => [{ ...noteForm, id: uid() }, ...prev]);
    setNoteForm({
      id: "",
      projectId: selectedProjectId === "all" ? "" : selectedProjectId,
      date: "",
      title: "",
      type: "General",
      note: "",
    });
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
          content: "There was an error contacting the AI route.",
        },
      ]);
    } finally {
      setLoadingAI(false);
    }
  }

  return (
    <main style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
  <img
  src="/agrimanage-logo.png"
  alt=""
  width={160}
  height={80}
  style={{ objectFit: "contain", display: "block", marginBottom: 10 }}
/>
</div>
        <div style={styles.tagline}>Flower Farm Manager</div>

        {[
          ["dashboard", "Dashboard"],
          ["projects", "Projects"],
          ["expenses", "Expenses"],
          ["income", "Income"],
          ["recurring", "Recurring Costs"],
          ["notes", "Farm Notes"],
          ["ai", "AI Assistant"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            style={{
              ...styles.navButton,
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

      <section style={styles.content}>
        <h1 style={styles.heading}>AgriManage™</h1>
        <p style={styles.subheading}>
          Track flower farm expenses, sales, recurring costs, records, notes, projects, and Schedule F organizer categories.
        </p>

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
                Schedule F categories are for organizing records only. Confirm final tax treatment with a qualified tax professional.
              </p>
            </div>

            <div style={styles.grid3}>
              <StatCard title="Total Income" value={money(totalIncome)} />
              <StatCard title="Total Expenses" value={money(totalExpenses)} />
              <StatCard title="Net" value={money(net)} />
            </div>

            <div style={styles.grid3}>
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
              <div style={styles.formGrid}>
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
              <div style={styles.formGrid}>
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
                  placeholder="Item"
                  value={expenseForm.item}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, item: e.target.value })
                  }
                />
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
                <select
                  style={styles.input}
                  value={expenseForm.category}
                  onChange={(e) => {
                    const category = e.target.value as ExpenseCategory;
                    setExpenseForm({
                      ...expenseForm,
                      category,
                      scheduleFCategory: guessScheduleFCategory(category),
                    });
                  }}
                >
                  {expenseCategories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  style={styles.input}
                  value={expenseForm.taxCategory}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      taxCategory: e.target.value as TaxCategory,
                    })
                  }
                >
                  {taxCategories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
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
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
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
                    <div>Category: {item.category}</div>
                    <div>General Tax: {item.taxCategory}</div>
                    <div>Schedule F: {item.scheduleFCategory}</div>
                    {item.notes && <div>Notes: {item.notes}</div>}
                    <button
                      style={styles.deleteButton}
                      onClick={() =>
                        setExpenses((prev) => prev.filter((x) => x.id !== item.id))
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
              <div style={styles.formGrid}>
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
                  placeholder="Description"
                  value={incomeForm.description}
                  onChange={(e) =>
                    setIncomeForm({
                      ...incomeForm,
                      description: e.target.value,
                    })
                  }
                />
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
                <select
                  style={styles.input}
                  value={incomeForm.category}
                  onChange={(e) =>
                    setIncomeForm({
                      ...incomeForm,
                      category: e.target.value as IncomeCategory,
                    })
                  }
                >
                  {incomeCategories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
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
                    <div>{item.category}</div>
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
              <div style={styles.formGrid}>
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
                  value={recurringForm.category}
                  onChange={(e) => {
                    const category = e.target.value as ExpenseCategory;
                    setRecurringForm({
                      ...recurringForm,
                      category,
                      scheduleFCategory: guessScheduleFCategory(category),
                    });
                  }}
                >
                  {expenseCategories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  style={styles.input}
                  value={recurringForm.taxCategory}
                  onChange={(e) =>
                    setRecurringForm({
                      ...recurringForm,
                      taxCategory: e.target.value as TaxCategory,
                    })
                  }
                >
                  {taxCategories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
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
                    <option key={cat}>{cat}</option>
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
                    <div>Category: {item.category}</div>
                    <div>General Tax: {item.taxCategory}</div>
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
              <div style={styles.formGrid}>
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
                        setFarmNotes((prev) => prev.filter((x) => x.id !== item.id))
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
                    ...styles.chatBubble,
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
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
      </section>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div style={styles.card}>
      <div style={{ fontSize: 14, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{value}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    minHeight: "100vh",
  },
  sidebar: {
    width: 260,
    background: "#e4f0e4",
    padding: 20,
    borderRight: "1px solid #cfe0cf",
  },
  logo: {
    fontSize: 28,
    fontWeight: 800,
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
    borderRadius: 10,
    border: "1px solid #b7cdb7",
    cursor: "pointer",
    textAlign: "left",
  },
  filterBox: {
    marginTop: 20,
    padding: 12,
    background: "#ffffff",
    border: "1px solid #d5e5d5",
    borderRadius: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
    color: "#48624e",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  heading: {
    margin: 0,
    fontSize: 34,
    color: "#18361f",
  },
  subheading: {
    marginTop: 8,
    marginBottom: 24,
    color: "#48624e",
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
  card: {
    background: "#ffffff",
    borderRadius: 14,
    padding: 18,
    border: "1px solid #d5e5d5",
  },
  panel: {
    background: "#ffffff",
    borderRadius: 14,
    padding: 18,
    border: "1px solid #d5e5d5",
    marginBottom: 18,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 12,
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #bfd1bf",
    background: "#fff",
  },
  textarea: {
    width: "100%",
    minHeight: 100,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #bfd1bf",
    marginBottom: 12,
  },
  actionButton: {
    background: "#2f6f3e",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  secondaryButton: {
    background: "#ffffff",
    color: "#17351f",
    border: "1px solid #b7cdb7",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  deleteButton: {
    marginTop: 10,
    background: "#8d3131",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
  },
  recordCard: {
    border: "1px solid #d5e5d5",
    borderRadius: 12,
    padding: 12,
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
};
