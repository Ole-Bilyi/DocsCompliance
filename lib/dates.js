import { supabase } from "./supabase"
import { getGroup } from "./group"

export async function createDate(dateData) {
    try{
        const { date_title, date_details, due_date, assigned_to, deadline_days } = dateData //assigned_to - email
        if(!date_title || !due_date) throw new Error("Title and due date are required")

        const groupResult = await getGroup(assigned_to)
        if(!groupResult.success || !groupResult.data) throw new Error("User don't have group")

        const {data:userData, error:userError} = await supabase
        .from('users')
        .select('user_id')
        .eq('email', assigned_to)
        .single()

        if(userError) throw userError
        if(!userData) throw new Error("Responsible user not found")

        const { error: checkError } = await supabase
        .from('dates')
        .insert([{group_id:groupResult.data, date_title:date_title, date_details:date_details, due_date:due_date, deadline_days:deadline_days, assigned_to:userData.user_id}])

        if(checkError) throw checkError

        return{success:true, error: null}
    } catch(error){
        return{success:false, error: error}
    }
}

export async function dateStatus(date_id) {
    try {
        const { data:dateData, error: checkError } = await supabase
        .from('dates')
        .select('due_date, status, deadline_days') //deadline_days > 0 !!!
        .eq('date_id', date_id)
        .single()

        if(checkError) throw checkError
        if(!dateData) throw new Error("No date found")
        if(dateData.status=="completed") return "completed"

        const oneDay = 24 * 60 * 60 * 1000;
        const nowDate = new Date()
        const dueDate = new Date(dateData.due_date)
        const diffInMilliseconds = dueDate.getTime() - nowDate.getTime();
        const days_before_due = Math.round(diffInMilliseconds / oneDay)+1;
        
        const status = days_before_due>dateData.deadline_days ? "pending" : (days_before_due>=0 ? "deadline" : "overdue") 

        if (status != dateData.status) {
            const {error:updateError} = await supabase
            .from('dates')
            .update({ status: status })
            .eq('date_id', date_id)

            if(updateError) throw updateError
        }

        return{success:true, data: status, error: null}
    } catch(error){
        return{success:false, error: error}
    }
}


export async function getDates(email) {
    try{
        const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id, admin, group_id')
        .eq('email', email)
        .single()

        if(userError) throw userError
        if(!userData) throw new Error("User not found")
  
        let query = await supabase
        .from('dates')
        .select('date_id, date_title, date_details, due_date, status, email:users!assigned_to(email), name:users!assigned_to(user_name)')
        
        if (userData.admin) {
            query = query.eq('group_id', userData.group_id)
        } else {
            query = query.eq('assigned_to', userData.user_id)
        }

        query = query.order('due_date', { ascending: true })

        const { data: dates, error: datesError } = await query

        if (datesError) throw datesError

        const newDateData = await Promise.all(
            dates.map(async (date) => {
                const statusResult = await dateStatus(date.date_id)
                return {
                    ...date,
                    current_status: statusResult.success ? statusResult.data : date.status,
                    email: date.email,
                    name: date.name
                }
            })
        )

        return{success:true, data:newDateData, error: null}
    } catch(error){
        return{success:false, error: error}
    }
}