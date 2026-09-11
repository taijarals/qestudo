# 02 - Regras de Negócio

## Materiais
* O sistema aceita **somente arquivos PDF** no MVP.
* O upload de um PDF cria um registro de `Material`.
* O `Material` possui um controle rígido de `status` durante seu processamento.
* A exclusão de um material **remove todos os dados derivados** a ele associados em cascata (páginas, pedaços/chunks, conceitos, planos, questões e uso da IA vinculado).
* O conteúdo extraído do PDF é a **única fonte da verdade** para a geração do modelo conceitual e das questões.

## Conceitos
A extração lógica do material segue a seguinte hierarquia pedagógica em árvore:
1. `discipline` (Disciplina)
2. `topic` (Assunto)
3. `subtopic` (Subassunto)
4. `concept` (Conceito - nó folha)

**Regra Crítica:** Todas as questões do sistema devem ser vinculadas obrigatoriamente a um **conceito final (nó folha, level 'concept')**. Não se gera questão ligada diretamente a um assunto sem especificar o conceito em si.

## Questões

### Tipos de Questão
As questões mapeiam perfis comuns de bancas de concurso:
* **CEBRASPE:** Modelo Certo/Errado (True/False).
* **FGV/FCC:** Múltipla escolha, contendo uma alternativa correta e exatas 4 alternativas falsas (A-E).

### Regras de Geração
* O **backend controla o gabarito**. A posição correta (A, B, C, D, E) ou a resposta (Certo/Errado) é predefinida no plano da questão (QuestionPlan) pelo sistema e *nunca* deixada à livre escolha da Inteligência Artificial.
* Somente questões com status `validated` (aprovadas pelas regras da IA e do sistema) podem ser enviadas para uma sessão de estudo.
* Toda questão **deve** possuir ao menos uma `source reference` (Referência de origem, indicando em qual trecho/página do PDF a base da questão se encontra).
* A geração deve utilizar **somente** o conteúdo autorizado do PDF para compor o enunciado e não conhecimentos abertos/externos da IA.

## Banco de Questões
Diferentemente de testes em que a prova é gerada "on the fly" sem ser salva, no QEstudo as questões são geradas sob demanda e alimentam um **banco de questões persistente** vinculado ao material do usuário.

* O usuário pode solicitar a geração em **lotes pré-definidos:** 1, 2, 3, 5 ou 10 questões de uma vez.
* Estas questões tornam-se parte definitiva do banco para que possam ser utilizadas em sessões futuras.

## Cobertura e Potencial de Estudo
O sistema possui inteligência para calcular a **cobertura (coverage)**.

* **estimatedQuestionCapacity:** Uma estimativa de quantas questões um conceito suporta antes de começar a gerar repetições semânticas.
* **remainingPotential:** Cálculo do sistema mostrando se um tópico ainda possui espaço seguro para gerar novas questões exclusivas.
* **Regra de interface:** É explicitado que a "cobertura" é uma **estimativa** (baseada na extensão de texto original vinculada ao conceito) e não uma garantia matemática rígida de quantidade exata.

## Estudo e Sessões
O fluxo de estudo ocorre através de sessões (StudySession).
* A sessão utiliza unicamente questões do banco que já estão finalizadas e prontas.
* (Decisão atual baseada no código) O motor de estudo provê a *próxima questão* buscando no banco já gerado; se não houver questão suficiente, o sistema bloqueia e emite a exceção `insufficient_question_bank`, instruindo o usuário a gerar mais antes de continuar. A geração automatizada no meio da sessão *não* ocorre.

## Respostas (Answers)
* As respostas registradas pelo usuário possuem os tipos: `answered` (respondida) ou `dont_know` (não sabe).
* A validação de acerto ou erro (`isCorrect`) ocorre e é garantida no **Backend**, que confronta a opção escolhida pelo usuário com o ID real da alternativa verdadeira (ou flag isCorrect no banco).
* **Não se confia** em um payload do frontend dizendo `isCorrect: true`. 

## Mastery (Domínio / Retenção)
Acompanhamento de retenção (`ConceptMastery`) (Métricas implementadas no código):
* Todo conceito rastreia sua respectiva proficiência.
* As contabilizações atuais englobam as contagens totais, respostas certas, erradas, repetidas (`consecutiveCorrect`, `consecutiveWrong`) e as métricas atreladas à retenção e feedbacks de compreensão.
