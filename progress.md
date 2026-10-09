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

## Modelo para as próximas sessões

```text
Data real:
Tarefas concluídas:
Requisitos atendidos:
Decisões ou mudanças na especificação:
Validações executadas e resultados:
Pendências e próximo passo:
```
