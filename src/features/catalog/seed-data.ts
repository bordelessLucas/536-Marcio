export type CatalogSeedItem = {
  name: string;
  isMandatory?: boolean;
  periodicityHint?: string;
};

export type CatalogSeedCategory = {
  name: string;
  slug: string;
  colorToken: string;
  items: CatalogSeedItem[];
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function itemSlug(name: string): string {
  return slugify(name);
}

export const CATALOG_SEED: CatalogSeedCategory[] = [
  {
    name: "Seguros",
    slug: "seguros",
    colorToken: "azul",
    items: [
      { name: "Incêndio", isMandatory: true },
      { name: "Garantia de Aluguel" },
      { name: "Proteção Unidade" },
      { name: "Responsabilidade Civil" },
      { name: "Pet" },
      { name: "Veicular (garagem)" },
      { name: "Vida em Grupo (funcionários)" },
    ],
  },
  {
    name: "Segurança e Portaria",
    slug: "seguranca-e-portaria",
    colorToken: "verde",
    items: [
      { name: "Portaria Presencial 24h" },
      { name: "Portaria Remota/Inteligente" },
      { name: "Vigilância Patrimonial" },
      { name: "CFTV/Câmeras" },
      { name: "Alarme Monitorado" },
      { name: "Controle de Acesso (biometria/facial/tag)" },
      { name: "Interfonia" },
      { name: "Cerca Elétrica" },
      { name: "Sensor de Presença/Barreira Perimetral" },
      { name: "Brigada de Incêndio (treinamento)" },
    ],
  },
  {
    name: "Manutenção Predial",
    slug: "manutencao-predial",
    colorToken: "amarelo",
    items: [
      { name: "Elevadores" },
      { name: "Bombas (hidráulicas/incêndio)" },
      { name: "Ar Condicionado (HVAC)" },
      { name: "Elétrica" },
      { name: "Hidráulica" },
      { name: "Telhados e Coberturas" },
      { name: "SPDA (Para-raios)" },
      { name: "Portões Automáticos" },
      { name: "Geradores" },
      { name: "Extintores e Mangueiras" },
      { name: "Gás (central/encanado)" },
      { name: "Cisternas e Reservatórios" },
      { name: "Piscinas" },
      { name: "Playground/Brinquedos" },
      { name: "Academia" },
    ],
  },
  {
    name: "Obras e Reformas",
    slug: "obras-e-reformas",
    colorToken: "laranja",
    items: [
      { name: "Impermeabilização de lajes" },
      { name: "Pintura e Restauração de Fachada" },
      { name: "Reforma de Hall e Áreas Comuns" },
      { name: "Reforma de Garagem" },
      { name: "Troca de Esquadrias" },
      { name: "Reforma de Telhado" },
      { name: "Reforma Hidráulica Geral" },
      { name: "Reforma Elétrica Geral" },
      { name: "Piso Tátil/Acessibilidade (NBR 9050)" },
      { name: "Construção de Guarita/Portaria" },
    ],
  },
  {
    name: "Limpeza e Conservação",
    slug: "limpeza-e-conservacao",
    colorToken: "vermelho",
    items: [
      { name: "Limpeza Geral" },
      { name: "Vidros e Fachadas" },
      { name: "Pós-Obra" },
      { name: "Caixa d'Água", isMandatory: true, periodicityHint: "semestral" },
      { name: "Piscinas" },
      { name: "Garagem" },
      { name: "Lixeiras" },
      { name: "Caixas de Gordura" },
      { name: "Desentupimento" },
      { name: "Tapetes e Carpetes" },
      { name: "Forros e Sancas" },
    ],
  },
  {
    name: "Controle de Pragas",
    slug: "controle-de-pragas",
    colorToken: "roxo",
    items: [
      { name: "Dedetização" },
      { name: "Desratização" },
      { name: "Descupinização" },
      { name: "Desinfecção/Sanitização" },
      { name: "Morcegos e Pombos" },
      { name: "Mosquitos (dengue)" },
    ],
  },
  {
    name: "Jardinagem e Paisagismo",
    slug: "jardinagem-e-paisagismo",
    colorToken: "marrom",
    items: [
      { name: "Corte de Grama" },
      { name: "Poda de Árvores/Arbustos" },
      { name: "Plantio/Replantio" },
      { name: "Projeto Paisagístico" },
      { name: "Irrigação Automatizada" },
      { name: "Adubação" },
      { name: "Jardins Verticais" },
      { name: "Hortas Comunitárias" },
    ],
  },
  {
    name: "Tecnologia e Automação",
    slug: "tecnologia-e-automacao",
    colorToken: "laranja",
    items: [
      { name: "Wi-Fi Áreas Comuns" },
      { name: "Antena Coletiva/TV" },
      { name: "Automação de Iluminação (LED/sensor)" },
      { name: "Software de Gestão" },
      { name: "Aplicativo do Condomínio" },
      { name: "Reconhecimento de Placas" },
      { name: "Automação de Portaria (totem/QR)" },
      { name: "Medição Individualizada de Água/Gás" },
    ],
  },
  {
    name: "Serviços Administrativos",
    slug: "servicos-administrativos",
    colorToken: "verde",
    items: [
      { name: "Administradora" },
      { name: "Contabilidade" },
      { name: "Assessoria Jurídica" },
      { name: "Cobrança Terceirizada" },
      { name: "Correspondência/Encomendas" },
      { name: "Digitalização de Documentos" },
    ],
  },
  {
    name: "Serviços Obrigatórios/Legais",
    slug: "servicos-obrigatorios-legais",
    colorToken: "azul",
    items: [
      { name: "AVCB/CLB (Corpo de Bombeiros)" },
      { name: "Laudo de Inspeção Predial (NBR 16.747)" },
      { name: "Laudo SPDA" },
      { name: "Laudo de Gás" },
      { name: "Laudo de Elevadores" },
      { name: "Laudo de Carga de Incêndio" },
      { name: "Atestado de Brigada" },
      { name: "Certificado de Limpeza de Caixa d'Água" },
      { name: "Alvará de Funcionamento" },
    ],
  },
  {
    name: "Materiais e Suprimentos",
    slug: "materiais-e-suprimentos",
    colorToken: "amarelo",
    items: [
      { name: "Materiais de Limpeza Profissional" },
      { name: "Materiais de Manutenção (elétrica/hidráulica)" },
      { name: "EPIs" },
      { name: "Uniformes" },
      { name: "Mobiliário para Áreas Comuns" },
      { name: "Suprimentos de Jardinagem" },
      { name: "Extintores e Sinalização" },
      { name: "Produtos para Piscina" },
    ],
  },
  {
    name: "Serviços Especiais/Eventos",
    slug: "servicos-especiais-eventos",
    colorToken: "roxo",
    items: [
      { name: "Salão de Festas/Churrasqueira" },
      { name: "Buffet/Refeições" },
      { name: "Segurança para Eventos" },
      { name: "Locação de Equipamentos (som/telão/tenda)" },
      { name: "Serviço de Mudanças" },
    ],
  },
  {
    name: "Facilities",
    slug: "facilities",
    colorToken: "vermelho",
    items: [
      { name: "Zeladoria" },
      { name: "Recepção/Atendimento" },
      { name: "Mensageiro/Office Boy" },
      { name: "Lavanderia" },
      { name: "Coleta de Resíduos Recicláveis" },
      { name: "Descarte de Entulho (caçamba)" },
      { name: "Higienização de Estofados" },
    ],
  },
];

export function catalogTotals() {
  return {
    categories: CATALOG_SEED.length,
    services: CATALOG_SEED.reduce((sum, category) => sum + category.items.length, 0),
  };
}
