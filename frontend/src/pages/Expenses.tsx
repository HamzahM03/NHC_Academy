import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getExpenses, createExpense } from "../lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function Expenses() {
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState<any[]>([])
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const data = await getExpenses()
      setExpenses(data)
    }
    load()
  }, [])

  const handleCreate = async () => {
    if (!description || !amount) return
    setLoading(true)
    try {
      const today = new Date().toISOString().split("T")[0]
      const expense = await createExpense({
        description,
        amount: parseFloat(amount),
        expense_date: today,
      })
      setExpenses((prev) => [expense, ...prev])
      setDescription("")
      setAmount("")
    } catch {
      alert("Error recording expense")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <p className="font-semibold">CampOps</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/")}>Back</Button>
      </div>

      <div className="p-6 space-y-6 max-w-2xl">
        <h1 className="text-2xl font-semibold">Expenses</h1>

        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Gym rental, basketballs..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={loading}>
              {loading ? "Saving..." : "Log expense"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 divide-y">
            {expenses.length === 0 && (
              <p className="text-sm text-center text-gray-500 py-6">No expenses yet</p>
            )}
            {expenses.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{e.description}</p>
                  <p className="text-xs text-gray-500">{e.expense_date}</p>
                </div>
                <Badge variant="secondary">${Number(e.amount).toFixed(2)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}