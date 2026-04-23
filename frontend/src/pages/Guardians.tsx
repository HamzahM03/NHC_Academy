import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getGuardians, createGuardian, createParticipant } from "../lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Guardians() {
  const navigate = useNavigate()
  const [guardians, setGuardians] = useState<any[]>([])
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  const [selectedGuardian, setSelectedGuardian] = useState<any>(null)
  const [partFirst, setPartFirst] = useState("")
  const [partLast, setPartLast] = useState("")
  const [partLoading, setPartLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const data = await getGuardians()
      setGuardians(data)
    }
    load()
  }, [])

  const handleCreateGuardian = async () => {
    if (!firstName || !lastName || !phone) return
    setLoading(true)
    try {
      const guardian = await createGuardian({ first_name: firstName, last_name: lastName, phone })
      setGuardians((prev) => [guardian, ...prev])
      setFirstName("")
      setLastName("")
      setPhone("")
    } catch {
      alert("Error creating guardian")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateParticipant = async () => {
    if (!partFirst || !partLast || !selectedGuardian) return
    setPartLoading(true)
    try {
      await createParticipant({
        guardian_id: selectedGuardian.id,
        first_name: partFirst,
        last_name: partLast,
      })
      setPartFirst("")
      setPartLast("")
      setSelectedGuardian(null)
      alert("Participant added successfully")
    } catch {
      alert("Error adding participant")
    } finally {
      setPartLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <p className="font-semibold">CampOps</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/")}>Back</Button>
      </div>

      <div className="p-6 space-y-6 max-w-2xl">
        <h1 className="text-2xl font-semibold">Guardians</h1>

        {/* add guardian form */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm font-medium">Add guardian</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleCreateGuardian} disabled={loading}>
              {loading ? "Saving..." : "Add guardian"}
            </Button>
          </CardContent>
        </Card>

        {/* guardian list */}
        <Card>
          <CardContent className="pt-4 divide-y">
            {guardians.length === 0 && (
              <p className="text-sm text-center text-gray-500 py-6">No guardians yet</p>
            )}
            {guardians.map((g: any) => (
              <div key={g.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{g.first_name} {g.last_name}</p>
                  <p className="text-xs text-gray-500">{g.phone}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setSelectedGuardian(g)}>
                  Add participant
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* add participant under selected guardian */}
        {selectedGuardian && (
          <Card>
            <CardContent className="pt-4 space-y-4">
              <p className="text-sm font-medium">
                Add participant under {selectedGuardian.first_name} {selectedGuardian.last_name}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First name</Label>
                  <Input value={partFirst} onChange={(e) => setPartFirst(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Last name</Label>
                  <Input value={partLast} onChange={(e) => setPartLast(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleCreateParticipant} disabled={partLoading}>
                  {partLoading ? "Saving..." : "Add participant"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedGuardian(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}