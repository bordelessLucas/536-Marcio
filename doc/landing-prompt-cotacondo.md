# Blueprint de Landing — CotaCondo (adaptado do prompt High-Fidelity)

> Origem: prompt técnico "Assist." (liquid-glass, micro-animações, hero dual-column).  
> Objetivo: **reutilizar a engenharia e o nível de acabamento**, mas **recontextualizar 100%** para o CotaCondo — marca real, copy real, estrutura do cliente — sem parecer landing genérica de produto de IA.

---

## 0. Princípio anti-“parece IA”

O prompt original entrega qualidade, mas a combinação Outfit + Inter + azul elétrico `#0084FF` + avatares Unsplash + “Trusted by 10,000+” + robô genérico + badges “Write an email” é o **padrão visual de SaaS AI**. No CotaCondo isso deve ser evitado.

| Manter do prompt original | Trocar / banir |
|---------------------------|----------------|
| Liquid-glass nav sticky | Marca “Assist.” + ícone Bot genérico |
| Grid 5/7 dual-column no hero | Fonte Outfit / Fustat / Inter |
| Aura radial + blur ambient | Primary Electric Blue `#0084FF` |
| Floating badges com float “breathing” | Avatares Unsplash inventados |
| Entrance springs (Framer Motion) | Vídeo de robô de terceiros |
| Drawer mobile premium | Copy em inglês de produtividade AI |
| Squircle + inset highlights | Social proof inventado (“10,000+ users”) |

**Direção CotaCondo:** corporativo de mercado condominial, confiança operacional, automação de cotação — não “assistente de IA genérico”.

---

## 1. Identidade visual & mood (CotaCondo)

### Filosofia
- Minimalista, tech-forward **B2B condomínios**, light theme de alto contraste, espaço negativo generoso, interfaces premium (squircles, bordas translúcidas, glass).
- Sensação: **plataforma de compras/cotações profissionais**, não chatbot.

### Paleta (derivada do logo/mascote reais)

| Token | Valor | Uso |
|-------|-------|-----|
| Canvas | `#FFFFFF` | Fundo principal |
| Ink display | `#0A0A0A` | Títulos |
| Ink body | `#171717` | Corpo |
| Ink muted | `#6B7280` | Captions |
| Brand Magenta | `#E11D8A` → `#C026D3` | Accent primário / CTAs |
| Brand Purple | `#9333EA` | Hover / anéis |
| Brand Blue | `#3B82F6` → `#06B6D4` | Gradiente secundário (logo) |
| Brand Teal | `#14B8A6` | Detalhes / badges positivos |
| Robot Black | `#0B0B0F` | Superfícies escuras pontuais |
| Neon line | `#D946EF` @ 40–60% | Contornos / glow do mascote |
| Aura A | `#C026D3` @ 12–18% + `blur-[100px]` | Ambient spotlight |
| Aura B | `#06B6D4` @ 12–18% + `blur-[120px]` | Ambient spotlight oposto |

**Liquid glass:** `from-white/80 to-white/50`, `backdrop-blur-[24px..40px]`, `border-white/70`, inset highlight suave. Evitar glow azul “Assist.”.

### Tipografia (briefing do cliente > prompt original)

| Papel | Fonte | Notas |
|-------|-------|-------|
| Display + UI + body | **Poppins** (400–800) | Única família oficial do cliente |
| Logo | Asset gráfico `logo.png` | Não recriar wordmark em texto |

```css
--font-sans: "Poppins", ui-sans-serif, system-ui, sans-serif;
```

- Headings: `tracking-tight` / `tracking-[-0.04em]`, `leading-[1.1]`
- Body: `leading-relaxed`, `tracking-[-0.01em]`
- **Não** importar Outfit, Fustat ou Inter neste projeto.

---

## 2. Estrutura da página (wireframe do cliente)

One-page no domínio principal. **Blog = link externo.**  
O hero dual-column do prompt vira a **primeira composição** (logo + mascote + proposta), depois seguem as seções pedidas.

```
[ Nav liquid-glass sticky ]
[ Hero dual-column: copy solicitante | mascote + floating badges ]
[ Banner rotativo full-bleed ≤10 slides clicáveis ]     ← (B) cliente
[ Planos lado a lado + checkout ]                       ← (D)
[ Falar com especialista (WhatsApp) ]                   ← (E)
[ Footer enxuto ]
```

