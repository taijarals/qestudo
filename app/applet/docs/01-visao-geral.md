# 01 - Visão Geral

## O que é o QEstudo

O **QEstudo** é um sistema de estudo adaptativo voltado a estudantes de concursos públicos. 

Seu objetivo principal é permitir que o usuário envie seus próprios materiais de estudo (em formato PDF), transforme o conteúdo desse material em uma estrutura conceitual organizada hierarquicamente e, a partir dela, gere um banco de questões customizadas. Por fim, o usuário utiliza esse banco para sessões de estudo interativas.

### A Fonte do Conhecimento
No QEstudo, o **PDF é a fonte absoluta da verdade**. 
Um "Material" não é um sinônimo genérico de "Matéria" (como "Direito Constitucional"), mas sim a representação de um documento físico ou digital específico enviado pelo usuário (ex: "Aula 01 - Direitos e Garantias Fundamentais.pdf"). Todo o aprendizado e todas as questões geradas estão estritamente vinculadas a esse material fonte.

### Estrutura Pedagógica

Ao ser processado, o material é quebrado em partes (chunks) e analisado pela IA para gerar uma árvore de conhecimento com a seguinte hierarquia pedagógica:

1. **Material** (O documento fonte)
2. **Disciplina** (Ex: Direito Administrativo)
3. **Assunto** (Topic - Ex: Atos Administrativos)
4. **Subassunto** (Subtopic - Ex: Atributos do Ato)
5. **Conceito** (Concept - A menor unidade de conhecimento. Ex: Presunção de Legitimidade)
6. **Questão** (Gerada sob demanda para avaliar o domínio do Conceito)

### Princípio Fundamental de Arquitetura

O coração do QEstudo segue o seguinte princípio:

> **"System controls the exam; AI writes the question."**
> *(O sistema controla a prova; a IA redige a questão.)*

Isso significa que a Inteligência Artificial atua como uma conteudista supervisionada: ela gera o texto das questões, as alternativas falsas e as justificativas, mas as regras estruturais (qual a alternativa correta, quantas questões fornecer e se a questão é validada para o estudo) são controladas determinística e exclusivamente pelo backend tradicional (sistema).
