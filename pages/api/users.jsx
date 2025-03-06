import { createClient } from '@/utils/supabase/server';

export default async function handler(req, res) {
    const supabase = await createClient(req.cookies);
    const { id } = req.query;

    // 📌 GET - Fetch users while respecting RLS
    if (req.method === 'GET') {
        const { data, error } = await supabase.from('users').select();

        if (error) {
            if (error.code === '42501') {
                return res.status(403).json({ error: "Access denied. You may not have permission to view this data." });
            }
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
    }

    // 📌 POST - Create a new user
    if (req.method === 'POST') {
        const { fname, lname, email, password, role_id } = req.body;

        // Input validation
        if (!fname || !lname || !email || !password || !role_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const { data, error } = await supabase.from('users').insert([
            { fname, lname, email, password, role_id }
        ]).select(); // Add .select() to return the created data

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    }

    // 📌 PATCH - Update user (if Admin)
    if (req.method === 'PATCH') {
        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const { fname, lname, email, profilePic } = req.body;
        const updateData = {};
        
        // Only include fields that are provided
        if (fname) updateData.fname = fname;
        if (lname) updateData.lname = lname;
        if (email) updateData.email = email;
        if (profilePic) updateData.profilePic = profilePic;

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select(); // Add .select() to return the updated data

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    // 📌 DELETE - Delete user
    if (req.method === 'DELETE') {
        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const { data, error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)
            .select(); // Add .select() to return the deleted data

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data); // Changed from 204 to 200 since we're returning data
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
