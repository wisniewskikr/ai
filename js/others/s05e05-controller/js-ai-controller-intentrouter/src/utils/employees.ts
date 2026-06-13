export interface Employee {
  id: string;
  name: string;
  title: string;
  description: string;
  reportsTo: string | null;
}

// In-memory employee data — flat list, relations encoded via reportsTo
export const employees: Employee[] = [
  {
    id: "anna",
    name: "Anna",
    title: "CEO",
    description:
      "Anna is the CEO of the company. She has strong leadership skills, strategic vision, and oversees all departments. She is responsible for company-wide decisions and long-term planning.",
    reportsTo: null,
  },
  {
    id: "jan",
    name: "Jan",
    title: "CTO",
    description:
      "Jan is the CTO. He leads the technology department, manages developers, and drives technical strategy. He reports directly to Anna and has deep expertise in software architecture.",
    reportsTo: "anna",
  },
  {
    id: "ewa",
    name: "Ewa",
    title: "CFO",
    description:
      "Ewa is the CFO. She manages company finances, budgeting, and accounting operations. She reports to Anna and ensures financial health of the organization.",
    reportsTo: "anna",
  },
  {
    id: "piotr",
    name: "Piotr",
    title: "Developer",
    description:
      "Piotr is a software developer in the technology department. He writes code, fixes bugs, and builds new features. He reports to Jan.",
    reportsTo: "jan",
  },
  {
    id: "maria",
    name: "Maria",
    title: "Developer",
    description:
      "Maria is a software developer focused on front-end development. She creates user interfaces and collaborates closely with Piotr. She reports to Jan.",
    reportsTo: "jan",
  },
  {
    id: "tomasz",
    name: "Tomasz",
    title: "Accountant",
    description:
      "Tomasz is an accountant who handles day-to-day financial records, invoices, and payroll. He reports to Ewa and supports the finance department.",
    reportsTo: "ewa",
  },
];
