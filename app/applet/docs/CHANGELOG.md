# CHANGELOG

Este documento registra as decisões históricas e macroestruturais que moldam o funcionamento arquitetural e funcional da aplicação **QEstudo**. Não pretende ser uma reconstrução minuciosa de cada *commit*, mas um rastreamento de pontos-chave na evolução do negócio.

---

## [Estado inicial da documentação] - 10 de Setembro de 2026

### Decisões Importantes Já Existentes (Fundação)

* **Schema `qestudo` Exclusivo**: O banco de dados PostgreSQL foi arquitetado para abrigar suas tabelas obrigatoriamente dentro de um schema focado (e não no public) usando Prisma multiSchema, isolando as credenciais de segurança e facilitando integrações com o Supabase nativo.
* **O PDF como Fonte Absoluta**: Estabilizamos a regra pedagógica de que nenhum dado deve ser "inventado" fora da caixa. A API Gemini é forçada através dos *prompts* e *chunks* lógicos a tirar as perguntas exclusivamente das folhas físicas recebidas.
* **Hierarquia Conceitual Rígida**: O aprendizado deve mapear: `Disciplina > Assunto > Subassunto > Conceito`. Toda pergunta necessita ser pendurada num nó folha (Concept final).
* **Banco de Questões Persistente**: A engine de prova não inventa as questões soltas "na hora" pro aluno sem salvar. Elas são enviadas ao Banco permanentemente (Materializadas na base).
* **Geração Sob Demanda e Lotes (`QuestionBatch`)**: Implementou-se um fluxo em grupo em que o aluno pode comprar as perguntas aos punhados (1, 2, 3, 5, 10), diminuindo chamadas custosas pingadas na API externa e aumentando a velocidade lógica do processamento (com status rastreáveis como *pending*, *processing*, *completed* e *failed*).
* **Controle Determinístico de Gabarito (Backend)**: Decidiu-se que a Inteligência Artificial cria o conteúdo criativo, mas o sistema relacional antigo trava *em qual posição* vai ficar a certa, garantindo lisura e zero viés comportamental.
* **Validação Semântica (Auditoria)**: A IA não joga no painel do estudante sem passar por um script cruzado de qualidade (Verificações se está dúbia, fora do escopo ou tem pegadinha injusta), cravando status fundamental `validated`.
* **Controle Rigoroso de Uso de IA (`AIUsage`)**: Introduziu-se e validou-se o monitoramento integral financeiro. Se falhar, estourar quota (429) ou exceder orçamento free tier, o sistema desarma de forma segura os serviços assíncronos (Lazy Initialization e Handlers), protege a tela e retorna um estado recuperável ao invés de derrubar o container.
