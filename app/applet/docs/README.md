# Documentação QEstudo

Bem-vindo à documentação oficial do **QEstudo**. Esta pasta (`docs/`) é a **FONTE DA VERDADE** do projeto e deve evoluir lado a lado com o código-fonte.

## Índice

* [01 - Visão Geral](./01-visao-geral.md): O que é o sistema, seus objetivos e princípios fundamentais.
* [02 - Regras de Negócio](./02-regras-de-negocio.md): Lógica fundamental das entidades (Materiais, Conceitos, Questões, Sessões).
* [03 - Arquitetura](./03-arquitetura.md): Desenho técnico da solução, stack e diagramas de componentes.
* [04 - Persistência](./04-persistencia.md): Modelos de banco de dados, relacionamentos e diagramas ER.
* [05 - Inteligência Artificial](./05-inteligencia-artificial.md): Papel da IA, otimização de tokens, limites de responsabilidade.
* [06 - Fluxos do Sistema](./06-fluxos-do-sistema.md): Fluxogramas de ponta a ponta (Upload, Mapeamento, Estudo, etc).
* [07 - Layout e UX](./07-layout-e-ux.md): Decisões de interface, navegação e experiência do usuário.
* [08 - Estados e Status](./08-estados-e-status.md): Dicionário unificado de estados (status) do sistema.
* [09 - API](./09-api.md): Inventário de endpoints REST implementados.
* [10 - MVP e Roadmap](./10-mvp-e-roadmap.md): Acompanhamento do que já está pronto e do que falta para o MVP.
* [CHANGELOG](./CHANGELOG.md): Histórico de decisões arquiteturais e funcionais.

---

## Regra de manutenção

Sempre que uma implementação alterar:
* regra de negócio;
* modelo de dados;
* arquitetura;
* API;
* status;
* UX;
* comportamento da IA;

O agente (ou desenvolvedor) **DEVE** verificar a pasta `docs/` e atualizar os arquivos impactados no MESMO commit. 
A documentação deve ser atualizada no mesmo commit sempre que uma mudança alterar regras de negócio, arquitetura, persistência, API, fluxo ou UX.
Nenhum novo `.md` deve ser criado para uma pequena alteração se ela pertencer a um documento existente para evitar fragmentação excessiva.
