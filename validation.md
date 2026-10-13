# Validação contra a especificação

Estado em **13/10/2026**: versão concluída. A sessão 4 completou os cenários de falha no navegador, o percurso por teclado e a revisão técnica. Resultados acumulados das quatro sessões:

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
| V10 | RF06 | Simular armazenamento indisponível; conferir aviso e continuidade na sessão | Aprovado: testes e Chrome em 13/10. Leitura bloqueada permite criar em memória sem gravar; liberar e tentar novamente preserva tarefas anteriores e novas. Falha de gravação mantém dados anteriores e alterações da sessão; retry salva ambas |
| V11 | RF06 | Simular JSON ou estrutura inválida; conferir aviso e confirmação antes de substituir dados | Aprovado: testes e Chrome em 13/10. JSON inválido mantém o conteúdo e zero gravações; cancelar mantém dados; confirmar grava lista vazia. Corrupção descoberta durante recuperação bloqueia controles e mantém o conteúdo inválido |
| V12 | RNF01 | Executar criar, editar, mover, filtrar e excluir usando apenas teclado | Aprovado em 13/10 com Tab, Shift+Tab, Enter, setas e Escape: criação, edição, mudança de estado, filtros combinados, ambos os botões de limpar, cancelamento e confirmação de exclusão |
| V13 | RNF01 | Conferir rótulos, foco visível, erros e identificação textual de estado e prioridade | Aprovado nos cenários revisados: erro de título mantém foco no campo; diálogos começam em Título/Cancelar e devolvem foco. Limpar filtros leva a Estado; retry bem-sucedido leva a Nova tarefa; controles desabilitados pela recuperação levam a Iniciar lista vazia |
| V14 | RNF02 | Verificar 360 px e 1280 px, incluindo título longo e ausência de rolagem horizontal | Aprovado: título de 100 caracteres conferido em 12/10; quadro e formulário reconferidos em 13/10. Sem rolagem horizontal em 360 e 1280 px; formulário móvel mede 307 px |
| V15 | RF01, RF02 | Salvar prazo passado e prazo futuro; conferir a mesma data após edição e recarga | Aprovado: prazo futuro 15/10/2026 criado e prazo passado 10/10/2026 editado/restaurado no Chrome; calendário e anos bissextos cobertos por testes |

## Verificações técnicas

| Verificação | Resultado |
| --- | --- |
| Build de produção e TypeScript | Aprovados: `npm run build`, incluindo `npm run check` |
| Testes automatizados | 63 testes aprovados com `npm test` |
| Lint | Aprovado: `npm run lint`, zero erros e avisos, regras recomendadas de JavaScript, TypeScript, React hooks e JSX acessível |
| Console do navegador | Nenhum erro ou aviso registrado na revisão da aplicação em 13/10 |

## Evidências e limites

A revisão de 12/10/2026 usou o Chrome em uma prévia local separada (`127.0.0.1:5174`). A sessão final usou `127.0.0.1:5175` e tarefas sintéticas, preservando os dados da tela principal. Os exemplos das capturas foram criados durante a validação e não fazem parte da inicialização do produto.

- Imagens: [desktop](preview-desktop.jpg), [celular](preview-mobile.jpg) e [recuperação de dados inválidos](storage-validation.jpg).
- Na revisão final, o documento mediu 345 e 1265 px dentro de viewports de 360 e 1280 px; a diferença corresponde à barra vertical, sem overflow horizontal.
- `tests/task.test.ts` valida campos, datas, operações e preservação dos metadados.
- `tests/taskStorage.test.ts` verifica leitura, formato, versão, identificadores, roundtrip e falhas de gravação.
- `tests/taskRecovery.test.ts` verifica preservação de dados que não puderam ser lidos inicialmente e combinação com tarefas da sessão.
- `tests/presentation.test.ts` verifica os avisos iniciais e bloqueios por renderização em servidor.
- `tests/useTasks.test.ts` exercita callbacks reais do hook e gravações em armazenamento simulado. Esses testes não simulam rerenders visuais; a integração foi conferida no navegador.
- `tests/browser/` oferece controles visíveis para simular falhas e mostrar o conteúdo armazenado e o número de gravações. Usa a aplicação real com armazenamento em memória, sem acessar dados reais do navegador. É uma página de desenvolvimento, excluída do build de produção.

## Correções da sessão 4

Três caminhos removiam ou desabilitavam o controle focado: limpar filtros, salvar novamente com sucesso e descobrir dados inválidos durante a recuperação. `App.tsx` agora escolhe um controle conectado e habilitado após a atualização da interface. Os caminhos afetados foram repetidos no Chrome, incluindo a confirmação de reset e a preservação do conteúdo inválido.

Os resultados de teclado, rótulos e foco cobrem os cenários acima. Não foi realizada auditoria completa com leitor de tela ou certificação de conformidade WCAG. A persistência é local à origem, sem backup ou sincronização; edição simultânea em várias abas permanece fora do escopo.
