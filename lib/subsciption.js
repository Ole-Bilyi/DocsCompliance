'use server'
import { getUser } from "./auth";
import { getSupabaseAdmin } from "./supabaseAdmin";

async function getAdmin() {
    return getSupabaseAdmin()
}

export async function subscriptionOfGroup(email) {
  try {
    if (!email) throw new Error("No email provided");
    const supabaseAdmin = await getAdmin();
    
    const user = await getUser(email);
    if (!user.success) throw new Error("User retrieval failed: " + user.error);
    if (!user.data) throw new Error("User not found");
    if (!user.data.admin) throw new Error("Only admins can get subscription");

    const { data:subData, error:subError } = await supabaseAdmin
    .from('group')
    .select('subscription, max_users')
    .eq('group_id', user.data.group_id)
    .single();

    if (subError) throw subError;
    if (!subData || !subData.subscription) throw new Error("No subscription data found");

    return{success:true, data:subData, error: null}
  } catch (error) {
    return{success:false, error: error.message}
  }
}

export async function updateSubscription(email, subscriptionData) {
    try {
        if (!email) throw new Error("No email provided");
        if (!subscriptionData) throw new Error("No subscription data provided");
        const supabaseAdmin = await getAdmin();

        const user = await getUser(email);
        if (!user.success) throw new Error("User retrieval failed: " + user.error);
        if (!user.data) throw new Error("User not found");
        if (!user.data.admin) throw new Error("Only admins can update subscription");

        const { error: updateError } = await supabaseAdmin
        .from('group')
        .update({ subscription: subscriptionData })
        .eq('group_id', user.data.group_id);
        
        if (updateError) throw updateError;
        
        return{success:true, error: null}
    } catch (error) {
        return{success:false, error: error.message}
    }
} //change later to more specific data