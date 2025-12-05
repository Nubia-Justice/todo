"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Chore = {
    id: string
    template: { title: string }
    dueDate: string | null
    assignedTo: { name: string }
    status: string
}

export default function CalendarPage() {
    const [chores, setChores] = useState<Chore[]>([])
    const [currentDate, setCurrentDate] = useState(new Date())

    useEffect(() => {
        fetchChores()
    }, [])

    async function fetchChores() {
        try {
            const res = await fetch("/api/chores")
            if (res.ok) {
                const data = await res.json()
                setChores(data)
            }
        } catch (error) {
            console.error("Failed to fetch chores", error)
        }
    }

    // Simple weekly view logic
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()) // Sunday

    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(startOfWeek)
        d.setDate(startOfWeek.getDate() + i)
        return d
    })

    const getChoresForDate = (date: Date) => {
        return chores.filter(c => {
            if (!c.dueDate) return false
            const d = new Date(c.dueDate)
            return d.getDate() === date.getDate() &&
                d.getMonth() === date.getMonth() &&
                d.getFullYear() === date.getFullYear()
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            const d = new Date(currentDate)
                            d.setDate(d.getDate() - 7)
                            setCurrentDate(d)
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-medium">
                        {startOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} -
                        {weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <button
                        onClick={() => {
                            const d = new Date(currentDate)
                            d.setDate(d.getDate() + 7)
                            setCurrentDate(d)
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weekDays.map((day) => {
                    const dayChores = getChoresForDate(day)
                    const isToday = day.getDate() === new Date().getDate() &&
                        day.getMonth() === new Date().getMonth()

                    return (
                        <div key={day.toISOString()} className={`min-h-[150px] bg-white rounded-lg border p-3 ${isToday ? 'ring-2 ring-indigo-600' : ''}`}>
                            <div className="text-center mb-3">
                                <div className="text-xs text-gray-500 uppercase">{day.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                                <div className={`text-lg font-bold ${isToday ? 'text-indigo-600' : 'text-gray-900'}`}>
                                    {day.getDate()}
                                </div>
                            </div>

                            <div className="space-y-2">
                                {dayChores.map(chore => (
                                    <div key={chore.id} className={`text-xs p-2 rounded border-l-2 ${chore.status === 'Completed' ? 'bg-green-50 border-green-500' :
                                            'bg-gray-50 border-indigo-500'
                                        }`}>
                                        <div className="font-medium truncate">{chore.template.title}</div>
                                        <div className="text-gray-500 truncate">{chore.assignedTo.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
