import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getSessions, createSession } from "../lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function Sessions() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const data = await getSessions()
      setSessions(data)
    }
    load()
  }, [])

  const handleCreate = async () => {
    if (!title || !date) return
    setLoading(true)
    try {
      const session = await createSession({ title, session_date: date })
      setSessions((prev) => [session, ...prev])
      setTitle("")
      setDate("")
    } catch {
      alert("Error creating session")
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
        <h1 className="text-2xl font-semibold">Sessions</h1>

        <Card>
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm font-medium">Create session</p>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Skills Training, Shooting Drills..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={loading}>
              {loading ? "Creating..." : "Create session"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 divide-y">
            {sessions.length === 0 && (
              <p className="text-sm text-center text-gray-500 py-6">No sessions yet</p>
            )}
            {sessions.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="text-xs text-gray-500">{s.session_date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.status === "scheduled" ? "secondary" : "outline"}>
                    {s.status}
                  </Badge>
                  {s.status === "scheduled" && (
                    <Button size="sm" onClick={() => navigate(`/checkin/${s.id}`)}>
                      Check in
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}