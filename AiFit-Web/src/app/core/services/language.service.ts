import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  
  // State signal to reactively update the UI when language changes
  currentLang = signal<'en' | 'pt'>('pt');

  constructor() {
    const savedLang = localStorage.getItem('app_lang') as 'en' | 'pt';
    if (savedLang) {
      this.currentLang.set(savedLang);
    }
  }

  setLanguage(lang: 'en' | 'pt') {
    this.currentLang.set(lang);
    localStorage.setItem('app_lang', lang);
  }

  // Dictionary containing UI translations
  // Format: pt-BR is the baseline key, en is the value.
  // Example: if currentLang is EN, translate('Perfil') -> 'Profile'
  private dictionary: Record<string, string> = {
    // Navbar
    'Painel': 'Dashboard',
    'Treinos': 'Workouts',
    'Dietas': 'Diets',
    'Medições': 'Measurements',
    'Perfil & Configurações': 'Profile & Setup',
    'Sair': 'Logout',
    'Geração por I.A.': 'A.I. Generation',
    'Acompanhamento': 'Tracking',

    // Dashboard
    'Bem vindo(a) de volta': 'Welcome back',
    'Pronto para esmagar seus objetivos hoje? Seu assistente de IA está pronto para traçar seu próximo passo.': 'Ready to crush your goals today? Your AI assistant is standing by to map out your next move.',
    'Seu resumo fitness': 'Your fitness overview',
    'Gerar Novo Treino': 'Generate Workout',
    'Novo Treino': 'New Workout',
    'Nova Dieta': 'New Diet',
    'Gerar Dieta': 'Generate Diet',
    'Precisa de um novo plano alimentar? Deixe a IA criar para você.': 'Need a new meal plan? Let AI craft it for you.',
    'Iniciar Geração': 'Start Generation',
    'Cérebro da IA': 'AI Brain',
    'Conectado e Pronto': 'Connected & Ready',
    'Não Conectado! Treinos/Dietas desativados.': 'Not Connected! Workouts/Diets disabled.',
    'Gerenciar': 'Manage',
    'Configurar': 'Configure',
    'Meus Treinos': 'My Workouts',
    'Minhas Dietas': 'My Diets',
    'Ver todos': 'View all',
    'Estatísticas Rápidas': 'Quick Stats',
    'Treinos Criados': 'Workouts Created',
    'Dietas Geradas': 'Diets Generated',
    'Total': 'Total',
    'Atual': 'Current',
    'Último': 'Latest',
    'Objetivo Atual': 'Current Goal',
    'Peso Atual': 'Current Weight',


    // Workouts (List)
    'Todos os seus programas de treino gerados por IA.': 'All your AI-generated training programs.',
    'Criar Novo': 'Generate New',
    'Gerar Novo': 'Generate New',
    'Nenhum treino ainda': 'No workouts yet',
    'Você não gerou nenhum plano de treino. Deixe nossa IA montar o plano perfeito para você.': "You haven't generated any training programs. Let our AI build the perfect custom plan for you.",
    'Começar agora': 'Get Started',
    'Treino Gerado por IA': 'AI Generated Workout',
    'dias de treino': 'training days',
    'Ver detalhes': 'View details',

    // Days
    'Segunda-feira': 'Monday',
    'Terça-feira': 'Tuesday',
    'Quarta-feira': 'Wednesday',
    'Quinta-feira': 'Thursday',
    'Sexta-feira': 'Friday',
    'Sábado': 'Saturday',
    'Domingo': 'Sunday',
    'Desconhecido': 'Unknown',


    // Workout Detail
    'Voltar aos Treinos': 'Back to Workouts',
    'AI Generated': 'AI Generated',
    'Excluir Programa': 'Delete Program',
    'Corpo Inteiro': 'Full Body',
    'Séries': 'Sets',
    'Repetições': 'Reps',
    'Descanso': 'Rest',
    'Minutos': 'Minutes',
    '1.5 Horas': '1.5 Hours',
    'Seu programa de treino personalizado.': 'Your customized training program.',


    // Diets (List)
    'Todos os seus planos alimentares gerados por IA.': 'All your AI-generated meal plans.',
    'Nenhuma dieta ainda': 'No diets yet',
    'Você não gerou nenhum plano alimentar. Deixe nossa IA montar a estratégia nutricional perfeita para você.': "You haven't generated any meal plans. Let our AI build the perfect custom nutrition plan for you.",
    'refeições': 'meals',
    'Calculado automaticamente': 'Calculated automatically',
    'kcal/dia': 'kcal/day',
    'Meta de Calorias': 'Target Calories',
    'Deixe em branco para a IA calcular': 'Leave blank to let AI calculate',
    'Especificações': 'Specifics',
    'Opcional': 'Optional',
    'Obrigatório': 'Required',

    // Diet Detail
    'Voltar às Dietas': 'Back to Diets',
    'Total Diário': 'Total Daily',
    'Proteína': 'Protein',
    'Carboidratos': 'Carbs',
    'Gordura': 'Fat',
    'Estimado': 'Estimated',
    'Alimento': 'Food',
    'Qtd': 'QTY',
    'Tem certeza que deseja excluir este plano alimentar?': 'Are you sure you want to delete this diet plan?',
    'Sua estratégia nutricional personalizada.': 'Your customized nutrition program.',
    'Personalize com seus dados para a IA estruturar o melhor cenário.': 'Customize with your data for the AI to structure the best scenario.',
    'Dias Disponíveis na Semana': 'Available Days in Week',
    'Duração do Treino': 'Session Duration',
    '40 Minutos': '40 Minutes',
    '1 Hora': '1 Hour',
    '1 Hora e 30 Minutos': '1 Hour 30 Mins',
    'Sem limite': 'Unlimited',
    'Observações Adicionais': 'Additional Notes',
    'Ex: Quero focar mais em ombros, ou tenho pouco tempo na terça-feira...': 'Ex: I want to focus more on shoulders, or I have little time on Tuesday...',
    'Gerando plano com Inteligência Artificial...': 'Generating plan with Artificial Intelligence...',
    'Gerar Plano de Treino': 'Generate Training Plan',

    // Profile Settings
    'Configurações e Perfil': 'Profile & Settings',
    'Gerencie suas informações pessoais e a configuração da IA.': 'Manage your personal information and AI configuration.',
    'Configuração da Inteligência Artificial': 'AI Engine Configuration',
    'Padrão do Servidor': 'Server Default',
    'Você está utilizando a IA global configurada no ambiente (.env). Escolha outra IA se desejar sobrescrever o roteamento unicamente para sua conta.': 'You are using the global AI configured in the environment (.env). Choose another AI if you want to override the routing uniquely for your account.',
    'Provedor de IA Customizado': 'Custom AI Provider',
    'Chave API (Secret Key)': 'API Key (Secret Key)',
    'Insira sua Chave API...': 'Enter your API Key...',
    'Ollama Local (Ilimitado e Off-line)': 'Local Ollama (Unlimited & Offline)',
    'Ollama será executado 100% nativo no seu computador ("localhost:11434"). Nenhuma chave remota é cobrada.': 'Ollama will run 100% natively on your computer ("localhost:11434"). No remote key is charged.',
    'Validando Comunicação...': 'Validating Connection...',
    'Definir Preferência': 'Set Preference',
    'Sua conta forçará a geração pelo modelo customizado gravado. Você pode remover isto se quiser retornar ao provedor base do código.': 'Your account will force generation by the recorded custom model. You can remove this if you want to return to the base code provider.',
    'Remover Modificação': 'Remove Modification',
    'Informação Pessoal': 'Personal Information',
    'Idade': 'Age',
    'Objetivo Principal': 'Primary Goal',
    'Hipertrofia (Ganho de Massa)': 'Hypertrophy (Muscle Gain)',
    'Perda de Peso / Emagrecimento': 'Weight Loss / Fat Loss',
    'Força / Performance': 'Strength / Performance',
    'Fôlego / Resistência': 'Endurance',
    'Condicionamento Geral': 'General Fitness',
    'Peso Atual (kg)': 'Current Weight (kg)',
    'Altura (cm)': 'Height (cm)',
    'Experiência de Treino': 'Training Experience',
    'Iniciante (0-6 meses)': 'Beginner (0-6 months)',
    'Intermediário (6-24 meses)': 'Intermediate (6-24 months)',
    'Avançado (2+ anos)': 'Advanced (2+ years)',
    'Lesões Conhecidas ou Limitações': 'Known Injuries or Limitations',
    'Elas serão levadas em consideração ao gerar seu treino.': 'These will be taken into account when generating your workout.',
    'Salvando...': 'Saving...',
    'Salvar Alterações': 'Save Changes',
    'Perfil atualizado com sucesso!': 'Profile updated successfully!',

    // App Settings
    'Preferências do Aplicativo': 'App Preferences',
    'Idioma do Sistema': 'System Language',
    'Escolha como a plataforma deve ser exibida para você.': 'Choose how the platform should be displayed to you.',

    // Measurements
    'Medições Corporais': 'Body Measurements',
    'Acompanhe seu progresso ao longo do tempo.': 'Track your progress over time.',
    'Cancelar': 'Cancel',
    'Adicionar Nova': 'Add New',
    'Novo Registro': 'New Record',
    'Peso (kg) *': 'Weight (kg) *',
    'Gordura Corporal %': 'Body Fat %',
    'Circunferências (cm)': 'Circumferences (cm)',
    'Peito': 'Chest',
    'Cintura': 'Waist',
    'Quadril': 'Hips',
    'Braço Esquerdo': 'Left Arm',
    'Braço Direito': 'Right Arm',
    'Coxa Esquerda': 'Left Thigh',
    'Coxa Direita': 'Right Thigh',
    'Observações': 'Notes',
    'Ex: Sentindo-me um pouco cansado hoje...': 'e.g. Feeling sluggish today...',
    'Salvar Registro': 'Save Record',
    'Nenhum dado ainda': 'No data yet',
    'Comece a acompanhar seu peso e medidas corporais para ver seu progresso ao longo do tempo.': 'Start tracking your weight and body measurements to see your progress over time.',
    'Adicionar Primeiro Registro': 'Add First Record',
    'Ações': 'Actions',
    'Excluir este registro?': 'Delete this record?',
    'Data': 'Date',
    'Braços (E/D)': 'Arms (L/R)',

    // AI Setup
    'Conecte sua IA': 'Connect Your AI',
    'O AIFit usa sua própria chave de API para gerar treinos e dietas personalizados.': 'AIFit uses your own AI API key to generate customized workouts and diets.',
    'Conectado com sucesso! Redirecionando...': 'Successfully connected! Redirecting...',
    'Provedor de IA': 'AI Provider',
    'Verificando Conexão...': 'Verifying Connection...',
    'Conectar IA e Continuar': 'Connect AI & Continue',
    'Pular por enquanto': 'Skip for now',
    'Falha ao conectar. Verifique sua chave API.': 'Failed to connect. Please check your API key.',
  };

  translate(key: string): string {
    if (this.currentLang() === 'pt') return key; // Baseline is PT
    return this.dictionary[key] || key; // Return EN or fallback to Key
  }
}
