const supabaseUrl = 'https://ybsuxuzqihvqkigyqtsd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlic3V4dXpxaWh2cWtpZ3lxdHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTI5MjgsImV4cCI6MjA4ODg4ODkyOH0.X1yIJmJFcCb1L1ZY4FZYLqGtuz43MHJ2JvNtZ1uI7hA';

// Em Supabase, a chave anônima pública (anon key) que temos só permite se registrar como usuário não confirmado.
// Para confirmar um usuário via API sem clicar no email, precisaríamos da service_role key, que não temos.
// Lovable não nos dá acesso ao painel do Supabase, então não temos a service_role key.
