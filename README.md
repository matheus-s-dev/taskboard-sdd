# Taskboard SDD

Quadro de tarefas pessoais em React, TypeScript e Vite, desenvolvido em etapas usando SDD.

## Estado atual

Etapa 3, realizada em **12/10/2026**: criação, edição, mudança de estado, exclusão com confirmação e salvamento das tarefas no navegador.

Na primeira execução, o quadro começa vazio. As tarefas permanecem após atualizar a página, no mesmo navegador e endereço. A imagem abaixo usa tarefas criadas para a validação; elas não são adicionadas automaticamente à aplicação.

![Interface do quadro em desktop](preview-desktop.jpg)

## Objetivo

Praticar Spec-Driven Development (SDD): definir o comportamento esperado, planejar a solução, dividir a implementação em tarefas e validar o resultado contra critérios de aceite.

O usuário pode criar, editar, excluir, organizar e filtrar tarefas. Os dados são armazenados no navegador usando `localStorage`.

## Documentos

| Arquivo | Finalidade |
| --- | --- |
| [spec.md](spec.md) | Escopo, regras e critérios de aceite |
| [plan.md](plan.md) | Decisões técnicas e sequência de implementação |
| [tasks.md](tasks.md) | Trabalho dividido em sessões |
| [validation.md](validation.md) | Verificações vinculadas aos requisitos |
| [progress.md](progress.md) | Histórico do trabalho e próximos passos |

## Como o SDD será aplicado

1. Consultar a especificação antes de implementar cada funcionalidade.
2. Atualizar a especificação quando uma decisão alterar o comportamento esperado.
3. Implementar as tarefas relacionadas aos requisitos.
4. Executar os cenários de aceite e registrar resultados reais.
5. Manter documentos e código consistentes durante a evolução.

O projeto utiliza um fluxo leve em Markdown, inspirado no [GitHub Spec Kit](https://github.github.com/spec-kit/). O toolkit não foi instalado; os documentos foram escritos para este projeto.

## Limites da primeira versão

Uso individual, sem login ou backend. Os dados ficam no navegador e não são sincronizados entre dispositivos. Não haverá arrastar e soltar, notificações ou colaboração nesta versão.

## Execução

Pré-requisito: Node.js 20.19+ da linha 20, ou Node.js 22.12+; npm.

```sh
npm ci
npm run dev
```

Abra o endereço local informado pelo Vite. Para verificar tipos e gerar a versão de produção:

```sh
npm run check
npm test
npm run build
npm run preview
```

Use `npm run format` para formatar os arquivos de código com Prettier.

## O que já funciona

- Quadro em três estados, com prioridade e prazo identificados por texto.
- Filtros de estado e prioridade combinados, com mensagem para resultados vazios.
- Criação em A fazer, validação do título e cancelamento do formulário.
- Edição preservando o identificador, o estado e a data de criação.
- Mudança para qualquer um dos três estados e exclusão com confirmação.
- Restauração das tarefas após recarregar, com filtros reiniciados em Todos.
- Avisos para falhas de armazenamento; dados inválidos são preservados até a confirmação para substituí-los.
- Layout para celular e desktop, foco visível, rótulos e fechamento por Escape.

Consulte `validation.md` para os resultados verificados e as verificações pendentes. `npm test` executa testes de regras, armazenamento, recuperação de falhas e apresentação dos avisos. O lint ainda não está configurado.

## Armazenamento

O aplicativo usa a chave `taskboard-sdd:tasks:v1` e um documento com versão e lista de tarefas. Verifica a estrutura, os campos, as datas e os identificadores antes de restaurar os dados.

Se uma gravação falhar, as alterações continuam disponíveis na sessão e aparece um aviso com a opção de tentar novamente. Se a leitura falhar temporariamente, as tarefas anteriores são recuperadas antes de gravar as tarefas criadas na sessão. Dados inválidos exigem confirmação explícita antes de começar uma lista vazia.
