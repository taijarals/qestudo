# 10 - MVP e Roadmap

Este documento centraliza a visão do Produto Mínimo Viável (MVP) e mapeia futuras explorações da plataforma após o lançamento primário.

## O MVP
O QEstudo baseia-se num checklist rígido de premissas essenciais. Elas garantem que a jornada de ponta a ponta (E2E) aconteça:

1. [x] Enviar PDF.
2. [x] Processar PDF (Chunking/Parse).
3. [x] Mapear disciplina/assuntos/conceitos (Taxonomia Gemini).
4. [x] Visualizar estrutura (Árvore e Modais na interface).
5. [x] Gerar questões por núcleo hierárquico.
6. [x] Escolher lotes de 1/2/3/5/10.
7. [x] Visualizar banco de questões geradas.
8. [x] Acompanhar cobertura estimada de inteligência e densidade.
9. [x] Configurar estudo por matéria/assunto/conceito.
10. [x] Responder questões em modo focado sem erro de crash.
11. [x] Receber correção e explicação fundamentada com base no material original.
12. [x] Registrar desempenho persistente (Answers).
13. [x] Visualizar resultados e feedbacks básicos.
14. [ ] Rever erros básicos no caderno (O conceito de Caderno de Erros visual na interface precisa ser validado e enriquecido).
15. [x] Excluir material e todos os derivados por dependência.
16. [x] Acompanhar rigorosamente uso e gastos de tokens de IA (AIUsage).

---

## Estado de Desenvolvimento (Baseado na Leitura Atual)

### Já implementado
* Todo o núcleo relacional do Prisma (com Schema seguro e escalável).
* Orquestração robusta dos serviços AI (GeminiClient) englobada por auditorias de Quota, Rate Limiting e Try/Catch amigável.
* Integração UI > Express focada na resiliência: o carregamento (Initialization) não trava mais o container quando falha leitura de Chave, rodando *lazy initialization*.
* Sistema de Lotes (QuestionBatch) cobrindo criação, auditoria cruzada semântica e gravação sequencial perfeitamente interligados.
* Motor base de Sessões de Estudo fornecendo questões sob demanda do banco já validado (impedindo looping livre e oneroso).
* Extração e quebra em páginas e chunks lógicos (PdfProcessingService).
* Frontend funcional responsivo com Tailwind e React.

### Em implementação / Necessário para fechar MVP
* (Revisão da UX): Painel Caderno de Erros, refinamento da listagem para revisar pontualmente as que o aluno acionou flag "Não entendi" (ComprehensionFeedback) e falhas da métrica Mastery.
* Certificação final de que os limites orçamentários dinâmicos da plataforma (SystemConfig Budgeting) estão efetivos na GUI.

---

## Pós-MVP (Roadmap Futuro)
Estas funcionalidades são exploratórias e **NÃO** devem bloquear o andamento/lançamento do fluxo central da jornada:
* Painéis massivos de Gamificação, Conquistas e Badges.
* Modo Multiplayer ou Ranking social de concurseiros.
* Compartilhamento / Marketplace Público de Material e Banco de Questões (atualmente focado na experiência Private/Solo).
* Incorporação nativa de Embeddings / Vetores avançados semânticos para indexação gigantesca (hoje quebrado nativamente via chunk limits do material).
* Aplicativo Mobile nativo estrito.
* Integração de IA criadora e operadora nativa de *Flashcards* visuais.
* Rotinas complexas de Web Scraping para baixar PDFs de portais terceiros nativamente pela interface.
* Remediação avançada automática ("O sistema viu que você errou, ele reescreve o texto com analogia").
* Analytics extremamente granulares de curva de esquecimento (Ebbinghaus) implementados em interface gráfica (as tabelas já possuem as colunas suporte).
