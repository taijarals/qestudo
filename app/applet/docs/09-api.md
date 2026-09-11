# 09 - API (Roteamento Express REST)

Abaixo encontra-se o inventário funcional real das rotas expostas em `/api` (Backend Express), extraídas de `server/routes/api.ts`.

## AI Usage (Monitoramento de Quota)
* **GET `/api/ai-usage/summary`**: Retorna consolidações métricas do consumo de IA.
* **GET `/api/ai-usage/history`**: Retorna um log array páginado do uso das operações na IA.

## Question Batches (Lotes de Geração)
* **GET `/api/question-batches/:id`**: Resgata infos de um lote gerado (ou processando).
* **GET `/api/question-batches/:batchId/stats`**: Recupera dados agregados do lote em si.
* **POST `/api/question-batches`**: Cria o pedido de um novo lote de geração.
  * Request: Payload contendo `{ materialId, scopeType, scopeId, board, questionType, requestedQuantity }`. Checa e invoca `QuestionBatchGenerationService`.

## Materials (Gestão de Conhecimento e PDFs)
* **POST `/api/materials/upload`**: Faz o upload nativo (form-data/multipart) alocando na memória, disparando ao Storage e criando o PDF base no sistema.
* **GET `/api/materials`**: Lista de forma limpa todos os materiais ativos na dashboard.
* **GET `/api/materials/:id`**: Retorna os detalhes de um documento singular.
* **DELETE `/api/materials/:id`**: Cascata implacável apagando o material e derivados.
* **POST `/api/materials/:id/process`**: Começa o parse de quebra de Chunking do PDF de modo assíncrono.
* **POST `/api/materials/:id/map-concepts`**: Dispara intencionalmente a IA sobre o texto processado para montar a árvore taxonômica folha a folha.
* **GET `/api/materials/:id/processing-status`**: Rota de feedback instantânea pro frontend pegar barra de progresso (Chunks, Stats e Progress).
* **GET `/api/materials/:id/pages`**: Extrai contagem de paginação de origem.
* **GET `/api/materials/:id/chunks`**: Lista os text blocks formatados (MaterialChunks).
* **GET `/api/materials/:id/concepts`**: Busca árvore hierárquica (Topics e Concepts).
* **GET `/api/materials/:id/questions`**: Lista as questões amarradas aquele documento.
* **GET `/api/materials/:id/coverage-tree`**: Retorna estimativas complexas da capacidade sistêmica para suportar questões vs o que falta.

## Concepts (Métricas Lógicas)
* **GET `/api/concepts/:id/questions`**: Traz as questões do banco de dados ligadas diretamente a este microassunto específico.
* **GET `/api/concepts/:id/mastery`**: Metadado de pontuação/retenção/performance de retenção atrelado ao conceito.
* **PUT `/api/concepts/:id/mastery`**: Sobrescreve score artificial ou manualmente no conceito.

## Question Plans & Questions (Engenharia Isolada)
*(Nota: Grande parte deste fluxo interno foi sobreposto pelo QuestionBatches que faz a jornada inteira. Eles co-existem para testes, validações manuais ou granularidades extremas)*
* **POST `/api/question-plans`**: Cria um esqueleto estrutural e distratores predefinidos.
* **GET `/api/question-plans/:id`**: Mostra o plano já amarrado.
* **GET `/api/concepts/:id/question-plans`**: Consulta planos alocados a uma folha taxonômica.
* **POST `/api/question-plans/:planId/generate`**: Manda a IA ler UM plano avulso para escrita.
* **GET `/api/questions/:id`**: Retorna a questão limpa com o enunciado formatado.
* **POST `/api/questions/:id/validate`**: Aciona o motor semântico para revalidar (auditoria humana-like) a pergunta.
* **GET `/api/questions/:id/validation`**: Recupera último laudo semântico dado na prova da pergunta.

## Provedor de Estudo
* **POST `/api/questions/provide`**: Solicita ao engine global para entregar 1 pacote de questão ao front (usado majoritariamente isolado de uma sessão tradicional).

## Respostas (Answers e Feedback)
* **POST `/api/answers`**: Recebe o clique exato (A,B,C... ou ID) do botão, tempo de prova, relaciona na Session e confere acerto relacional no backend (Não aceita boolean no payload).
* **POST `/api/answers/:answerId/comprehension`**: Insere metadados se o aluno "Entendeu" a explicação após ter respondido.

## Study Sessions (A Arena do Usuário)
* **POST `/api/study-sessions`**: Inicia e crava um tempo zero para uma sessão.
* **PATCH `/api/study-sessions/:id`**: Atualiza metadados gerais da rodada.
* **GET `/api/study-sessions/:id/answers`**: Pega log do que foi respondido nessa arena.
* **POST `/api/study-sessions/:id/next-question`**: Dispara a engine adaptativa determinando se o aluno tem capacidade/banco suficiente para a Sessão prosseguir, e busca a melhor próxima questão. Se falhar, retorna `insufficient_question_bank` para congelar a interface adequadamente.
