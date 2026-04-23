import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getProfit } from "../lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Profit() {
  const navigate = useNavigate()
  const [profit, setProfit] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const data = await getProfit()
      setProfit(data)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen">
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <p className="font-semibold">CampOps</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/")}>Back</Button>
      </div>

      <div className="p-6 space-y-6 max-w-2xl">
        <h1 className="text-2xl font-semibold">Profit</h1>

        {profit ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500 font-normal">Total payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-green-600">
                  ${Number(profit.total_payments).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500 font-normal">Total expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-red-500">
                  ${Number(profit.total_expenses).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500 font-normal">Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-semibold ${Number(profit.profit) >= 0 ? "text-green-600" : "text-red-500"}`}>
                  ${Number(profit.profit).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Loading...</p>
        )}
      </div>
    </div>
  )
}