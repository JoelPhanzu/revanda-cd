const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.ptsgqjxnvlwnhwmtavjg:Vodacomtigo10%40@aws-0-eu-central-1.pooler.supabase.co:6543/postgres"
});

client.connect((err) => {
  if (err) {
    console.error('❌ Erreur de connexion:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connexion réussie!');
    client.end();
  }
});