import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getParticipants, getPackages, createPackage } from "../lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function Packages() {
  const navigate = useNavigate()
  const [participants, setParticipants] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [participantId, setParticipantId] = useState("")
  const [name, setName] = useState("")
  const [sessionsTotal, setSessionsTotal] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const [parts, pkgs] = await Promise.all([getParticipants(), getPackages()])
      setParticipants(parts)
      setPackages(pkgs)
    }
    load()
  }, [])

  const getParticipantName = (id: string) => {
    const p = participants.find((p: any) => p.id === id)
    return p ? `${p.first_name} ${p.last_name}` : "Unknown"
  }

  const handleCreate = async () => {
    if (!participantId || !name || !sessionsTotal || !price) return
    setLoading(true)
    try {
      const pkg = await createPackage({
        participant_id: participantId,
        name,
        sessions_total: parseInt(sessionsTotal),
        price: parseFloat(price),
      })
      setPackages((prev) => [pkg, ...prev])
      setParticipantId("")
      setName("")
      setSessionsTotal("")
      setPrice("")
    } catch {
      alert("Error creating package")
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
        <h1 className="text-2xl font-semibold">Packages</h1>

        <Card>
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm font-medium">Assign package</p>
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
              <Label>Package name</Label>
              <Input
                placeholder="10 session pack, Drop-in..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sessions</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={sessionsTotal}
                  onChange={(e) => setSessionsTotal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  placeholder="200.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={loading}>
              {loading ? "Saving..." : "Assign package"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 divide-y">
            {packages.length === 0 && (
              <p className="text-sm text-center text-gray-500 py-6">No packages yet</p>
            )}
            {packages.map((pkg: any) => (
              <div key={pkg.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{getParticipantName(pkg.participant_id)}</p>
                  <p className="text-xs text-gray-500">{pkg.name} · {pkg.sessions_remaining} left</p>
                </div>
                <Badge variant={pkg.status === "active" ? "secondary" : "outline"}>
                  {pkg.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}