> Nota: no briefing original, (B) banner vinha no topo e (C) robô+texto abaixo. Para qualidade editorial e anti-IA, o **mascote entra no hero** (como o robô do prompt) e o **banner rotativo** fica como seção visual seguinte — full-bleed, sem card. Se o cliente insistir no banner como primeiro viewport, inverter: banner full-bleed → bloco mascote+copy.

### Containment
- Wrapper: `w-full max-w-[1280px] mx-auto px-6 sm:px-12 lg:px-20`
- Grid hero `lg:`: `grid-cols-12 gap-10 lg:gap-12`
  - Esquerda copy: `lg:col-span-5`
  - Direita mascote: `lg:col-span-7`
- Mobile `<lg`: `grid-cols-1` (mascote abaixo ou acima conforme teste — preferência: copy primeiro)

---

## 3. Componentes adaptados

### A. Nav liquid-glass (flutuante)

- `fixed top-[24px..30px] z-50` centralizada, `rounded-[16px]`, glass.
- **Esquerda:** `/brand/logo.png` (altura ~28–32px), **sem** texto “Assist.” e **sem** ícone Lucide Bot.
- **Links (desktop), nesta ordem exata:**
  1. Para Fornecedores → `/fornecedores`
  2. Fazer cotação → `#cotacao` ou fluxo solicitante
  3. Blog → URL externa (Master Admin)
  4. Acesse → `/login` (ou `/acesse`)
- **CTA pill:** “Começar agora” ou “Fazer cotação” → login/cadastro (seta `ArrowRight`).
- Mobile: drawer branco/glass da direita com os 4 links + CTA.

### B. Coluna esquerda — copy & CTAs (persona solicitante)

**Sem social proof falso.** Se não houver número real, usar prova operacional:

- Badge pill: “Cotações, negociação e contratação 100% na plataforma”  
  **ou** (se o cliente fornecer número real) “Usado por X administradoras” — **nunca inventar**.

**Headline (PT-BR, editorial):**
> Cotações de condomínio  
> sem planilha. Sem WhatsApp solto.

**Subhead:**
> Abra a cotação, receba propostas de fornecedores elegíveis, compare, negocie e aprove — com franquia por plano, compliance e rastreio completo.

**CTAs:**
1. Primário — “Fazer cotação”  
   - Gradiente marca (magenta→roxo) ou sólido magenta com inset highlight (mesma fórmula do prompt, trocando o azul pelo brand).  
   - Bead branco com chevron → `/login` ou cadastro solicitante.
2. Secundário — “Sou fornecedor” → `/fornecedores`  
   - Ghost / play-style bead opcional **sem** “Watch Demo” genérico (só se houver vídeo real do cliente).

### C. Coluna direita — mascote + floating badges

- **Asset:** `/brand/mascote.png` (fundo claro) — **não** usar o MP4 de terceiros do prompt.
- Opcional futuro: vídeo/Lottie do mascote **próprio**; até lá, imagem + motion CSS/Framer.
- Aura: blurs magenta/teal (não sky-blue Assist.).
- Anéis orbitais: stroke com gradiente do logo (`#E11D8A` → `#06B6D4`), dash suave, opacidade baixa.
- Filtro leve só se necessário para blend no branco.

**Floating badges (contexto CotaCondo — 3 cards glass):**

| Posição | Título | Subtítulo | Accent ícone |
|---------|--------|-----------|--------------|
| Top right | Abrir cotação | com meta de propostas | Magenta — `FileSearch` / `ClipboardList` |
| Center left | Comparar propostas | quadro side-by-side | Teal — `Columns2` / `GitCompare` |
| Bottom right | Aprovar ou negociar | 100% na plataforma | Roxo — `BadgeCheck` / `MessagesSquare` |

Mesmas âncoras/animações do prompt (float Y 8–10px, hover scale 1.05, springs staggered).

### D. Seção planos
- Cards lado a lado (Free / Pago / Premium — textos reais do escopo).
- Botão “Cotar” / “Contratar” → login + checkout do **plano específico** (gateway).
- Visual: glass ou superfície limpa; **evitar** grid de 6 feature pills genéricas.

