# 05 - Inteligência Artificial

A Inteligência Artificial no **QEstudo** atua estritamente como um redator conteudista supervisionado. Ela trabalha em conjunto com as chaves transacionais para poupar tempo humano, mas **jamais decide a regra sistêmica final.**

## Responsabilidades Exclusivas da IA

1. **Mapeamento Conceitual (`ConceptMappingService`)**
   * Ler a massa bruta de texto extraída do PDF.
   * Produzir uma taxonomia pedagógica em árvore estrita (Disciplina, Assuntos, Subassuntos e Conceitos finais) perfeitamente ligada ao texto lido.
2. **Geração de Questões (`QuestionGeneratorService` / `QuestionBatchGenerationService`)**
   * Escrever enunciados engajantes, imitando o estilo da banca escolhida (Ex: FGV, CEBRASPE).
   * Elaborar alternativas falsas verossímeis (distratores).
   * Redigir explicações robustas justificando a escolha certa e porque as alternativas falsas estão erradas.
3. **Validação Semântica (`QuestionValidatorService` / `QuestionBatchValidatorService`)**
   * Agir como um revisor humano secundário que audita a questão criada antes que ela chegue ao aluno.
   * Critérios da rubrica de validação incluem: A questão exigiu conhecimento de fora do PDF? Existe dubiedade (duas respostas perfeitamente corretas)? É excessivamente longa ou foge da característica da banca? 

## O que NÃO fica sob controle da IA

* **Posição da Alternativa Correta:** É o Backend, em sua base determinística (`QuestionPlan`), que força matematicamente qual será o índice correto (se será A, B, C, D ou E) para evitar vícios da IA de colocar a letra 'C' em todas.
* **Decisão de Aprovação/Rejeição Definitiva:** Embora a IA gere uma validação semântica com pontuação e rubricas, o banco de dados e o sistema clássico decidem qual métrica barra o status `validated`.
* **Acesso Livre ao Mundo Externo:** A IA não realiza web scraping aberto ou "dá opinião". Ela é restringida ao parâmetro `sourceChunks` do prompt.
* **Mecânica de Estudo e Gabaritos:** A IA nunca audita, dentro da sessão de estudo interativa, se o aluno acertou ou errou — a conferência relacional clássica faz isso no endpoint. Ela também não dita qual a próxima questão a exibir no estudo.

## Modelos e Configurações Atuais

Todo o tráfego ocorre via o SDK `@google/genai` (Inteligência Artificial primária, Google Gemini).

*(Inconsistência identificada: variáveis exclusivas como `GEMINI_PRIMARY_MODEL`, `GEMINI_ESCALATION_MODEL`, ou enum de perfis de geração `economy|balanced|strict` constam em algumas requisições de design, porém o código-fonte atual carrega majoritariamente de uma variável principal fixa ou `GEMINI_MODEL`. Foi priorizado o uso hard-coded do Flash nas validações atuais, portanto o modo de otimização complexo e dinâmico de modelo está em revisão ou desenvolvimento planejado e pendente na camada .env.example).*

## Otimização de Tokens, Resiliência e Quotas

Dado que o serviço pode processar centenas de páginas e construir dezenas de questões:
* **Geração em Lote (Batch):** O sistema agora engloba as solicitações de múltiplas questões em um modelo "batch", gerando várias de uma só vez numa mesma iteração semântica do modelo. Isso aumenta radicalmente a performance e economiza tokens de entrada repetidos do prompt do material bruto.
* **Pedaços Mínimos (Chunks):** Na criação do plano, o backend manda para a IA apenas os textos-fontes amarrados àquele assunto específico, poupando a IA de precisar mastigar todo o PDF gigantesco de 100 páginas de novo na etapa de pergunta.
* **Tratamento Fino de Retries:** A IA não para o sistema bruscamente caso apresente alucinação ou caso acabe os créditos gratuitos na nuvem:
  * Exceções com código de quota excedida (`429`, `quota_exceeded`, `rate_limited`) não travam o backend. Elas são devolvidas com status amigável e o status do lote do Banco volta o frontend a permitir "Tentar novamente".
  
## AIUsage (Auditoria de Consumo)

Todos as execuções instanciam e encerram no banco de dados, via classe `GeminiClient`, uma tabela `AIUsage` essencial.
O sistema loga deterministicamente:
* Quantos *tokens de entrada (promptTokens)* e *saída (outputTokens)* cada requisição pesou no limite da conta.
* Em que momento (`startedAt` e `completedAt`).
* O status final: `success`, `failed`, `quota_exceeded`, ou `rate_limited`.
* Isso impede gastos surpresas ou looping infinito da geração batendo contra a quota do Google caso o banco do aplicativo escale repentinamente.

## Operações Suportadas Efetivamente
De acordo com os tipamentos reais (TypeScript), são interceptadas e mapeadas as operações:
* `concept_mapping`
* `question_generation`
* `question_validation`
* `question_batch_generation`
* `question_batch_validation`
* `question_escalation_validation`
