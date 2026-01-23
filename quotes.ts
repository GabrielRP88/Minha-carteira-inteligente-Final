
export const DAILY_QUOTES = [
  "O sucesso financeiro não é o quanto você ganha, mas o quão bem você vive com o que tem.",
  "Economizar hoje é garantir a liberdade de escolha amanhã.",
  "Pequenos gastos são como pequenos vazamentos: podem afundar um grande navio.",
  "O melhor investimento que você pode fazer é em você mesmo e na sua educação financeira.",
  "Disciplina é a ponte entre seus objetivos e suas conquistas financeiras.",
  "Não compre o que você não precisa com o dinheiro que você não tem para impressionar quem você não gosta.",
  "Riqueza consiste muito mais em desfrutar do que em possuir.",
  "A paciência é um elemento fundamental para quem deseja investir com sabedoria.",
  "Defina suas metas financeiras com clareza e o caminho aparecerá.",
  "O dinheiro é um excelente servo, mas um mestre terrível.",
  "Seu futuro é criado pelo que você faz hoje, não amanhã.",
  "O hábito de poupar é, por si só, uma educação; ele fomenta todas as virtudes.",
  "Controle o seu dinheiro ou ele controlará você.",
  "Riqueza não é ter muitas posses, mas poucas necessidades.",
  "A liberdade financeira começa quando você decide que sua paz vale mais que um objeto novo.",
  "Invista no seu conhecimento; ele rende os melhores juros.",
  "Organização financeira é o primeiro passo para a realização de grandes sonhos.",
  "Não trabalhe apenas pelo dinheiro, faça o dinheiro trabalhar por você.",
  "Cada centavo economizado é um passo a mais rumo à sua independência.",
  "A simplicidade é o último grau da sofisticação financeira.",
  "Planejar o futuro não significa não viver o presente, mas sim viver o presente com segurança.",
  "O segredo da riqueza é gastar menos do que você ganha e investir a diferença.",
  "Sua carteira reflete suas escolhas. Escolha com sabedoria.",
  "O equilíbrio financeiro é a base para uma mente tranquila.",
  "Grandes fortunas começam com pequenas economias.",
  "A prosperidade é o resultado natural da persistência e do planejamento.",
  "Seja o capitão do seu destino financeiro.",
  "Poupar não é sobre privação, é sobre priorização.",
  "O tempo é o melhor amigo dos bons investimentos.",
  "A maior riqueza é a saúde e a paz de espírito; o dinheiro deve servir a elas.",
  "Mantenha o foco nos seus objetivos e ignore o barulho do consumo imediato.",
  "A educação financeira transforma dívidas em investimentos.",
  "Viver dentro das suas possibilidades é o maior luxo que você pode tener.",
  "A segurança financeira traz a liberdade de dizer 'não' ao que não te agrega.",
  "Comemore cada pequena vitória na sua jornada de economia.",
  "Seus boletos não definem quem você é, mas sua gestão define como você vive."
];

export const getDayOfYearIndex = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay) % DAILY_QUOTES.length;
};
