# Validação contra a especificação

Estado em **12/10/2026**: funcionalidades da sessão 3 implementadas. Resultados abaixo distinguem testes automatizados, revisão no navegador e verificações reservadas à sessão final.

| ID | Requisito | Cenário | Resultado |
| --- | --- | --- | --- |
| V01 | RF01 | Criar com título válido; conferir A fazer, prioridade média e campos salvos | Aprovado: criação, prioridade padrão, prazo futuro e restauração conferidos no Chrome; regras cobertas por testes |
| V02 | RF01, RF02 | Rejeitar título vazio, só espaços, acima de 100 caracteres e descrição acima de 500 | Aprovado em testes; no Chrome, título só com espaços e limites de 101/501 mostraram erros sem apagar os campos |
| V03 | RF01, RF02 | Cancelar criação e edição; conferir ausência de mudanças | Criação conferida na sessão 2; edição e confirmação de exclusão canceladas por teclado em 12/10, preservando dados e foco |
| V04 | RF02 | Editar campos; preservar identificador, estado e criação | Aprovado: testes preservam todos os metadados; Chrome confirmou título, descrição, prioridade, prazo, mesmo identificador e estado após recarga |
| V05 | RF03 | Mover para cada um dos três estados; conferir grupo e preservação dos campos | Aprovado: testes cobrem todas as transições; Chrome conferiu A fazer, Em andamento e Concluído, inclusive retorno e persistência |
| V06 | RF04 | Cancelar e confirmar exclusão; conferir que somente a tarefa escolhida é removida | Aprovado: cancelamento preservou a tarefa; confirmação removeu apenas a tarefa temporária e a remoção persistiu após recarga |
| V07 | RF05 | Combinar filtros, produzir resultado vazio e limpar filtros | Aprovado: Concluído + Alta produziu mensagem de vazio; filtros reiniciaram em Todos e as três tarefas reapareceram ao recarregar |
| V08 | RF05 | Criar duas tarefas e editar a mais antiga; conferir ordenação por criação | Aprovado: testes preservam a ordem; Chrome manteve a tarefa mais recente acima da tarefa antiga editada, ao reunir ambas em Concluído |
| V09 | RF06 | Recarregar após cada operação de escrita; conferir dados e filtros reiniciados | Aprovado: criação, edição, mudança de estado e exclusão restauradas no Chrome; filtros não são armazenados |
| V10 | RF06 | Simular armazenamento indisponível; conferir aviso e continuidade na sessão | Aprovado em testes: leitura/getter indisponível, falha de escrita, alterações em memória, ações consecutivas, recuperação e apresentação do aviso; reconferir visualmente a falha na sessão final |
| V11 | RF06 | Simular JSON ou estrutura inválida; conferir aviso e confirmação antes de substituir dados | Aprovado em testes: raw preservado, aviso apresentado, alterações e retry bloqueados, somente reset explícito substitui os dados; confirmação completa no navegador fica para revisão final |
| V12 | RNF01 | Executar criar, editar, mover, filtrar e excluir usando apenas teclado | Parcial: confirmação/cancelamento ativados por Enter, foco inicial e retorno e foco após mudança de estado conferidos. Percurso completo somente por teclado reservado à sessão 4 |
| V13 | RNF01 | Conferir rótulos, foco visível, erros e identificação textual de estado e prioridade | Rótulos e mensagens conferidos; confirmação começa em Cancelar; edição retorna ao controle de origem. Revisão final de acessibilidade pendente |
| V14 | RNF02 | Verificar 360 px e 1280 px, incluindo título longo e ausência de rolagem horizontal | Aprovado em 12/10: documento sem rolagem horizontal nas duas larguras, incluindo título de 100 caracteres e as novas ações |
| V15 | RF01, RF02 | Salvar prazo passado e prazo futuro; conferir a mesma data após edição e recarga | Aprovado: prazo futuro 15/10/2026 criado e prazo passado 10/10/2026 editado/restaurado no Chrome; calendário e anos bissextos cobertos por testes |

## Verificações técnicas

| Verificação | Resultado |
| --- | --- |
| Build de produção e TypeScript | Aprovados: `npm run build`, incluindo `npm run check` |
| Testes automatizados | 63 testes aprovados com `npm test` |
| Lint | Ainda não configurado; avaliar na etapa final |

## Evidências e limites

A revisão de 12/10/2026 usou o Chrome em uma prévia local separada (`127.0.0.1:5174`) para preservar os dados da tela principal. Os exemplos da captura foram criados durante a validação e não fazem parte da inicialização do produto.

- Imagem desktop atual: `preview-desktop.jpg`.
- Nos testes, a largura do documento permaneceu igual à largura visível em 360 e 1280 px.
- `tests/task.test.ts` valida campos, datas, operações e preservação dos metadados.
- `tests/taskStorage.test.ts` verifica leitura, formato, versão, identificadores, roundtrip e falhas de gravação.
- `tests/taskRecovery.test.ts` verifica preservação de dados que não puderam ser lidos inicialmente e combinação com tarefas da sessão.
- `tests/presentation.test.ts` verifica os avisos iniciais e bloqueios por renderização em servidor.
- `tests/useTasks.test.ts` exercita callbacks reais do hook e gravações em armazenamento simulado. Esses testes não simulam rerenders visuais; os fluxos comuns foram conferidos no navegador.

A sessão 4 deve completar o percurso de teclado e a revisão visual dos cenários de armazenamento inválido/indisponível, além de preparar a apresentação.
