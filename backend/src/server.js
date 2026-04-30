import express from "express";

const app = express();
const port = 3000;

const router = express.Router();

app.use(express.json());

let payables = [
  { id: 1, dueDate: 2001, category: "Loan", amount: 20, isPaid: false },
  { id: 2, dueDate: 2003, category: "Personal", amount: 100, isPaid: false },
  { id: 3, dueDate: 2002, category: "Credit", amount: 400, isPaid: false },
  { id: 4, dueDate: 2004, category: "Loan", amount: 60, isPaid: false },
];

app.get("/", (req, res) => {
  res.send("Bro this is from the API.");
});

router.get("/", (req, res) => {
  res.json(payables);
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const payable = payables.find((p) => p.id === id);

  if (!payable) return res.status(404).send("Payable not found");
  res.json(payable);
});

router.post("/", (req, res) => {
  const { dueDate, category, amount, isPaid } = req.body;

  if (!dueDate || !category || !amount)
    return res.status(400).send("Missing required fields");

  const newPayable = {
    id: payables.length + 1,
    dueDate,
    category,
    amount,
    isPaid: false,
  };

  payables.push(newPayable);
  res.status(201).json(newPayable);
});

app.use("/api/v1", router);

app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`),
);
