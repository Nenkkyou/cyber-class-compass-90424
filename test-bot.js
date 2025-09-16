// Teste do sistema de bot
import { supabase } from './src/integrations/supabase/client.js'

async function testBot() {
  console.log('🧪 Testando sistema de bot...')
  
  try {
    // Teste 1: Saudação
    console.log('\n1️⃣ Testando saudação...')
    const greetingResult = await supabase.functions.invoke('chat-bot-intelligent', {
      body: {
        message: 'Olá',
        user_id: 'test_user',
        session_id: 'test_session'
      }
    })
    console.log('Resultado:', greetingResult.data)
    
    // Teste 2: Pergunta sobre Excel
    console.log('\n2️⃣ Testando pergunta sobre Excel...')
    const excelResult = await supabase.functions.invoke('chat-bot-intelligent', {
      body: {
        message: 'Me fale sobre o curso de Excel',
        user_id: 'test_user',
        session_id: 'test_session'
      }
    })
    console.log('Resultado:', excelResult.data)
    
    // Teste 3: Pergunta sobre PowerPoint
    console.log('\n3️⃣ Testando pergunta sobre PowerPoint...')
    const pptResult = await supabase.functions.invoke('chat-bot-intelligent', {
      body: {
        message: 'PowerPoint',
        user_id: 'test_user',
        session_id: 'test_session'
      }
    })
    console.log('Resultado:', pptResult.data)
    
    // Teste 4: Pergunta sobre IA
    console.log('\n4️⃣ Testando pergunta sobre IA...')
    const iaResult = await supabase.functions.invoke('chat-bot-intelligent', {
      body: {
        message: 'curso de IA',
        user_id: 'test_user',
        session_id: 'test_session'
      }
    })
    console.log('Resultado:', iaResult.data)
    
    console.log('\n✅ Testes concluídos!')
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error)
  }
}

testBot()
