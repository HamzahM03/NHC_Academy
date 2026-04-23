import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getParticipants, getPackagesForParticipant, getSessionAttendance, checkIn } from "../lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function CheckIn() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [participants, setParticipants] = useState<any[]>([])
  const [packages, setPackages] = useState<Record<string, any[]>>({})
  const [attendance, setAttendance] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [parts, att] = await Promise.all([
          getParticipants(),
          getSessionAttendance(sessionId!)
        ])
        setParticipants(parts)
        setAttendance(att)

        const pkgMap: Record<string, any[]> = {}
        await Promise.all(
          parts.map(async (p: any) => {
            const pkgs = await getPackagesForParticipant(p.id)
            pkgMap[p.id] = pkgs.filter((pkg: any) => pkg.status === "active")
          })
        )
        setPackages(pkgMap)
      } catch {
        navigate("/")
      }
    }
    load()
  }, [sessionId])

  const filtered = participants.filter((p: any) =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
  )

  const isCheckedIn = (participantId: string) =>
    attendance.some((a: any) => a.participant_id === participantId)

  const handleCheckIn = async (participant: any) => {
    const pkgs = packages[participant.id] ?? []
    const pkg = pkgs[0]
    if (!pkg) return alert("No active package for this participant")

    setLoading(true)
    try {
      const record = await checkIn({
        session_id: sessionId!,
        participant_id: participant.id,
        package_id: pkg.id,
      })
      setAttendance((prev) => [...prev, record])
    } catch {
      alert("Already checked in or error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <p className="font-semibold">CampOps</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/")}>Back to dashboard</Button>
      </div>

      <div className="p-6 space-y-4 max-w-2xl">
        <h1 className="text-2xl font-semibold">Check-in</h1>
        <p className="text-sm text-gray-500">{attendance.length} checked in so far</p>

        <Input
          placeholder="Search participant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Card>
          <CardContent className="pt-4 divide-y">
            {filtered.length === 0 && (
              <p className="text-sm text-center text-gray-500 py-6">No participants found</p>
            )}
            {filtered.map((participant: any) => {
              const checkedIn = isCheckedIn(participant.id)
              const pkgs = packages[participant.id] ?? []
              const pkg = pkgs[0]

              return (
                <div
                  key={participant.id}
                  className={`flex items-center justify-between py-3 ${checkedIn ? "opacity-50" : ""}`}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {participant.first_name} {participant.last_name}
                    </p>
                    {pkg ? (
                      <p className="text-xs text-gray-500">
                        {pkg.name} — {pkg.sessions_remaining} left
                      </p>
                    ) : (
                      <p className="text-xs text-red-500">No active package</p>
                    )}
                  </div>
                  {checkedIn ? (
                    <Badge variant="secondary">Checked in</Badge>
                  ) : (
                    <Button
                      size="sm"
                      disabled={loading || !pkg}
                      onClick={() => handleCheckIn(participant)}
                    >
                      Check in
                    </Button>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}