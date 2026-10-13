# Plano técnico

Estado: funcionalidades implementadas em 12/10/2026; revisão de teclado, falhas de armazenamento, lint e preparação da apresentação realizadas na sessão 4, em 13/10/2026. Resultados detalhados em `validation.md`.

## Decisões

- React e TypeScript para a interface e os tipos do domínio.
- Vite para desenvolvimento local e build.
- CSS simples para o layout responsivo e o foco visível.
- Estado em memória com hooks do React; uma única página dispensa roteamento.
- `localStorage` para persistência, usando uma chave própria e um formato com versão.
- Controle de estado por seleção ou botões, mantendo o fluxo acessível por teclado.
- Nenhum serviço externo ou segredo necessário para executar o produto.

As versões das dependências estão fixadas no `package-lock.json`.

## Estrutura

```text
src/
  App.tsx
  TaskBoard.tsx
  TaskForm.tsx
  ConfirmDialog.tsx
  task.ts
  taskStorage.ts
  taskRecovery.ts
  useTasks.ts
  main.tsx
  styles.css
tests/
  *.test.ts
  browser/
    index.html
    main.tsx
eslint.config.js
```

Como a aplicação ainda tem poucos arquivos, a estrutura permanece plana: o quadro reúne os cartões, os filtros ficam em `App.tsx`, e regras e armazenamento estão separados do hook de interação.

## Decisões da sessão 2

- Criação em memória e filtros foram conectados para revisar o comportamento da interface. Os exemplos são temporários e serão retirados da inicialização da versão com persistência.
- O formulário usa o elemento nativo `dialog`, com foco inicial no título, Escape e retorno do foco ao botão de abertura.
- O prazo é lido como `YYYY-MM-DD` pelo formulário e exibido como data local, preservando o dia escolhido.
- A demonstração informa que os dados serão reiniciados ao recarregar. Isso registra explicitamente a limitação anterior à implementação de RF06.
- Dependências com versões exatas e `package-lock.json`; `npm run check` verifica tipos, e `npm run build` verifica tipos antes do build.

## Modelo e armazenamento

Representar estado e prioridade com valores tipados. Guardar prazo como `YYYY-MM-DD`, sem conversão de fuso horário. Usar um identificador único por tarefa e preservar a criação ao editar.

Centralizar a validação dos campos. A leitura do armazenamento deve verificar o JSON, a versão e os tipos dos dados antes de usá-los. Tratar falhas de leitura e escrita com mensagens visíveis. Não substituir automaticamente dados inválidos encontrados na inicialização.

## Decisões da sessão 3

- `task.ts` concentra validação e operações imutáveis; a edição preserva identificador, estado, criação e ordenação.
- `taskStorage.ts` lê e grava o envelope `{ version: 1, tasks }`. A leitura nunca escreve; estruturas, datas ou identificadores inválidos são rejeitados.
- `useTasks.ts` atualiza a sessão e tenta persistir em cada operação. Um ref preserva ações consecutivas antes do próximo render; não há gravação na inicialização do StrictMode.
- `taskRecovery.ts` recupera uma leitura inicialmente indisponível antes de autorizar gravações. Tarefas anteriores e tarefas da sessão são preservadas.
- Dados inválidos bloqueiam alterações e só podem ser substituídos pela confirmação de iniciar uma lista vazia.
- O mesmo formulário atende criação e edição. Limites apresentam mensagens por campo e preservam o preenchimento; datas parcialmente digitadas são rejeitadas.
- Confirmações começam com foco em Cancelar. Fechar devolve o foco ao controle de origem ou ao botão Nova tarefa quando o cartão já não existe.
- `npm test` usa `tsx` e o test runner do Node para validar regras, armazenamento, recuperação e avisos da interface, sem serviços externos.

## Decisões da sessão 4

- Ao limpar filtros, o foco volta ao controle Estado, porque o botão Limpar filtros deixa de existir. Isso vale para os controles da barra e do resultado vazio.
- Após uma tentativa bem-sucedida de salvar, o foco segue para Nova tarefa. Se a recuperação descobrir dados inválidos, os controles de alteração ficam bloqueados e o foco segue para Iniciar lista vazia.
- `tests/browser/` oferece uma página de validação em desenvolvimento com armazenamento simulado. Ela permite conferir falhas de leitura, gravação e dados inválidos sem acessar os dados reais do navegador. O build de produção usa apenas a entrada principal da aplicação.
- ESLint aplica as configurações recomendadas de JavaScript, TypeScript, React Hooks e JSX accessibility. Nenhuma regra foi desativada; `npm run lint` exige zero avisos.
- TypeScript foi ajustado de 7.0 para 6.0 para atender aos peer dependencies de `typescript-eslint`. ESLint 9 foi escolhido pela compatibilidade com o plugin JSX accessibility. A instalação avisa que a linha 9 está fora de suporte; futuras atualizações devem considerar os plugins em conjunto.
- `presentation.md` explica o método, a demonstração e a participação do autor e do Codex.

## Sequência

1. Revisar `spec.md` e seus cenários de aceite.
2. Criar a base React e a interface com exemplos locais temporários.
3. Implementar criação, edição, mudança de estado e exclusão.
4. Conectar filtros e persistência.
5. Validar comportamento, teclado, responsividade e build.
6. Atualizar README e histórico com os resultados reais.

## Validação

Os cenários de `validation.md` ligam os comportamentos aos requisitos. Testes automatizados cobrem regras, dados inválidos e recuperação, porque esses casos podem causar perda de dados ou falha na inicialização. A integração, o percurso de teclado e os avisos também foram conferidos no Chrome.

Na sessão 4, `npm test` aprovou 63 testes, `npm run build` passou com a checagem TypeScript e `npm run lint` passou sem erros ou avisos. A revisão de falhas usa o armazenamento simulado da página `/tests/browser/`, disponível pelo servidor de desenvolvimento. As evidências de layout e o resultado de cada cenário ficam em `validation.md`.

## Mudanças de escopo

Quando surgir um novo comportamento, atualizar primeiro os requisitos e critérios de aceite, depois o plano e as tarefas afetadas. Registrar a decisão em `progress.md`.
