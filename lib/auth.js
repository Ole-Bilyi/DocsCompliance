import { supabase } from './supabase'
import { getGroup } from './group'

export async function getUser(email) {
    try{
        const { data: userData, error: checkError } = await supabase
        .from('users')
        .select('user_name, admin, group_id')
        .eq('email', email)
        .single()
        
        if(checkError) throw checkError
        if(!userData) throw new Error("Invalid email or password")

        return{success:true, data:userData, error: null}
    } catch(error){
        return{success:false, error: error.message}
    }
}

export async function getGroupUsers(email) {
    try{
        const groupResult = await getGroup(email)
        if(!groupResult.success || !groupResult.data) throw new Error("User don't have group")

        const { data: usersData, error: checkError } = await supabase
        .from('users')
        .select('email, user_name, admin')
        .eq('group_id', groupResult.data.group_id)
        
        if(checkError) throw checkError
        if(!usersData) throw new Error("No users in the group")

        return{success:true, data:usersData, error: null}
    } catch(error){
        return{success:false, error: error.message}
    }
}