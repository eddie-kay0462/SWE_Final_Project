import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client"; // Use client for hooks
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // Assuming sonner is used for toasts

// Define types based on your users table
/**
 * @typedef {import('@supabase/supabase-js').User} SupabaseAuthUser
 */
  
/**
 * @typedef {object} UserProfileData
 * @property {string} id - UUID from public.users (matches auth.uid())
 * @property {string | null} student_id - Text student ID
 * @property {string} fname
 * @property {string} lname
 * @property {string} email
 * @property {string | null} profilepic
 * @property {number} role_id - Assuming 1=Admin, 2=Staff, 3=Student based on schema check constraint
 * @property {string} created_at
 */

const supabase = createClient();

/**
 * Fetches the user profile data from the public.users table.
 * @param {string} userId - The user's UUID (auth.uid()).
 * @returns {Promise<UserProfileData | null>} User profile data or null if not found.
 */
async function fetchUserProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("users")
    .select("id, student_id, fname, lname, email, profilepic, role_id, created_at")
    .eq("id", userId)
    .single();

  // It's okay if a profile doesn't exist yet (e.g., right after signup before profile creation)
  // RLS policy "Allow authenticated users to read their own data" must be enabled on users table.
  if (error && error.code !== 'PGRST116') { // PGRST116 = 'No rows found'
      console.error("Error fetching user profile:", error);
      throw new Error(error.message || "Failed to fetch user profile");
  }
  return data;
}

/**
 * Custom hook for managing authentication state and user profile data.
 */
export function useAuth() {
  const [authUser, setAuthUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const queryClient = useQueryClient();
  const isInitialized = useRef(false);

  // Effect for initializing auth state and listening to changes
  useEffect(() => {
    if (isInitialized.current) return;

    let isMounted = true; // Prevent state updates on unmounted component

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (isMounted) {
          setAuthUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        if (isMounted) {
          setInitialLoading(false);
          isInitialized.current = true;
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       if (isMounted) {
            setAuthUser(session?.user ?? null);
            // Reset profile query if user changes (login/logout)
            if (session?.user?.id !== authUser?.id) {
                queryClient.invalidateQueries({ queryKey: ["userProfile", session?.user?.id] });
                queryClient.invalidateQueries({ queryKey: ["userProfile", undefined] }); // invalidate null user query
            }
             // Ensure loading is false after the initial check is done
            if (isInitialized.current) {
                 setInitialLoading(false);
            }
       }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]); // Add queryClient as dependency

  // Use React Query to fetch user profile data based on authUser state
  const {
    data: userProfile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile, // Function to manually refetch profile
  } = useQuery({
    queryKey: ["userProfile", authUser?.id], // Query key depends on user ID
    queryFn: () => fetchUserProfile(authUser?.id),
    enabled: !!authUser && !initialLoading, // Only run query if user is logged in and initial auth check is done
    staleTime: 1000 * 60 * 5, // Cache profile data for 5 minutes
    retry: false, // Don't retry if profile fetch fails (e.g., RLS issue)
  });


 // --- Authentication Methods ---

  /**
   * Signs in a user.
   * @param {string} email
   * @param {string} password
   */
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        toast.error(error.message || "Sign in failed");
        throw error;
    }
    // Re-fetch profile after sign-in might be needed if queries were disabled
     queryClient.invalidateQueries({ queryKey: ["userProfile", data.user?.id] });
    return data;
  };

 /**
  * Signs up a new user.
  * Note: This basic version doesn't automatically create a public.users record.
  * You'll need separate logic (e.g., a trigger or function called after signup)
  * to create the corresponding row in public.users.
  * @param {string} email
  * @param {string} password
  * @param {object} [metadata] - Optional data (fname, lname etc.) for signup options
  */
  const signUp = async (email, password, metadata = {}) => {
     // Basic signup - does NOT create public.users record automatically
     const { data, error } = await supabase.auth.signUp({
       email,
       password,
       options: { data: metadata }, // Pass fname, lname here if needed for profile creation later
     });
     if (error) {
       toast.error(error.message || "Sign up failed");
       throw error;
     }
     // Important: Need logic elsewhere (e.g., trigger, another function) to insert into public.users
     // using data.user.id and metadata after successful signup & email verification (if enabled).
     toast.success("Signup successful! Check your email for verification if enabled.");
     return data;
  };

  /**
   * Signs out the current user.
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        toast.error(error.message || "Sign out failed");
        throw error;
    }
     // Clear cached user data
     queryClient.clear(); // Clears all query cache, might be too broad, consider specific invalidation
     setAuthUser(null); // Ensure auth state updates immediately
  };


 // --- Profile Update (Example - Adapt as needed) ---
 /**
  * Updates the user's profile in public.users.
  * @param {Partial<UserProfileData>} updates - Fields to update.
  */
  const updateProfileMutation = useMutation({
     mutationFn: async (updates) => {
         if (!authUser) throw new Error("User not authenticated");
         // Remove 'id' and 'email' if present, as they shouldn't be updated directly here
         const { id, email, ...updateData } = updates;

         const { data, error } = await supabase
             .from('users')
             .update(updateData)
             .eq('id', authUser.id)
             .select()
             .single();

         if (error) {
             toast.error(error.message || "Failed to update profile");
             throw error;
         }
         return data;
     },
     onSuccess: (updatedProfile) => {
         // Update the cache with the new profile data
         queryClient.setQueryData(['userProfile', authUser?.id], updatedProfile);
         toast.success("Profile updated successfully");
     },
     onError: (error) => {
         console.error("Update profile error:", error);
         // Toast is handled in mutationFn's error handling now
     }
  });


  return {
    // Auth state
    authUser, // The raw user object from supabase.auth
    // Profile Data
    userProfile, // User data from your public.users table
    // Loading states
    loading: initialLoading || (!!authUser && profileLoading), // True during initial load or if fetching profile for logged-in user
    // Error states
    error: profileError,
    // Auth methods
    signIn,
    signUp,
    signOut,
    // Profile methods
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
    refetchProfile, // Expose refetch function
    // Roles (example based on role_id)
    isAdmin: userProfile?.role_id === 1, // Adjust role IDs as needed
    isStaff: userProfile?.role_id === 2,
    isStudent: userProfile?.role_id === 3,
  };
}