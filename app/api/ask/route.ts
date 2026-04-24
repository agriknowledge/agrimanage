import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { answer: "OPENAI_API_KEY is missing from .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      question,
      selectedProjectId = "all",
      selectedProjectName = "All Projects",
      projects = [],
      expenses = [],
      income = [],
      recurringCosts = [],
      farmNotes = [],
      taxSummary = {},
      scheduleFSummary = {},
      chat = [],
    } = body ?? {};

    const prompt = `
You are an assistant for a flower farm management app called AgriManage™.

Important tax boundary:
- You may help organize farm records and explain general recordkeeping concepts.
- You are not a CPA, attorney, enrolled agent, or tax advisor.
- Do not tell the user that a category is definitely tax-deductible.
- Use phrases like "possible category," "organizer category," and "confirm with a qualified tax professional."
- Schedule F information is for organization and preparation only, not final tax advice.

Goals:
- help summarize flower farm records
- help explain spending patterns and recurring costs
- help organize expenses into likely Schedule F organizer categories
- help organize expenses into general tax-style categories
- help identify trends in income and expenses
- compare project performance when useful
- answer simply and clearly

Current selected project scope:
- selectedProjectId: ${selectedProjectId}
- selectedProjectName: ${selectedProjectName}

Data:
${JSON.stringify(
  {
    projects,
    expenses,
    income,
    recurringCosts,
    farmNotes,
    taxSummary,
    scheduleFSummary,
    recentChat: chat.slice(-8),
  },
  null,
  2
)}

User question:
${question}
`;

    const response = await client.responses.create({
      model: "gpt-5.4",
      input: prompt,
    });

    return Response.json({
      answer: response.output_text || "No response returned.",
    });
  } catch (error) {
    console.error("ASK ROUTE ERROR:", error);
    return Response.json(
      { answer: "There was an error generating the AI response." },
      { status: 500 }
    );
  }
}
