# Especificação — quadro de tarefas pessoais

Versão: 0.1 — 07/10/2026. Base inicial para revisão durante a próxima sessão.

## Problema e objetivo

Uma pessoa precisa acompanhar suas tarefas em uma tela simples, distinguir o que está pendente e retomar seu trabalho após fechar o navegador.

## Escopo

Uma página em português com três estados: **A fazer**, **Em andamento** e **Concluído**. As tarefas serão agrupadas por estado e poderão ser filtradas por estado e prioridade.

## Dados de uma tarefa

| Campo | Regra |
| --- | --- |
| Identificador | Único e criado pela aplicação |
| Título | Obrigatório; de 1 a 100 caracteres após remover espaços nas extremidades |
| Descrição | Opcional; até 500 caracteres |
| Prioridade | Baixa, média ou alta; padrão média |
| Prazo | Opcional; data de calendário sem horário; permite datas passadas |
| Estado | A fazer, em andamento ou concluído; padrão A fazer |
| Criação | Data e hora geradas pela aplicação, preservadas nas edições |

## Requisitos e critérios de aceite

### RF01 — Criar tarefa

- Com um título válido, ao salvar, a tarefa aparece em A fazer.
- Título vazio ou composto apenas de espaços impede o salvamento e apresenta mensagem junto ao campo.
- Valores acima dos limites indicados não podem ser salvos; os dados já preenchidos permanecem no formulário.
- Cancelar descarta somente o formulário e não cria uma tarefa.

### RF02 — Editar tarefa

- É possível alterar título, descrição, prioridade e prazo, respeitando as mesmas validações de criação.
- Salvar atualiza a tarefa existente, preservando identificador, estado e data de criação.
- Cancelar mantém os dados anteriores.

### RF03 — Alterar estado

- Cada tarefa oferece um controle para selecionar qualquer um dos três estados.
- Ao alterar o estado, a tarefa aparece no grupo correspondente; os outros campos são preservados.

### RF04 — Excluir tarefa

- A exclusão exige confirmação que identifique o título da tarefa.
- Confirmar remove somente a tarefa escolhida; cancelar mantém a tarefa.

### RF05 — Filtrar tarefas

- Filtros de estado e prioridade começam em Todos e podem ser combinados.
- Os filtros afetam somente a visualização, sem modificar os dados.
- Quando não há resultados, uma mensagem explica a ausência; limpar os filtros restaura a visualização completa.
- Em cada grupo, as tarefas mais recentes aparecem primeiro; editar não altera essa ordem.

### RF06 — Persistir dados

- Após criar, editar, mover ou excluir uma tarefa, a mudança é salva no navegador.
- Ao atualizar a página ou reabrir a aplicação no mesmo navegador e origem, as tarefas são restauradas.
- Os filtros são reiniciados em Todos ao recarregar.
- Se o armazenamento falhar, a aplicação continua funcionando na sessão e informa que as mudanças podem ser perdidas ao fechar ou recarregar.
- Dados armazenados inválidos não causam tela em branco. A aplicação informa o problema e oferece iniciar uma lista vazia, exigindo confirmação antes de substituir os dados armazenados.

### RNF01 — Usabilidade e acessibilidade

- Formulários possuem rótulos e mensagens de validação compreensíveis.
- Criar, editar, mover, filtrar e excluir funcionam com teclado e apresentam foco visível.
- Estado e prioridade são identificados por texto, além da cor.

### RNF02 — Layout responsivo

- As funções permanecem acessíveis em telas de 360 px e 1280 px de largura.
- A página não exige rolagem horizontal nessas larguras; títulos longos quebram linha.

## Fora do escopo

Login, backend, sincronização, colaboração, anexos, arrastar e soltar, notificações, relatórios e edição simultânea em várias abas.

## Conclusão da versão

A versão estará concluída quando RF01–RF06 e RNF01–RNF02 forem implementados, os cenários de `validation.md` tiverem resultados registrados e o README explicar como executar a aplicação.
