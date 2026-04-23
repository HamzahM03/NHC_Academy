import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getMe, getTodaySession, getParticipants, getPackages, getPayments } from "../lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { logout } from "../lib/api"

export default function Dashboard() {
  const [coach, setCoach] = useState<any>(null)
  const [todaySession, setTodaySession] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const [me, session, parts, pkgs, pays] = await Promise.all([
          getMe(),
          getTodaySession().catch(() => null),
          getParticipants(),
          getPackages(),
          getPayments(),
        ])
        setCoach(me)
        setTodaySession(session)
        setParticipants(parts)
        setPackages(pkgs)
        setPayments(pays)
      } catch {
        navigate("/login")
      }
    }
    load()
  }, [])

  const lowPackages = packages.filter((p: any) => p.sessions_remaining <= 2 && p.status === "active")

  const balancesDue = participants.map((participant: any) => {
    const participantPackages = packages.filter((p: any) => p.participant_id === participant.id)
    const participantPayments = payments.filter((p: any) => p.participant_id === participant.id)
    const totalOwed = participantPackages.reduce((sum: number, p: any) => sum + Number(p.price), 0)
    const totalPaid = participantPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0)
    const balance = totalOwed - totalPaid
    return { ...participant, balance }
  }).filter((p: any) => p.balance > 0)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen">
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <p className="font-semibold">CampOps</p>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/payments")}>Payments</Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/expenses")}>Expenses</Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/profit")}>Profit</Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>Sign out</Button>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-3xl">
        <h1 className="text-2xl font-semibold">
          Hey {coach?.first_name}
        </h1>

        {/* today's session */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {todaySession ? "Today's session" : "No session today"}
          </h2>
          {todaySession ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{todaySession.title}</CardTitle>
                  <Badge>Today</Badge>
                </div>
                <CardDescription>{todaySession.session_date}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="sm" onClick={() => navigate(`/checkin/${todaySession.id}`)}>
                  Open check-in
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">No session scheduled today</CardTitle>
              </CardHeader>
            </Card>
          )}
        </section>

        {/* balances due */}
        {balancesDue.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Balances due</h2>
            <Card>
              <CardContent className="pt-4 divide-y">
                {balancesDue.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <p className="text-sm font-medium">{p.first_name} {p.last_name}</p>
                    <Badge variant="destructive">${p.balance.toFixed(2)}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {/* low packages */}
        {lowPackages.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Low packages</h2>
            <Card>
              <CardContent className="pt-4 divide-y">
                {lowPackages.map((pkg: any) => {
                  const participant = participants.find((p: any) => p.id === pkg.participant_id)
                  return (
                    <div key={pkg.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium">
                          {participant?.first_name} {participant?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{pkg.name}</p>
                      </div>
                      <Badge variant="secondary">{pkg.sessions_remaining} left</Badge>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  )
}