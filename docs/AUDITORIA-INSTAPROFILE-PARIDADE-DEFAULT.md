# Auditoria técnica — InstaProfile vs. LinkStack Default Theme

**Escopo:** LinkFree-LinkTree (LinkStack/Laravel 9) e tema \`InstaProfile\` do catálogo \`LinkFree---Themes\`.
**Objetivo:** garantir que os componentes disponibilizados pelo Default Theme continuem renderizando e funcionando quando o usuário escolher o tema InstaProfile, adotando visual estático inspirado em perfis fotográficos.

## Fontes auditadas

Aplicação principal (branch \`main\`):
- \`linkstack/resources/views/linkstack/layout.blade.php\`: a página tem \`.container > .row > .column\` e áreas de inserção.
- \`linkstack/resources/views/linkstack/elements/{avatar,heading,bio,icons,buttons}.blade.php\`: avatar, texto, links, ícones e botões.
- \`linkstack/resources/views/linkstack/modules/{theme,assets,meta,share-button,footer,dynamic-contrast,block-libraries}.blade.php\`: integração de temas, JavaScript da aplicação, metadados, compartilhamento, rodapé e recursos de blocos.
- \`linkstack/assets/linkstack/css/{skeleton-auto,brands,animations,share.button,normalize}.css\`: referência visual e comportamental do Default Theme.
- \`linkstack/blocks/\`: blocos nativos \`link\`, \`heading\`, \`text\`, \`spacer\`, \`email\`, \`telephone\`, \`vcard\`.
- \`linkstack/app/Services/ThemeInstaller.php\`: convenções e segurança de importação dos ZIPs.

Tema: \`reference-themes/InstaProfile/\`, com arquivos reconhecidos por LinkStack: \`config.php\`, \`readme.md\`, \`skeleton-auto.css\`, \`brands.css\`, \`animations.css\`, \`share.button.css\`. Os arquivos são empacotados como \`InstaProfile/...\`.

## Matriz de achados e correções

| Área | Risco encontrado | Correção aplicada no tema |
|---|---|---|
| Layout principal | Contêineres de largura fixa, margens inline e overflow em mobile | Larguras fluidas, min-width zero, padding responsivo e breakpoints |
| Footer | O Default usa \`.container\` aninhada; o tema repetia cartão e detalhe decorativo | Neutralização visual da \`.container\` interna, sem remover links/créditos |
| Avatar | Várias formas de carregar imagem de perfil/fallback | Regra para \`#avatar\` e \`.rounded-avatar\`, raio circular, \`object-fit\` |
| Títulos e textos | Textos sem espaços e blocos HTML podiam vazar do cartão | Wrap, limite de largura, tipografia, parágrafos, listas e links acessíveis |
| Botões de plataformas | Grande variedade de classes \`.button-*\` com ícones e rótulos | Base genérica aplicada a todas as classes; área tocável >= 44px; custom CSS permitido |
| Ícones de redes | Efeitos de transformação herdados do Default | Ícones e links preservados; transições e transformações visuais desativadas |
| Links externos | Estilo sem foco contrastante | Estados hover/focus, cores legíveis, navegação por teclado |
| Bloco título/texto | HTML renderizado por \`blocks::...display\` | Regras para títulos, spans, parágrafos e hierarquia |
| Bloco espaçador | \`.button-spacer\` com altura inline | Preservação da altura e do fluxo original |
| E-mail, telefone e vCard | Ações nativas acionadas via links | CSS de botão sem alterar URL, alvo, evento ou roteamento |
| Imagem/figura | Largura maior que mobile, legendas desalinhadas | \`max-width\`, proporção preservada e legenda |
| Vídeo/áudio | Dimensões fixas de players | Regras de vídeo/audio responsivas, preservando controles nativos |
| YouTube/Vimeo/Facebook vídeo | Iframe com largura/altura fixas | Proporção 16:9, largura do cartão, sem modificar o conteúdo interno |
| Instagram/TikTok | Embeds potencialmente altos/verticais | Proporção vertical e limites de largura, sem dependência do Instagram |
| Outros iframes | Conteúdo externo podia exceder o contêiner | Largura máxima de 100%, respeitando altura e scripts de terceiros |
| Tabelas | Várias colunas geravam scroll horizontal da página | Tabela horizontalmente rolável dentro da área de conteúdo |
| Código/HTML longo | \`<pre>\` e strings gigantes vazavam da viewport | Scroll local no código e quebra de textos |
| Formulários | Inputs, select, textarea e botões sem tratamento mobile | Campos fluídos, altura tocável, foco acessível e contraste |
| Compartilhar | Alinhamento ao viewport, em vez da largura do cartão | Botão alinhado ao cartão, JS nativo de compartilhamento preservado |
| Animação | \`animate.css\` e classes \`.fadein\`, \`.social-hover\` e similares herdadas | Neutralização de efeitos do tema/default, sem desabilitar vídeos, JS nem embutidos |
| Links do footer | Cards internos repetidos, espaços inconsistentes | Rodapé alinhado e links tocáveis sem segundo cartão |
| Compatibilidade de importação | Requisitos do importador e estrutura do pacote | ZIP com uma pasta \`InstaProfile\`, \`readme.md\` e CSS de tema compatível |

## Alcance de funcionalidade

### Preservado porque pertence ao sistema

- A aplicação continua renderizando os blocos nos mesmos partials Blade e handlers.
- O click-tracking de links e os eventos do botão de compartilhar continuam no código original.
- Links para telefonia, e-mail, site, vCard e redes sociais continuam com seus URLs/rotas.
- Metadados, OG tags, foto de perfil, bio e perfis autenticados permanecem na aplicação.
- Regras de permissão/segurança, uploads, dados, editor de blocos e banco **não são modificados**.
- O tema não injeta JavaScript nem fontes proprietárias do Instagram.

### Limites reais da paridade

- O projeto auditado **não tem blocos nativos dedicados de galeria ou vídeo**. Imagens e vídeos podem aparecer por HTML de usuário autorizado, editor de blocos adicionais ou incorporações externas. O CSS agora os acomoda, mas não cria blocos novos nem habilita a permissão de HTML.
- Um iframe externo pode ser bloqueado por CSP, política do provedor, cookies ou \`X-Frame-Options\`; CSS do tema não pode contornar isso.
- O CSS não consegue estilizar o conteúdo interno de iframes de outro domínio.
- Blocos customizados que propositalmente usam \`ignore_container\` podem ser renderizados fora da área principal e precisam de revisão específica quando instalados.
- A personalização de CSS inline dos botões é preservada pela configuração \`allow_custom_buttons=true\`; estilos de terceiros podem ter especificidade maior.
- Funções protegidas por login, fluxo de banco de dados, webhooks, analytics reais e instalação na VPS exigem **testes integrados em um LinkStack de teste**. Não são comprovadas apenas por HTML/CSS ou CI.

## Critérios automatizados

\`scripts/audit-instaprofile.py\`, executado no GitHub Actions antes do empacotamento:

- Sintaxe CSS, ausência de \`@keyframes\`, \`@import\` e partículas/scripts do tema.
- Integridade dos arquivos exigidos, seletor de conteúdo e configuração de botões personalizados.
- Renderização em Google Chrome headless nas larguras **320, 360, 390, 430, 768, 1024 e 1440 px**.
- Não transbordar viewport ou cortar cartão, imagem, vídeo, iframes, botões e formulário.
- Corrigir o footer aninhado, suprimir animações herdadas e manter altura mínima dos botões.
- Eventos de clique, compartilhamento e submissão em fixture HTML que reproduz a estrutura do Default.
- Capturas de QA em \`.theme-build/qa/\` (artefatos da execução do Actions).
- Verificação posterior de ZIP, caminhos obrigatórios e thumbnail 960×540.

O fixture de QA cobre o contrato visual/DOM. Para conclusão em produção, conferir com sessão de teste uma página real contendo muitos botões, texto, avatar, mídia incorporada e rodapé, nos navegadores Chrome Android, Safari iOS e desktop.

## Critérios para aprovação de implantação

1. GitHub Actions aprovado e pacote \`Free/InstaProfile/InstaProfile.zip\` publicado.
2. Importar pelo menu administrativo de temas em **ambiente de homologação**.
3. Criar uma página com conteúdo misto e validar botões, abertura de URL, contato/vCard, ícones, compartilhar, imagem, embed, HTML autorizado e links do rodapé.
4. Verificar no painel (autenticado) se as configurações por usuário e o tema persistem após recarregar.
5. Comparar com o Default no mesmo conjunto de conteúdos. As funções devem permanecer; a identidade visual será propositalmente diferente.
6. Testar plugin/HTML específico de vídeo/galeria se estes recursos forem instalados. O tema sozinho não garante suporte para todo plugin de terceiros.

**Importante:** "compatibilidade equivalente com os blocos nativos" não é o mesmo que garantir compatibilidade irrestrita com toda extensão ou código embed. Qualquer falha detectada em homologação deve gerar caso de teste antes da publicação definitiva.
