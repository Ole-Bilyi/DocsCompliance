'use server'
import { getSupabaseAdmin } from "./supabaseAdmin"
import { getGroupByEmail } from "./group"

async function getAdmin(){ return getSupabaseAdmin() }

export async function createCalendarEvent(event) {
    try{
        //const { event_name, event_description, event_date, event_color, assigned_to } = event | assigned_to - email(required)
        if (!event.assigned_to) throw new Error("User email is required")
        
        const groupResult = await getGroupByEmail(event.assigned_to)
        if(!groupResult.success || !groupResult.data) throw new Error("User don't have group")

        const eventData = {group_id:groupResult.data.group_id, ...event}

        const supabaseAdmin = await getAdmin()
        const {data:userData, error:userError} = await supabaseAdmin
        .from('users')
        .select('user_id')
        .eq('email', event.assigned_to)
        .single()

        if(userError) throw userError
        if(!userData) throw new Error("User not found")

        eventData.assigned_to = userData.user_id

        const { data:insertData, error: insertError } = await supabaseAdmin
        .from('calendar_events')
        .insert([eventData])
        .select()
        .single()

        if(insertError) {
            if (insertError.message && insertError.message.includes('calendar_events')) {
                throw new Error("Calendar events table not found. Please run the database migration in database/calendar_events_table.sql");
            }
            throw insertError
        }

        return{success:true, data:insertData, error: null}
    } catch(error){
        return{success:false, error: error.message}
    }
}

export async function getCalendarEvents(email) {
    try{
        const supabaseAdmin = await getAdmin()
        const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('user_id, admin, group_id')
        .eq('email', email)
        .single()

        if(userError) throw userError
        if (!userData) throw new Error("User not found")
  
        let query = supabaseAdmin
        .from('calendar_events')
        .select('event_id, event_name, event_description, event_date, event_color, assigned_to')
        
        if (userData.admin) {
            query = query.eq('group_id', userData.group_id)
        } else {
            query = query.eq('assigned_to', userData.user_id)
        }

        query = query.order('event_date', { ascending: true })

        const { data: events, error: eventsError } = await query

        if (eventsError) throw eventsError

        return{success:true, data:events || [], error: null}
    } catch(error){
        return{success:false, error: error.message}
    }
}

async function access(email, event_id) {
    try {
        const supabaseAdmin = await getAdmin()
        const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('user_id, admin, group_id')
        .eq('email', email)
        .single()

        if(userError) throw userError
        if (!userData) throw new Error("User not found")

        const { data: accessEvent, error:accessError } = await supabaseAdmin
        .from('calendar_events')
        .select('group_id, assigned_to')
        .eq('event_id', event_id)
        .single()

        if(accessError) throw accessError
        if(!accessEvent) throw new Error("Event not found")
        const hasAccess = userData.admin ? accessEvent.group_id === userData.group_id : accessEvent.assigned_to === userData.user_id

        return{success:true, data:{ hasAccess }, error: null}
    } catch (error) {
        return{success:false, error: error.message}
    }
}

export async function updateCalendarEvent(email, event_id, update) {
    try {
        //const { event_name, event_description, event_date, event_color } = update
        const accessCheck = await access(email, event_id)
        if (!accessCheck.success || !accessCheck.data || !accessCheck.data.hasAccess) {
            throw new Error("Access denied")
        }

        const supabaseAdmin = await getAdmin()

        const { data:updatedEvent, error:updateError } = await supabaseAdmin
        .from('calendar_events')
        .update(update)
        .eq('event_id', event_id)
        .select()
        .single()

        if (updateError) throw updateError
        
        return{success:true, data:updatedEvent, error: null}
    } catch (error) {
        return{success:false, error: error.message}
    }
}

export async function deleteCalendarEvent(email, event_id) {
    try {
        const accessCheck = await access(email, event_id)
        if (!accessCheck.success || !accessCheck.data || !accessCheck.data.hasAccess) {
            throw new Error("Access denied")
        }
        const supabaseAdmin = await getAdmin()

        const { error:deleteError } = await supabaseAdmin
        .from('calendar_events')
        .delete()
        .eq('event_id', event_id)

        if (deleteError) throw deleteError
        
        return{success:true, error: null}
    } catch (error) {
        return{success:false, error: error.message}
    }
}

