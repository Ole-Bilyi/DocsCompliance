'use server'
import { getSupabaseAdmin } from './supabaseAdmin'
async function getAdmin() { return getSupabaseAdmin() }

async function userId(email) {
    try {
        if (!email) throw new Error("No email provided")
        const supabaseAdmin = await getAdmin()
        const { data: userData, error: checkError } = await supabaseAdmin
        .from('users')
        .select('user_id')
        .eq('email', email)
        .single()
        if (checkError) throw checkError
        if (!userData) throw new Error("User not found")
        return { success: true, data: userData.user_id, error: null }
    } catch (error) {
        return{success:false, error: error.message}
    }
}

export async function isTrustedUser(email) {
    try {
        if (!email) throw new Error("No email provided")
        const supabaseAdmin = await getAdmin()

        const userIdResult = await userId(email)
        if (!userIdResult.success) throw new Error("Could not retrieve user ID: " + userIdResult.error)
        const user_id = userIdResult.data

        const { data: userData, error: checkError } = await supabaseAdmin
        .from('trusted_users')
        .select('admin_id')
        .eq('user_id', user_id)
        .single()

        if (checkError) {
            if (checkError.code === 'PGRST116') {return { success: true, isTrusted: false, error: null }}
            throw checkError
        }
        if (!userData) return { success: true, isTrusted: false, error: null }
        return { success: true, isTrusted: true, error: null }
    } catch (error) {
        return { success: false, isTrusted: false, error: error.message }
    }
}

export async function addTrustedUser(user_email, admin_email) {
    try {
        if (!user_email || !admin_email) throw new Error("No email provided")
        const supabaseAdmin = await getAdmin()

        const userIdResult = await userId(user_email)
        if (!userIdResult.success) throw new Error("Could not retrieve user ID: " + userIdResult.error)
        const user_id = userIdResult.data

        const adminIdResult = await userId(admin_email)
        if (!adminIdResult.success) throw new Error("Could not retrieve user ID: " + adminIdResult.error)
        const admin_id = adminIdResult.data

        const { error: insertError } = await supabaseAdmin
        .from('trusted_users')
        .insert([{ user_id: user_id, admin_id: admin_id}])
        .single()
        if (insertError) throw insertError
        return { success: true, error: null }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

export async function removeTrustedUser(user_email, admin_email) {
    try {
        if (!user_email || !admin_email) throw new Error("No email provided")
        const supabaseAdmin = await getAdmin()

        const userIdResult = await userId(user_email)
        if (!userIdResult.success) throw new Error("Could not retrieve user ID: " + userIdResult.error)
        const user_id = userIdResult.data
        
        const adminIdResult = await userId(admin_email)
        if (!adminIdResult.success) throw new Error("Could not retrieve user ID: " + adminIdResult.error)
        const admin_id = adminIdResult.data
        
        const { error: deleteError } = await supabaseAdmin
        .from('trusted_users')
        .delete()
        .eq('user_id', user_id)
        .eq('admin_id', admin_id)
        
        if (deleteError) throw deleteError
        return { success: true, error: null }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

export async function listTrustedUsers(admin_email) {
    try {
        if (!admin_email) throw new Error("No admin email provided");
        const supabaseAdmin = await getSupabaseAdmin();
        
        // Get admin user_id
        const { data: adminData, error: adminError } = await supabaseAdmin
            .from('users')
            .select('user_id')
            .eq('email', admin_email)
            .single();

        if (adminError || !adminData) throw new Error('Admin not found');

        // Get all trusted users for this admin
        const { data: trustedUsers, error: listError } = await supabaseAdmin
            .from('trusted_users')
            .select(`
                user_id,
                users:user_id (email, user_name)
            `)
            .eq('admin_id', adminData.user_id);

        if (listError && listError.code !== 'PGRST116') throw listError;
        
        const formattedUsers = (trustedUsers || []).map(tu => ({
            email: tu.users?.email || '',
            name: tu.users?.user_name || 'Unknown'
        }));
        
        return { success: true, data: formattedUsers, error: null };
    } catch (error) {
        return { success: false, error: error.message };
    }
}