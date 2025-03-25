import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
    try {
        // Get user role from query parameter
        const { searchParams } = new URL(request.url)
        const role = searchParams.get('role')

        if (!role) {
            return NextResponse.json({ error: 'Role parameter is required' }, { status: 400 })
        }

        // Data fetching based on role
        switch (role) {
            case 'superAdmin':
                return await getSuperAdminData()
            case 'admin':
                return await getAdminData()
            case 'student':
                return await getStudentData()
            default:
                return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }
    } catch (error) {
        console.error('Dashboard API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

async function getSuperAdminData() {
    const [
        usersCount,
        sessionsCount,
        internshipRequestsStats,
        recentUsers
    ] = await Promise.all([
        // Get active users count
        supabase
            .from('users')
            .select('id', { count: 'exact' }),

        // Get career sessions count
        supabase
            .from('career_sessions')
            .select('session_id', { count: 'exact' }),

        // Get internship requests statistics
        supabase
            .from('internship_requests')
            .select('status'),

        // Get recent users
        supabase
            .from('users')
            .select('id, fname, lname, email, role_id, created_at')
            .order('created_at', { ascending: false })
            .limit(5)
    ])

    // Process internship request stats
    const requestStats = internshipRequestsStats.data.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1
        return acc
    }, {})

    return NextResponse.json({
        activeUsers: usersCount.count,
        careerSessions: sessionsCount.count,
        internshipRequests: {
            total: internshipRequestsStats.data.length,
            pending: requestStats.pending || 0,
            approved: requestStats.approved || 0,
            rejected: requestStats.rejected || 0
        },
        recentUsers: recentUsers.data.map(user => ({
            id: user.id,
            name: `${user.fname} ${user.lname}`,
            role: getRoleName(user.role_id),
            status: 'Active',
            lastLogin: new Date(user.created_at).toLocaleDateString()
        })),
        systemHealth: {
            databaseUptime: 99.9,
            serverLoad: 45,
            apiResponseTime: 150
        }
    })
}

async function getAdminData() {
    const [
        internshipRequests,
        upcomingSessions
    ] = await Promise.all([
        // Get internship requests statistics
        supabase
            .from('internship_requests')
            .select('status'),

        // Get upcoming career sessions
        supabase
            .from('career_sessions')
            .select('*')
            .gte('date', new Date().toISOString())
            .order('date', { ascending: true })
            .limit(3)
    ])

    // Process internship request stats
    const requestStats = internshipRequests.data.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1
        return acc
    }, {})

    return NextResponse.json({
        internshipRequests: {
            pending: requestStats.pending || 0,
            approved: requestStats.approved || 0,
            rejected: requestStats.rejected || 0
        },
        upcomingSessions: upcomingSessions.data.map(session => ({
            id: session.session_id,
            title: session.description,
            date: new Date(session.date).toLocaleDateString(),
            attendees: 0 // You might want to join with attendance table to get real count
        })),
        studentEngagement: {
            thisWeek: 45,
            lastWeek: 38,
            change: 18
        },
        urgentNotifications: [
            {
                id: 1,
                type: 'request',
                message: 'New internship requests pending review'
            }
        ]
    })
}

async function getStudentData() {
    const [
        internshipRequests,
        upcomingSessions,
        attendedSessions
    ] = await Promise.all([
        // Get student's internship requests
        supabase
            .from('internship_requests')
            .select('status'),

        // Get upcoming career sessions
        supabase
            .from('career_sessions')
            .select('*')
            .gte('date', new Date().toISOString())
            .order('date', { ascending: true })
            .limit(3),

        // Get attended sessions count
        supabase
            .from('attendance')
            .select('id', { count: 'exact' })
    ])

    // Process internship request stats
    const requestStats = internshipRequests.data.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1
        return acc
    }, {})

    return NextResponse.json({
        internshipRequests: {
            pending: requestStats.pending || 0,
            approved: requestStats.approved || 0,
            rejected: requestStats.rejected || 0
        },
        upcomingSessions: upcomingSessions.data.map(session => ({
            id: session.session_id,
            title: session.description,
            date: new Date(session.date).toLocaleDateString(),
            location: 'Career Services Office'
        })),
        careerEngagement: {
            progress: 65,
            sessionsAttended: attendedSessions.count,
            internshipsApplied: requestStats.pending + requestStats.approved + requestStats.rejected,
            resourcesUsed: 12
        },
        notifications: [
            {
                id: 1,
                type: 'reminder',
                message: 'Upcoming career session tomorrow'
            }
        ]
    })
}

function getRoleName(roleId) {
    switch (roleId) {
        case 1:
            return 'Super Admin'
        case 2:
            return 'Admin'
        case 3:
            return 'Student'
        default:
            return 'Unknown'
    }
}