import { auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Home, Calendar, CheckSquare, Gift, Settings, LogOut, User } from "lucide-react"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const navItems = [
        { name: "Home", href: "/dashboard", icon: Home },
        { name: "Chores", href: "/dashboard/chores", icon: CheckSquare },
        { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
        { name: "Rewards", href: "/dashboard/rewards", icon: Gift },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
                <span className="font-bold text-xl text-indigo-600">HouseChores</span>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{session.user.name}</span>
                    {session.user.image ? (
                        <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <User size={16} />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex">
                {/* Sidebar for Desktop */}
                <aside className="hidden lg:flex flex-col w-64 bg-white border-r min-h-screen fixed">
                    <div className="p-6 border-b">
                        <h1 className="text-2xl font-bold text-indigo-600">HouseChores</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {/* @ts-ignore */}
                            {session.user.role === 'parent' ? 'Parent View' : 'Child View'}
                        </p>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t">
                        <div className="flex items-center gap-3 mb-4 px-4">
                            {session.user.image ? (
                                <img src={session.user.image} alt="Avatar" className="w-10 h-10 rounded-full" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <User size={20} />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                            </div>
                        </div>
                        <Link
                            href="/api/auth/signout"
                            className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors w-full"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            <span className="font-medium">Sign Out</span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 p-4 lg:p-8 pb-20 lg:pb-8">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-50">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="flex flex-col items-center p-2 text-gray-500 hover:text-indigo-600"
                    >
                        <item.icon className="w-6 h-6" />
                        <span className="text-xs mt-1">{item.name}</span>
                    </Link>
                ))}
            </nav>
        </div>
    )
}
