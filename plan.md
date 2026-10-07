# Plano técnico

Estado: planejamento inicial, anterior à implementação.

## Decisões

- React e TypeScript para a interface e os tipos do domínio.
- Vite para desenvolvimento local e build.
- CSS simples para o layout responsivo e o foco visível.
- Estado em memória com hooks do React; uma única página dispensa roteamento.
- `localStorage` para persistência, usando uma chave própria e um formato com versão.
- Controle de estado por seleção ou botões, mantendo o fluxo acessível por teclado.
- Nenhum serviço externo ou segredo necessário para executar o produto.

As versões das dependências serão escolhidas ao iniciar a implementação e registradas no lockfile.

## Estrutura prevista

```text
src/
  App.tsx
  components/
    TaskBoard.tsx
    TaskCard.tsx
    TaskForm.tsx
    TaskFilters.tsx
  hooks/
    useTasks.ts
  domain/
    task.ts
  services/
    taskStorage.ts
  styles.css
```

Adaptar a estrutura se uma separação não trouxer clareza; evitar arquivos e abstrações sem uso.

## Modelo e armazenamento

Representar estado e prioridade com valores tipados. Guardar prazo como `YYYY-MM-DD`, sem conversão de fuso horário. Usar um identificador único por tarefa e preservar a criação ao editar.

Centralizar a validação dos campos. A leitura do armazenamento deve verificar o JSON, a versão e os tipos dos dados antes de usá-los. Tratar falhas de leitura e escrita com mensagens visíveis. Não substituir automaticamente dados inválidos encontrados na inicialização.

## Sequência

1. Revisar `spec.md` e seus cenários de aceite.
2. Criar a base React e a interface com exemplos locais temporários.
3. Implementar criação, edição, mudança de estado e exclusão.
4. Conectar filtros e persistência.
5. Validar comportamento, teclado, responsividade e build.
6. Atualizar README e histórico com os resultados reais.

## Validação prevista

Executar os cenários de `validation.md`. Na implementação, acrescentar testes automatizados para regras de validação e leitura de armazenamento inválido, pois esses casos podem causar perda de dados ou falha na inicialização. Verificar a integração pelo navegador e executar os comandos de build e lint disponíveis no projeto.

## Mudanças de escopo

Quando surgir um novo comportamento, atualizar primeiro os requisitos e critérios de aceite, depois o plano e as tarefas afetadas. Registrar a decisão em `progress.md`.
