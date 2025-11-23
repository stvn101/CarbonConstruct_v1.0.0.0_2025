import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export interface RateLimitConfig {
  windowMinutes: number;  // Time window in minutes
  maxRequests: number;    // Max requests allowed in the window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Check if a user has exceeded their rate limit for a specific endpoint
 */
export async function checkRateLimit(
  supabaseClient: SupabaseClient,
  userId: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - config.windowMinutes * 60 * 1000);

  try {
    // Get current rate limit record for this user and endpoint
    const { data: existingLimit, error: fetchError } = await supabaseClient
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart.toISOString())
      .order('window_start', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "no rows found" - not an error
      console.error(`[rate-limiter] Error fetching rate limit:`, fetchError);
      // On error, allow the request but log it
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: new Date(Date.now() + config.windowMinutes * 60 * 1000)
      };
    }

    const now = new Date();

    if (!existingLimit) {
      // No existing limit - create new record
      const { error: insertError } = await supabaseClient
        .from('rate_limits')
        .insert([{
          user_id: userId,
          endpoint,
          request_count: 1,
          window_start: now.toISOString()
        }]);

      if (insertError) {
        console.error(`[rate-limiter] Error creating rate limit:`, insertError);
      }

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: new Date(now.getTime() + config.windowMinutes * 60 * 1000)
      };
    }

    // Check if limit exceeded
    if (existingLimit.request_count >= config.maxRequests) {
      const resetAt = new Date(
        new Date(existingLimit.window_start).getTime() + 
        config.windowMinutes * 60 * 1000
      );

      return {
        allowed: false,
        remaining: 0,
        resetAt
      };
    }

    // Increment counter
    const { error: updateError } = await supabaseClient
      .from('rate_limits')
      .update({ 
        request_count: existingLimit.request_count + 1,
        updated_at: now.toISOString()
      })
      .eq('id', existingLimit.id);

    if (updateError) {
      console.error(`[rate-limiter] Error updating rate limit:`, updateError);
    }

    return {
      allowed: true,
      remaining: config.maxRequests - (existingLimit.request_count + 1),
      resetAt: new Date(
        new Date(existingLimit.window_start).getTime() + 
        config.windowMinutes * 60 * 1000
      )
    };

  } catch (error) {
    console.error(`[rate-limiter] Unexpected error:`, error);
    // On unexpected error, allow the request
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: new Date(Date.now() + config.windowMinutes * 60 * 1000)
    };
  }
}
