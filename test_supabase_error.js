const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(envFile.split('\n').filter(Boolean).map(line => line.split('=')));

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = env.VITE_SUPABASE_URL.trim();
const supabaseKey = env.VITE_SUPABASE_ANON_KEY.trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      business_id: '15647565-d0c2-488b-a486-89d813735163', 
      nome: 'Contato WhatsApp Test',
      telefone: '12345678',
      fonte: 'WhatsApp',
      etapa: 'novo_lead',
      temperatura: 'morno',
      servico: 'Avaliação',
      procedimento_interesse: 'Avaliação',
      angulo_oferta: 'Direto',
      etapa_jornada: 'Descoberta',
    })
    .select()
    .single();

  console.log("Response:", data);
  console.log("Error:", JSON.stringify(error, null, 2));
}

test();
