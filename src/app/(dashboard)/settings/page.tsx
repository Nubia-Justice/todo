import { auth, signOut } from "@/auth"

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user) return null

    // @ts-expect-error -- Session user type is extended at runtime
    const { role, familyId } = session.user

    return (
        <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl font-bold">
                        {session.user.name?.[0]}
                    </div>
                    <div>
                        <div className="font-medium text-lg">{session.user.name}</div>
                        <div className="text-gray-500">{session.user.email}</div>
                        <div className="text-sm text-indigo-600 mt-1 capitalize">
                            {role} Account
                        </div>
                    </div>
                </div>

                <form
                    action={async () => {
                        "use server"
                        await signOut()
                    }}
                >
                    <button className="px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors">
                        Sign Out
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Family Settings</h2>
                <p className="text-gray-500 text-sm mb-4">
                    Manage your family group, invite members, and configure preferences.
                </p>
                <div className="p-4 bg-gray-50 rounded-md border">
                    <div className="text-sm font-medium text-gray-700">Family Invite Code</div>

                    <p className="text-3xl font-mono font-bold tracking-wider text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg inline-block border-2 border-indigo-100 border-dashed">
                        {familyId}
                    </p>
                    <div className="text-xs text-gray-500 mt-1">Share this code with your children to let them join.</div>
                </div>
            </div>
        </div>
    )
}
