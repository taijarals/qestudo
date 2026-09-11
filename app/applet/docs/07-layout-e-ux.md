# 07 - Layout e UX

O **QEstudo** adota uma identidade visual focada em densidade, elegância moderna e minimização de distrações, voltada unicamente à produtividade do estudo. Toda a base de estilização consome **TailwindCSS**, descartando `css` solto.

## Design System Visual
* **Paleta Base:** O sistema usa majoritariamente variações dos neutros padrão e ardósia (`slate-50` a `slate-900`) para os planos de fundo e o texto, construindo uma estética incisiva.
* **Cor Primária (Ações principais):** Azul (familia de tons `blue-600` e `blue-700`) destinado a ações positivas como "Gerar Questões", "Continuar" e links centrais.
* **Cores Semânticas:**
  * **Vermelho:** Indicativo de ações destrutivas (Apagar material) ou erros (Respostas Incorretas, Fallbacks da IA e quotas estouradas).
  * **Verde:** Sucesso (Respostas Corretas na sessão de estudo, barras de progresso cheias, métricas positivas de retenção).
* **Fundações de Layout:** A interface apoia-se num fundo claro com uma *Sidebar (Menu lateral)* fixa, preta/escura na tela principal de uso, servindo de âncora de navegação.

## Elementos Constantes
* **Cards e Superfícies:** Blocos de conteúdo, métricas e listas são envelopados em containers com bordas sutis (`border-slate-200`), cantos ligeiramente arredondados (sem exagero de border-radius clássicos) e uso extenso de espaço negativo e *paddings*.
* **Iconografia:** Todos os ícones emanam de forma exclusiva e uniforme da biblioteca `lucide-react`.

## Principais Telas da Aplicação
1. **Dashboard (Visão Geral):** Home principal com sumários breves das métricas de avanço e botão primário para continuar o estudo recente.
2. **Materials (Lista):** Grid ou lista exibindo todos os PDFs que o aluno inseriu no sistema, exibindo tag colorida com os devidos `status`.
3. **MaterialDetails:** Coração gerencial do arquivo. Exibe em formato hierárquico, tipo sanfona ou árvore, a indexação dos Conceitos gerados. É daqui que nascem os modais e gatilhos para gerar novos lotes de banco de questões, bloqueando botões de estudo/geração enquanto o status não é cravado.
4. **StudySession (Arena de Resolução):** Tela livre de distrações, com a pergunta posta ao centro. Alternativas dispostas como grandes botões clicáveis. Ao responder, surge o bloco de Feedback com a explanação validada.
5. **Configurações / Uso da IA:** Painel técnico embutido para monitorar gastos e quotas, consumindo os logs salvos da API Gemini de forma transparente ao usuário.

## Princípios de Experiência do Usuário (UX) implementados
* **Zero Dados Fictícios:** Uma vez vazio, o sistema apresenta *Empty States* sinceros indicando onde subir PDFs. Não renderizamos mock-datas ou "lorem ipsums" injetados aleatoriamente em listas.
* **Loading Explícito (Estado vs Processamento):** Processamentos pesados de IA (como mapeamento e extração de PDF) mantêm barras de progresso polidas, esvaziando a tela e prevenindo múltiplos cliques.
* **Transparência de Erro:** Se a IA estourar cota do plano Free da API, em vez da tela branca, um block component vermelho revela graciosamente a mensagem ("Acesso expirado", "Aguarde x segundos") com um botão de repescagem. Nenhuma falha técnica deve ser "camuflada" com falsos positivos visuais.
* **Confirmação e Irreversibilidade:** Ações destrutivas (ex: exclusão em cascata) devem invocar diálogos/modais de confirmação severos em cor de erro vermelho antes de despachados ao Prisma.
