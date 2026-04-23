import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getPayments, getParticipants, createPayment } from "../lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function Payments() {
  const navigate = useNavigate()
  const [payments, setPayments] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [participantId, setParticipantId] = useState("")
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("cash")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const [pays, parts] = await Promise.all([getPayments(), getParticipants()])
      setPayments(pays)
      setParticipants(parts)
    }
    load()
  }, [])

  const getParticipantName = (id: string) => {
    const p = participants.find((p: any) => p.id === id)
    return p ? `${p.first_name} ${p.last_name}` : "Unknown"
  }

  const handleCreate = async () => {
    if (!participantId || !amount) return
    setLoading(true)
    try {
      const payment = await createPayment({
        participant_id: participantId,
        amount: parseFloat(amount),
        method,
      })
      setPayments((prev) => [payment, ...prev])
      setAmount("")
      setParticipantId("")
    } catch {
      alert("Error recording payment")
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
        <h1 className="text-2xl font-semibold">Payments</h1>

        {/* record payment form */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label>Participant</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
              >
                <option value="">Select participant</option>
                {participants.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name}
                  </option>
                ))}
              </select>
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

            <div className="space-y-2">
              <Label>Method</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="zelle">Zelle</option>
                <option value="cash_app">Cash App</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Button className="w-full" onClick={handleCreate} disabled={loading}>
              {loading ? "Recording..." : "Record payment"}
            </Button>
          </CardContent>
        </Card>

        {/* payment history */}
        <Card>
          <CardContent className="pt-4 divide-y">
            {payments.length === 0 && (
              <p className="text-sm text-center text-gray-500 py-6">No payments yet</p>
            )}
            {payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{getParticipantName(p.participant_id)}</p>
                  <p className="text-xs text-gray-500">{p.method} · {new Date(p.paid_at).toLocaleDateString()}</p>
                </div>
                <Badge variant="secondary">${Number(p.amount).toFixed(2)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}