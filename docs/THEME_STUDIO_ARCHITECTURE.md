# LinkStack Futuristic Theme Studio — Documentação Técnica e Arquitetura

## 1. Visão Geral
O **LinkStack Futuristic Theme Studio** é um módulo isolado de desenvolvimento visual, importação segura, simulação responsiva e exportação de pacotes de temas compatíveis com o **LinkStack** (baseado na arquitetura LittleLink Custom / Laravel Blade).

O laboratório opera de forma independente em relação ao núcleo da aplicação LinkStack: nenhum tema importado ou editado no estúdio sobrescreve temas oficiais (`PolySleek`, `galaxy`), rotas, banco de dados ou arquivos de produção.

---

## 2. Auditoria Técnica Realizada (LinkStack `themes/`)
A inspeção direta dos temas reais fornecidos no repositório de referência (`reference-themes/PolySleek/` e `reference-themes/galaxy/`) revelou os seguintes requisitos contratuais para compatibilidade real:

| Arquivo | Função no LinkStack | Observações Técnicas |
| :--- | :--- | :--- |
| `config.php` | Matriz de flags PHP (`return [...]`) | Define `allow_custom_buttons`, `open_links_in_same_tab`, `enable_custom_code`, `enable_custom_head`, `enable_custom_body`, `enable_custom_body_end`, `use_custom_icons` e `custom_icon_extension`. Valores booleanos são strings `'true'` / `'false'`. |
| `readme.md` | Metadados e licença | Contém `* Theme Name:`, `* Theme Version:`, `* Theme Date:`, `* Theme Author:`, `* Theme Author URI:`, `* Theme License:`. |
| `preview.png` | Miniatura no painel admin | Imagem PNG `1920 × 1080` exibida no seletor de temas (`LinkStack → Temas`). |
| `skeleton-auto.css` | Grid, `:root`, tipografia e rodapé | Define `.container`, `.column`, `:root` CSS variables, `body`, `h1`, `p`, `a`, `.spacing`, `.credit-footer`, `.credit-txt`. |
| `brands.css` | Avatar, ícones sociais e botões | Define `.rounded-avatar`, `.social-icon-div`, `.social-icon`, `.button`, `.button:hover`, `.button:active`, `.icon`. |
| `animations.css` | Animações de entrada e hover | Define `.button-entrance`, `.fadein`, `.button-hover`, `.credit-hover`, `.footer-hover` e `@keyframes`. |
| `share.button.css` | Botão de compartilhamento e toast | Define `.sharediv`, `.sharebutton`, `.share-icon`, `.toastdiv`, `.toastbox` e `.toastbox.toast-tox--active`. |
| `extra/` | Injeções Blade e ativos locais | Contém `custom-head.blade.php`, `custom-body.blade.php`, `custom-body-end.blade.php`, `custom-assets/` (referenciados via `{{themeAsset('arquivo')}}`) e `custom-icons/`. |

---

## 3. Estrutura do Módulo
- `server.ts`: Servidor Express + middleware Vite com API isolada (`/api/themes/base`, `/api/projects`, `/api/themes/import-zip`, `/api/themes/export-zip`, `/api/docs`).
- `reference-themes/`: Cópia somente leitura dos temas auditados `PolySleek` e `galaxy`.
- `data/`: Armazenamento persistente local do estúdio (`studio-projects.json` e diretório isolado `workspace-themes/<slug>/`).
- `src/core/`: Lógica pura desacoplada e testada unitariamente:
  - `types.ts`: Tipagem completa dos projetos, paletas, efeitos e relatórios.
  - `palettes.ts`: 7 paletas futurísticas (`Cyberpunk`, `Golden Tech`, `Emerald Future`, `Electric Blue`, `Crimson Matrix`, `Aurora Neon`, `Holographic`) e presets iniciais.
  - `contrast.ts`: Cálculo de luminância relativa e razão de contraste WCAG.
  - `linkstackGenerator.ts`: Gerador real de todos os arquivos do pacote LinkStack.
  - `themeValidator.ts`: Validador de compatibilidade em 10 critérios.
  - `zipSecurity.ts`: Inspetor estático de segurança ZIP, PHP e Blade.
- `src/components/`: Interface do estúdio (`TopBar`, `ThemeGallery`, `VisualEditor`, `LinkStackSimulator`, `ImportZipModal`, `ExportZipModal`, `AuditDocsView`).

---

## 4. Segurança da Importação de Arquivos `.zip`
A rota `POST /api/themes/import-zip` e `src/core/zipSecurity.ts` implementam:
1. **Limite de tamanho**: Máximo de 15 MB comprimidos e 45 MB descomprimidos, máximo de 250 entradas.
2. **Prevenção contra Zip-Slip / Path Traversal**: Rejeita caminhos com `..`, barras iniciais `/`, letras de unidade (`C:\`) ou null bytes.
3. **Bloqueio de Links Simbólicos**: Verifica atributos UNIX (`0120000`) e rejeita symlinks.
4. **Bloqueio de Extensões Perigosas**: Rejeita `.exe`, `.sh`, `.bat`, `.phar`, `.phtml`, `.cgi`, etc.
5. **Zero Execução PHP**: `config.php` e arquivos `.blade.php` são inspecionados exclusivamente por regex estática. Chamadas como `eval`, `exec`, `shell_exec`, `system` são bloqueadas imediatamente.
6. **Área Isolada**: Arquivos importados são salvos apenas no diretório de trabalho do estúdio (`data/workspace-themes/`), nunca no diretório raiz de produção do LinkStack.

---

## 5. Processo de Exportação e Instalação no LinkStack
Ao clicar em **Exportar ZIP**:
1. O `themeValidator.ts` executa 10 verificações (estrutura, sintaxe `config.php`, diretivas Blade, balanceamento CSS, contraste WCAG, responsividade mobile, `prefers-reduced-motion`, isolamento `pointer-events`, licença).
2. Um `preview.png` de `1920 × 1080` é renderizado em Canvas HTML5 refletindo fielmente a paleta, fundo, geometria, avatar e botões configurados.
3. O backend gera o arquivo `<ThemeSlug>.zip` exatamente no mesmo formato do pacote de referência: `themes/<ThemeSlug>/...`, contendo os arquivos plug-and-play (`config.php`, `readme.md`, `preview.png`, CSS e `extra/custom-assets/theme-effects.js`).

---

## 6. Decisões Arquiteturais, Licenças e Limitações Conhecidas
- **Preservação de Licenças**: Temas derivados de `PolySleek` preservam referência MIT; temas derivados de `galaxy` preservam GPLv3.
- **Limitação do Ambiente de Preview**: O container atual executa Node.js/Express + React/Vite e não possui o runtime PHP/Laravel completo do servidor LinkStack. Portanto, a renderização do simulador reproduz o DOM e os seletores CSS reais do LinkStack em ambiente sandbox no navegador, e a validação final é baseada em análise estática e verificação estrutural do ZIP. Recomenda-se validar a importação final na sua instância PHP/Laravel via painel administrativo.
- **Dependências Utilizadas**: `react`, `express`, `jszip`, `lucide-react`, `motion`, `tailwindcss`, `tsx`.
