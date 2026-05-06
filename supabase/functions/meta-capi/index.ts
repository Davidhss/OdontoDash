import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to generate SHA256 hash using Web Crypto API
async function sha256(message: string): Promise<string> {
  if (!message) return '';
  const msgUint8 = new TextEncoder().encode(message.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { eventName, leadData, value, testEventCode } = await req.json()

    // Get Meta tokens from Supabase Secrets (Environment Variables)
    // Fallback to the ones provided by the user if not configured in secrets yet
    const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN') || 'EAA5BdPseaOUBRV7SAEbtws3z7JDqudc0AbW7bPFy4Dt6l61l6rjrvdVxZBq05ADs1m3hDRRo2ZAnLwoqe9E0BSzf1nOZBI6ZAp89mqvPPaJxgQShUZCYb7qcwPZCTSqRTyX7POqD7vg3ZAr6pl5yRfxAH8bzlerIQNchfpSl4Sd7A8uxBXZABbbqW8xMr8iPJQZDZD';
    const META_PIXEL_ID = Deno.env.get('META_PIXEL_ID') || '1489020932664195';

    if (!eventName) {
      throw new Error('Missing eventName')
    }

    // Format and hash user data
    // Meta requires phone numbers to include country code. Assuming Brazil (+55) if not present.
    let phone = leadData?.telefone?.replace(/\D/g, '') || '';
    if (phone && !phone.startsWith('55') && phone.length <= 11) {
      phone = '55' + phone;
    }
    const hashedPhone = phone ? await sha256(phone) : undefined;
    const hashedEmail = leadData?.email ? await sha256(leadData.email) : undefined;
    
    // Split name into first and last name for FB
    const nameParts = leadData?.nome ? leadData.nome.trim().split(' ') : [];
    const fn = nameParts.length > 0 ? await sha256(nameParts[0]) : undefined;
    const ln = nameParts.length > 1 ? await sha256(nameParts.slice(1).join(' ')) : undefined;

    // Construct user_data object
    const user_data: any = {
      // Deno requests don't always have accurate IPs and User Agents depending on proxy, 
      // but we try to grab them if possible.
      client_user_agent: req.headers.get('user-agent'),
      client_ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
    };

    if (hashedEmail) user_data.em = [hashedEmail];
    if (hashedPhone) user_data.ph = [hashedPhone];
    if (fn) user_data.fn = [fn];
    if (ln) user_data.ln = [ln];

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const custom_data: any = {
      currency: 'BRL',
    };

    if (value) {
      custom_data.value = Number(value);
    } else if (eventName === 'Purchase') {
      custom_data.value = 0; // Purchase usually requires value
    }

    const payload: any = {
      data: [
        {
          event_name: eventName,
          event_time: currentTimestamp,
          action_source: 'system_generated', // Indicates CRM/Backend server hit
          user_data: user_data,
          custom_data: custom_data,
        }
      ]
    };

    if (testEventCode) {
      payload.test_event_code = testEventCode;
    }

    // Send to Meta Graph API
    const metaApiUrl = `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`;
    
    const metaResponse = await fetch(metaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const metaResult = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error('Meta API Error:', metaResult);
      throw new Error(`Meta API error: ${metaResult.error?.message || 'Unknown error'}`);
    }

    return new Response(
      JSON.stringify({ success: true, result: metaResult }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error: any) {
    console.error('Error in meta-capi function:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
