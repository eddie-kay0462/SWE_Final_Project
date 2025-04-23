import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const supabase = createClient();

/**
 * Core authentication library for the application
 * Provides centralized authentication utilities and user management
 * 
 * @module auth
 */

/**
 * Get the current session if it exists
 * @returns {Promise<{data: { session }, error}>}
 */
export async function getSession() {
  return await supabase.auth.getSession();
}

/**
 * Get the current authenticated user if any
 * @returns {Promise<{data: { user }, error}>}
 */
export async function getUser() {
  return await supabase.auth.getUser();
}

/**
 * Sign in with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{data, error}>}
 */
export async function signInWithPassword(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Sign in error:", error.message);
    return { data: null, error };
  }
}

/**
 * Sign up a new user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {Object} metadata - Additional user metadata (e.g., fname, lname)
 * @returns {Promise<{data, error}>}
 */
export async function signUp(email, password, metadata = {}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Sign up error:", error.message);
    return { data: null, error };
  }
}

/**
 * Sign out the current user
 * @returns {Promise<{error}>}
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Sign out error:", error.message);
    return { error };
  }
}

/**
 * Fetch user profile from the users table
 * @param {string} userId - The user's UUID
 * @returns {Promise<{data, error}>}
 */
export async function getUserProfile(userId) {
  try {
    if (!userId) throw new Error("User ID is required");

    const { data, error } = await supabase
      .from("users")
      .select("id, student_id, fname, lname, email, profilepic, role_id, created_at")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Get user profile error:", error.message);
    return { data: null, error };
  }
}

/**
 * Update user profile in the users table
 * @param {string} userId - The user's UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
export async function updateUserProfile(userId, updates) {
  try {
    if (!userId) throw new Error("User ID is required");
    
    const { id, email, ...updateData } = updates;
    
    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Update user profile error:", error.message);
    return { data: null, error };
  }
}

/**
 * Reset password for authenticated user
 * @param {string} newPassword
 * @returns {Promise<{data, error}>}
 */
export async function updatePassword(newPassword) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Password update error:", error.message);
    return { data: null, error };
  }
}

/**
 * Send password reset email
 * @param {string} email
 * @returns {Promise<{data, error}>}
 */
export async function resetPasswordEmail(email) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Password reset email error:", error.message);
    return { data: null, error };
  }
}

/**
 * Check if user has a specific role
 * @param {number} roleId - The role ID to check
 * @returns {Promise<boolean>}
 */
export async function hasRole(roleId) {
  try {
    const { data: { user }, error } = await getUser();
    if (error || !user) return false;

    const { data: profile } = await getUserProfile(user.id);
    return profile?.role_id === roleId;
  } catch (error) {
    console.error("Role check error:", error.message);
    return false;
  }
}

export const authOptions = {
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        const supabase = createClient();
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        return {
          ...session,
          user: {
            ...session.user,
            ...profile
          }
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const supabase = createClient();
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        return {
          ...token,
          ...profile
        };
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  }
};