### E. WhatsApp
- CTA “Falar com um especialista” → `wa.me` configurável.
- Estilo: botão sólido escuro ou outline premium — não verde WhatsApp gritante em toda a página (ícone oficial ok, layout discreto).

### Banner rotativo (B do cliente)
- Full-bleed, até 10 slides, autoplay orgânico, links externos, gerenciável no Master Admin.
- Sem overlay de chips/stickers sobre a imagem (regra de design do projeto).

---

## 4. Micro-animações (manter engenharia)

Reaproveitar o blueprint do prompt:

1. **Nav:** slide down `-20px → 0`, ease `[0.16, 1, 0.3, 1]`, `0.6s`
2. **Hero L/R:** slide up `20px → 0`, `0.9s`, delay sequencial
3. **Badges:** spring `damping: 20, stiffness: 100`, delay `0.6s → 1.0s`
4. **Breathing floats:** ciclos 4.8s / 5.0s / 5.5s (assíncronos)
5. **CTA primary:** `whileHover scale 1.02`, `whileTap 0.98`, chevron bead `x` no hover
6. Preferência: **Framer Motion** (ou CSS + View Transitions se o stack exigir menos deps)

---

## 5. LP `/fornecedores` (mesma engenharia, outra persona)

- Mesma nav, tipografia, glass, auras.
- Headline mais direta: benefícios do fornecedor (oportunidades, compliance, planos Pro/Premium, CRM).
- Badges flutuantes: “Receber oportunidades”, “Enviar proposta”, “Plano Pro / parceria”.
- CTAs → checkout dos planos de fornecedor.
- Slots UTM/pixel sem poluir a LP principal.

---

## 6. Copy kit (PT-BR) — não usar o inglês do Assist.

| Slot | Assist. (banido) | CotaCondo |
|------|------------------|-----------|
| Brand | Assist. | Logo asset |
| Nav | Home / Features / Company / Pricing | Para Fornecedores / Fazer cotação / Blog / Acesse |
| H1 | Your All in One Assist. | Cotações de condomínio sem planilha. Sem WhatsApp solto. |
| Body | Ask questions, get answers… | Abra a cotação, receba propostas… |
| Primary CTA | Try Assist. | Fazer cotação |
| Secondary | Watch Demo | Sou fornecedor |
| Badge 1 | Write an email | Abrir cotação |
| Badge 2 | Summarize document | Comparar propostas |
| Badge 3 | Create a to-do list | Aprovar ou negociar |

---

## 7. Assets obrigatórios

```
/public/brand/logo.png
/public/brand/mascote.png
/public/brand/mascote-avatar-circular.png   ← avatar, chat, mobile menu opcional
```

Proibido no MVP da LP: Unsplash faces, vídeo DigitalOcean do Assist., ícone Bot como logo.

---

## 8. Stack sugerido para implementação

- Next.js App Router + TypeScript + Tailwind
- `next/font` → Poppins
- Framer Motion (animações do blueprint)
- Lucide só para ícones de badge/CTA (não para marca)
- Imagens locais via `next/image`

---

## 9. Critérios de aceite (anti-genérico)

- [ ] Nenhuma ocorrência visual de “Assist.” / azul `#0084FF` como primary
- [ ] Poppins em toda a LP; logo é imagem
- [ ] Mascote oficial no hero; badges falam de cotação
- [ ] Menu na ordem do cliente; Blog externo
- [ ] Planos → checkout do plano específico
- [ ] WhatsApp configurável
- [ ] Banner ≤10 slides clicáveis
- [ ] Motion presente (entrada + breathing) sem parecer template AI genérico
- [ ] Textos 100% PT-BR, sem social proof inventado

---

## 10. Como usar este arquivo

Este documento é o **prompt de engenharia front-end** para construir a LP do CotaCondo.  
Ao implementar (Dia 7 / sprint marketing), o agente/dev deve seguir **este blueprint**, não o prompt “Assist.” original.

*Gerado a partir do prompt High-Fidelity “Assist.” + briefing Site/Landing CotaCondo + assets em `/public/brand`.*
