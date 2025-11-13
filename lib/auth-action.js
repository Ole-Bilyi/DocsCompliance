'use server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

export async function signUpAction(name, email, password) {
  try {
    const { data: existingUsers, error: checkError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('email', email)

    if (checkError) throw checkError
    if (existingUsers && existingUsers.length > 0) throw new Error("Email already exists")
    
    const saltRounds = parseInt(process.env.SALT_ROUNDS)
    const hashPassword = await bcrypt.hash(password, saltRounds)

    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert([{
        user_name: name, 
        email: email, 
        password: hashPassword,
        admin: false,
        group_id: null
      }])

    if(insertError) throw insertError
    
    return { success: true, error: null }
  } catch(error) {
    return { success: false, error: error.message }
  }
}

export async function loginAction(email, password) {
    try{
        const { data: userData, error: checkError } = await supabaseAdmin
        .from('users')
        .select('user_name, email, password, admin, group_id')
        .eq('email', email)
        .single()
        
        if (checkError) {
            if (checkError.code === 'PGRST116') throw new Error("Invalid email or password 1")
            throw checkError
        }
        if(!userData) throw new Error("Invalid email or password 2")

        const check = bcrypt.compareSync(password, userData.password)

        const group = await getGroupA(userData.group_id)
        if(check){ 
            const groupData = group.success ? group.data : { group_id: null, group_name: null }
            return{
            name:userData.user_name,
            success:true, 
            admin:userData.admin, 
            group:groupData, 
            error: group.success ? null : group.error
            }
        } else throw new Error("Invalid email or password 3")
    } catch(error){
        return{success:false, error: error.message}
    }
}

export async function getGroupA(groupId){
    try{
        if(!groupId){
            return{
                success:true,
                data:{ group_id: null, group_name: null },
                error:null
            }
        }

        const {data:group, error: checkError } = await supabaseAdmin
        .from('groups')
        .select('group_name')
        .eq('group_id', groupId)
        .single()

        if(checkError) throw checkError
        if(!group) throw new Error("Group not found")

        return{success:true, data: {
                group_id: groupId,
                group_name: group.group_name
            }, error: null}
    } catch(error){
        return{success:false, error: error.message}
    }
}