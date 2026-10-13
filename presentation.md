# Guia para apresentar o Taskboard SDD

Use este roteiro como apoio. A revisão da sessão 4 foi realizada em 13/10/2026. Os resultados de cada verificação estão em [validation.md](validation.md); o histórico real está em [progress.md](progress.md).

Repositório: [matheus-s-dev/taskboard-sdd](https://github.com/matheus-s-dev/taskboard-sdd).

## Abertura — 60 a 90 segundos

> Escolhi fazer um quadro de tarefas pessoais, com uma primeira versão pequena: criar, editar, mudar o estado, excluir e filtrar tarefas. Decidi manter só o frontend em React, porque esse escopo não precisava de login, servidor nem dados compartilhados.
>
> Usei SDD, desenvolvimento guiado por especificações. Antes do código, foram definidos o comportamento esperado e os critérios de aceite. Por exemplo: uma tarefa nova começa em A fazer, editar mantém sua identidade e recarregar deve restaurar os dados. A partir disso, o trabalho foi dividido em planejamento, tarefas por sessão, implementação e validação.
>
> Usei o Codex para redigir os documentos, implementar o código e os testes e apoiar a revisão. Minha participação foi escolher a proposta, definir o escopo e delegar a execução em etapas. Um exemplo interessante da revisão foi a recuperação do armazenamento: a especificação foi esclarecida para impedir que uma falha de leitura apagasse tarefas anteriores. Os testes e as verificações registrados no repositório mostram o que foi conferido e os limites da solução.

## Demonstração — cerca de 4 minutos

Abra a aplicação e o repositório. Use tarefas próprias para a demonstração, sem depender dos exemplos da imagem do README.

| Tempo | O que mostrar | Critério da especificação |
| --- | --- | --- |
| 30 s | Abra `spec.md` e mostre RF01 e RF06. Explique que esses comportamentos foram definidos antes da implementação. | Requisitos ligados ao resultado verificável |
| 45 s | Em Nova tarefa, tente salvar um título só com espaços. Depois crie “Preparar apresentação”, com descrição, prioridade alta e prazo. | RF01: erro junto ao campo; título válido cria em A fazer |
| 45 s | Abra Editar, altere o título e cancele: nada muda. Abra novamente e salve uma alteração. | RF02: cancelar preserva dados; salvar atualiza a mesma tarefa e mantém o estado |
| 30 s | Mova a tarefa para Em andamento e depois Concluído. Mostre que os detalhes continuam no cartão. | RF03: selecionar qualquer estado preservando os outros campos |
| 30 s | Combine filtros de estado e prioridade para produzir resultado vazio. Limpe os filtros. | RF05: filtros só mudam a visualização e podem ser combinados |
| 30 s | Crie uma tarefa temporária, abra Excluir e cancele. Depois confirme; a outra tarefa continua no quadro. | RF04: confirmação identifica a tarefa e remove somente a escolhida |
| 30 s | Escolha um filtro e recarregue a página. A tarefa permanece, e os filtros voltam para Todos. | RF06: persistência no mesmo navegador e origem; filtros não são salvos |

Se houver tempo, abra o formulário usando o teclado e feche com Escape. Mostre o retorno do foco e os rótulos de estado e prioridade, além das cores: RNF01.

## Como explicar o SDD

O fluxo deste projeto é **especificação → plano → tarefas → implementação → validação**:

- `spec.md`: o que deve acontecer e como reconhecer um resultado correto.
- `plan.md`: como construir isso; React, componentes, regras e armazenamento.
- `tasks.md`: partes do trabalho e os requisitos atendidos por cada uma.
- `src/`: implementação desses comportamentos.
- `validation.md` e `tests/`: cenários, resultados e limites das verificações.

Um exemplo concreto é RF06. Na revisão, apareceu um risco: a leitura inicial falhar, o quadro começar vazio e uma gravação posterior substituir tarefas que não tinham sido lidas. A especificação foi esclarecida para exigir que a aplicação recuperasse os dados anteriores antes de salvar as tarefas criadas na sessão. Isso orientou `taskRecovery.ts` e testes para preservar as duas listas. Dados inválidos seguem outro caminho: ficam preservados até a confirmação explícita de iniciar uma lista vazia.

Esse vínculo entre comportamento, decisão, código e verificação é o que torna os documentos úteis no desenvolvimento. Quando aparece uma ambiguidade, o requisito também é atualizado.

## Perguntas prováveis

**Por que React, TypeScript e Vite, só no frontend?** React organiza a interface; TypeScript ajuda a conferir os tipos; Vite executa o ambiente local e gera o build. Uma página para uso individual não exige backend neste escopo.

**Onde ficam os dados?** No `localStorage` do navegador, vinculados à origem do endereço. Não há sincronização entre dispositivos, login ou backup automático. Limpar os dados do site pode apagar as tarefas; falhas de acesso ou gravação geram avisos.

**Qual a diferença entre SDD e simplesmente escrever documentos?** Aqui os critérios orientam a implementação e a validação: “editar preserva identificador e criação” vira uma regra no código e um teste. A revisão do armazenamento também alterou o requisito e a solução.

**O que a IA fez?** O Codex redigiu a especificação e o planejamento, implementou o código e os testes e apoiou a revisão. O autor escolheu a proposta e o escopo com frontend em React e delegou as etapas. Não é necessário dizer que escreveu ou revisou manualmente cada arquivo.

**Usou o GitHub Spec Kit?** O fluxo foi inspirado nele, mas o toolkit não foi instalado. Os documentos Markdown foram preparados para este projeto; SDD foi aplicado como método de trabalho.

**Como foi testado?** Na sessão 4, 63 testes, build com TypeScript e lint passaram. Há testes de regras, armazenamento, recuperação, avisos e callbacks do hook. No Chrome, o percurso completo por teclado e as falhas de armazenamento foram conferidos; essas falhas usam uma página de desenvolvimento com armazenamento simulado. Consulte `validation.md` para os cenários e as evidências.

## Antes de apresentar

- Conseguir criar, editar, mover, filtrar e excluir uma tarefa sem seguir o roteiro.
- Saber explicar por que recarregar preserva tarefas, mas reinicia filtros.
- Localizar um requisito em `spec.md` e sua verificação em `validation.md`.
- Entender o exemplo de recuperação e os limites do `localStorage`.
- Saber descrever sua participação e a assistência do Codex com clareza.
