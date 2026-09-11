# 08 - Estados e Status

Centralização dos valores literais esperados nas strings de controle de fluxo de estado no banco de dados e roteamento da aplicação. Se um valor não está listado aqui, ele não deve ser forçado no banco ou no front.

## Material (`Material.status`)
Os passos transicionais da carga e preparo de um PDF.
* `uploaded`: Arquivo foi recebido no sistema.
* `extracting`: Motor está lendo o texto do PDF via parser.
* `chunking`: Motor está fatiando o texto em blocos semânticos lógicos (MaterialChunk).
* `ready_for_mapping`: O arquivo de texto está organizado, aguardando o clique/comando para a IA ler.
* `mapping_concepts`: A Inteligência Artificial está montando ativamente a árvore de conceitos (Requisição voando).
* `mapping_error`: Houve um gargalo da IA ou timeout (Permite tentar de novo sem re-upload).
* `ready`: Status de ouro. O mapeamento salvou perfeitamente os nós folhas de conceito e as questões/sessões estão totalmente desbloqueadas.
* `error`: Erro catastrófico genérico de arquivo.
* `pdf_requires_ocr`: Erro específico - PDF recebido como imagem (Sem camada legível de texto no Parse normal).

## Questão (`Question.validationStatus` e afins)
* `draft`: Questão em rascunho temporário, não utilizável para sessões.
* `validated`: Questão que sofreu rigor de auditoria cruzada semântica e do sistema e pode ir pro aluno.
* `rejected`: Questão chumbada pela IA revisora (Não deve compor painel final).
* `duplicate`: Chumbada porque o sistema entende que é idêntica semanticamente ou literalmente à outra do banco.

## Lote de Questões (`QuestionBatch.status`)
Os disparos que formam conjuntos.
* `pending`: Lote recém inserido.
* `processing`: Processador assíncrono/loteamento com a IA rodando.
* `completed`: Todas as questões atingiram desfechos finais com total sucesso e persistiram.
* `partial`: Lote entregue de forma mista (ex: algumas rejeitadas, mas encerrou sem estourar limites).
* `failed`: Falha fatal de execução que anula o lote.
* `paused_quota`: *(Acompanhamento Planejado/Adicionado na listagem como placeholder de estagnação de token)*

## Sessão de Estudo (`StudySession.status`)
* `active`: Sessão sendo operada agora, esperando o array ser completado.
* `finished`: Sessão encerrada (Fechada a pontuação).

## Retenção e Proficiência (`ConceptMastery.status`)
Grau de evolução e retenção do aluno por conceito.
* `not_seen`: Aluno não respondeu nada provado disso.
* `learning`: Começou a falhar/acertar no nível raso.
* `consolidating`: Bons espaçamentos lógicos acertados e pontuação mediana.
* `mastered`: Sequência prolongada provada de excelência ininterrupta.
* `review_needed`: Relógio temporal do espaçamento apitou - perdeu proficiência.

## Log de API (`AIUsage.status`)
Auditoria rigorosa do Gemini.
* `success`: Prompts rodaram perfeitamente retornando blocos 200 do SDK.
* `failed`: Falha no parseamento (500), SDK caiu ou o JSON devolvido foi não intelegível.
* `quota_exceeded`: (Código 429) Usuário varou o limite free do Google daquele minuto/dia.
* `rate_limited`: Disparou muitas threads simultâneas travando limite de gargalo da API (Também interceptado via 429 nas regras finas).

---
*(Inconsistência encontrada no modelo Prisma)*: O status "paused_quota" foi inferido como esperado mas atualmente, de acordo com o código, os erros que caem no Gemini de Batch mudam diretamente para `failed` cravado se interrompidos. O campo QuestionBatch não tem literais estritas garantidas por DB Enums de Postgre nativo, então ele engole falhas.
