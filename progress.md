# Histórico do projeto

## 07/10/2026 — especificação e planejamento

- Escolhido um quadro de tarefas pessoal com frontend em React, TypeScript e Vite.
- Definidos requisitos, critérios de aceite e limites em `spec.md`.
- Preparados plano técnico, tarefas por sessão e checklist de validação.
- Documentado um fluxo leve de SDD em Markdown, inspirado no GitHub Spec Kit.
- Implementação e execução de testes ainda pendentes.

Próximo passo: revisar a especificação com o autor e iniciar T01–T04 na sessão de interface. Data sugerida: 09/10/2026.

## 08/10/2026 — sessão 2: base e interface

- Consultada a especificação antes de começar a implementação, mantendo o escopo final.
- Criada a base React + TypeScript + Vite, com dependências fixas e lockfile.
- Implementadas três colunas, cartões, prioridades, prazos, filtros combinados e mensagem para resultados vazios.
- Criado formulário acessível com validação do título, cancelamento e criação em memória.
- Usados exemplos temporários, com aviso explícito de que os dados reiniciam ao recarregar.
- Simplificada a estrutura inicial para poucos arquivos em `src/`; extrações futuras registradas em `plan.md`.
- Verificados no Chrome o layout em 360 e 1280 px, filtros, criação, prazo passado, Escape e retorno do foco.
- Executado `npm run build`, incluindo checagem TypeScript, com sucesso. Resultados detalhados em `validation.md`.

Próximo passo: completar edição, mudança de estado e exclusão; implementar `localStorage` e seus casos de falha. As datas da próxima sessão continuam sendo sugestões.

## 12/10/2026 — sessão 3: funcionalidades e persistência

- Implementadas edição, mudança entre os três estados e exclusão com confirmação que identifica a tarefa.
- Centralizadas as regras dos campos, a normalização do título e as operações imutáveis, preservando os metadados nas edições.
- Implementados armazenamento com versão, restauração das tarefas, avisos de falha e confirmação antes de substituir dados inválidos.
- Esclarecido em `spec.md` o comportamento em falhas temporárias de leitura: recuperar e preservar dados anteriores antes de gravar tarefas novas da sessão.
- Removidos os exemplos da inicialização. O quadro começa vazio quando não há dados salvos.
- Conferidos na prévia local isolada criação, limites, data parcial, edição e cancelamento, mudança de estado, exclusão, filtros, ordenação e persistência após recarregar.
- Preservadas as tarefas da prévia principal; os testes de navegador usaram uma origem local separada e tarefas criadas para validação.
- Conferido o layout em 360 e 1280 px, incluindo um título de 100 caracteres. Atualizada a imagem do README.
- Executados build com TypeScript e 63 testes de domínio, armazenamento, recuperação, apresentação dos avisos e callbacks do hook, todos aprovados.

Próximo passo: sessão 4 para revisão final de acessibilidade, conferência dos avisos no navegador, eventuais correções e preparação da explicação do projeto e do uso de SDD.

## 13/10/2026 — sessão 4: revisão e apresentação

- Executados novamente `npm test` com 63 testes aprovados, `npm run build` com checagem TypeScript e `npm run lint` sem erros ou avisos.
- Configurado ESLint com regras recomendadas de JavaScript, TypeScript, React Hooks e JSX accessibility, sem desativar regras. TypeScript ajustado para 6.0 por compatibilidade com `typescript-eslint`; registrada a limitação de suporte da linha ESLint 9 mantida pela compatibilidade dos plugins.
- Corrigido o foco ao limpar filtros nos dois botões: agora retorna ao controle Estado. Após retry bem-sucedido, segue para Nova tarefa; quando a recuperação descobre dados inválidos, segue para Iniciar lista vazia, com alterações bloqueadas.
- Conferido no Chrome o percurso completo por teclado com Tab, Shift+Tab, Enter, setas e Escape: criação, rejeição de título só com espaços, cancelamento, edição, mudança de estado, filtros combinados, limpeza, exclusão cancelada/confirmada e retornos do foco.
- Criada `tests/browser/`, página de desenvolvimento que substitui o armazenamento apenas por uma simulação em memória, sem acessar os dados reais do navegador. A aplicação de produção mantém sua entrada principal.
- Conferidos os cenários simulados em uma prévia separada na porta 5175: JSON inválido bloqueia criação; cancelar mantém o conteúdo com zero gravações; confirmar substitui por lista vazia com uma gravação.
- Conferida falha de leitura: criação na sessão não grava; liberar leitura e tentar novamente preserva a tarefa antiga e a nova com uma gravação. Conferida falha de escrita: dados antigos persistidos permanecem intactos, a mudança fica em memória e o retry grava as duas tarefas.
- Conferida recuperação que descobre JSON inválido ao mover uma tarefa: os controles ficam bloqueados e o foco segue para a ação de recuperação.
- Preparado `presentation.md` com roteiro de demonstração, explicação do SDD, perguntas prováveis e participação real do autor e da IA. Atualizados README e plano técnico com os comandos e as decisões da revisão.

Os resultados e as evidências desta sessão estão em `validation.md`. O guia está pronto para o autor estudar e ensaiar a apresentação ao gestor.

## Modelo para as próximas sessões

```text
Data real:
Tarefas concluídas:
Requisitos atendidos:
Decisões ou mudanças na especificação:
Validações executadas e resultados:
Pendências e próximo passo:
```
