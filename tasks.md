# Tarefas por sessão

Datas reais das sessões, no fuso America/Sao_Paulo. O trabalho foi realizado em quatro etapas, conforme a disponibilidade do autor.

## Sessão 1 — 07/10/2026 — especificação e planejamento

- [x] Definir ideia, escopo e limites da primeira versão.
- [x] Escrever requisitos e critérios de aceite em `spec.md`.
- [x] Registrar decisões técnicas em `plan.md`.
- [x] Preparar tarefas e cenários de validação.
- [x] Revisar a especificação antes da implementação; execução delegada pelo autor em 08/10/2026, com o escopo inicial mantido.

## Sessão 2 — realizada: 08/10/2026 — base e interface

- [x] T01: Criar projeto React + TypeScript + Vite e lockfile. Relacionado: todos os requisitos.
- [x] T02: Criar grupos, cartões e estado vazio. Relacionado: RF03, RF05, RNF02.
- [x] T03: Criar formulário e controles de filtros com rótulos e foco visível. Relacionado: RF01, RF02, RF05, RNF01.
- [x] T04: Conferir a interface em 360 px e 1280 px. Relacionado: RNF02.

Na sessão 2 foram conectados os filtros e a criação em memória para experimentar a interface. Essa demonstração ainda reiniciava ao recarregar; edição e persistência foram acrescentadas na sessão 3.

## Sessão 3 — realizada: 12/10/2026 — funcionalidades

- [x] T05: Completar criação, validação e edição. Relacionado: RF01, RF02.
- [x] T06: Implementar mudança de estado e exclusão com confirmação. Relacionado: RF03, RF04.
- [x] T07: Aplicar filtros combinados e ordenação. Antecipado na sessão 2. Relacionado: RF05.
- [x] T08: Implementar armazenamento, restauração e tratamento de falhas. Relacionado: RF06.
- [x] T09: Testar regras dos campos e dados armazenados inválidos. Relacionado: RF01, RF02, RF06.

## Sessão 4 — realizada: 13/10/2026 — validação e entrega

- [x] T10: Executar os cenários de `validation.md` e registrar evidências. Relacionado: todos os requisitos.
- [x] T11: Corrigir falhas encontradas e executar novamente os cenários afetados.
- [x] T12: Executar build e lint; registrar comandos e resultados reais.
- [x] T13: Completar README com instalação, execução e imagens da aplicação. Antecipado na sessão 3 e revisado na sessão 4.
- [x] T14: Revisar consistência entre especificação, código e documentação.
- [x] T15: Preparar explicação do uso de SDD e link do repositório para apresentação, em `presentation.md`.

## Registro de andamento

Marcar cada tarefa somente após concluí-la. Registrar em `progress.md` a data real, os resultados e o que ficou pendente em cada sessão. Criar commits conforme o trabalho for realizado.
